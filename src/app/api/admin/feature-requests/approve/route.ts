import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { requestId, decision, grantTrial, comments } = body

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: 'User not found in organization' }, { status: 404 })
    }

    // Check if user can approve
    if (!['admin', 'owner'].includes(userRole.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the request
    const { data: featureRequest, error: requestError } = await supabase
      .from('feature_requests')
      .select('*')
      .eq('id', requestId)
      .eq('organization_id', userRole.organization_id)
      .single()

    if (requestError || !featureRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (featureRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request has already been processed' }, { status: 400 })
    }

    // Update the request
    const { error: updateError } = await supabase
      .from('feature_requests')
      .update({
        status: decision === 'approved' && grantTrial ? 'trial_started' : decision === 'approved' ? 'approved' : 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: decision === 'rejected' ? comments : null
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating request:', updateError)
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
    }

    // Create approval record
    const { error: approvalError } = await supabase
      .from('feature_approvals')
      .insert({
        organization_id: userRole.organization_id,
        feature_id: featureRequest.feature_id,
        request_id: requestId,
        approved_by: user.id,
        approval_type: 'feature_request',
        decision: decision,
        comments: comments || ''
      })

    if (approvalError) {
      console.error('Error creating approval record:', approvalError)
    }

    // If approved, enable the feature or start trial
    if (decision === 'approved') {
      if (grantTrial) {
        // Start a trial
        const trialDurationDays = 14 // Default trial duration

        const { data: trial, error: trialError } = await supabase
          .rpc('start_feature_trial', {
            p_organization_id: userRole.organization_id,
            p_feature_id: featureRequest.feature_id,
            p_requested_by: featureRequest.requested_by,
            p_trial_duration_days: trialDurationDays
          })

        if (trialError) {
          console.error('Error starting trial:', trialError)
          return NextResponse.json({ error: 'Failed to start trial' }, { status: 500 })
        }
      } else {
        // Enable feature permanently
        const { error: enableError } = await supabase
          .rpc('enable_organization_feature', {
            p_organization_id: userRole.organization_id,
            p_feature_id: featureRequest.feature_id
          })

        if (enableError) {
          console.error('Error enabling feature:', enableError)
          return NextResponse.json({ error: 'Failed to enable feature' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in feature approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
