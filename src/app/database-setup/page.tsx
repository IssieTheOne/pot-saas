'use client'

import { useEffect, useState } from 'react'

interface DatabaseStatus {
  success: boolean
  message: string
  tables: Record<string, string>
  database_ready: boolean
  next_steps: string[]
  error?: string
}

export default function DatabaseSetupPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/database-status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        success: false,
        message: 'Failed to check database status',
        tables: {},
        database_ready: false,
        next_steps: ['Check your internet connection and try again'],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking database status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🗄️ Database Setup
            </h1>
            <p className="text-lg text-gray-600">
              Let's get your database ready for Pot SaaS
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className={`w-4 h-4 rounded-full mr-3 ${
                status?.success ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <h2 className="text-xl font-semibold">
                {status?.success ? '✅ Supabase Connected' : '❌ Connection Failed'}
              </h2>
            </div>

            {status?.success && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(status.tables).map(([table, status]) => (
                    <div key={table} className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                        status === 'exists' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <p className="text-sm font-medium capitalize">{table}</p>
                      <p className="text-xs text-gray-500">
                        {status === 'exists' ? 'Ready' : 'Not Created'}
                      </p>
                    </div>
                  ))}
                </div>

                {status.database_ready ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">🎉 Database Ready!</h3>
                    <p className="text-green-700 text-sm">
                      All tables are created and ready. You can now start building features!
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">📋 Setup Required</h3>
                    <div className="space-y-2 text-sm text-yellow-700">
                      {status.next_steps.map((step, index) => (
                        <p key={index}>• {step}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {status?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
                <p className="text-red-700 text-sm">{status.error}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-semibold mb-4">🚀 Quick Setup Guide</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                <div>
                  <p className="font-medium">Go to Supabase Dashboard</p>
                  <p className="text-sm text-gray-600">Visit <a href="https://supabase.com/dashboard" className="text-blue-600 underline" target="_blank">supabase.com/dashboard</a></p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                <div>
                  <p className="font-medium">Open SQL Editor</p>
                  <p className="text-sm text-gray-600">Navigate to your project → SQL Editor</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                <div>
                  <p className="font-medium">Run Schema Script</p>
                  <p className="text-sm text-gray-600">Copy and paste the contents of <code className="bg-gray-100 px-1 rounded">database-schema.sql</code></p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                <div>
                  <p className="font-medium">Verify Setup</p>
                  <p className="text-sm text-gray-600">Refresh this page to confirm all tables are created</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={checkDatabaseStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Check Status
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🗄️ Open Supabase
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
