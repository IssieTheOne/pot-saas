import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use service role key to bypass RLS for status check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase service role configuration. Please check your .env.local file.',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test connection and check if tables exist
    const tables = ['organizations', 'users', 'invoices', 'expenses']
    const tableStatus: Record<string, string> = {}

    for (const table of tables) {
      try {
        // Try to select from the table to see if it exists
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        // If no error, table exists
        // If error contains "does not exist", table doesn't exist
        if (error) {
          if (error.message.includes('does not exist')) {
            tableStatus[table] = 'not_created'
          } else {
            // Table exists but there might be other issues
            tableStatus[table] = 'exists'
          }
        } else {
          tableStatus[table] = 'exists'
        }
      } catch (err: any) {
        if (err.message && err.message.includes('does not exist')) {
          tableStatus[table] = 'not_created'
        } else {
          tableStatus[table] = 'exists'
        }
      }
    }

    const allTablesExist = Object.values(tableStatus).every(status => status === 'exists')

    return NextResponse.json({
      success: true,
      message: 'Database status check completed',
      tables: tableStatus,
      database_ready: allTablesExist,
      next_steps: allTablesExist
        ? ['🎉 Database is ready! You can now start building features.']
        : [
            '1. Go to Supabase Dashboard > SQL Editor',
            '2. Copy and run the database-schema.sql file',
            '3. Refresh this page to verify setup'
          ],
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
