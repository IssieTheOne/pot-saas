import { NextResponse } from 'next/server'

interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

class MailerSendService {
  private apiKey: string
  private baseUrl = 'https://api.mailersend.com/v1'
  private fromEmail: string
  private fromName: string

  constructor() {
    this.apiKey = process.env.MAILERSEND_API_KEY || ''
    this.fromEmail = process.env.MAILERSEND_FROM_EMAIL || 'noreply@yoursaas.com'
    this.fromName = process.env.MAILERSEND_FROM_NAME || 'Your SaaS App'

    if (!this.apiKey) {
      console.warn('MailerSend API key not configured')
    }
  }

  async sendEmail({ to, subject, html, from }: EmailData) {
    try {
      if (!this.apiKey) {
        console.log('MailerSend not configured, logging email instead:')
        console.log({ to, subject, html: html.substring(0, 200) + '...' })
        return { success: true, messageId: 'dev-mode-' + Date.now() }
      }

      const response = await fetch(`${this.baseUrl}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          from: {
            email: from || this.fromEmail,
            name: this.fromName
          },
          to: [
            {
              email: to
            }
          ],
          subject: subject,
          html: html
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('MailerSend API error:', response.status, errorData)
        throw new Error(`MailerSend API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        messageId: data.message_id || 'unknown'
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  // Team invitation email
  async sendTeamInvitation(inviteData: {
    email: string
    inviterName: string
    organizationName: string
    inviteToken: string
    expiresAt: string
  }) {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?token=${inviteData.inviteToken}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>You're invited to join ${inviteData.organizationName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
          </div>

          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Join ${inviteData.organizationName}</h2>

            <p>Hi there!</p>

            <p><strong>${inviteData.inviterName}</strong> has invited you to join their team at <strong>${inviteData.organizationName}</strong>.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept Invitation</a>
            </div>

            <p style="color: #666; font-size: 14px;">This invitation will expire on ${new Date(inviteData.expiresAt).toLocaleDateString()}.</p>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">${inviteUrl}</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #666; font-size: 12px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: inviteData.email,
      subject: `You're invited to join ${inviteData.organizationName}`,
      html
    })
  }

  // Password reset email
  async sendPasswordReset(userData: {
    email: string
    resetToken: string
    userName: string
  }) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${userData.resetToken}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset your password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
          </div>

          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>

            <p>Hi ${userData.userName},</p>

            <p>We received a request to reset your password. Click the button below to create a new password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>

            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>

            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">${resetUrl}</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #666; font-size: 12px;">
              For security reasons, this link can only be used once and will expire soon.
            </p>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: userData.email,
      subject: 'Reset your password',
      html
    })
  }

  // Email verification
  async sendEmailVerification(userData: {
    email: string
    verificationToken: string
    userName: string
  }) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${userData.verificationToken}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify your email address</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
          </div>

          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Welcome to Your SaaS App!</h2>

            <p>Hi ${userData.userName},</p>

            <p>Thank you for signing up! Please verify your email address to complete your registration:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">${verificationUrl}</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #666; font-size: 12px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: userData.email,
      subject: 'Verify your email address',
      html
    })
  }
}

// Export singleton instance
export const mailerSend = new MailerSendService()
export default mailerSend