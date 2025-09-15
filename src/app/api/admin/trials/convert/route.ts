import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { trialId } = body

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

    // Check if user can manage trials
    if (!['admin', 'owner'].includes(userRole.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Convert trial to paid
    const { data: result, error: convertError } = await supabase
      .rpc('convert_trial_to_paid', {
        p_trial_id: trialId,
        p_converted_by: user.id
      })

    if (convertError) {
      console.error('Error converting trial:', convertError)
      return NextResponse.json({ error: 'Failed to convert trial' }, { status: 500 })
    }

    if (!result) {
      return NextResponse.json({ error: 'Trial not found or already converted' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in trial conversion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
