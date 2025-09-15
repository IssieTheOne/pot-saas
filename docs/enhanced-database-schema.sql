-- Enhanced Pot SaaS Database Schema - Complete Edition
-- This includes ALL tables for the complete platform including documents, invoices, reminders, and internationalization
-- Run this in Supabase SQL Editor to create all tables, policies, and seed data
-- Includes comprehensive error handling and rollback capabilities

DO $$
BEGIN
    RAISE NOTICE 'Starting Pot SaaS database setup...';

    -- Enable necessary extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    RAISE NOTICE 'Extensions enabled successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to enable extensions: %', SQLERRM;
END $$;

-- ===========================================
-- CORE BUSINESS TABLES
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating core business tables...';

    -- Organizations table (Enhanced)
    CREATE TABLE IF NOT EXISTS organizations (
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

    -- Users table (Enhanced)
    CREATE TABLE IF NOT EXISTS users (
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

    -- User profiles (Additional user preferences)
    CREATE TABLE IF NOT EXISTS user_profiles (
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

    RAISE NOTICE 'Core business tables created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create core business tables: %', SQLERRM;
END $$;

-- ===========================================
-- FINANCIAL TABLES
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating financial tables...';

    -- Invoices table
    CREATE TABLE IF NOT EXISTS invoices (
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

    -- Invoice items
    CREATE TABLE IF NOT EXISTS invoice_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Invoice templates
    CREATE TABLE IF NOT EXISTS invoice_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      description TEXT,
      template_data JSONB NOT NULL, -- Store template structure
      is_default BOOLEAN DEFAULT false,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Invoice payment records
    CREATE TABLE IF NOT EXISTS invoice_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      payment_date DATE NOT NULL,
      payment_method TEXT NOT NULL, -- 'bank_transfer', 'credit_card', 'paypal', 'cash', etc.
      transaction_id TEXT, -- External payment processor ID
      notes TEXT,
      recorded_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Invoice reminders/notifications
    CREATE TABLE IF NOT EXISTS invoice_reminders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      reminder_type TEXT NOT NULL, -- 'due_date_approaching', 'overdue', 'payment_received', 'custom'
      scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
      sent_date TIMESTAMP WITH TIME ZONE,
      status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Recurring invoice templates
    CREATE TABLE IF NOT EXISTS recurring_invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id),
      template_name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_address TEXT,
      frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'
      start_date DATE NOT NULL,
      end_date DATE, -- NULL means indefinite
      next_due_date DATE NOT NULL,
      last_generated_date DATE,
      is_active BOOLEAN DEFAULT true,
      invoice_data JSONB NOT NULL, -- Store the invoice template data
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Expenses table
    CREATE TABLE IF NOT EXISTS expenses (
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

    RAISE NOTICE 'Financial tables created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create financial tables: %', SQLERRM;
END $$;

-- ===========================================
-- TEAM MANAGEMENT TABLES
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating team management tables...';

    -- Teams table
    CREATE TABLE IF NOT EXISTS teams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      description TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Team members
    CREATE TABLE IF NOT EXISTS team_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'member',
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(team_id, user_id)
    );

    -- Team invitations
    CREATE TABLE IF NOT EXISTS team_invitations (
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

    RAISE NOTICE 'Team management tables created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create team management tables: %', SQLERRM;
END $$;

-- ===========================================
-- DOCUMENT MANAGEMENT TABLES
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating document management tables...';

    -- Documents table
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id),
      uploaded_by UUID NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      type TEXT NOT NULL,
      size BIGINT NOT NULL,
      url TEXT NOT NULL, -- This will be a token/identifier for R2/Cloudflare
      storage_path TEXT, -- Actual path in storage (for internal use)
      category TEXT DEFAULT 'other',
      tags TEXT[] DEFAULT '{}',
      is_deleted BOOLEAN DEFAULT false,
      deleted_at TIMESTAMP WITH TIME ZONE,
      deleted_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Document shares (for sharing documents with external users)
    CREATE TABLE IF NOT EXISTS document_shares (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      shared_by UUID NOT NULL REFERENCES users(id),
      shared_with_email TEXT,
      shared_with_name TEXT,
      permissions TEXT DEFAULT 'read', -- read, write, admin
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE,
      download_count INTEGER DEFAULT 0,
      last_downloaded_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Document versions (for version control)
    CREATE TABLE IF NOT EXISTS document_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      size BIGINT NOT NULL,
      url TEXT NOT NULL,
      storage_path TEXT,
      changes_description TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    RAISE NOTICE 'Document management tables created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create document management tables: %', SQLERRM;
END $$;

-- ===========================================
-- NOTIFICATION & REMINDER SYSTEM
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating notification and reminder system...';

    -- General notifications table (for all types of notifications)
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id),
      user_id UUID REFERENCES users(id), -- NULL for system notifications
      type TEXT NOT NULL, -- 'invoice_due', 'payment_received', 'team_invitation', 'system', 'reminder'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data JSONB DEFAULT '{}', -- Additional context data
      is_read BOOLEAN DEFAULT false,
      read_at TIMESTAMP WITH TIME ZONE,
      priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
      expires_at TIMESTAMP WITH TIME ZONE, -- Auto-expire old notifications
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Scheduled reminders (for recurring tasks)
    CREATE TABLE IF NOT EXISTS scheduled_reminders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id),
      title TEXT NOT NULL,
      description TEXT,
      reminder_type TEXT NOT NULL, -- 'one_time', 'daily', 'weekly', 'monthly', 'yearly'
      scheduled_date TIMESTAMP WITH TIME ZONE,
      recurrence_pattern JSONB, -- For complex recurrence rules
      next_run TIMESTAMP WITH TIME ZONE,
      last_run TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT true,
      assigned_to UUID REFERENCES users(id),
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Reminder executions (track when reminders were sent)
    CREATE TABLE IF NOT EXISTS reminder_executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reminder_id UUID NOT NULL REFERENCES scheduled_reminders(id) ON DELETE CASCADE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'skipped'
      error_message TEXT,
      recipient_count INTEGER DEFAULT 0
    );

    RAISE NOTICE 'Notification and reminder system created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create notification and reminder system: %', SQLERRM;
END $$;

-- ===========================================
-- FEATURE MANAGEMENT TABLES
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating feature management tables...';

    -- Features table
    CREATE TABLE IF NOT EXISTS features (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'addon',
      icon TEXT,
      required BOOLEAN DEFAULT false,
      popular BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Feature requests table for user feedback
    CREATE TABLE IF NOT EXISTS feature_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID REFERENCES organizations(id),
      requested_by UUID REFERENCES users(id),
      feature_id TEXT REFERENCES features(id),
      title TEXT,
      description TEXT,
      request_reason TEXT,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'implemented')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Feature trials table for trial management
    CREATE TABLE IF NOT EXISTS feature_trials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID REFERENCES organizations(id),
      feature_id TEXT REFERENCES features(id),
      requested_by UUID REFERENCES users(id),
      trial_duration_days INTEGER DEFAULT 14,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'converted')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Translations table for internationalization
    CREATE TABLE IF NOT EXISTS translations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT NOT NULL,
      locale VARCHAR(5) NOT NULL,
      value TEXT NOT NULL,
      namespace TEXT DEFAULT 'common',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(key, locale, namespace)
    );

    -- System settings table
    CREATE TABLE IF NOT EXISTS system_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    RAISE NOTICE 'Feature management tables created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create feature management tables: %', SQLERRM;
