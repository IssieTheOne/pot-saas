-- Quick Fix: Drop and Recreate Database Schema
-- WARNING: This will DELETE ALL EXISTING DATA
-- Only use this if you want to start fresh with the enhanced schema
-- Run this in Supabase SQL Editor

-- ===========================================
-- DROP ALL EXISTING TABLES AND POLICIES
-- ===========================================

-- Drop policies first
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view documents in their organization" ON documents;
DROP POLICY IF EXISTS "Users can upload documents to their organization" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Anyone can view active features" ON features;
DROP POLICY IF EXISTS "Only admins can manage features" ON features;
DROP POLICY IF EXISTS "Users can view feature requests in their organization" ON feature_requests;
DROP POLICY IF EXISTS "Users can create feature requests" ON feature_requests;
DROP POLICY IF EXISTS "Admins can update feature requests" ON feature_requests;
DROP POLICY IF EXISTS "Anyone can view translations" ON translations;
DROP POLICY IF EXISTS "Only admins can manage translations" ON translations;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS feature_usage_logs CASCADE;
DROP TABLE IF EXISTS document_access_logs CASCADE;
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS translation_suggestions CASCADE;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS user_feature_access CASCADE;
DROP TABLE IF EXISTS feature_trials CASCADE;
DROP TABLE IF EXISTS feature_requests CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS document_shares CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS team_invitations CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ===========================================
-- RECREATE THE COMPLETE SCHEMA
-- ===========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Core business tables
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  default_language VARCHAR(5) DEFAULT 'en',
  supported_languages JSONB DEFAULT '["en"]',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'team_member',
  language VARCHAR(5) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  job_title TEXT,
  department TEXT,
  phone TEXT,
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  currency VARCHAR(3) DEFAULT 'USD',
  theme VARCHAR(20) DEFAULT 'light',
  notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Financial tables
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  expense_date DATE NOT NULL,
  payment_method TEXT,
  is_reimbursable BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team management tables
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  team_id UUID REFERENCES teams(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'team_member',
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  invited_by UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document management tables
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  category TEXT DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id),
  shared_with_email TEXT,
  shared_with_name TEXT,
  permissions TEXT DEFAULT 'read',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature management tables
CREATE TABLE features (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  trial_available BOOLEAN DEFAULT false,
  trial_duration_days INTEGER DEFAULT 14,
  requires_approval BOOLEAN DEFAULT false,
  approval_roles TEXT[] DEFAULT '{}',
  popular BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  feature_id TEXT NOT NULL REFERENCES features(id),
  reason TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  admin_notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE feature_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  feature_id TEXT NOT NULL REFERENCES features(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active',
  converted_at TIMESTAMP WITH TIME ZONE,
  extended_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_feature_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  feature_id TEXT NOT NULL REFERENCES features(id),
  access_type TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_id)
);

-- Internationalization tables
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL,
  locale VARCHAR(5) NOT NULL,
  value TEXT NOT NULL,
  namespace VARCHAR(100) DEFAULT 'common',
  context TEXT,
  is_html BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(key, locale, namespace)
);

CREATE TABLE translation_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_id UUID REFERENCES translations(id) ON DELETE CASCADE,
  suggested_value TEXT NOT NULL,
  suggested_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and logging tables
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE feature_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  feature_id TEXT REFERENCES features(id),
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System tables
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create all indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_expenses_organization_id ON expenses(organization_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_is_deleted ON documents(is_deleted);
CREATE INDEX idx_document_shares_token ON document_shares(token);
CREATE INDEX idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX idx_feature_requests_organization_id ON feature_requests(organization_id);
CREATE INDEX idx_feature_requests_status ON feature_requests(status);
CREATE INDEX idx_feature_requests_feature_id ON feature_requests(feature_id);
CREATE INDEX idx_feature_trials_user_id ON feature_trials(user_id);
CREATE INDEX idx_feature_trials_status ON feature_trials(status);
CREATE INDEX idx_user_feature_access_user_id ON user_feature_access(user_id);
CREATE INDEX idx_user_feature_access_feature_id ON user_feature_access(feature_id);
CREATE INDEX idx_translations_key_locale ON translations(key, locale);
CREATE INDEX idx_translations_namespace ON translations(namespace);
CREATE INDEX idx_translations_locale ON translations(locale);
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX idx_document_access_logs_document_id ON document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_created_at ON document_access_logs(created_at);
CREATE INDEX idx_feature_usage_logs_user_id ON feature_usage_logs(user_id);
CREATE INDEX idx_feature_usage_logs_created_at ON feature_usage_logs(created_at);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM users WHERE organization_id = organizations.id
  ));

CREATE POLICY "Organization owners can update their organization" ON organizations
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM users WHERE organization_id = organizations.id AND role = 'owner'
  ));

CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM users WHERE organization_id = users.organization_id
  ));

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view documents in their organization" ON documents
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND is_deleted = false
  );

CREATE POLICY "Users can upload documents to their organization" ON documents
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND uploaded_by = auth.uid()
  );

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (uploaded_by = auth.uid());

