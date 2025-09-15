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

    const { data: reminder, error } = await supabase
      .from('scheduled_reminders')
      .select(`
        *,
        assigned_to:users!scheduled_reminders_assigned_to_fkey (full_name, email),
        created_by:users!scheduled_reminders_created_by_fkey (full_name, email),
        reminder_executions (*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching reminder:', error)
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error('Error in reminder API:', error)
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
      title,
      description,
      reminder_type,
      scheduled_date,
      recurrence_pattern,
      is_active,
      assigned_to
    } = body

    // Calculate next_run if needed
    let updateData: any = {
      title,
      description,
      reminder_type,
      scheduled_date,
      recurrence_pattern,
      is_active,
      assigned_to,
      updated_at: new Date().toISOString()
    }

    if (reminder_type === 'one_time') {
      updateData.next_run = scheduled_date
    }

    const { data: reminder, error } = await supabase
      .from('scheduled_reminders')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        assigned_to:users!scheduled_reminders_assigned_to_fkey (full_name, email),
        created_by:users!scheduled_reminders_created_by_fkey (full_name, email)
      `)
      .single()

    if (error) {
      console.error('Error updating reminder:', error)
      return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 })
    }

    return NextResponse.json({
      reminder,
      message: 'Reminder updated successfully'
    })
  } catch (error) {
    console.error('Error in reminder update:', error)
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

    const { error } = await supabase
      .from('scheduled_reminders')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting reminder:', error)
      return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Reminder deleted successfully' })
  } catch (error) {
    console.error('Error in reminder deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}