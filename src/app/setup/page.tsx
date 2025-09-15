import Link from 'next/link'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🚀 Pot SaaS Setup
          </h1>
          <p className="text-gray-600">
            Let's get your project configured!
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Supabase Not Configured</h3>
            <p className="text-sm text-yellow-700 mb-3">
              You need to set up Supabase to continue. Follow these steps:
            </p>
            <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
              <li>Create account at <a href="https://supabase.com" className="underline" target="_blank">supabase.com</a></li>
              <li>Create a new project</li>
              <li>Copy your project URL and API keys</li>
              <li>Update the <code className="bg-yellow-100 px-1 rounded">.env.local</code> file</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Next Steps</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                <span>Configure Supabase credentials</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                <span>Run database migrations</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                <span>Build authentication system</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                <span>Create dashboard and core features</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="https://supabase.com"
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Supabase →
            </Link>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Need help? Check the <code className="bg-gray-100 px-1 rounded">SETUP.md</code> file for detailed instructions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
