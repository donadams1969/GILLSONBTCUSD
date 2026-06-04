import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const docId = parseInt(id)

    if (isNaN(docId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document ID' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('court_documents')
      .select('id, case_no, pos_file_name, status')
      .eq('id', docId)
      .single()
    
    if (error || !data) throw new Error('Document not found')
    
    // Mark POS as ready for download
    await supabase
      .from('court_documents')
      .update({ pos_download_ready: true })
      .eq('id', docId)
    
    // Generate POS file info
    const posData = {
      document_id: data.id,
      case_number: data.case_no,
      file_name: data.pos_file_name,
      generated_at: new Date().toISOString(),
      status: 'READY',
      download_url: `/api/court/download-pos/${docId}/file`,
      sha256: `SHA256_${docId}_${Date.now()}`
    }
    
    return NextResponse.json({
      success: true,
      proof_of_service: posData
    })
  } catch (error) {
    console.error('Error generating POS:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate proof of service' },
      { status: 500 }
    )
  }
}
