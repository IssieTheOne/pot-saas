import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error && !error.message.includes('relation "public.users" does not exist')) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      database_status: error ? 'Tables not created yet' : 'Tables exist',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