CREATE POLICY "Anyone can view active features" ON features
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage features" ON features
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view feature requests in their organization" ON feature_requests
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create feature requests" ON feature_requests
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Admins can update feature requests" ON feature_requests
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND auth.uid() IN (
      SELECT id FROM users WHERE organization_id = feature_requests.organization_id
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Anyone can view translations" ON translations
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage translations" ON translations
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('owner', 'admin')
    )
  );

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_requests_updated_at BEFORE UPDATE ON feature_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_trials_updated_at BEFORE UPDATE ON feature_trials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION calculate_invoice_total(invoice_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  subtotal DECIMAL(10,2);
  tax_rate DECIMAL(5,2);
  tax_amount DECIMAL(10,2);
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(total), 0) INTO subtotal
  FROM invoice_items
  WHERE invoice_items.invoice_id = calculate_invoice_total.invoice_id;

  SELECT invoices.tax_rate INTO tax_rate
  FROM invoices
  WHERE invoices.id = calculate_invoice_total.invoice_id;

  tax_amount := subtotal * (tax_rate / 100);
  total := subtotal + tax_amount;

  UPDATE invoices
  SET
    subtotal = subtotal,
    tax_amount = tax_amount,
    total = total,
    updated_at = NOW()
  WHERE id = calculate_invoice_total.invoice_id;

  RETURN total;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION has_feature_access(user_id UUID, feature_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN := false;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_feature_access ufa
    WHERE ufa.user_id = has_feature_access.user_id
    AND ufa.feature_id = has_feature_access.feature_id
    AND (ufa.expires_at IS NULL OR ufa.expires_at > NOW())
  ) INTO has_access;

  IF NOT has_access THEN
    SELECT EXISTS(
      SELECT 1 FROM feature_trials ft
      WHERE ft.user_id = has_feature_access.user_id
      AND ft.feature_id = has_feature_access.feature_id
      AND ft.status = 'active'
      AND ft.expires_at > NOW()
    ) INTO has_access;
  END IF;

  RETURN has_access;
END;
$$ LANGUAGE plpgsql;

-- Seed initial data
INSERT INTO features (id, name, description, category, icon, required, popular) VALUES
('dashboard', 'Dashboard', 'Main dashboard with key metrics and insights', 'core', 'Home', true, false),
('user_management', 'User Management', 'Manage team members and permissions', 'core', 'Users', true, false),
('invoices', 'Invoice Management', 'Create and manage invoices', 'business', 'FileText', false, true),
('expenses', 'Expense Tracking', 'Track business expenses', 'business', 'DollarSign', false, true),
('reports', 'Reports & Analytics', 'Analytics and insights', 'business', 'BarChart3', false, true),
('documents', 'Document Management', 'File storage and organization', 'addon', 'FolderOpen', false, true),
('marketplace', 'Feature Marketplace', 'Discover and request new features', 'addon', 'Sparkles', false, true);

INSERT INTO translations (key, locale, value, namespace) VALUES
('common.save', 'en', 'Save', 'common'),
('common.cancel', 'en', 'Cancel', 'common'),
('common.loading', 'en', 'Loading...', 'common'),
('navigation.dashboard', 'en', 'Dashboard', 'navigation'),
('navigation.marketplace', 'en', 'Marketplace', 'navigation'),
('navigation.documents', 'en', 'Documents', 'navigation');

INSERT INTO system_settings (key, value, description, is_public) VALUES
('maintenance_mode', 'false', 'Enable maintenance mode', true),
('max_file_size', '104857600', 'Maximum file upload size in bytes (100MB)', true),
('supported_languages', '["en", "es", "fr", "de", "pt", "ar", "zh"]', 'Supported languages', true),
('trial_duration_days', '14', 'Default trial duration in days', false);

-- Create views
CREATE VIEW user_organizations AS
SELECT
  u.id as user_id,
  u.email,
  u.full_name,
  u.role,
  o.id as organization_id,
  o.name as organization_name,
  o.type as organization_type
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.is_active = true AND o.is_active = true;

CREATE VIEW document_summary AS
SELECT
  d.organization_id,
  COUNT(*) as total_documents,
  SUM(d.size) as total_size,
  COUNT(CASE WHEN d.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_uploads,
  array_agg(DISTINCT d.category) as categories
FROM documents d
WHERE d.is_deleted = false
GROUP BY d.organization_id;

CREATE VIEW feature_usage_summary AS
SELECT
  f.id as feature_id,
  f.name as feature_name,
  f.category,
  COUNT(DISTINCT ufa.user_id) as active_users,
  COUNT(DISTINCT ft.user_id) as trial_users,
  COUNT(DISTINCT fr.id) as total_requests
FROM features f
LEFT JOIN user_feature_access ufa ON f.id = ufa.feature_id AND (ufa.expires_at IS NULL OR ufa.expires_at > NOW())
LEFT JOIN feature_trials ft ON f.id = ft.feature_id AND ft.status = 'active'
LEFT JOIN feature_requests fr ON f.id = fr.feature_id
WHERE f.is_active = true
GROUP BY f.id, f.name, f.category;

/*
FRESH DATABASE CREATED!

This script has:
1. Dropped all existing tables and policies
2. Created the complete enhanced schema
3. Set up all indexes, RLS policies, functions, and triggers
4. Seeded initial data
5. Created useful views

Your database is now ready with all enhanced features:
- Document management with R2/Cloudflare integration
- Feature marketplace with trials and requests
- Internationalization support
- Comprehensive logging and analytics

WARNING: All previous data has been deleted. Make sure to backup if needed.
*/
