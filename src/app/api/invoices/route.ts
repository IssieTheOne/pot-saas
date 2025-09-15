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

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization from the users table
    let userData = null
    const { data: initialUserData, error: userDataError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userDataError || !initialUserData) {
      // User not found in users table, try to sync them
      if (userDataError?.code === 'PGRST116') { // Not found error
        console.log('User not found in users table, attempting to sync...')
        // Try to get organization_id from user metadata as fallback
        const organizationId = user.user_metadata?.organization_id

        if (organizationId) {
          // Create the user record directly
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              organization_id: organizationId,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
              role: 'team_member',
              is_active: true,
              email_verified: user.email_confirmed_at ? true : false
            })
            .select()
            .single()

          if (!createError && newUser) {
            userData = newUser
          } else {
            return NextResponse.json({ error: 'Failed to sync user account. Please contact support.' }, { status: 400 })
          }
        } else {
          return NextResponse.json({ error: 'User account not properly set up. Please contact support.' }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
      }
    } else {
      userData = initialUserData
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*),
        invoice_payments (*),
        created_by:users!invoices_created_by_fkey (full_name, email)
      `)
      .eq('organization_id', userData.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: invoices, error, count } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }

    return NextResponse.json({
      invoices,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error in invoices API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization from the users table
    let userData = null
    const { data: initialUserData, error: userDataError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userDataError || !initialUserData) {
      // User not found in users table, try to sync them
      if (userDataError?.code === 'PGRST116') { // Not found error
        console.log('User not found in users table, attempting to sync...')
        // Try to get organization_id from user metadata as fallback
        const organizationId = user.user_metadata?.organization_id

        if (organizationId) {
          // Create the user record directly
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              organization_id: organizationId,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
              role: 'team_member',
              is_active: true,
              email_verified: user.email_confirmed_at ? true : false
            })
            .select()
            .single()

          if (!createError && newUser) {
            userData = newUser
          } else {
            return NextResponse.json({ error: 'Failed to sync user account. Please contact support.' }, { status: 400 })
          }
        } else {
          return NextResponse.json({ error: 'User account not properly set up. Please contact support.' }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
      }
    } else {
      userData = initialUserData
    }

    const body = await request.json()
    const {
      organization_id,
      invoice_number,
      client_name,
      client_email,
      client_address,
      issue_date,
      due_date,
      tax_rate = 0,
      notes,
      items = []
    } = body

    // Validate required fields
    if (!organization_id || !invoice_number || !client_name || !issue_date || !due_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user belongs to the organization
    if (userData.organization_id !== organization_id) {
      return NextResponse.json(
        { error: 'Unauthorized to create invoices for this organization' },
        { status: 403 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const tax_amount = subtotal * (tax_rate / 100)
    const total = subtotal + tax_amount

    // Create the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        organization_id,
        invoice_number,
        client_name,
        client_email,
        client_address,
        status: 'draft',
        issue_date,
        due_date,
        subtotal,
        tax_rate,
        tax_amount,
        total,
        notes,
        created_by: user.id
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }

    // Create invoice items
    if (items.length > 0) {
      const invoiceItems = items.map((item: any) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
        // Don't fail the whole request, but log the error
      }
    }

    // Fetch the complete invoice with items
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', invoice.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete invoice:', fetchError)
    }

    return NextResponse.json({
      invoice: completeInvoice || invoice,
      message: 'Invoice created successfully'
    })
  } catch (error) {
    console.error('Error in invoice creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}