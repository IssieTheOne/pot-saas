import { createClient, createServiceRoleClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, organizationName } = await request.json()

    if (!email || !password || !firstName || !lastName || !organizationName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`

    const supabase = createClient()
    const supabaseAdmin = createServiceRoleClient()

    // Start a transaction-like process
    // First, create the organization using service role (bypasses RLS)
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: organizationName,
        type: 'general'
      })
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      return NextResponse.json(
        { error: 'Failed to create organization: ' + orgError.message },
        { status: 500 }
      )
    }

    // Create the user account using service role (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        organization_id: orgData.id,
      },
      email_confirm: true // Skip email confirmation for registration
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      // If auth fails, clean up the organization
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Check if this is the first user (for testing, make them admin)
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)

    const isFirstUser = !existingUsers || existingUsers.length === 0
    const userRole = isFirstUser ? 'admin' : 'owner'

    // Create the user record in our users table using service role
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user?.id,
        organization_id: orgData.id,
        email,
        full_name: fullName,
        role: userRole
      })

    if (userError) {
      console.error('User record creation error:', userError)
      // Clean up on error - use service role for auth admin operations too
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user?.id!)
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id)
      return NextResponse.json(
        { error: 'Failed to create user record: ' + userError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: authData.user,
      organization: orgData,
      message: 'Registration successful! Please check your email to verify your account.'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
