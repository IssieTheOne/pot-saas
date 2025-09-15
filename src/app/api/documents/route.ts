import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
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
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await request.formData()

    // Get user from session (this should be handled by middleware, but let's get it explicitly)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
          organization_id: user.user_metadata?.organization_id,
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
