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

export async function GET() {
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

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error in documents API:', error)
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
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const uploadedDocuments = []

    for (const file of files) {
      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 100MB.` },
          { status: 400 }
        )
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

      // TODO: Implement proper R2 upload with AWS SDK or signed URLs
      // For now, we'll just save metadata to database
      const publicUrl = `https://placeholder-url.com/${uniqueFileName}` // Placeholder URL

      // Save document metadata to database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          organization_id: userData.organization_id,
          uploaded_by: user.id,
          name: uniqueFileName,
          original_name: file.name,
          type: file.type,
          size: file.size,
          url: publicUrl,
          storage_path: uniqueFileName,
          category: 'other',
          tags: [],
          is_deleted: false
        })
        .select()
        .single()

      if (dbError) {
        console.error('Error saving document metadata:', dbError)
        continue
      }

      uploadedDocuments.push(document)
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      documents: uploadedDocuments
    })
  } catch (error) {
    console.error('Error in documents upload API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
