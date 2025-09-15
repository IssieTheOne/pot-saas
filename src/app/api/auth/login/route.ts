import { createServerClient, createServiceRoleClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const supabaseAdmin = createServiceRoleClient()

    // Use server client for authentication to create proper session
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Get user details from our custom users table
    let userDetails = null
    try {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, organization_id, email, full_name, role')
        .eq('id', data.user?.id)
        .single()

      if (userError) {
        console.error('User details query error:', userError)
        // Don't fail the login if we can't get user details, just log it
      } else {
        userDetails = userData
      }
    } catch (userQueryError) {
      console.error('User details query exception:', userQueryError)
    }

    // Create response - the middleware will handle setting cookies
    const response = NextResponse.json({
      user: {
        ...data.user,
        ...(userDetails && {
          role: userDetails.role,
          organization_id: userDetails.organization_id,
          full_name: userDetails.full_name
        })
      },
      session: data.session,
      message: 'Login successful'
    })

    return response

  } catch (error) {
    console.error('Login internal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
