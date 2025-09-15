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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization from the users table
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*),
        invoice_payments (*),
        invoice_reminders (*),
        created_by:users!invoices_created_by_fkey (full_name, email)
      `)
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .single()

    if (error) {
      console.error('Error fetching invoice:', error)
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error in invoice API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization from the users table
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    const body = await request.json()
    const {
      invoice_number,
      client_name,
      client_email,
      client_address,
      status,
      issue_date,
      due_date,
      tax_rate,
      notes,
      items = []
    } = body

    // First, get the invoice to verify ownership
    const { data: existingInvoice, error: getInvoiceError } = await supabase
      .from('invoices')
      .select('organization_id')
      .eq('id', params.id)
      .single()

    if (getInvoiceError || !existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Verify user belongs to the organization
    if (userData.organization_id !== existingInvoice.organization_id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this invoice' },
        { status: 403 }
      )
    }
    let updateData: any = {
      invoice_number,
      client_name,
      client_email,
      client_address,
      status,
      issue_date,
      due_date,
      tax_rate,
      notes,
      updated_at: new Date().toISOString()
    }

    if (items.length > 0) {
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
      const tax_amount = subtotal * ((tax_rate || 0) / 100)
      const total = subtotal + tax_amount

      updateData.subtotal = subtotal
      updateData.tax_amount = tax_amount
      updateData.total = total
    }

    // Update the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError)
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }

    // Update invoice items if provided
    if (items.length > 0) {
      // Delete existing items
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', params.id)

      // Insert new items
      const invoiceItems = items.map((item: any) => ({
        invoice_id: params.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) {
        console.error('Error updating invoice items:', itemsError)
      }
    }

    // Fetch the complete updated invoice
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*),
        invoice_payments (*)
      `)
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated invoice:', fetchError)
    }

    return NextResponse.json({
      invoice: completeInvoice || invoice,
      message: 'Invoice updated successfully'
    })
  } catch (error) {
    console.error('Error in invoice update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization from the users table
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    // Check if invoice exists and belongs to user's organization
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Prevent deletion of paid invoices
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete paid invoices' },
        { status: 400 }
      )
    }

    // Delete the invoice (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting invoice:', deleteError)
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error in invoice deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}