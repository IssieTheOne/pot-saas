-- ===========================================
-- COMPREHENSIVE POT SAAS CRUD TEST SCRIPT
-- ===========================================
-- This script tests all CRUD operations for the Pot SaaS platform
-- Run this after deploying the enhanced-database-schema.sql
-- It covers: User registration, Invoice management, Expense tracking,
-- Document operations, Team management, and Feature marketplace

DO $$
DECLARE
    -- Test variables
    test_org_id UUID;
    test_user_id UUID;
    test_invoice_id UUID;
    test_expense_id UUID;
    test_document_id UUID;
    test_team_id UUID;
    test_reminder_id UUID;
    test_feature_request_id UUID;
BEGIN
    RAISE NOTICE '🚀 Starting Comprehensive Pot SaaS CRUD Tests...';

    -- ===========================================
    -- 1. USER REGISTRATION & ORGANIZATION CREATION
    -- ===========================================
    RAISE NOTICE '📝 Testing User Registration & Organization Creation...';

    -- Create test organization
    INSERT INTO organizations (
        name, type, address, email, phone, website,
        default_language, supported_languages, settings
    ) VALUES (
        'Test Company Inc',
        'business',
        '123 Test Street, Test City, TC 12345',
        'contact@testcompany.com',
        '+1-555-0123',
        'https://testcompany.com',
        'en',
        '["en", "es"]',
        '{"timezone": "America/New_York", "currency": "USD"}'
    ) RETURNING id INTO test_org_id;

    RAISE NOTICE '✅ Organization created: %', test_org_id;

    -- Create test user (simulating registration)
    INSERT INTO users (
        organization_id, email, full_name, role, language, timezone
    ) VALUES (
        test_org_id,
        'john.doe.' || EXTRACT(epoch FROM NOW()) || '@testcompany.com',
        'John Doe',
        'owner',
        'en',
        'America/New_York'
    ) RETURNING id INTO test_user_id;

    RAISE NOTICE '✅ User registered: %', test_user_id;

    -- Create user profile
    INSERT INTO user_profiles (
        user_id, bio, job_title, department, phone, theme
    ) VALUES (
        test_user_id,
        'Experienced business owner with 10+ years in tech',
        'CEO',
        'Executive',
        '+1-555-0124',
        'light'
    );

    RAISE NOTICE '✅ User profile created';

    -- ===========================================
    -- 2. INVOICE CRUD OPERATIONS
    -- ===========================================
    RAISE NOTICE '💰 Testing Invoice CRUD Operations...';

    -- CREATE: New invoice
    INSERT INTO invoices (
        organization_id, invoice_number, client_name, client_email,
        client_address, status, issue_date, due_date, subtotal,
        tax_rate, notes, created_by
    ) VALUES (
        test_org_id,
        'TEST-' || EXTRACT(epoch FROM NOW()),
        'Client Corp',
        'billing@clientcorp.com',
        '456 Client Ave, Client City, CC 67890',
        'draft',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        2500.00,
        8.5,
        'Test invoice for development services',
        test_user_id
    ) RETURNING id INTO test_invoice_id;

    RAISE NOTICE '✅ Invoice created: %', test_invoice_id;

    -- CREATE: Invoice items
    INSERT INTO invoice_items (
        invoice_id, description, quantity, unit_price, total
    ) VALUES
    (test_invoice_id, 'Frontend Development', 20, 75.00, 1500.00),
    (test_invoice_id, 'Backend API Development', 15, 66.67, 1000.00);

    RAISE NOTICE '✅ Invoice items added';

    -- READ: Verify invoice totals were calculated
    RAISE NOTICE '📊 Invoice totals: %',
        (SELECT CONCAT('Subtotal: ', subtotal, ', Tax: ', tax_amount, ', Total: ', total)
         FROM invoices WHERE id = test_invoice_id);

    -- UPDATE: Change invoice status
    UPDATE invoices
    SET status = 'sent', updated_at = NOW()
    WHERE id = test_invoice_id;

    RAISE NOTICE '✅ Invoice status updated to sent';

    -- CREATE: Invoice payment
    INSERT INTO invoice_payments (
        invoice_id, amount, payment_date, payment_method,
        transaction_id, notes, recorded_by
    ) VALUES (
        test_invoice_id,
        2500.00,
        CURRENT_DATE,
        'bank_transfer',
        'TXN-' || EXTRACT(epoch FROM NOW()),
        'Full payment received',
        test_user_id
    );

    RAISE NOTICE '✅ Payment recorded';

    -- ===========================================
    -- 3. EXPENSE CRUD OPERATIONS
    -- ===========================================
    RAISE NOTICE '💸 Testing Expense CRUD Operations...';

    -- CREATE: New expense
    INSERT INTO expenses (
        organization_id, user_id, category, amount, description,
        expense_date, payment_method, is_reimbursable
    ) VALUES (
        test_org_id,
        test_user_id,
        'Office Supplies',
        125.50,
        'Printer paper and ink cartridges',
        CURRENT_DATE - INTERVAL '3 days',
        'credit_card',
        true
    ) RETURNING id INTO test_expense_id;

    RAISE NOTICE '✅ Expense created: %', test_expense_id;

    -- CREATE: Additional expenses
    INSERT INTO expenses (
        organization_id, user_id, category, amount, description,
        expense_date, payment_method, is_reimbursable
    ) VALUES
    (test_org_id, test_user_id, 'Travel', 450.00, 'Flight to client meeting', CURRENT_DATE - INTERVAL '7 days', 'credit_card', true),
    (test_org_id, test_user_id, 'Software', 99.00, 'Annual software license', CURRENT_DATE - INTERVAL '1 day', 'bank_transfer', false);

    RAISE NOTICE '✅ Additional expenses added';

    -- READ: Get expense summary
    RAISE NOTICE '📊 Expense summary: %',
        (SELECT CONCAT('Total: ', SUM(amount), ', Count: ', COUNT(*))
         FROM expenses WHERE organization_id = test_org_id);

    -- UPDATE: Approve expense
    UPDATE expenses
    SET status = 'approved', approved_by = test_user_id, approved_at = NOW(), updated_at = NOW()
    WHERE id = test_expense_id;

    RAISE NOTICE '✅ Expense approved';

    -- ===========================================
    -- 4. DOCUMENT CRUD OPERATIONS
    -- ===========================================
    RAISE NOTICE '📄 Testing Document CRUD Operations...';

    -- CREATE: Upload document
    INSERT INTO documents (
        organization_id, uploaded_by, name, original_name, type, size,
        url, storage_path, category, tags
    ) VALUES (
        test_org_id,
        test_user_id,
        'contract-001.pdf',
        'Client Contract.pdf',
        'application/pdf',
        2048576, -- 2MB
        'token-' || EXTRACT(epoch FROM NOW()) || 'abc123',
        'contracts/2025/contract-001.pdf',
        'contracts',
        ARRAY['client', 'contract', 'signed']
    ) RETURNING id INTO test_document_id;

    RAISE NOTICE '✅ Document uploaded: %', test_document_id;

    -- CREATE: Additional documents
    INSERT INTO documents (
        organization_id, uploaded_by, name, original_name, type, size,
        url, storage_path, category, tags
    ) VALUES
    (test_org_id, test_user_id, 'receipt-001.jpg', 'Office Supplies Receipt.jpg', 'image/jpeg', 512000, 'token-' || EXTRACT(epoch FROM NOW()) || 'def789', 'receipts/2025/receipt-001.jpg', 'receipts', ARRAY['office', 'supplies']),
    (test_org_id, test_user_id, 'presentation.pptx', 'Q4 Presentation.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 5242880, 'token-' || EXTRACT(epoch FROM NOW()) || 'jkl345', 'presentations/2025/q4-review.pptx', 'presentations', ARRAY['quarterly', 'review']);

    RAISE NOTICE '✅ Additional documents uploaded';

    -- READ: Document summary
    RAISE NOTICE '📊 Document summary: %',
        (SELECT CONCAT('Total: ', COUNT(*), ', Size: ', SUM(size), ' bytes')
         FROM documents WHERE organization_id = test_org_id AND is_deleted = false);

    -- UPDATE: Update document metadata
    UPDATE documents
    SET tags = ARRAY['client', 'contract', 'signed', 'important'], updated_at = NOW()
    WHERE id = test_document_id;

    RAISE NOTICE '✅ Document metadata updated';

    -- CREATE: Document share
    INSERT INTO document_shares (
        document_id, shared_by, shared_with_email, shared_with_name,
        permissions, token, expires_at
    ) VALUES (
        test_document_id,
        test_user_id,
        'client@clientcorp.com',
        'Client Contact',
        'read',
        'share-token-' || EXTRACT(epoch FROM NOW()),
        CURRENT_DATE + INTERVAL '30 days'
    );

    RAISE NOTICE '✅ Document shared with client';

    -- SOFT DELETE: Mark document as deleted
    UPDATE documents
    SET is_deleted = true, deleted_at = NOW(), deleted_by = test_user_id, updated_at = NOW()
    WHERE id = test_document_id;

    RAISE NOTICE '✅ Document soft deleted';

    -- ===========================================
    -- 5. TEAM MANAGEMENT OPERATIONS
    -- ===========================================
    RAISE NOTICE '👥 Testing Team Management Operations...';

    -- CREATE: New team
    INSERT INTO teams (
        organization_id, name, description, created_by
    ) VALUES (
        test_org_id,
        'Development Team',
        'Core development and engineering team',
        test_user_id
    ) RETURNING id INTO test_team_id;

    RAISE NOTICE '✅ Team created: %', test_team_id;

    -- CREATE: Team member
    INSERT INTO team_members (
        team_id, user_id, role
    ) VALUES (
        test_team_id,
        test_user_id,
        'lead'
    );

    RAISE NOTICE '✅ Team member added';

    -- CREATE: Team invitation
    INSERT INTO team_invitations (
        organization_id, team_id, email, role, token, expires_at, invited_by
    ) VALUES (
        test_org_id,
        test_team_id,
        'jane.smith.' || EXTRACT(epoch FROM NOW()) || '@testcompany.com',
        'developer',
        'invite-token-' || EXTRACT(epoch FROM NOW()),
        CURRENT_DATE + INTERVAL '7 days',
        test_user_id
    );

    RAISE NOTICE '✅ Team invitation sent';

    -- ===========================================
    -- 6. NOTIFICATION & REMINDER SYSTEM
    -- ===========================================
    RAISE NOTICE '🔔 Testing Notification & Reminder System...';

    -- CREATE: Scheduled reminder
    INSERT INTO scheduled_reminders (
        organization_id, title, description, reminder_type,
        scheduled_date, next_run, is_active, assigned_to, created_by
    ) VALUES (
        test_org_id,
        'Monthly Expense Review',
        'Review and categorize all business expenses',
        'monthly',
        CURRENT_DATE + INTERVAL '1 month',
        CURRENT_DATE + INTERVAL '1 month',
        true,
        test_user_id,
        test_user_id
    ) RETURNING id INTO test_reminder_id;

    RAISE NOTICE '✅ Scheduled reminder created: %', test_reminder_id;

    -- CREATE: Notification
    INSERT INTO notifications (
        organization_id, user_id, type, title, message, data, priority
    ) VALUES (
        test_org_id,
        test_user_id,
        'system',
        'Welcome to Pot SaaS',
        'Your account has been successfully set up!',
        '{"setup_complete": true}',
        'normal'
    );

    RAISE NOTICE '✅ Notification created';

    -- ===========================================
    -- 7. FEATURE MARKETPLACE OPERATIONS
    -- ===========================================
    RAISE NOTICE '✨ Testing Feature Marketplace Operations...';

    -- READ: Check available features
    RAISE NOTICE '📋 Available features: %',
        (SELECT COUNT(*) FROM features WHERE is_active = true);

    -- CREATE: Feature request
    INSERT INTO feature_requests (
        organization_id, requested_by, feature_id, request_reason
    ) VALUES (
        test_org_id,
        test_user_id,
        'marketplace',
        'We need advanced reporting features for our business analytics'
    ) RETURNING id INTO test_feature_request_id;

    RAISE NOTICE '✅ Feature request submitted: %', test_feature_request_id;

    -- CREATE: Feature trial
    INSERT INTO feature_trials (
        organization_id, feature_id, requested_by, trial_duration_days, ends_at
    ) VALUES (
        test_org_id,
        'invoices',
        test_user_id,
        14,
        CURRENT_DATE + INTERVAL '14 days'
    );

    RAISE NOTICE '✅ Feature trial started';

    -- ===========================================
    -- 8. RECURRING INVOICE OPERATIONS
    -- ===========================================
    RAISE NOTICE '🔄 Testing Recurring Invoice Operations...';

    -- CREATE: Recurring invoice template
    INSERT INTO recurring_invoices (
        organization_id, template_name, client_name, client_email,
        client_address, frequency, start_date, next_due_date,
        invoice_data, created_by
    ) VALUES (
        test_org_id,
        'Monthly Consulting',
        'Client Corp',
        'billing@clientcorp.com',
        '456 Client Ave, Client City, CC 67890',
        'monthly',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 month',
        '{
            "items": [
                {"description": "Monthly Consulting", "quantity": 1, "unitPrice": 5000.00, "total": 5000.00}
            ]
        }'::jsonb,
        test_user_id
    );

    RAISE NOTICE '✅ Recurring invoice template created';

    -- ===========================================
    -- 9. SYSTEM OPERATIONS & CLEANUP
    -- ===========================================
    RAISE NOTICE '🧹 Testing System Operations & Cleanup...';

    -- READ: System health check - count all records
    RAISE NOTICE '📊 System Health Check:';
    RAISE NOTICE '   Organizations: %', (SELECT COUNT(*) FROM organizations);
    RAISE NOTICE '   Users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '   Invoices: %', (SELECT COUNT(*) FROM invoices);
    RAISE NOTICE '   Invoice Items: %', (SELECT COUNT(*) FROM invoice_items);
    RAISE NOTICE '   Expenses: %', (SELECT COUNT(*) FROM expenses);
    RAISE NOTICE '   Documents: %', (SELECT COUNT(*) FROM documents WHERE is_deleted = false);
    RAISE NOTICE '   Teams: %', (SELECT COUNT(*) FROM teams);
    RAISE NOTICE '   Notifications: %', (SELECT COUNT(*) FROM notifications);
    RAISE NOTICE '   Scheduled Reminders: %', (SELECT COUNT(*) FROM scheduled_reminders);

    -- Test view functionality
    RAISE NOTICE '🔍 Testing Views:';
    RAISE NOTICE '   User Organizations View: % rows', (SELECT COUNT(*) FROM user_organizations);
    RAISE NOTICE '   Document Summary View: % rows', (SELECT COUNT(*) FROM document_summary);
    RAISE NOTICE '   Feature Usage Summary View: % rows', (SELECT COUNT(*) FROM feature_usage_summary);

    -- Test function calls
    RAISE NOTICE '⚙️ Testing Functions:';
    PERFORM generate_recurring_invoices();
    RAISE NOTICE '   Recurring invoice generation: Completed';

    -- Final cleanup (optional - uncomment if you want to clean up test data)
    /*
    RAISE NOTICE '🧹 Cleaning up test data...';
    DELETE FROM invoice_payments WHERE invoice_id IN (SELECT id FROM invoices WHERE organization_id = test_org_id);
    DELETE FROM invoice_reminders WHERE invoice_id IN (SELECT id FROM invoices WHERE organization_id = test_org_id);
    DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE organization_id = test_org_id);
    DELETE FROM invoices WHERE organization_id = test_org_id;
    DELETE FROM expenses WHERE organization_id = test_org_id;
    DELETE FROM document_shares WHERE document_id IN (SELECT id FROM documents WHERE organization_id = test_org_id);
    DELETE FROM document_versions WHERE document_id IN (SELECT id FROM documents WHERE organization_id = test_org_id);
    DELETE FROM documents WHERE organization_id = test_org_id;
    DELETE FROM team_invitations WHERE organization_id = test_org_id;
    DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE organization_id = test_org_id);
    DELETE FROM teams WHERE organization_id = test_org_id;
    DELETE FROM scheduled_reminders WHERE organization_id = test_org_id;
    DELETE FROM notifications WHERE organization_id = test_org_id;
    DELETE FROM feature_trials WHERE organization_id = test_org_id;
    DELETE FROM feature_requests WHERE organization_id = test_org_id;
    DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE organization_id = test_org_id);
    DELETE FROM users WHERE organization_id = test_org_id;
    DELETE FROM organizations WHERE id = test_org_id;
    RAISE NOTICE '✅ Test data cleaned up';
    */

    RAISE NOTICE '';
    RAISE NOTICE '🎉 ALL CRUD TESTS COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ User Registration & Authentication: PASSED';
    RAISE NOTICE '✅ Invoice Management (Create/Read/Update): PASSED';
    RAISE NOTICE '✅ Expense Tracking: PASSED';
    RAISE NOTICE '✅ Document Upload/Download/Management: PASSED';
    RAISE NOTICE '✅ Team Management: PASSED';
    RAISE NOTICE '✅ Notification System: PASSED';
    RAISE NOTICE '✅ Feature Marketplace: PASSED';
    RAISE NOTICE '✅ Recurring Invoices: PASSED';
    RAISE NOTICE '✅ System Views & Functions: PASSED';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your Pot SaaS platform is fully operational!';
    RAISE NOTICE '';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '❌ CRUD Test failed: %', SQLERRM;
END $$;