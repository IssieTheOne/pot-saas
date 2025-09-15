-- Organization Features Table
CREATE TABLE organization_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, feature_id)
);

-- Feature Permissions Table
CREATE TABLE feature_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, user_id, feature_id)
);

-- User Roles Table
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, user_id)
);

-- Feature Usage Tracking
CREATE TABLE feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations Table (if not exists)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  business_type TEXT,
  template_id TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_organization_features_org_id ON organization_features(organization_id);
CREATE INDEX idx_organization_features_feature_id ON organization_features(feature_id);
CREATE INDEX idx_feature_permissions_org_user ON feature_permissions(organization_id, user_id);
CREATE INDEX idx_user_roles_org_user ON user_roles(organization_id, user_id);
CREATE INDEX idx_feature_usage_org_feature ON feature_usage(organization_id, feature_id);

-- RLS Policies
ALTER TABLE organization_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Organization Features Policies
CREATE POLICY "Users can view their organization's features" ON organization_features
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage organization features" ON organization_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND organization_id = organization_features.organization_id
      AND role IN ('admin', 'owner')
    )
  );

-- Feature Permissions Policies
CREATE POLICY "Users can view their feature permissions" ON feature_permissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage feature permissions" ON feature_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur1
      JOIN user_roles ur2 ON ur1.organization_id = ur2.organization_id
      WHERE ur1.user_id = auth.uid()
      AND ur2.user_id = feature_permissions.user_id
      AND ur1.role IN ('admin', 'owner')
    )
  );

-- User Roles Policies
CREATE POLICY "Users can view roles in their organization" ON user_roles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur1
      JOIN user_roles ur2 ON ur1.organization_id = ur2.organization_id
      WHERE ur1.user_id = auth.uid()
      AND ur2.user_id = user_roles.user_id
      AND ur1.role IN ('admin', 'owner')
    )
  );

-- Feature Usage Policies
CREATE POLICY "Users can view their own usage" ON feature_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view organization usage" ON feature_usage
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );

-- Organizations Policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage organizations" ON organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND organization_id = organizations.id
      AND role IN ('admin', 'owner')
    )
  );

-- Functions for feature management
CREATE OR REPLACE FUNCTION enable_organization_feature(
  p_organization_id UUID,
  p_feature_id TEXT,
  p_settings JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO organization_features (organization_id, feature_id, settings)
  VALUES (p_organization_id, p_feature_id, p_settings)
  ON CONFLICT (organization_id, feature_id)
  DO UPDATE SET
    enabled = true,
    settings = p_settings,
    updated_at = NOW();

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION disable_organization_feature(
  p_organization_id UUID,
  p_feature_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE organization_features
  SET enabled = false, updated_at = NOW()
  WHERE organization_id = p_organization_id AND feature_id = p_feature_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_organization_features(p_organization_id UUID)
RETURNS TABLE (
  feature_id TEXT,
  enabled BOOLEAN,
  settings JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT of.feature_id, of.enabled, of.settings
  FROM organization_features of
  WHERE of.organization_id = p_organization_id AND of.enabled = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Feature Requests Table (Managers requesting features)
CREATE TABLE feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  request_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'trial_started')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, feature_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Feature Trials Table (Free trial tracking)
CREATE TABLE feature_trials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id),
  trial_duration_days INTEGER NOT NULL DEFAULT 14,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'converted', 'cancelled')),
  auto_renew BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, feature_id)
);

-- Trial Notifications Table (Track notifications sent)
CREATE TABLE trial_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trial_id UUID NOT NULL REFERENCES feature_trials(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('trial_start', 'trial_ending', 'trial_expired', 'trial_converted')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipient_email TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Feature Approvals Table (Audit trail for approvals)
CREATE TABLE feature_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  request_id UUID REFERENCES feature_requests(id),
  approved_by UUID NOT NULL REFERENCES auth.users(id),
  approval_type TEXT NOT NULL CHECK (approval_type IN ('feature_request', 'trial_extension', 'trial_conversion')),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'trial_granted')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX idx_feature_requests_org_status ON feature_requests(organization_id, status);
CREATE INDEX idx_feature_requests_requested_by ON feature_requests(requested_by);
CREATE INDEX idx_feature_trials_org_status ON feature_trials(organization_id, status);
CREATE INDEX idx_feature_trials_ends_at ON feature_trials(ends_at);
CREATE INDEX idx_trial_notifications_trial_type ON trial_notifications(trial_id, notification_type);
CREATE INDEX idx_feature_approvals_org_feature ON feature_approvals(organization_id, feature_id);

