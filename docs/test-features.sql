-- Quick Test Script for Features Table
-- Run this in Supabase SQL Editor to verify the features table issue is resolved

-- 1. Check if features table exists
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'features' AND table_schema = 'public')
        THEN '✅ Features table exists'
        ELSE '❌ Features table does not exist - run the full migration script'
    END as table_status;

-- 2. If it exists, check if it has the expected structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'features'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if basic policies exist
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'features'
ORDER BY policyname;

-- 4. Test a simple insert (this should work if everything is set up correctly)
-- Uncomment the line below to test:
-- INSERT INTO features (id, name, description, category, icon, required)
-- VALUES ('test_feature', 'Test Feature', 'A test feature', 'test', 'TestIcon', false)
-- ON CONFLICT (id) DO NOTHING;
