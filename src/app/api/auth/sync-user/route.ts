import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in public.users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking user:', checkError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({
        message: 'User record already exists',
        user: existingUser
      })
    }

    // User doesn't exist in public.users table, create one
    // Try to get organization_id from user metadata (for users created through registration)
    const organizationId = user.user_metadata?.organization_id

    if (!organizationId) {
      return NextResponse.json({
        error: 'Cannot create user record: no organization_id found in user metadata. Please contact support.'
      }, { status: 400 })
    }

    // Create the user record
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        organization_id: organizationId,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
        role: 'team_member', // Default role
        is_active: true,
        email_verified: user.email_confirmed_at ? true : false
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user record:', createError)
      return NextResponse.json({
        error: 'Failed to create user record: ' + createError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'User record created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('Error in sync-user API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}