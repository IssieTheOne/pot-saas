import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { mailerSend } from '@/lib/mailersend'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { email, teamId, inviterName, teamName } = await request.json()

    if (!email || !teamId || !inviterName || !teamName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, teamId, inviterName, teamName' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists in the system' },
        { status: 400 }
      )
    }

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert({
        email,
        team_id: teamId,
        invited_by: request.headers.get('user-id'), // You'll need to get this from auth
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Invitation creation error:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${invitation.id}`

    const result = await mailerSend.sendTeamInvitation({
      email,
      inviterName,
      organizationName: teamName,
      inviteToken: invitation.id,
      expiresAt: invitation.expires_at
    })

    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      messageId: result.messageId,
      message: 'Team invitation sent successfully'
    })
  } catch (error) {
    console.error('Team invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to send team invitation' },
      { status: 500 }
    )
  }
}