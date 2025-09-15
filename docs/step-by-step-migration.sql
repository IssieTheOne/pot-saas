-- Step-by-Step Migration Test
-- Run these queries one by one in Supabase SQL Editor to test the migration

-- STEP 1: Check current database state
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- STEP 2: Test conditional policy drop (should not error even if features table doesn't exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'features' AND table_schema = 'public') THEN
        RAISE NOTICE 'Features table exists - dropping policies';
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active features" ON features';
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can manage features" ON features';
    ELSE
        RAISE NOTICE 'Features table does not exist - skipping policy drops';
    END IF;
END $$;

-- STEP 3: Create features table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.features (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    price DECIMAL(10,2),
    trial_available BOOLEAN DEFAULT false,
    trial_duration_days INTEGER DEFAULT 14,
    requires_approval BOOLEAN DEFAULT false,
    approval_roles TEXT[] DEFAULT '{}',
    popular BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}',
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Enable RLS
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create policies
CREATE POLICY "features_public_select_policy" ON public.features
    FOR SELECT USING (is_active = true);

CREATE POLICY "features_admin_all_policy" ON public.features
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role IN ('owner', 'admin')
        )
    );

-- STEP 6: Insert default data
INSERT INTO public.features (id, name, description, category, icon, required, popular)
VALUES
    ('dashboard', 'Dashboard', 'Main dashboard with key metrics and insights', 'core', 'Home', true, false),
    ('user_management', 'User Management', 'Manage team members and permissions', 'core', 'Users', true, false)
ON CONFLICT (id) DO NOTHING;

-- STEP 7: Verify everything worked
SELECT
    '✅ Migration successful!' as status,
    COUNT(*) as features_count
FROM public.features;
