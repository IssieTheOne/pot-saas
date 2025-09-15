-- Test R2 Storage Integration
-- Run these queries after setting up R2 to verify the configuration

-- 1. Check if documents table has the right structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Test document insertion (replace with actual values)
-- INSERT INTO documents (
--     organization_id,
--     uploaded_by,
--     name,
--     original_name,
--     type,
--     size,
--     url,
--     storage_path,
--     category
-- ) VALUES (
--     'your-org-id',
--     'your-user-id',
--     'test-document.pdf',
--     'test-document.pdf',
--     'application/pdf',
--     1024000,
--     'https://your-bucket.r2.cloudflarestorage.com/org-id/user-id/doc-id/test-document.pdf',
--     'org-id/user-id/doc-id/test-document.pdf',
--     'contract'
-- );

-- 3. Check RLS policies on documents table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'documents'
ORDER BY policyname;

-- 4. Verify system settings for file upload limits
SELECT
    key,
    value,
    description
FROM system_settings
WHERE key IN ('max_file_size', 'supported_languages')
ORDER BY key;

-- 5. Test feature access function
SELECT has_feature_access('user-id', 'documents');

-- 6. Check document summary view
SELECT * FROM document_summary LIMIT 5;