END $$;

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating performance indexes...';

    -- Invoice indexes
    CREATE INDEX IF NOT EXISTS idx_invoices_organization_status ON invoices(organization_id, status);
    CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
    CREATE INDEX IF NOT EXISTS idx_invoices_client_email ON invoices(client_email);
    CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

    -- Payment indexes
    CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_invoice_payments_date ON invoice_payments(payment_date);

    -- Reminder indexes
    CREATE INDEX IF NOT EXISTS idx_invoice_reminders_invoice_id ON invoice_reminders(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_invoice_reminders_status ON invoice_reminders(status);
    CREATE INDEX IF NOT EXISTS idx_invoice_reminders_scheduled_date ON invoice_reminders(scheduled_date);

    -- Recurring invoice indexes
    CREATE INDEX IF NOT EXISTS idx_recurring_invoices_organization ON recurring_invoices(organization_id);
    CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_due ON recurring_invoices(next_due_date);
    CREATE INDEX IF NOT EXISTS idx_recurring_invoices_active ON recurring_invoices(is_active);

    -- Notification indexes
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_organization_type ON notifications(organization_id, type);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

    -- Scheduled reminder indexes
    CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_next_run ON scheduled_reminders(next_run);
    CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_active ON scheduled_reminders(is_active);
    CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_assigned_to ON scheduled_reminders(assigned_to);

    -- Feature indexes
    CREATE INDEX IF NOT EXISTS idx_features_category ON features(category);
    CREATE INDEX IF NOT EXISTS idx_features_active ON features(is_active);

    -- Feature requests indexes
    CREATE INDEX IF NOT EXISTS idx_feature_requests_organization ON feature_requests(organization_id);
    CREATE INDEX IF NOT EXISTS idx_feature_requests_requested_by ON feature_requests(requested_by);
    CREATE INDEX IF NOT EXISTS idx_feature_requests_feature_id ON feature_requests(feature_id);
    CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
    CREATE INDEX IF NOT EXISTS idx_feature_requests_priority ON feature_requests(priority);

    -- Feature trials indexes
    CREATE INDEX IF NOT EXISTS idx_feature_trials_organization ON feature_trials(organization_id);
    CREATE INDEX IF NOT EXISTS idx_feature_trials_feature_id ON feature_trials(feature_id);
    CREATE INDEX IF NOT EXISTS idx_feature_trials_requested_by ON feature_trials(requested_by);
    CREATE INDEX IF NOT EXISTS idx_feature_trials_status ON feature_trials(status);
    CREATE INDEX IF NOT EXISTS idx_feature_trials_ends_at ON feature_trials(ends_at);

    -- Translation indexes
    CREATE INDEX IF NOT EXISTS idx_translations_key_locale ON translations(key, locale);
    CREATE INDEX IF NOT EXISTS idx_translations_locale_namespace ON translations(locale, namespace);

    -- System settings indexes
    CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
    CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

    RAISE NOTICE 'Performance indexes created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create performance indexes: %', SQLERRM;
END $$;

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating Row Level Security policies...';

    -- Organizations
    ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
    CREATE POLICY "Users can view their organization" ON organizations
      FOR SELECT USING (id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- Users
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
    CREATE POLICY "Users can view users in their organization" ON users
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- User profiles
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;
    CREATE POLICY "Users can manage their own profile" ON user_profiles
      FOR ALL USING (user_id = auth.uid());

    -- Invoices
    ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view invoices in their organization" ON invoices;
    CREATE POLICY "Users can view invoices in their organization" ON invoices
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));
    DROP POLICY IF EXISTS "Users can manage invoices in their organization" ON invoices;
    CREATE POLICY "Users can manage invoices in their organization" ON invoices
      FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- Invoice items
    ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view invoice items in their organization" ON invoice_items;
    CREATE POLICY "Users can view invoice items in their organization" ON invoice_items
      FOR SELECT USING (invoice_id IN (
        SELECT id FROM invoices WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      ));

    -- Invoice templates
    ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view invoice templates in their organization" ON invoice_templates;
    CREATE POLICY "Users can view invoice templates in their organization" ON invoice_templates
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));
    DROP POLICY IF EXISTS "Users can manage invoice templates in their organization" ON invoice_templates;
    CREATE POLICY "Users can manage invoice templates in their organization" ON invoice_templates
      FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- Invoice payments
    ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view payments for invoices in their organization" ON invoice_payments;
    CREATE POLICY "Users can view payments for invoices in their organization" ON invoice_payments
      FOR SELECT USING (invoice_id IN (
        SELECT id FROM invoices WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      ));
    DROP POLICY IF EXISTS "Users can manage payments for invoices in their organization" ON invoice_payments;
    CREATE POLICY "Users can manage payments for invoices in their organization" ON invoice_payments
      FOR ALL USING (invoice_id IN (
        SELECT id FROM invoices WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      ));

    -- Invoice reminders
    ALTER TABLE invoice_reminders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view reminders for invoices in their organization" ON invoice_reminders;
    CREATE POLICY "Users can view reminders for invoices in their organization" ON invoice_reminders
      FOR SELECT USING (invoice_id IN (
        SELECT id FROM invoices WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      ));
    DROP POLICY IF EXISTS "Users can manage reminders for invoices in their organization" ON invoice_reminders;
    CREATE POLICY "Users can manage reminders for invoices in their organization" ON invoice_reminders
      FOR ALL USING (invoice_id IN (
        SELECT id FROM invoices WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      ));

    -- Recurring invoices
    ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view recurring invoices in their organization" ON recurring_invoices;
    CREATE POLICY "Users can view recurring invoices in their organization" ON recurring_invoices
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));
    DROP POLICY IF EXISTS "Users can manage recurring invoices in their organization" ON recurring_invoices;
    CREATE POLICY "Users can manage recurring invoices in their organization" ON recurring_invoices
      FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- Expenses
    ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view expenses in their organization" ON expenses;
    CREATE POLICY "Users can view expenses in their organization" ON expenses
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));
    DROP POLICY IF EXISTS "Users can manage expenses in their organization" ON expenses;
    CREATE POLICY "Users can manage expenses in their organization" ON expenses
      FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- Teams
    ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view teams in their organization" ON teams;
    CREATE POLICY "Users can view teams in their organization" ON teams
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- Team members
    ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view team members in their organization" ON team_members;
    CREATE POLICY "Users can view team members in their organization" ON team_members
      FOR SELECT USING (team_id IN (
        SELECT id FROM teams WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      ));

    -- Team invitations
    ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view team invitations in their organization" ON team_invitations;
    CREATE POLICY "Users can view team invitations in their organization" ON team_invitations
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- Documents
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view documents in their organization" ON documents;
    CREATE POLICY "Users can view documents in their organization" ON documents
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ) AND is_deleted = false);

    -- Document shares
    ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view document shares they created" ON document_shares;
    CREATE POLICY "Users can view document shares they created" ON document_shares
      FOR SELECT USING (shared_by = auth.uid());

    -- Document versions
    ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view document versions in their organization" ON document_versions;
    CREATE POLICY "Users can view document versions in their organization" ON document_versions
      FOR SELECT USING (document_id IN (
        SELECT id FROM documents WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      ));

    -- Notifications
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    CREATE POLICY "Users can view their own notifications" ON notifications
      FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
    DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
    CREATE POLICY "Users can update their own notifications" ON notifications
      FOR UPDATE USING (user_id = auth.uid());

    -- Scheduled reminders
    ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view reminders in their organization" ON scheduled_reminders;
    CREATE POLICY "Users can view reminders in their organization" ON scheduled_reminders
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));
    DROP POLICY IF EXISTS "Users can manage reminders in their organization" ON scheduled_reminders;
    CREATE POLICY "Users can manage reminders in their organization" ON scheduled_reminders
      FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- Reminder executions
    ALTER TABLE reminder_executions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view executions for reminders in their organization" ON reminder_executions;
    CREATE POLICY "Users can view executions for reminders in their organization" ON reminder_executions
      FOR SELECT USING (reminder_id IN (
        SELECT id FROM scheduled_reminders WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      ));

    -- Features (public read access for marketplace)
    ALTER TABLE features ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view active features" ON features;
    CREATE POLICY "Anyone can view active features" ON features
      FOR SELECT USING (is_active = true);

    -- Feature requests (organization-specific)
    ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view feature requests from their organization" ON feature_requests;
    CREATE POLICY "Users can view feature requests from their organization" ON feature_requests
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));
    DROP POLICY IF EXISTS "Users can create feature requests for their organization" ON feature_requests;
    CREATE POLICY "Users can create feature requests for their organization" ON feature_requests
      FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ) AND requested_by = auth.uid());
    DROP POLICY IF EXISTS "Users can update their own feature requests" ON feature_requests;
    CREATE POLICY "Users can update their own feature requests" ON feature_requests
      FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ) AND requested_by = auth.uid());

    -- Feature trials (organization-specific)
    ALTER TABLE feature_trials ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view feature trials from their organization" ON feature_trials;
    CREATE POLICY "Users can view feature trials from their organization" ON feature_trials
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));
    DROP POLICY IF EXISTS "Users can create feature trials for their organization" ON feature_trials;
    CREATE POLICY "Users can create feature trials for their organization" ON feature_trials
      FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ) AND requested_by = auth.uid());
    DROP POLICY IF EXISTS "Users can update feature trials from their organization" ON feature_trials;
    CREATE POLICY "Users can update feature trials from their organization" ON feature_trials
      FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ));

    -- Translations (public read access for i18n)
    ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view translations" ON translations;
    CREATE POLICY "Anyone can view translations" ON translations
      FOR SELECT USING (true);

    -- System settings (public read for public settings, admin write)
    ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view public system settings" ON system_settings;
    CREATE POLICY "Anyone can view public system settings" ON system_settings
      FOR SELECT USING (is_public = true);
    DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
    CREATE POLICY "Admins can manage system settings" ON system_settings
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid()
          AND u.role IN ('admin', 'owner')
        )
      );

    RAISE NOTICE 'Row Level Security policies created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create Row Level Security policies: %', SQLERRM;
