-- Pot SaaS Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'team_member',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
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

-- Invoice items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  expense_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view their organization's users" ON users;
DROP POLICY IF EXISTS "Users can view their organization's invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their organization's expenses" ON expenses;

-- Organizations policies
CREATE POLICY "Allow organization creation" ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    auth.uid() IN (
      SELECT id FROM users WHERE organization_id = organizations.id
    )
  );

CREATE POLICY "Users can update their organization" ON organizations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE organization_id = organizations.id AND role IN ('owner', 'admin')
    )
  );

-- Users policies
CREATE POLICY "Allow user creation during registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update users in their organization" ON users
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE organization_id = users.organization_id AND role IN ('owner', 'admin')
    )
  );

-- Invoices policies
CREATE POLICY "Users can view invoices in their organization" ON invoices
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoices in their organization" ON invoices
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices in their organization" ON invoices
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Invoice items policies
CREATE POLICY "Users can view invoice items for their organization's invoices" ON invoice_items
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create invoice items for their organization's invoices" ON invoice_items
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Expenses policies
CREATE POLICY "Users can view expenses in their organization" ON expenses
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create expenses in their organization" ON expenses
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update expenses in their organization" ON expenses
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE organization_id = expenses.organization_id AND role IN ('owner', 'admin')
    )
  );

-- Insert a test organization and user (optional)
-- INSERT INTO organizations (name, type) VALUES ('Test Company', 'general');
-- INSERT INTO users (organization_id, email, full_name, role) VALUES
--   ((SELECT id FROM organizations LIMIT 1), 'test@example.com', 'Test User', 'owner');
