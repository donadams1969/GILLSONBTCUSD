import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { document_id, file_name, file_content, filed_date, confirmation_number } = body

    if (!document_id || !file_name) {
      return NextResponse.json(
        { success: false, error: 'document_id and file_name required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('court_documents')
      .update({
        file_name,
        filed_date: filed_date || new Date().toISOString(),
        confirmation_number: confirmation_number || `CONF-${Date.now()}`,
        status: 'FILED',
        updated_at: new Date().toISOString()
      })
      .eq('id', document_id)
      .select()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: `Document ${document_id} filed successfully`,
      document: data?.[0]
    })
  } catch (error) {
    console.error('Error filing document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to file document' },
      { status: 500 }
    )
  }
}