-- RLS Policies for new tables
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_approvals ENABLE ROW LEVEL SECURITY;

-- Feature Requests Policies
CREATE POLICY "Users can view requests in their organization" ON feature_requests
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create requests in their organization" ON feature_requests
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    ) AND requested_by = auth.uid()
  );

CREATE POLICY "Owners and admins can update requests" ON feature_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND organization_id = feature_requests.organization_id
      AND role IN ('admin', 'owner')
    )
  );

-- Feature Trials Policies
CREATE POLICY "Users can view trials in their organization" ON feature_trials
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage trials" ON feature_trials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND organization_id = feature_trials.organization_id
      AND role IN ('admin', 'owner')
    )
  );

-- Trial Notifications Policies
CREATE POLICY "Admins can view trial notifications" ON trial_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feature_trials ft
      JOIN user_roles ur ON ft.organization_id = ur.organization_id
      WHERE ft.id = trial_notifications.trial_id
      AND ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'owner')
    )
  );

-- Feature Approvals Policies
CREATE POLICY "Users can view approvals in their organization" ON feature_approvals
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create approvals" ON feature_approvals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND organization_id = feature_approvals.organization_id
      AND role IN ('admin', 'owner')
    ) AND approved_by = auth.uid()
  );

-- Functions for trial and request management
CREATE OR REPLACE FUNCTION start_feature_trial(
  p_organization_id UUID,
  p_feature_id TEXT,
  p_requested_by UUID,
  p_trial_duration_days INTEGER DEFAULT 14
) RETURNS UUID AS $$
DECLARE
  trial_id UUID;
