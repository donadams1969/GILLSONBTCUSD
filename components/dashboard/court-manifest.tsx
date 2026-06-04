'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Download, FileText, CheckCircle, Clock } from 'lucide-react'

interface CourtDocument {
  id: number
  name: string
  description: string
  file_name: string
  pos_file_name: string
  status: string
  filer: string
}

export function CourtManifest() {
  const [documents, setDocuments] = useState<CourtDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/court/documents')
        const data = await res.json()
        if (data.success) {
          setDocuments(data.documents)
        } else {
          setError('Failed to load documents')
        }
      } catch (err) {
        setError('Error fetching documents')
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  const downloadPOS = async (docId: number) => {
    try {
      const res = await fetch(`/api/court/download-pos/${docId}`)
      const data = await res.json()
      if (data.success) {
        // Trigger download
        const element = document.createElement('a')
        element.href = data.proof_of_service.download_url
        element.download = `POS_DOC_${docId}.pdf`
        element.click()
      }
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const fileDocument = async (docId: number) => {
    try {
      const res = await fetch('/api/court/file-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: docId,
          file_name: `CUD-26-682107_DOC${docId}.pdf`
        })
      })
      const data = await res.json()
      if (data.success) {
        setDocuments(prev => prev.map(d => 
          d.id === docId ? { ...d, status: 'FILED' } : d
        ))
      }
    } catch (err) {
      console.error('Filing failed:', err)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-cyan-400">Loading documents...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="bg-zinc-900/50 border-cyan-500/20 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-mono font-bold text-cyan-400">
                    Doc {doc.id}: {doc.name}
                  </h3>
                  {doc.status === 'FILED' ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <p className="text-sm text-zinc-400 mb-2">{doc.description}</p>
                <div className="text-xs text-zinc-500 space-y-1">
                  <p>File: {doc.file_name}</p>
                  <p>POS: {doc.pos_file_name}</p>
                  <p>Filer: {doc.filer}</p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => downloadPOS(doc.id)}
                  className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition"
                  title="Download Proof of Service"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => fileDocument(doc.id)}
                  disabled={doc.status === 'FILED'}
                  className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-mono transition disabled:opacity-50"
                >
                  {doc.status === 'FILED' ? 'FILED' : 'FILE'}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