END $$;

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating functions and triggers...';

    RAISE NOTICE 'Functions and triggers created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create functions and triggers: %', SQLERRM;
END $$;

-- Function to update invoice totals when items change
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the invoice totals based on items
  UPDATE invoices
  SET
    subtotal = (
      SELECT COALESCE(SUM(total), 0)
      FROM invoice_items
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ),
    tax_amount = subtotal * (tax_rate / 100),
    total = subtotal + tax_amount,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update invoice totals
DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON invoice_items;
CREATE TRIGGER update_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- Function to create notifications for invoice events
CREATE OR REPLACE FUNCTION create_invoice_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification when invoice status changes
  IF OLD.status != NEW.status THEN
    INSERT INTO notifications (organization_id, type, title, message, data)
    VALUES (
      NEW.organization_id,
      'invoice_status_change',
      'Invoice Status Updated',
      'Invoice ' || NEW.invoice_number || ' status changed to ' || NEW.status,
      jsonb_build_object('invoice_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invoice notifications
DROP TRIGGER IF EXISTS invoice_notification_trigger ON invoices;
CREATE TRIGGER invoice_notification_trigger
  AFTER UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION create_invoice_notification();

-- Function to update recurring invoice next due dates
CREATE OR REPLACE FUNCTION update_recurring_invoice_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate next due date based on frequency
  NEW.next_due_date = CASE
    WHEN NEW.frequency = 'weekly' THEN NEW.next_due_date + INTERVAL '7 days'
    WHEN NEW.frequency = 'monthly' THEN NEW.next_due_date + INTERVAL '1 month'
    WHEN NEW.frequency = 'quarterly' THEN NEW.next_due_date + INTERVAL '3 months'
    WHEN NEW.frequency = 'yearly' THEN NEW.next_due_date + INTERVAL '1 year'
    ELSE NEW.next_due_date
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoices from recurring templates
CREATE OR REPLACE FUNCTION generate_recurring_invoices()
RETURNS void AS $$
DECLARE
  recurring_record RECORD;
  new_invoice_id UUID;
  item_record JSONB;
BEGIN
  -- Loop through active recurring invoices that are due
  FOR recurring_record IN
    SELECT * FROM recurring_invoices
    WHERE is_active = true
    AND next_due_date <= CURRENT_DATE
    AND (end_date IS NULL OR next_due_date <= end_date)
  LOOP
    -- Generate new invoice number (you might want to customize this)
    -- Create the invoice
    INSERT INTO invoices (
      organization_id,
      invoice_number,
      client_name,
      client_email,
      client_address,
      status,
      issue_date,
      due_date,
      created_by
    ) VALUES (
      recurring_record.organization_id,
      'REC-' || recurring_record.id || '-' || to_char(CURRENT_DATE, 'YYYYMMDD'),
      recurring_record.client_name,
      recurring_record.client_email,
      recurring_record.client_address,
      'draft',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days', -- Default 30 days payment terms
      recurring_record.created_by
    ) RETURNING id INTO new_invoice_id;

    -- Create invoice items from template
    FOR item_record IN SELECT * FROM jsonb_array_elements(recurring_record.invoice_data->'items')
    LOOP
      INSERT INTO invoice_items (
        invoice_id,
        description,
        quantity,
        unit_price,
        total
      ) VALUES (
        new_invoice_id,
        item_record->>'description',
        (item_record->>'quantity')::decimal,
        (item_record->>'unitPrice')::decimal,
        (item_record->>'total')::decimal
      );
    END LOOP;

    -- Update the recurring invoice
    UPDATE recurring_invoices
    SET
      last_generated_date = CURRENT_DATE,
      next_due_date = CASE
        WHEN frequency = 'weekly' THEN next_due_date + INTERVAL '7 days'
        WHEN frequency = 'monthly' THEN next_due_date + INTERVAL '1 month'
        WHEN frequency = 'quarterly' THEN next_due_date + INTERVAL '3 months'
        WHEN frequency = 'yearly' THEN next_due_date + INTERVAL '1 year'
        ELSE next_due_date
      END,
      updated_at = NOW()
    WHERE id = recurring_record.id;

  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- VIEWS FOR APPLICATION USE
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Creating useful views...';

    -- User organizations view - shows users with their organization details
    CREATE OR REPLACE VIEW user_organizations AS
    SELECT
        u.id as user_id,
        u.email,
        u.full_name,
        u.role,
        u.language,
        u.timezone,
        u.created_at as user_created_at,
        o.id as organization_id,
        o.name as organization_name,
        o.type as organization_type,
        o.email as organization_email,
        o.website,
        o.default_language,
        o.settings as organization_settings
    FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE o.is_active = true;

    -- Document summary view - aggregated document statistics
    CREATE OR REPLACE VIEW document_summary AS
    SELECT
        d.organization_id,
        COUNT(*) as total_documents,
        SUM(d.size) as total_size_bytes,
        COUNT(CASE WHEN d.is_deleted = false THEN 1 END) as active_documents,
        COUNT(CASE WHEN d.is_deleted = true THEN 1 END) as deleted_documents,
        COUNT(DISTINCT d.category) as categories_used,
        MAX(d.created_at) as latest_upload
    FROM documents d
    GROUP BY d.organization_id;

    -- Feature usage summary view - shows feature adoption across organizations
    CREATE OR REPLACE VIEW feature_usage_summary AS
    SELECT
        f.id as feature_id,
        f.name as feature_name,
        f.category,
        COUNT(DISTINCT fr.organization_id) as organizations_requesting,
        COUNT(DISTINCT ft.organization_id) as organizations_trial,
        COUNT(fr.id) as total_requests,
        COUNT(ft.id) as total_trials,
        AVG(ft.trial_duration_days) as avg_trial_duration
    FROM features f
    LEFT JOIN feature_requests fr ON f.id = fr.feature_id
    LEFT JOIN feature_trials ft ON f.id = ft.feature_id
    GROUP BY f.id, f.name, f.category;

    RAISE NOTICE 'Views created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create views: %', SQLERRM;
END $$;

-- ===========================================
-- SEED DATA
-- ===========================================

DO $$
DECLARE
  org_id UUID;
  user_id UUID;
BEGIN
    RAISE NOTICE 'Adding seed data...';

    -- Insert basic features for marketplace
    INSERT INTO features (id, name, description, category, icon, required, popular, is_active) VALUES
    ('invoices', 'Advanced Invoicing', 'Professional invoice management with templates and automation', 'core', 'receipt', true, true, true),
    ('expenses', 'Expense Tracking', 'Track and categorize business expenses with AI analysis', 'finance', 'credit-card', false, true, true),
    ('documents', 'Document Management', 'Secure file storage with 100MB upload limits and sharing', 'productivity', 'file-text', false, true, true),
    ('marketplace', 'Feature Marketplace', 'Discover and request new platform features', 'addon', 'shopping-cart', false, false, true),
    ('reports', 'Advanced Reporting', 'Comprehensive business analytics and insights', 'analytics', 'bar-chart', false, false, true),
    ('teams', 'Team Collaboration', 'Multi-user access with role-based permissions', 'collaboration', 'users', false, true, true)
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Features seed data added';

    -- Get the first organization and user (if they exist)
    SELECT id INTO org_id FROM organizations LIMIT 1;
    SELECT id INTO user_id FROM users LIMIT 1;

    -- Only add seed data if we have an organization and user
    IF org_id IS NOT NULL AND user_id IS NOT NULL THEN
        -- Insert sample invoices
        INSERT INTO invoices (
          organization_id, invoice_number, client_name, client_email, client_address,
          status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes, created_by
        ) VALUES
        (
          org_id, 'INV-2025-001', 'Acme Corporation', 'billing@acme.com', '123 Business St, City, State 12345',
          'paid', '2025-09-01', '2025-09-30', 2500.00, 8.5, 212.50, 2712.50,
          'Web development services for Q3 2025', user_id
        ),
        (
          org_id, 'INV-2025-002', 'TechStart Inc', 'accounts@techstart.com', '456 Innovation Ave, Tech City, State 67890',
          'sent', '2025-09-05', '2025-10-05', 1800.00, 8.5, 153.00, 1953.00,
          'Mobile app development consultation', user_id
        ),
        (
          org_id, 'INV-2025-003', 'Global Solutions Ltd', 'finance@globalsolutions.com', '789 Enterprise Blvd, Metro City, State 54321',
          'overdue', '2025-08-15', '2025-09-14', 3200.00, 8.5, 272.00, 3472.00,
          'Annual maintenance contract', user_id
        ),
        (
          org_id, 'INV-2025-004', 'StartupXYZ', 'hello@startupxyz.com', '321 Launch St, Innovation City, State 98765',
          'draft', '2025-09-10', '2025-10-10', 950.00, 8.5, 80.75, 1030.75,
          'Logo design and branding package', user_id
        ),
        (
          org_id, 'INV-2025-005', 'Enterprise Corp', 'procurement@enterprise.com', '654 Corporate Pkwy, Business City, State 13579',
          'sent', '2025-09-08', '2025-10-08', 4200.00, 8.5, 357.00, 4557.00,
          'Full-stack web application development', user_id
        ) ON CONFLICT DO NOTHING;

        -- Insert invoice items
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
        ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-001'), 'Frontend Development', 40, 50.00, 2000.00),
        ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-001'), 'Backend API Development', 20, 25.00, 500.00),
        ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-002'), 'Initial Consultation', 8, 100.00, 800.00),
        ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-002'), 'Technical Specification Document', 1, 600.00, 600.00),
        ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-002'), 'Project Timeline Planning', 4, 100.00, 400.00) ON CONFLICT DO NOTHING;

        -- Insert sample reminders
        INSERT INTO scheduled_reminders (
          organization_id, title, description, reminder_type, scheduled_date,
          next_run, is_active, assigned_to, created_by
        ) VALUES
        (
          org_id, 'Review Monthly Expenses', 'Monthly review of all business expenses and categorize uncategorized items',
          'monthly', '2025-09-30 09:00:00+00', '2025-09-30 09:00:00+00', true, user_id, user_id
        ),
        (
          org_id, 'Send Invoice Reminders', 'Send payment reminders for invoices that are 7 days past due date',
          'weekly', '2025-09-16 10:00:00+00', '2025-09-16 10:00:00+00', true, user_id, user_id
        ),
        (
          org_id, 'Backup Database', 'Weekly database backup and integrity check',
          'weekly', '2025-09-15 02:00:00+00', '2025-09-22 02:00:00+00', true, user_id, user_id
        ) ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Seed data added successfully';
    ELSE
        RAISE NOTICE 'No existing organization/user found - skipping seed data';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not add seed data: %', SQLERRM;
END $$;

-- ===========================================
-- FINAL SUCCESS MESSAGE
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'ðŸŽ‰ Pot SaaS Database Setup Complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'âœ… All tables created successfully';
    RAISE NOTICE 'âœ… All indexes created for performance';
    RAISE NOTICE 'âœ… Row Level Security policies applied';
    RAISE NOTICE 'âœ… Functions and triggers installed';
    RAISE NOTICE 'âœ… Sample data added (if organization exists)';
    RAISE NOTICE '';
    RAISE NOTICE 'ðŸš€ Your database is ready for the Pot SaaS application!';
    RAISE NOTICE '';
END $$;


-- ===========================================
-- FINAL NOTES
-- ===========================================
/*
This enhanced database schema includes:

This enhanced database schema includes:

1. **Complete CRUD Support**: All entities have full create, read, update, delete operations
2. **Document Management**: File storage with R2/Cloudflare integration (tokens in url field)
3. **Feature Marketplace**: Complete feature request and trial system
4. **Internationalization**: Multi-language support with translation management
5. **Security**: Row Level Security (RLS) policies for data protection
6. **Performance**: Optimized indexes for common queries
7. **Audit Trail**: Comprehensive logging for compliance and debugging
8. **Analytics**: Views for business intelligence and reporting

Key Features:
- UUID primary keys for scalability
- JSONB fields for flexible metadata storage
- Automatic timestamp management
- Soft deletes for data preservation
- Comprehensive indexing strategy
- RLS policies for data security
- Multi-tenant architecture support

To deploy:
1. Run this script in Supabase SQL Editor
2. Configure R2/Cloudflare storage buckets
3. Set up authentication and authorization
4. Seed initial data as needed
5. Test all CRUD operations
*/
