import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/files — list all files with their tags
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('files_with_tags')
    .select('*')
    .order('date_modified', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/files — create a new file record
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, kind, file_url, thumbnail_url, icon_url, folder_id, size, tags } = body

  const { data: file, error } = await supabaseAdmin
    .from('files')
    .insert({ name, kind, file_url, thumbnail_url, icon_url, folder_id, size })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert tag relationships
  if (tags && tags.length > 0) {
    const tagRows = tags.map((tag_id: string) => ({ file_id: file.id, tag_id }))
    await supabaseAdmin.from('file_tags').insert(tagRows)
  }

  return NextResponse.json(file, { status: 201 })
}
