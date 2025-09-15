-- ===========================================
-- POT SAAS TEST DATA CLEANUP SCRIPT
-- ===========================================
-- Run this to remove all test data created by the comprehensive test script
-- WARNING: This will delete test organizations and all associated data!

DO $$
DECLARE
    test_org_name TEXT := 'Test Company Inc';
    deleted_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🧹 Starting test data cleanup for organization: %', test_org_name;

    -- Find test organization
    IF EXISTS (SELECT 1 FROM organizations WHERE name = test_org_name) THEN

        -- Delete in reverse dependency order
        RAISE NOTICE 'Deleting invoice payments...';
        DELETE FROM invoice_payments
        WHERE invoice_id IN (
            SELECT i.id FROM invoices i
            JOIN organizations o ON i.organization_id = o.id
            WHERE o.name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % invoice payments', deleted_count;

        RAISE NOTICE 'Deleting invoice reminders...';
        DELETE FROM invoice_reminders
        WHERE invoice_id IN (
            SELECT i.id FROM invoices i
            JOIN organizations o ON i.organization_id = o.id
            WHERE o.name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % invoice reminders', deleted_count;

        RAISE NOTICE 'Deleting invoice items...';
        DELETE FROM invoice_items
        WHERE invoice_id IN (
            SELECT i.id FROM invoices i
            JOIN organizations o ON i.organization_id = o.id
            WHERE o.name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % invoice items', deleted_count;

        RAISE NOTICE 'Deleting invoices...';
        DELETE FROM invoices
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % invoices', deleted_count;

        RAISE NOTICE 'Deleting expenses...';
        DELETE FROM expenses
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % expenses', deleted_count;

        RAISE NOTICE 'Deleting document shares...';
        DELETE FROM document_shares
        WHERE document_id IN (
            SELECT d.id FROM documents d
            JOIN organizations o ON d.organization_id = o.id
            WHERE o.name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % document shares', deleted_count;

        RAISE NOTICE 'Deleting document versions...';
        DELETE FROM document_versions
        WHERE document_id IN (
            SELECT d.id FROM documents d
            JOIN organizations o ON d.organization_id = o.id
            WHERE o.name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % document versions', deleted_count;

        RAISE NOTICE 'Deleting documents...';
        DELETE FROM documents
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % documents', deleted_count;

        RAISE NOTICE 'Deleting team invitations...';
        DELETE FROM team_invitations
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % team invitations', deleted_count;

        RAISE NOTICE 'Deleting team members...';
        DELETE FROM team_members
        WHERE team_id IN (
            SELECT t.id FROM teams t
            JOIN organizations o ON t.organization_id = o.id
            WHERE o.name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % team members', deleted_count;

        RAISE NOTICE 'Deleting teams...';
        DELETE FROM teams
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % teams', deleted_count;

        RAISE NOTICE 'Deleting scheduled reminders...';
        DELETE FROM scheduled_reminders
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % scheduled reminders', deleted_count;

        RAISE NOTICE 'Deleting notifications...';
        DELETE FROM notifications
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % notifications', deleted_count;

        RAISE NOTICE 'Deleting feature trials...';
        DELETE FROM feature_trials
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % feature trials', deleted_count;

        RAISE NOTICE 'Deleting feature requests...';
        DELETE FROM feature_requests
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % feature requests', deleted_count;

        RAISE NOTICE 'Deleting user profiles...';
        DELETE FROM user_profiles
        WHERE user_id IN (
            SELECT u.id FROM users u
            JOIN organizations o ON u.organization_id = o.id
            WHERE o.name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % user profiles', deleted_count;

        RAISE NOTICE 'Deleting users...';
        DELETE FROM users
        WHERE organization_id IN (
            SELECT id FROM organizations WHERE name = test_org_name
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % users', deleted_count;

        RAISE NOTICE 'Deleting organization...';
        DELETE FROM organizations WHERE name = test_org_name;

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % organizations', deleted_count;

        RAISE NOTICE '';
        RAISE NOTICE '✅ Test data cleanup completed successfully!';
        RAISE NOTICE 'All test data for "%" has been removed.', test_org_name;

    ELSE
        RAISE NOTICE 'ℹ️ No test organization found with name: %', test_org_name;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Cleanup failed: %', SQLERRM;
END $$;