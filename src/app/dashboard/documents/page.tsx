'use client'

import { useAuth } from '../../../../lib/auth-context'
import { useEffect, useState } from 'react'
import { createClient } from '../../../../lib/supabase-client'

interface Document {
  id: string
  name: string
  original_name: string
  size: number
  type: string
  created_at: string
  is_deleted: boolean
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-white/70">Manage and organize your business documents</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
          Upload Document
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Documents</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search documents..."
                className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Types</option>
                <option>PDF</option>
                <option>Word</option>
                <option>Excel</option>
                <option>PowerPoint</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Name</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Type</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Size</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Uploaded</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/70">
                    Loading documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/70">
                    No documents found. Upload your first document to get started.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">📄</span>
                        </div>
                        <span className="text-white font-medium">{doc.original_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{doc.type.split('/')[1]?.toUpperCase() || 'FILE'}</td>
                    <td className="px-6 py-4 text-white/70">{formatFileSize(doc.size)}</td>
                    <td className="px-6 py-4 text-white/70">{formatDate(doc.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
                          👁️
                        </button>
                        <button className="text-green-400 hover:text-green-300 transition-colors">
                          ⬇️
                        </button>
                        <button className="text-red-400 hover:text-red-300 transition-colors">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-white/70">
              {loading ? 'Loading...' : `Showing ${documents.length} documents`}
            </p>
            <div className="flex space-x-2">
              <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors">
                Previous
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg">
                1
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors">
                2
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
