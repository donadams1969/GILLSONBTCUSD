import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('court_documents')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      documents: data || []
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
