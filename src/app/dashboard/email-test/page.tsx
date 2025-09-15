'use client'

import { useState } from 'react'

export default function EmailTestPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testEmail = async () => {
    if (!email) return

    setLoading(true)
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Test Email from Your SaaS App',
          html: `
            <h1>Test Email</h1>
            <p>This is a test email sent from your SaaS application.</p>
            <p>If you received this, the MailerSend integration is working correctly!</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
          `
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult(`✅ Email sent successfully! Message ID: ${data.messageId}`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-6">Email Testing</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-white/80 mb-2">Test Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={testEmail}
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>

            {result && (
              <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
                <p className="text-white/90 whitespace-pre-wrap">{result}</p>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-white/5 border border-white/20 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Available API Endpoints:</h3>
            <ul className="text-white/70 space-y-1 text-sm">
              <li>• <code className="bg-black/20 px-1 py-0.5 rounded">POST /api/email/test</code> - Send test email</li>
              <li>• <code className="bg-black/20 px-1 py-0.5 rounded">POST /api/team/invite</code> - Send team invitation</li>
              <li>• <code className="bg-black/20 px-1 py-0.5 rounded">POST /api/auth/reset-password</code> - Send password reset</li>
              <li>• <code className="bg-black/20 px-1 py-0.5 rounded">POST /api/auth/verify-email</code> - Send email verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}