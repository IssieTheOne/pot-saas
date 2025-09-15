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

    // Get pending requests for the organization
    const { data: requests, error: requestsError } = await supabase
      .from('feature_requests')
      .select(`
        id,
        feature_id,
        request_reason,
        status,
        created_at,
        requested_by,
        auth.users!feature_requests_requested_by_fkey (
          email,
          raw_user_meta_data
        )
      `)
      .eq('organization_id', userRole.organization_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching requests:', requestsError)
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }

    // Format the response
    const formattedRequests = requests?.map((request: any) => ({
      id: request.id,
      feature_id: request.feature_id,
      request_reason: request.request_reason,
      status: request.status,
      created_at: request.created_at,
      requested_by: request.requested_by,
      requested_by_email: request.users?.email,
      requested_by_name: request.users?.raw_user_meta_data?.name
    })) || []

    return NextResponse.json({ requests: formattedRequests })
  } catch (error) {
    console.error('Error in feature requests API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { featureId, reason } = body

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

    // Check if user can request this feature
    const { data: existingRequest, error: checkError } = await supabase
      .from('feature_requests')
      .select('id')
      .eq('organization_id', userRole.organization_id)
      .eq('feature_id', featureId)
      .eq('requested_by', user.id)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending request for this feature' }, { status: 400 })
    }

    // Create the request
    const { data: newRequest, error: insertError } = await supabase
      .from('feature_requests')
      .insert({
        organization_id: userRole.organization_id,
        requested_by: user.id,
        feature_id: featureId,
        request_reason: reason || ''
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating request:', insertError)
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
    }

    return NextResponse.json({ request: newRequest })
  } catch (error) {
    console.error('Error in feature request creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
