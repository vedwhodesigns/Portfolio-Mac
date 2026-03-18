"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore, FileData, FolderData, TagData } from '@/store/useOSStore';
import { Track } from '@/store/useOSStore';

type AdminTab = 'files' | 'folders' | 'tags' | 'tracks' | 'upload'

// ── Password gate ──────────────────────────────────────────

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin'

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_unlocked', '1')
      onUnlock()
    } else {
      setError(true)
      setInput('')
      setTimeout(() => setError(false), 1500)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <div style={{ fontSize: 32 }}>🔐</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>Admin Access Required</div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 220 }}>
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            padding: '6px 10px', fontSize: 12, borderRadius: 6,
            border: error ? '1.5px solid #ff3b30' : '1.5px solid #aaa',
            outline: 'none', background: 'rgba(255,255,255,0.8)',
            transition: 'border 0.2s',
          }}
        />
        <button type="submit" className="aqua-btn-primary" style={{ fontSize: 12 }}>
          Unlock
        </button>
        {error && <div style={{ fontSize: 11, color: '#ff3b30', textAlign: 'center' }}>Incorrect password</div>}
      </form>
    </div>
  )
}

// ── File row ───────────────────────────────────────────────

function FileRow({ file, folders, tags, onSave, onDelete }: {
  file: FileData
  folders: FolderData[]
  tags: TagData[]
  onSave: (id: string, updates: Partial<FileData> & { tags?: string[] }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(file.name)
  const [folderId, setFolderId] = useState(file.folderId ?? '')
  const [selectedTags, setSelectedTags] = useState<string[]>(file.tags)
  const [saving, setSaving] = useState(false)

  const toggleTag = (tagName: string) =>
    setSelectedTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName])

  const save = async () => {
    setSaving(true)
    const tagIds = tags.filter(t => selectedTags.includes(t.name)).map(t => t.id)
    await onSave(file.id, { name, folderId: folderId || null, tags: tagIds })
    setSaving(false)
    setEditing(false)
  }

  const kindIcon = file.kind === 'Video' ? '🎬' : file.kind === 'Image' ? '🖼' : file.kind === 'PDF' ? '📄' : '📁'

  return (
    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: 11 }}>
      <td style={{ padding: '4px 6px' }}>{kindIcon}</td>
      <td style={{ padding: '4px 6px' }}>
        {editing
          ? <input value={name} onChange={e => setName(e.target.value)} style={{ fontSize: 11, padding: '2px 4px', width: 180, borderRadius: 4, border: '1px solid #aaa' }} />
          : <span style={{ fontWeight: 500 }}>{file.name}</span>}
      </td>
      <td style={{ padding: '4px 6px' }}>
        {editing
          ? (
            <select value={folderId} onChange={e => setFolderId(e.target.value)} style={{ fontSize: 11, padding: '2px 4px', borderRadius: 4 }}>
              <option value="">— No folder —</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          )
          : folders.find(f => f.id === file.folderId)?.name ?? '—'}
      </td>
      <td style={{ padding: '4px 6px', maxWidth: 200 }}>
        {editing
          ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {tags.map(t => (
                <span
                  key={t.id}
                  onClick={() => toggleTag(t.name)}
                  style={{
                    padding: '1px 6px', borderRadius: 10, fontSize: 10, cursor: 'pointer',
                    background: selectedTags.includes(t.name) ? (t.color ?? '#888') : 'rgba(0,0,0,0.08)',
                    color: selectedTags.includes(t.name) ? '#fff' : '#333',
                    transition: 'all 0.15s',
                  }}
                >{t.name}</span>
              ))}
            </div>
          )
          : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {file.tags.slice(0, 3).map(t => (
                <span key={t} style={{ padding: '1px 5px', borderRadius: 8, fontSize: 10, background: 'rgba(0,0,0,0.08)' }}>{t}</span>
              ))}
              {file.tags.length > 3 && <span style={{ fontSize: 10, opacity: 0.5 }}>+{file.tags.length - 3}</span>}
            </div>
          )}
      </td>
      <td style={{ padding: '4px 6px', whiteSpace: 'nowrap' }}>
        {editing ? (
          <>
            <button onClick={save} disabled={saving} style={{ marginRight: 4, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#1a6ccf', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {saving ? '…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #aaa', cursor: 'pointer' }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} style={{ marginRight: 4, fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #aaa', cursor: 'pointer' }}>
              Edit
            </button>
            <button onClick={() => onDelete(file.id)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #ff3b30', color: '#ff3b30', cursor: 'pointer', background: 'none' }}>
              ✕
            </button>
          </>
        )}
      </td>
    </tr>
  )
}

// ── Upload tab ─────────────────────────────────────────────

function UploadTab({ folders, tags, onDone }: { folders: FolderData[], tags: TagData[], onDone: () => void }) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [folderId, setFolderId] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setName(f.name)
  }

  const toggleTag = (tagName: string) =>
    setSelectedTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName])

  const kindFromFile = (f: File): FileData['kind'] => {
    if (f.type.startsWith('video/')) return 'Video'
    if (f.type.startsWith('image/')) return 'Image'
    if (f.type === 'application/pdf') return 'PDF'
    return 'Application'
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setProgress('Uploading file…')

    try {
      // 1. Upload to Supabase Storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', kindFromFile(file).toLowerCase())

      const upRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!upRes.ok) throw new Error('Upload failed')
      const { url } = await upRes.json()

      setProgress('Saving to database…')

      // 2. Create file record
      const tagIds = tags.filter(t => selectedTags.includes(t.name)).map(t => t.id)
      const fileRes = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          kind: kindFromFile(file),
          file_url: url,
          folder_id: folderId || null,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          tags: tagIds,
        }),
      })
      if (!fileRes.ok) throw new Error('DB insert failed')

      setProgress('Done!')
      setTimeout(() => { setProgress(''); setFile(null); setName(''); setSelectedTags([]); onDone(); }, 1000)
    } catch (err) {
      setProgress(`Error: ${err}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#1a6ccf' : '#bbb'}`,
          borderRadius: 10, padding: 32, textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(26,108,207,0.06)' : 'rgba(0,0,0,0.02)',
          transition: 'all 0.2s', marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 28 }}>{file ? '✅' : '⬆'}</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>
          {file ? file.name : 'Drop a file here or click to browse'}
        </div>
        <div style={{ fontSize: 10, opacity: 0.5, marginTop: 3 }}>Images, Videos, PDFs</div>
        <input ref={inputRef} type="file" accept="image/*,video/*,.pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>

      {file && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600 }}>File name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 3, padding: '5px 8px', fontSize: 12, borderRadius: 6, border: '1px solid #bbb', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600 }}>Folder</label>
            <select value={folderId} onChange={e => setFolderId(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 3, padding: '5px 8px', fontSize: 12, borderRadius: 6, border: '1px solid #bbb' }}>
              <option value="">— No folder —</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600 }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {tags.map(t => (
                <span
                  key={t.id}
                  onClick={() => toggleTag(t.name)}
                  style={{
                    padding: '2px 8px', borderRadius: 10, fontSize: 10, cursor: 'pointer',
                    background: selectedTags.includes(t.name) ? (t.color ?? '#888') : 'rgba(0,0,0,0.08)',
                    color: selectedTags.includes(t.name) ? '#fff' : '#333',
                    transition: 'all 0.15s',
                  }}
                >{t.name}</span>
              ))}
            </div>
          </div>
          <button onClick={upload} disabled={uploading} className="aqua-btn-primary" style={{ marginTop: 4, fontSize: 12 }}>
            {uploading ? progress || 'Uploading…' : '⬆ Upload & Save'}
          </button>
          {progress && !uploading && <div style={{ fontSize: 11, color: progress.startsWith('Error') ? '#ff3b30' : '#34c759', textAlign: 'center' }}>{progress}</div>}
        </div>
      )}
    </div>
  )
}