BEGIN
  -- Insert trial record
  INSERT INTO feature_trials (
    organization_id,
    feature_id,
    requested_by,
    trial_duration_days,
    ends_at
  ) VALUES (
    p_organization_id,
    p_feature_id,
    p_requested_by,
    p_trial_duration_days,
    NOW() + INTERVAL '1 day' * p_trial_duration_days
  ) RETURNING id INTO trial_id;

  -- Enable the feature
  PERFORM enable_organization_feature(p_organization_id, p_feature_id, '{"trial_id": "' || trial_id || '"}');

  -- Log notification
  INSERT INTO trial_notifications (trial_id, notification_type, recipient_email)
  SELECT trial_id, 'trial_start', u.email
  FROM auth.users u WHERE u.id = p_requested_by;

  RETURN trial_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION extend_feature_trial(
  p_trial_id UUID,
  p_additional_days INTEGER DEFAULT 14
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE feature_trials
  SET
    ends_at = ends_at + INTERVAL '1 day' * p_additional_days,
    updated_at = NOW()
  WHERE id = p_trial_id AND status = 'active';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION convert_trial_to_paid(
  p_trial_id UUID,
  p_converted_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
  trial_record RECORD;
BEGIN
  -- Get trial info
  SELECT * INTO trial_record FROM feature_trials WHERE id = p_trial_id;

  IF NOT FOUND OR trial_record.status != 'active' THEN
    RETURN false;
  END IF;

  -- Update trial status
  UPDATE feature_trials
  SET
    status = 'converted',
    converted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_trial_id;

  -- Update feature settings to remove trial
  UPDATE organization_features
  SET
    settings = settings - 'trial_id',
    updated_at = NOW()
  WHERE organization_id = trial_record.organization_id
    AND feature_id = trial_record.feature_id;

  -- Log notification
  INSERT INTO trial_notifications (trial_id, notification_type, recipient_email)
  SELECT p_trial_id, 'trial_converted', u.email
  FROM auth.users u WHERE u.id = trial_record.requested_by;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION expire_feature_trials() RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
  trial_record RECORD;
BEGIN
  -- Find expired trials
  FOR trial_record IN
    SELECT * FROM feature_trials
    WHERE status = 'active' AND ends_at < NOW()
  LOOP
    -- Update trial status
    UPDATE feature_trials
    SET status = 'expired', updated_at = NOW()
    WHERE id = trial_record.id;

    -- Disable the feature
    PERFORM disable_organization_feature(trial_record.organization_id, trial_record.feature_id);

    -- Log notification
    INSERT INTO trial_notifications (trial_id, notification_type, recipient_email)
    SELECT trial_record.id, 'trial_expired', u.email
    FROM auth.users u WHERE u.id = trial_record.requested_by;

    expired_count := expired_count + 1;
  END LOOP;

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION send_trial_reminders() RETURNS INTEGER AS $$
DECLARE
  reminder_count INTEGER := 0;
  trial_record RECORD;
BEGIN
  -- Find trials ending in 3 days that haven't been reminded
  FOR trial_record IN
    SELECT * FROM feature_trials
    WHERE status = 'active'
      AND ends_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
      AND reminder_sent = false
  LOOP
    -- Log notification
    INSERT INTO trial_notifications (trial_id, notification_type, recipient_email)
    SELECT trial_record.id, 'trial_ending', u.email
    FROM auth.users u WHERE u.id = trial_record.requested_by;

    -- Mark as reminded
    UPDATE feature_trials
    SET reminder_sent = true, updated_at = NOW()
    WHERE id = trial_record.id;

    reminder_count := reminder_count + 1;
  END LOOP;

  RETURN reminder_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION request_feature(
  p_organization_id UUID,
  p_feature_id TEXT,
  p_requested_by UUID,
  p_request_reason TEXT DEFAULT ''
) RETURNS UUID AS $$
DECLARE
  request_id UUID;
BEGIN
  INSERT INTO feature_requests (
    organization_id,
    requested_by,
    feature_id,
    request_reason
  ) VALUES (
    p_organization_id,
    p_requested_by,
    p_feature_id,
    p_request_reason
  ) RETURNING id INTO request_id;

  RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_feature_request(
  p_request_id UUID,
  p_approved_by UUID,
  p_decision TEXT,
  p_comments TEXT DEFAULT '',
  p_grant_trial BOOLEAN DEFAULT false,
  p_trial_duration_days INTEGER DEFAULT 14
) RETURNS BOOLEAN AS $$
DECLARE
  request_record RECORD;
  approval_id UUID;
BEGIN
  -- Get request info
  SELECT * INTO request_record FROM feature_requests WHERE id = p_request_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update request status
  UPDATE feature_requests
  SET
    status = CASE WHEN p_decision = 'approved' AND p_grant_trial THEN 'trial_started'
                  WHEN p_decision = 'approved' THEN 'approved'
                  ELSE 'rejected' END,
    approved_by = p_approved_by,
    approved_at = NOW(),
    rejection_reason = CASE WHEN p_decision = 'rejected' THEN p_comments ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_request_id;

  -- Log approval
  INSERT INTO feature_approvals (
    organization_id,
    feature_id,
    request_id,
    approved_by,
    approval_type,
    decision,
    comments
  ) VALUES (
    request_record.organization_id,
    request_record.feature_id,
    p_request_id,
    p_approved_by,
    'feature_request',
    p_decision,
    p_comments
  );

  -- If approved and trial granted, start trial
  IF p_decision = 'approved' AND p_grant_trial THEN
    PERFORM start_feature_trial(
      request_record.organization_id,
      request_record.feature_id,
      request_record.requested_by,
      p_trial_duration_days
    );
  ELSIF p_decision = 'approved' THEN
    -- Enable feature permanently
    PERFORM enable_organization_feature(request_record.organization_id, request_record.feature_id);
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active trials for an organization
CREATE OR REPLACE FUNCTION get_active_trials(p_organization_id UUID)
RETURNS TABLE (
  trial_id UUID,
  feature_id TEXT,
  days_remaining INTEGER,
  ends_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ft.id,
    ft.feature_id,
    EXTRACT(EPOCH FROM (ft.ends_at - NOW())) / 86400 :: INTEGER,
    ft.ends_at
  FROM feature_trials ft
  WHERE ft.organization_id = p_organization_id
    AND ft.status = 'active'
    AND ft.ends_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending feature requests
CREATE OR REPLACE FUNCTION get_pending_requests(p_organization_id UUID)
RETURNS TABLE (
  request_id UUID,
  feature_id TEXT,
  requested_by_name TEXT,
  requested_by_email TEXT,
  request_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fr.id,
    fr.feature_id,
    COALESCE(up.raw_user_meta_data->>'name', u.email),
    u.email,
    fr.request_reason,
    fr.created_at
  FROM feature_requests fr
  JOIN auth.users u ON fr.requested_by = u.id
  LEFT JOIN auth.users up ON fr.requested_by = up.id
  WHERE fr.organization_id = p_organization_id
    AND fr.status = 'pending'
  ORDER BY fr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
