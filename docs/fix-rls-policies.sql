-- Fix RLS Policies for Pot SaaS
-- Run this in Supabase SQL Editor to fix the infinite recursion issue

-- Drop existing problematic policies
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