// ── Main Admin Panel ───────────────────────────────────────

export default function AdminPanel() {
  const { files, folders, tags, loadFromSupabase } = useOSStore()
  const [tab, setTab] = useState<AdminTab>('files')
  const [unlocked, setUnlocked] = useState(() => typeof window !== 'undefined' && sessionStorage.getItem('admin_unlocked') === '1')
  const [localTracks, setLocalTracks] = useState<Track[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newFolderName, setNewFolderName] = useState('')

  // Load tracks from API separately
  useEffect(() => {
    if (!unlocked) return
    fetch('/api/tracks').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setLocalTracks(data)
    }).catch(() => {})
  }, [unlocked])

  const refresh = useCallback(async () => {
    await loadFromSupabase()
    const r = await fetch('/api/tracks')
    if (r.ok) setLocalTracks(await r.json())
  }, [loadFromSupabase])

  const saveFile = async (id: string, updates: Partial<FileData> & { tags?: string[] }) => {
    await fetch(`/api/files/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: updates.name, folder_id: updates.folderId, tags: updates.tags }),
    })
    await loadFromSupabase()
  }

  const deleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return
    await fetch(`/api/files/${id}`, { method: 'DELETE' })
    await loadFromSupabase()
  }

  const addTag = async () => {
    if (!newTagName.trim()) return
    await fetch('/api/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newTagName.trim(), color: '#888888' }) })
    setNewTagName('')
    await loadFromSupabase()
  }

  const deleteTag = async (id: string) => {
    if (!confirm('Delete tag? This removes it from all files.')) return
    await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    await loadFromSupabase()
  }

  const addFolder = async () => {
    if (!newFolderName.trim()) return
    await fetch('/api/folders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newFolderName.trim() }) })
    setNewFolderName('')
    await loadFromSupabase()
  }

  const deleteFolder = async (id: string) => {
    if (!confirm('Delete folder? Files inside will be unassigned.')) return
    await fetch(`/api/folders/${id}`, { method: 'DELETE' })
    await loadFromSupabase()
  }

  const deleteTrack = async (id: string) => {
    if (!confirm('Delete this track?')) return
    await fetch(`/api/tracks/${id}`, { method: 'DELETE' })
    await refresh()
  }

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

  const tabStyle = (t: AdminTab): React.CSSProperties => ({
    padding: '4px 12px', fontSize: 11, cursor: 'pointer', border: 'none', background: 'none',
    borderBottom: tab === t ? '2px solid #1a6ccf' : '2px solid transparent',
    fontWeight: tab === t ? 600 : 400, color: tab === t ? '#1a6ccf' : '#555',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: 12 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '6px 8px 0', gap: 2, background: 'rgba(255,255,255,0.6)' }}>
        {(['files', 'folders', 'tags', 'tracks', 'upload'] as AdminTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
            {t === 'files' ? '📁 Files' : t === 'folders' ? '🗂 Folders' : t === 'tags' ? '🏷 Tags' : t === 'tracks' ? '🎵 Tracks' : '⬆ Upload'}
          </button>
        ))}
        <button onClick={refresh} style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 4, border: '1px solid #aaa', cursor: 'pointer', background: 'none' }}>⟳ Refresh</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: tab === 'upload' ? 0 : 12 }}>

        {/* FILES tab */}
        {tab === 'files' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ fontSize: 10, opacity: 0.5, textAlign: 'left' }}>
                <th style={{ padding: '2px 6px' }}></th>
                <th style={{ padding: '2px 6px' }}>Name</th>
                <th style={{ padding: '2px 6px' }}>Folder</th>
                <th style={{ padding: '2px 6px' }}>Tags</th>
                <th style={{ padding: '2px 6px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0
                ? <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', opacity: 0.4 }}>No files yet — upload some in the Upload tab</td></tr>
                : files.map(f => (
                  <FileRow key={f.id} file={f} folders={folders} tags={tags} onSave={saveFile} onDelete={deleteFile} />
                ))}
            </tbody>
          </table>
        )}

        {/* FOLDERS tab */}
        {tab === 'folders' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="New folder name…" onKeyDown={e => e.key === 'Enter' && addFolder()} style={{ flex: 1, padding: '5px 8px', fontSize: 12, borderRadius: 6, border: '1px solid #bbb' }} />
              <button onClick={addFolder} style={{ padding: '5px 12px', fontSize: 12, borderRadius: 6, background: '#1a6ccf', color: '#fff', border: 'none', cursor: 'pointer' }}>+ Add</button>
            </div>
            {folders.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid rgba(0,0,0,0.06)', gap: 8 }}>
                <span style={{ fontSize: 16 }}>📁</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{f.name}</span>
                {f.parent_id && <span style={{ fontSize: 10, opacity: 0.5 }}>in {folders.find(p => p.id === f.parent_id)?.name}</span>}
                <button onClick={() => deleteFolder(f.id)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #ff3b30', color: '#ff3b30', cursor: 'pointer', background: 'none' }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* TAGS tab */}
        {tab === 'tags' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="New tag name…" onKeyDown={e => e.key === 'Enter' && addTag()} style={{ flex: 1, padding: '5px 8px', fontSize: 12, borderRadius: 6, border: '1px solid #bbb' }} />
              <button onClick={addTag} style={{ padding: '5px 12px', fontSize: 12, borderRadius: 6, background: '#1a6ccf', color: '#fff', border: 'none', cursor: 'pointer' }}>+ Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: t.color ?? '#888', color: '#fff', fontSize: 11 }}>
                  <span>{t.name}</span>
                  <button onClick={() => deleteTag(t.id)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0, opacity: 0.7 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRACKS tab */}
        {tab === 'tracks' && (
          <div>
            {localTracks.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '7px 8px', borderBottom: '1px solid rgba(0,0,0,0.06)', gap: 10 }}>
                <span style={{ fontSize: 10, opacity: 0.4, width: 14 }}>{i + 1}</span>
                <span style={{ fontSize: 14 }}>🎵</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 11 }}>{t.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{t.artist}</div>
                </div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>
                  {Math.floor(t.duration / 60)}:{String(t.duration % 60).padStart(2, '0')}
                </div>
                <button onClick={() => deleteTrack(t.id)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #ff3b30', color: '#ff3b30', cursor: 'pointer', background: 'none' }}>✕</button>
              </div>
            ))}
            {localTracks.length === 0 && <div style={{ padding: 20, textAlign: 'center', opacity: 0.4 }}>No tracks yet</div>}
          </div>
        )}

        {/* UPLOAD tab */}
        {tab === 'upload' && <UploadTab folders={folders} tags={tags} onDone={() => { refresh(); setTab('files') }} />}
      </div>
    </div>
  )
}
