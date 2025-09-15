import { NextResponse } from 'next/server'
import { mailerSend } from '@/lib/mailersend'

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    const result = await mailerSend.sendEmail({
      to,
      subject,
      html
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Test email sent successfully'
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}