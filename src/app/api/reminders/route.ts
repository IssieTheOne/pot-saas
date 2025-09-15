import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('scheduled_reminders')
      .select(`
        *,
        assigned_to:users!scheduled_reminders_assigned_to_fkey (full_name, email),
        created_by:users!scheduled_reminders_created_by_fkey (full_name, email),
        reminder_executions (*)
      `)
      .order('next_run', { ascending: true })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('reminder_type', type)
    }

    if (status !== null) {
      const isActive = status === 'active'
      query = query.eq('is_active', isActive)
    }

    const { data: reminders, error, count } = await query

    if (error) {
      console.error('Error fetching reminders:', error)
      return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
    }

    return NextResponse.json({
      reminders,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error in reminders API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const {
      organization_id,
      title,
      description,
      reminder_type,
      scheduled_date,
      recurrence_pattern,
      assigned_to
    } = body

    // Validate required fields
    if (!organization_id || !title || !reminder_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate next_run based on type and scheduled_date
    let next_run: string
    const now = new Date()

    if (reminder_type === 'one_time') {
      next_run = scheduled_date || now.toISOString()
    } else {
      // For recurring reminders, set next_run to the next occurrence
      next_run = scheduled_date || now.toISOString()
    }

    const { data: reminder, error } = await supabase
      .from('scheduled_reminders')
      .insert({
        organization_id,
        title,
        description,
        reminder_type,
        scheduled_date,
        recurrence_pattern,
        next_run,
        assigned_to
      })
      .select(`
        *,
        assigned_to:users!scheduled_reminders_assigned_to_fkey (full_name, email),
        created_by:users!scheduled_reminders_created_by_fkey (full_name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating reminder:', error)
      return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
    }

    return NextResponse.json({
      reminder,
      message: 'Reminder created successfully'
    })
  } catch (error) {
    console.error('Error in reminder creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}