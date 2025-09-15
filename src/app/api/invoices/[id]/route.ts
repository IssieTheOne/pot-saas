import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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

    // Calculate totals if items are provided
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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if invoice exists and can be deleted
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', params.id)
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