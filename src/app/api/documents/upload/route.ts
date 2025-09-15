import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        continue
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // Save document metadata to database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          type: file.type,
          size: file.size,
          url: publicUrl,
          category: 'other', // Default category
          tags: [],
          uploaded_by: 'current_user' // This should be from auth
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
