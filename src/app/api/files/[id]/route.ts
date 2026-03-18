import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/files/:id — update a file
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { tags, ...fields } = body

  const { error } = await supabaseAdmin
    .from('files')
    .update({ ...fields, date_modified: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Replace tags if provided
  if (tags !== undefined) {
    await supabaseAdmin.from('file_tags').delete().eq('file_id', id)
    if (tags.length > 0) {
      const tagRows = tags.map((tag_id: string) => ({ file_id: id, tag_id }))
      await supabaseAdmin.from('file_tags').insert(tagRows)
    }
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/files/:id
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabaseAdmin.from('files').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
