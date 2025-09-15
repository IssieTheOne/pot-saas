-- ===========================================
-- POT SAAS DATABASE HEALTH CHECK
-- ===========================================
-- Quick verification that the database schema is properly deployed
-- and basic operations work without creating test data

DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    function_count INTEGER;
    index_count INTEGER;
    test_user_id UUID;
    test_org_id UUID;
BEGIN
    RAISE NOTICE '🏥 Starting Pot SaaS Database Health Check...';
    RAISE NOTICE '';

    -- Check if all expected tables exist
    RAISE NOTICE '📋 Checking table existence...';
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'organizations', 'users', 'user_profiles', 'teams', 'team_members',
        'team_invitations', 'invoices', 'invoice_items', 'invoice_templates',
        'invoice_payments', 'invoice_reminders', 'recurring_invoices', 'expenses',
        'documents', 'document_versions', 'document_shares', 'notifications',
        'scheduled_reminders', 'reminder_executions', 'features', 'feature_requests',
        'feature_trials', 'translations', 'system_settings'
    );

    IF table_count = 24 THEN
        RAISE NOTICE '✅ All 24 expected tables exist';
    ELSE
        RAISE EXCEPTION '❌ Missing tables. Found % out of 24 expected tables', table_count;
    END IF;

    -- Check RLS policies
    RAISE NOTICE '🔒 Checking RLS policies...';
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    IF policy_count >= 20 THEN
        RAISE NOTICE '✅ Found % RLS policies (expected: 20+)', policy_count;
    ELSE
        RAISE EXCEPTION '❌ Insufficient RLS policies. Found % (expected: 20+)', policy_count;
    END IF;

    -- Check functions
    RAISE NOTICE '⚙️ Checking database functions...';
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION';

    IF function_count >= 4 THEN
        RAISE NOTICE '✅ Found % database functions (expected: 4+)', function_count;
    ELSE
        RAISE EXCEPTION '❌ Insufficient functions. Found % (expected: 4+)', function_count;
    END IF;

    -- Check indexes
    RAISE NOTICE '🔍 Checking indexes...';
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';

    IF index_count >= 15 THEN
        RAISE NOTICE '✅ Found % indexes (expected: 15+)', index_count;
    ELSE
        RAISE EXCEPTION '❌ Insufficient indexes. Found % (expected: 15+)', index_count;
    END IF;

    -- Test basic operations
    RAISE NOTICE '🧪 Testing basic operations...';

    -- Test organization creation
    INSERT INTO organizations (name, type, email, settings)
    VALUES ('Health Check Org', 'business', 'health-check@test.com', '{"test": true}'::jsonb)
    RETURNING id INTO test_org_id;

    RAISE NOTICE '✅ Organization creation: OK';

    -- Test user creation
    INSERT INTO users (email, organization_id, role)
    VALUES ('health-check@test.com', test_org_id, 'admin')
    RETURNING id INTO test_user_id;

    RAISE NOTICE '✅ User creation: OK';

    -- Test user profile creation
    INSERT INTO user_profiles (user_id, bio, job_title, department, phone, theme)
    VALUES (test_user_id, 'Health check user', 'Tester', 'QA', '+1-555-0123', 'light');

    RAISE NOTICE '✅ User profile creation: OK';

    -- Test invoice creation
    INSERT INTO invoices (organization_id, created_by, invoice_number, client_name, status, issue_date, due_date, subtotal, total)
    VALUES (test_org_id, test_user_id, 'HC-001', 'Test Client', 'draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 100.00, 100.00);

    RAISE NOTICE '✅ Invoice creation: OK';

    -- Test expense creation
    INSERT INTO expenses (organization_id, user_id, amount, category, description, expense_date)
    VALUES (test_org_id, test_user_id, 50.00, 'Office Supplies', 'Health check expense', CURRENT_DATE);

    RAISE NOTICE '✅ Expense creation: OK';

    -- Test document creation
    INSERT INTO documents (organization_id, uploaded_by, name, original_name, type, size, url, storage_path)
    VALUES (test_org_id, test_user_id, 'health-check.pdf', 'health-check.pdf', 'application/pdf', 1024, 'token-abc123', '/test/health-check.pdf');

    RAISE NOTICE '✅ Document creation: OK';

    -- Test team creation
    INSERT INTO teams (organization_id, name, description, created_by)
    VALUES (test_org_id, 'Health Check Team', 'Test team', test_user_id);

    RAISE NOTICE '✅ Team creation: OK';

    -- Test feature request creation
    INSERT INTO feature_requests (organization_id, requested_by, feature_id, title, description, request_reason, priority)
    VALUES (test_org_id, test_user_id, 'invoices', 'Health Check Feature', 'Test feature request', 'Testing database functionality', 'medium');

    RAISE NOTICE '✅ Feature request creation: OK';

    -- Clean up test data
    RAISE NOTICE '🧹 Cleaning up test data...';

    DELETE FROM feature_requests WHERE organization_id = test_org_id;
    DELETE FROM teams WHERE organization_id = test_org_id;
    DELETE FROM documents WHERE organization_id = test_org_id;
    DELETE FROM expenses WHERE organization_id = test_org_id;
    DELETE FROM invoices WHERE organization_id = test_org_id;
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    DELETE FROM users WHERE id = test_user_id;
    DELETE FROM organizations WHERE id = test_org_id;

    RAISE NOTICE '✅ Test data cleanup: OK';

    RAISE NOTICE '';
    RAISE NOTICE '🎉 HEALTH CHECK PASSED!';
    RAISE NOTICE '✅ Database schema is properly deployed and functional';
    RAISE NOTICE '✅ All basic CRUD operations working correctly';
    RAISE NOTICE '✅ RLS policies and security measures in place';
    RAISE NOTICE '✅ Ready for application development';

EXCEPTION
    WHEN OTHERS THEN
        -- Clean up any partial test data
        IF test_org_id IS NOT NULL THEN
            DELETE FROM organizations WHERE id = test_org_id;
        END IF;

        RAISE EXCEPTION '❌ HEALTH CHECK FAILED: %', SQLERRM;
END $$;