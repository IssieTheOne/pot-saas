import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { mailerSend } from '@/lib/mailersend'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { email, userName } = await request.json()

    if (!email || !userName) {
      return NextResponse.json(
        { error: 'Email and userName are required' },
        { status: 400 }
      )
    }

    // Generate a verification token (you might want to store this in your database)
    const verificationToken = crypto.randomUUID()

    // Send verification email
    const result = await mailerSend.sendEmailVerification({
      email,
      verificationToken,
      userName
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      verificationToken, // In production, you'd store this securely
      message: 'Email verification sent successfully'
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send email verification' },
      { status: 500 }
    )
  }
}