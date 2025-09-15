import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: 'User not found in organization' }, { status: 404 })
    }

    // Get active trials for the organization
    const { data: trials, error: trialsError } = await supabase
      .from('feature_trials')
      .select(`
        id,
        feature_id,
        requested_by,
        approved_by,
        trial_duration_days,
        started_at,
        ends_at,
        status,
        auth.users!feature_trials_requested_by_fkey (
          email,
          raw_user_meta_data
        )
      `)
      .eq('organization_id', userRole.organization_id)
      .eq('status', 'active')
      .order('ends_at', { ascending: true })

    if (trialsError) {
      console.error('Error fetching trials:', trialsError)
      return NextResponse.json({ error: 'Failed to fetch trials' }, { status: 500 })
    }

    // Format the response
    const formattedTrials = trials?.map((trial: any) => ({
      id: trial.id,
      feature_id: trial.feature_id,
      requested_by: trial.requested_by,
      approved_by: trial.approved_by,
      trial_duration_days: trial.trial_duration_days,
      started_at: trial.started_at,
      ends_at: trial.ends_at,
      status: trial.status,
      requested_by_email: trial.users?.email,
      requested_by_name: trial.users?.raw_user_meta_data?.name
    })) || []

    return NextResponse.json({ trials: formattedTrials })
  } catch (error) {
    console.error('Error in trials API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
