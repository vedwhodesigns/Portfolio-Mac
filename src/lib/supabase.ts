import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client — safe to use in components
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client — uses service role key, only for API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// ── Database types ─────────────────────────────────────────

export interface DBFolder {
  id: string
  name: string
  parent_id: string | null
  icon_url: string | null
  created_at: string
}

export interface DBFile {
  id: string
  name: string
  kind: 'Image' | 'Video' | 'PDF' | 'Application' | 'Folder'
  file_url: string
  thumbnail_url: string | null
  icon_url: string | null
  folder_id: string | null
  size: string | null
  date_modified: string
  created_at: string
  tags?: DBTag[]
}

export interface DBTag {
  id: string
  name: string
  color: string | null
}

export interface DBTrack {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  album_art: string | null
  sort_order: number
  created_at: string
}
