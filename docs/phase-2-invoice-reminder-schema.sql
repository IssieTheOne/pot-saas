-- Phase 2: Invoice Management & Recurring Reminders
-- Additional database schema for enhanced invoice management and reminder system

-- ===========================================
-- ENHANCED INVOICE MANAGEMENT
-- ===========================================

-- Invoice templates
CREATE TABLE invoice_templates (
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
CREATE TABLE invoice_payments (
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
CREATE TABLE invoice_reminders (
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
CREATE TABLE recurring_invoices (
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

-- ===========================================
-- NOTIFICATION & REMINDER SYSTEM
-- ===========================================

-- General notifications table (for all types of notifications)
CREATE TABLE notifications (
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
CREATE TABLE scheduled_reminders (
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
CREATE TABLE reminder_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES scheduled_reminders(id) ON DELETE CASCADE,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'skipped'
  error_message TEXT,
  recipient_count INTEGER DEFAULT 0
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Invoice indexes
CREATE INDEX idx_invoices_organization_status ON invoices(organization_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_client_email ON invoices(client_email);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Payment indexes
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_date ON invoice_payments(payment_date);

-- Reminder indexes
CREATE INDEX idx_invoice_reminders_invoice_id ON invoice_reminders(invoice_id);
CREATE INDEX idx_invoice_reminders_status ON invoice_reminders(status);
CREATE INDEX idx_invoice_reminders_scheduled_date ON invoice_reminders(scheduled_date);

-- Recurring invoice indexes
CREATE INDEX idx_recurring_invoices_organization ON recurring_invoices(organization_id);
CREATE INDEX idx_recurring_invoices_next_due ON recurring_invoices(next_due_date);
CREATE INDEX idx_recurring_invoices_active ON recurring_invoices(is_active);

-- Notification indexes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_organization_type ON notifications(organization_id, type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Scheduled reminder indexes
CREATE INDEX idx_scheduled_reminders_next_run ON scheduled_reminders(next_run);
CREATE INDEX idx_scheduled_reminders_active ON scheduled_reminders(is_active);
CREATE INDEX idx_scheduled_reminders_assigned_to ON scheduled_reminders(assigned_to);

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Invoice Templates
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view invoice templates in their organization" ON invoice_templates
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
CREATE POLICY "Users can manage invoice templates in their organization" ON invoice_templates
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Invoice Payments
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view payments for invoices in their organization" ON invoice_payments
  FOR SELECT USING (invoice_id IN (
    SELECT id FROM invoices WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));
CREATE POLICY "Users can manage payments for invoices in their organization" ON invoice_payments
  FOR ALL USING (invoice_id IN (
    SELECT id FROM invoices WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- Invoice Reminders
ALTER TABLE invoice_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view reminders for invoices in their organization" ON invoice_reminders
  FOR SELECT USING (invoice_id IN (
    SELECT id FROM invoices WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));
CREATE POLICY "Users can manage reminders for invoices in their organization" ON invoice_reminders
  FOR ALL USING (invoice_id IN (
    SELECT id FROM invoices WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- Recurring Invoices
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view recurring invoices in their organization" ON recurring_invoices
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
CREATE POLICY "Users can manage recurring invoices in their organization" ON recurring_invoices
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Scheduled Reminders
ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view reminders in their organization" ON scheduled_reminders
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
CREATE POLICY "Users can manage reminders in their organization" ON scheduled_reminders
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Reminder Executions
ALTER TABLE reminder_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view executions for reminders in their organization" ON reminder_executions
  FOR SELECT USING (reminder_id IN (
    SELECT id FROM scheduled_reminders WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

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
$$ LANGUAGE plpgsql;</content>
<parameter name="filePath">g:\Coding Projects\pot-saas\docs\phase-2-invoice-reminder-schema.sql