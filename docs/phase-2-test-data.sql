-- Test Data for Phase 2: Invoice Management & Recurring Reminders
-- Run this in Supabase SQL Editor to populate test data

-- First, get the organization ID (assuming there's at least one organization)
-- Replace 'your-organization-id-here' with actual organization ID from your database

DO $$
DECLARE
  org_id UUID;
  user_id UUID;
BEGIN
  -- Get the first organization
  SELECT id INTO org_id FROM organizations LIMIT 1;

  -- Get the first user
  SELECT id INTO user_id FROM users LIMIT 1;

  -- Insert test invoices
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
  );

  -- Insert invoice items for the first invoice
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-001'), 'Frontend Development', 40, 50.00, 2000.00),
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-001'), 'Backend API Development', 20, 25.00, 500.00);

  -- Insert invoice items for the second invoice
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-002'), 'Initial Consultation', 8, 100.00, 800.00),
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-002'), 'Technical Specification Document', 1, 600.00, 600.00),
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-002'), 'Project Timeline Planning', 4, 100.00, 400.00);

  -- Insert invoice items for the third invoice
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-003'), 'Monthly Maintenance (12 months)', 12, 250.00, 3000.00),
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-003'), 'Emergency Support Calls', 8, 25.00, 200.00);

  -- Insert invoice items for the fourth invoice
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-004'), 'Logo Design (3 concepts)', 1, 400.00, 400.00),
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-004'), 'Brand Guidelines Document', 1, 300.00, 300.00),
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-004'), 'Business Card Design', 1, 150.00, 150.00);

  -- Insert invoice items for the fifth invoice
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-005'), 'Full-Stack Development', 80, 45.00, 3600.00),
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-005'), 'UI/UX Design', 20, 30.00, 600.00);

  -- Insert invoice payments
  INSERT INTO invoice_payments (invoice_id, amount, payment_date, payment_method, notes, recorded_by) VALUES
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-001'), 2712.50, '2025-09-15', 'bank_transfer', 'Full payment received via wire transfer', user_id),
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-2025-003'), 1500.00, '2025-09-01', 'credit_card', 'Partial payment - remaining $1972 due', user_id);

  -- Insert test reminders
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
  ),
  (
    org_id, 'Client Follow-up Call', 'Follow up with Acme Corporation about project requirements',
    'one_time', '2025-09-20 14:00:00+00', '2025-09-20 14:00:00+00', true, user_id, user_id
  ),
  (
    org_id, 'Tax Document Preparation', 'Prepare quarterly tax documents for Q3 2025',
    'monthly', '2025-10-01 09:00:00+00', '2025-10-01 09:00:00+00', true, user_id, user_id
  ),
  (
    org_id, 'Team Performance Review', 'Monthly team performance and goal review meeting',
    'monthly', '2025-09-25 15:00:00+00', '2025-09-25 15:00:00+00', true, user_id, user_id
  );

  -- Insert invoice reminders
  INSERT INTO invoice_reminders (
    invoice_id, reminder_type, scheduled_date, status, recipient_email,
    subject, message
  ) VALUES
  (
    (SELECT id FROM invoices WHERE invoice_number = 'INV-2025-003'),
    'overdue', '2025-09-21 09:00:00+00', 'pending', 'finance@globalsolutions.com',
    'Payment Overdue - Invoice INV-2025-003',
    'Dear Global Solutions Ltd, This is a friendly reminder that your invoice INV-2025-003 for $3,472.00 is now 7 days past due. Please arrange payment at your earliest convenience.'
  ),
  (
    (SELECT id FROM invoices WHERE invoice_number = 'INV-2025-002'),
    'due_date_approaching', '2025-09-28 09:00:00+00', 'pending', 'accounts@techstart.com',
    'Invoice Due Soon - INV-2025-002',
    'Dear TechStart Inc, This is a reminder that your invoice INV-2025-002 for $1,953.00 is due on October 5, 2025. Please ensure payment is processed by the due date.'
  );

  -- Insert recurring invoice templates
  INSERT INTO recurring_invoices (
    organization_id, template_name, client_name, client_email, client_address,
    frequency, start_date, next_due_date, is_active, invoice_data, created_by
  ) VALUES
  (
    org_id, 'Monthly Consulting Retainer', 'Acme Corporation', 'billing@acme.com', '123 Business St, City, State 12345',
    'monthly', '2025-09-01', '2025-10-01', true,
    '{
      "items": [
        {"description": "Senior Developer Consulting (20 hours)", "quantity": 20, "unitPrice": 125.00, "total": 2500.00},
        {"description": "Project Management", "quantity": 1, "unitPrice": 500.00, "total": 500.00}
      ]
    }'::jsonb,
    user_id
  ),
  (
    org_id, 'Weekly Maintenance Contract', 'Global Solutions Ltd', 'finance@globalsolutions.com', '789 Enterprise Blvd, Metro City, State 54321',
    'weekly', '2025-09-09', '2025-09-16', true,
    '{
      "items": [
        {"description": "System Maintenance & Monitoring", "quantity": 1, "unitPrice": 300.00, "total": 300.00},
        {"description": "Security Updates", "quantity": 1, "unitPrice": 150.00, "total": 150.00}
      ]
    }'::jsonb,
    user_id
  );

  -- Insert test notifications
  INSERT INTO notifications (
    organization_id, user_id, type, title, message, data, priority
  ) VALUES
  (
    org_id, user_id, 'invoice_overdue', 'Invoice Overdue',
    'Invoice INV-2025-003 to Global Solutions Ltd is now 7 days overdue.',
    '{"invoice_id": "' || (SELECT id FROM invoices WHERE invoice_number = 'INV-2025-003') || '", "amount": 3472.00}',
    'high'
  ),
  (
    org_id, user_id, 'reminder_due', 'Reminder Due Today',
    'Your reminder "Review Monthly Expenses" is due today.',
    '{"reminder_id": "' || (SELECT id FROM scheduled_reminders WHERE title = 'Review Monthly Expenses' LIMIT 1) || '"}',
    'normal'
  ),
  (
    org_id, user_id, 'payment_received', 'Payment Received',
    'Payment of $2,712.50 received from Acme Corporation for Invoice INV-2025-001.',
    '{"invoice_id": "' || (SELECT id FROM invoices WHERE invoice_number = 'INV-2025-001') || '", "amount": 2712.50}',
    'normal'
  );

  RAISE NOTICE 'Test data inserted successfully!';

END $$;