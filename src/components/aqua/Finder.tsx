"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { useOSStore, FileData } from '@/store/useOSStore';
import { APP_TAGS } from '@/data/masterFiles';

type ViewMode = 'icon' | 'list' | 'column';
type SortCol = 'name' | 'date' | 'kind' | 'size';
type SortDir = 'asc' | 'desc';

// ── Virtual filesystem for column view ────────────────────

interface FSFolder { type: 'folder'; id: string; name: string }
interface FSFile   { type: 'file';   id: string; fileData: FileData }
type FSItem = FSFolder | FSFile;

const ROOT_FOLDERS: FSFolder[] = [
  { type: 'folder', id: 'applications', name: 'Applications' },
  { type: 'folder', id: 'filter-PDF',   name: 'Documents' },
  { type: 'folder', id: 'filter-Video', name: 'Movies' },
  { type: 'folder', id: 'filter-Image', name: 'Pictures' },
  { type: 'folder', id: 'home',         name: 'Users' },
];

const HOME_FOLDERS: FSFolder[] = [
  { type: 'folder', id: 'favorites',    name: 'Favorites' },
  { type: 'folder', id: 'desktop',      name: 'Desktop' },
];

// ── SVG Icons for toolbar ─────────────────────────────────

const IconViewSVG = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <rect x="1"  y="1"  width="5.5" height="5.5" rx="1"/>
    <rect x="8.5" y="1"  width="5.5" height="5.5" rx="1"/>
    <rect x="1"  y="8.5" width="5.5" height="5.5" rx="1"/>
    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1"/>
  </svg>
);

const ListViewSVG = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <rect x="1" y="2.5" width="13" height="2" rx="1"/>
    <rect x="1" y="6.5" width="13" height="2" rx="1"/>
    <rect x="1" y="10.5" width="13" height="2" rx="1"/>
  </svg>
);

const ColumnViewSVG = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <rect x="1"   y="1" width="3.5" height="13" rx="1"/>
    <rect x="5.75" y="1" width="3.5" height="13" rx="1"/>
    <rect x="10.5" y="1" width="3.5" height="13" rx="1"/>
  </svg>
);

// Shortcut icons — placeholder SVGs (user will replace with real icons)
const ComputerSVG = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="2" y="3" width="24" height="17" rx="2" fill="#8ab0d8" stroke="#5a80a8" strokeWidth="1"/>
    <rect x="4" y="5" width="20" height="13" rx="1" fill="#c8e0f8"/>
    <rect x="8" y="21" width="12" height="2" rx="1" fill="#8ab0d8"/>
    <rect x="6" y="23" width="16" height="2" rx="1" fill="#8ab0d8"/>
  </svg>
);

const HomeSVG = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <polygon points="14,4 26,14 22,14 22,24 16,24 16,18 12,18 12,24 6,24 6,14 2,14" fill="#d46060" stroke="#a03030" strokeWidth="0.8" strokeLinejoin="round"/>
    <rect x="11" y="15" width="6" height="9" rx="0.5" fill="#b84040"/>
  </svg>
);

const FavoritesSVG = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 5 C14 5 8 5 8 11 C8 17 14 22 14 22 C14 22 20 17 20 11 C20 5 14 5 14 5Z" fill="#e05050" stroke="#b03030" strokeWidth="0.8"/>
  </svg>
);

const ApplicationsSVG = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" fill="#e8c060" stroke="#b08030" strokeWidth="0.8"/>
    <text x="14" y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#704000" fontFamily="serif">A</text>
  </svg>
);

// Folder icon SVG
const FolderSVG = ({ color = '#7aabdc' }: { color?: string }) => (
  <svg width="52" height="44" viewBox="0 0 52 44" fill="none">
    <path d="M2 10 Q2 6 6 6 L20 6 L24 10 L46 10 Q50 10 50 14 L50 38 Q50 42 46 42 L6 42 Q2 42 2 38 Z" fill={color} stroke={`${color}88`} strokeWidth="0.5"/>
    <path d="M2 14 L50 14 L50 38 Q50 42 46 42 L6 42 Q2 42 2 38 Z" fill={`${color}dd`}/>
    {/* Gloss */}
    <path d="M3 14 L49 14 L49 22 Q26 28 3 22 Z" fill="rgba(255,255,255,0.25)"/>
  </svg>
);

// Drive icon SVG
const DriveSVG = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect x="4" y="12" width="44" height="28" rx="4" fill="#b0b8c8" stroke="#8090a8" strokeWidth="1"/>
    <rect x="4" y="12" width="44" height="12" rx="4" fill="#c8d0e0"/>
    <rect x="4" y="20" width="44" height="4" fill="#c8d0e0"/>
    <circle cx="40" cy="18" r="3" fill="#708090"/>
    <circle cx="40" cy="18" r="1.5" fill="#a0b0c0"/>
    <rect x="8" y="32" width="20" height="3" rx="1.5" fill="#8090a8"/>
  </svg>
);

// File icon SVG
const FileSVG = ({ kind }: { kind: string }) => {
  const colors: Record<string, string> = {
    Video: '#6080e0', Image: '#40a070', PDF: '#e06040', Application: '#8060c0', Folder: '#7aabdc',
  };
  const color = colors[kind] ?? '#8090a8';
  return (
    <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
      <path d="M4 2 L30 2 L40 12 L40 50 Q40 52 38 52 L6 52 Q4 52 4 50 Z" fill="#f8f8f8" stroke="#ccc" strokeWidth="1"/>
      <path d="M30 2 L30 12 L40 12 Z" fill="#ddd"/>
      <rect x="8" y="20" width="28" height="3" rx="1" fill={`${color}88`}/>
      <rect x="8" y="26" width="24" height="2" rx="1" fill={`${color}66`}/>
      <rect x="8" y="31" width="26" height="2" rx="1" fill={`${color}66`}/>
      <rect x="8" y="36" width="20" height="2" rx="1" fill={`${color}44`}/>
    </svg>
  );
};

// ── File Icon (with thumbnail support) ────────────────────

function FileIcon({ file, size = 52 }: { file: FileData; size?: number }) {
  if (file.thumbnailUrl) {
    return (
      <img
        src={file.thumbnailUrl}
        alt={file.name}
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: 3, display: 'block' }}
        draggable={false}
      />
    );
  }
  if (file.kind === 'Folder') return <FolderSVG />;
  return <div style={{ transform: `scale(${size / 52})`, transformOrigin: 'top center' }}><FileSVG kind={file.kind} /></div>;
}

// ── Finder Component ───────────────────────────────────────

interface FinderProps {
  windowId: string;
  initialView?: string;
}

export default function Finder({ windowId, initialView = 'desktop' }: FinderProps) {
  const { files, openFile, openWindow } = useOSStore();

  // Navigation history
  const [history, setHistory] = useState<string[]>([initialView]);
  const [histIdx, setHistIdx] = useState(0);
  const currentView = history[histIdx];

  const [viewMode, setViewMode] = useState<ViewMode>('icon');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<SortCol>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Column view state: which id is selected in each column
  const [colSel, setColSel] = useState<[string | null, string | null]>([null, null]);

  const navigateTo = useCallback((view: string) => {
    setHistory(prev => {
      const newHist = prev.slice(0, histIdx + 1);
      newHist.push(view);
      return newHist;
    });
    setHistIdx(i => i + 1);
    setSelectedId(null);
  }, [histIdx]);

  const goBack = useCallback(() => {
    if (histIdx > 0) { setHistIdx(i => i - 1); setSelectedId(null); }
  }, [histIdx]);

  const canGoBack = histIdx > 0;

  // Displayed files for icon/list views
  const displayedFiles = useMemo((): FileData[] | null => {
    if (currentView === 'applications') return null;

    let result: FileData[];
    if (currentView === 'desktop' || currentView === 'computer') {
      result = [...files];
    } else if (currentView === 'favorites') {
      result = files.filter(f => f.tags.some(t => t.toLowerCase() === 'favorite'));
    } else if (currentView === 'home') {
      result = files.filter(f => f.tags.some(t => ['favorite', 'reel'].includes(t.toLowerCase())));
    } else if (currentView.startsWith('filter-')) {
      const kind = currentView.replace('filter-', '');
      result = files.filter(f => f.kind === kind);
    } else {
      result = files.filter(f => f.tags.some(t => t.toLowerCase() === currentView.toLowerCase()));
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortCol === 'date') cmp = a.dateModified.localeCompare(b.dateModified);
      else if (sortCol === 'kind') cmp = a.kind.localeCompare(b.kind);
      else if (sortCol === 'size') cmp = a.size.localeCompare(b.size);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [files, currentView, sortCol, sortDir]);

  const availableApps = useMemo(() =>
    APP_TAGS.filter(app => files.some(f => f.tags.some(t => t.toLowerCase() === app.tag.toLowerCase()))),
    [files]
  );

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const handleOpenApp = (tag: string, label: string) => {
    openWindow({ id: `finder-${tag}`, type: 'finder', title: label, x: 140, y: 80, width: 700, height: 480, finderView: tag });
  };

  const handleFileDoubleClick = (file: FileData) => {
    openFile(file);
  };

  const sortArrow = (col: SortCol) => sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  // Column view items
  const colItems = useMemo((): FSItem[] => {
    // Column 0 always shows root folders
    return ROOT_FOLDERS;
  }, []);

  const col1Items = useMemo((): FSItem[] => {
    const sel = colSel[0];
    if (!sel) return [];
    if (sel === 'home') return HOME_FOLDERS;
    if (sel === 'applications') return APP_TAGS.map(a => ({ type: 'folder' as const, id: a.tag, name: a.label }));
    let fls: FileData[];
    if (sel.startsWith('filter-')) {
      const kind = sel.replace('filter-', '');
      fls = files.filter(f => f.kind === kind);
    } else if (sel === 'favorites') {
      fls = files.filter(f => f.tags.some(t => t.toLowerCase() === 'favorite'));
    } else if (sel === 'desktop') {
      fls = [...files];
    } else {
      fls = files.filter(f => f.tags.some(t => t.toLowerCase() === sel.toLowerCase()));
    }
    return fls.map(f => ({ type: 'file' as const, id: f.id, fileData: f }));
  }, [colSel, files]);

  const col2Item = useMemo((): FileData | null => {
    const sel = colSel[1];
    if (!sel) return null;
    return files.find(f => f.id === sel) ?? null;
  }, [colSel, files]);

  // Toolbar shortcut config
  const shortcuts = [
    { id: 'computer', label: 'Computer',     Icon: ComputerSVG },
    { id: 'home',     label: 'Home',         Icon: HomeSVG },
    { id: 'favorites',label: 'Favorites',    Icon: FavoritesSVG },
    { id: 'applications', label: 'Applications', Icon: ApplicationsSVG },
  ];

  const statusText = () => {
    if (currentView === 'applications') return `${availableApps.length} applications`;
    if (!displayedFiles) return '';
    if (selectedId) {
      const f = displayedFiles.find(f => f.id === selectedId);
      return f ? `${f.name} — ${f.size}` : `${displayedFiles.length} items`;
    }
    return `${displayedFiles.length} item${displayedFiles.length !== 1 ? 's' : ''}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Toolbar ── */}
      <div className="aqua-finder-toolbar">

        {/* Back button */}
        <button
          className="finder-back-btn"
          disabled={!canGoBack}
          onClick={goBack}
          title="Back"
        >
          <span className="finder-back-arrow">‹</span>
          <span style={{ fontSize: 11, marginLeft: 2 }}>Back</span>
        </button>

        {/* View toggle — segmented control */}
        <div className="finder-view-control">
          <button
            className={`finder-view-btn ${viewMode === 'icon' ? 'active' : ''}`}
            onClick={() => setViewMode('icon')}
            title="Icon View"
          >
            <IconViewSVG />
          </button>
          <button
            className={`finder-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <ListViewSVG />
          </button>
          <button
            className={`finder-view-btn ${viewMode === 'column' ? 'active' : ''}`}
            onClick={() => setViewMode('column')}
            title="Column View"
          >
            <ColumnViewSVG />
          </button>
        </div>

        {/* Separator */}
        <div className="finder-toolbar-sep" />

        {/* Shortcut buttons */}
        {shortcuts.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`finder-shortcut-btn ${currentView === id ? 'active' : ''}`}
            onClick={() => navigateTo(id)}
            title={label}
          >
            <div className="finder-shortcut-icon"><Icon /></div>
            <span className="finder-shortcut-label">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="aqua-finder-content" onClick={() => setSelectedId(null)}>

        {/* ── Column View ── */}
        {viewMode === 'column' && (
          <div className="finder-column-view">
            {/* Column 0: root folders */}
            <div className="finder-column">
              {colItems.map(item => (
                <button
                  key={item.id}
                  className={`finder-column-item ${colSel[0] === item.id ? 'selected' : ''}`}
                  onClick={e => { e.stopPropagation(); setColSel([item.id, null]); }}
                >
                  <span style={{ fontSize: 14 }}>📁</span>
                  <span>{item.type === 'folder' ? item.name : ''}</span>
                  {item.type === 'folder' && <span style={{ marginLeft: 'auto', fontSize: 9, opacity: 0.6 }}>›</span>}
                </button>
              ))}
            </div>

            {/* Column 1: contents of selected folder */}
            {colSel[0] && (
              <div className="finder-column">
                {col1Items.map(item => (
                  <button
                    key={item.id}
                    className={`finder-column-item ${colSel[1] === item.id ? 'selected' : ''}`}
                    onClick={e => {
                      e.stopPropagation();
                      if (item.type === 'file') {
                        setColSel([colSel[0], item.id]);
                      } else {
                        setColSel([colSel[0], item.id]);
                      }
                    }}
                    onDoubleClick={e => {
                      e.stopPropagation();
                      if (item.type === 'file') handleFileDoubleClick(item.fileData);
                      else navigateTo(item.id);
                    }}
                  >
                    <span style={{ fontSize: 13 }}>
                      {item.type === 'folder' ? '📁' : '📄'}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.type === 'folder' ? item.name : item.fileData.name}
                    </span>
                    {item.type === 'folder' && <span style={{ marginLeft: 'auto', fontSize: 9, opacity: 0.6 }}>›</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Column 2: preview */}
            {colSel[1] && (
              <div className="finder-column-preview">
                {col2Item ? (
                  <>
                    {col2Item.thumbnailUrl ? (
                      <img
                        src={col2Item.thumbnailUrl}
                        alt={col2Item.name}
                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                      />
                    ) : (
                      <FileIcon file={col2Item} size={64} />
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#222', maxWidth: 160, wordBreak: 'break-word' }}>{col2Item.name}</div>
                      <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{col2Item.kind} — {col2Item.size}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{col2Item.dateModified}</div>
                    </div>
                    <button
                      className="aqua-btn-primary"
                      style={{ marginTop: 8, fontSize: 11 }}
                      onClick={() => handleFileDoubleClick(col2Item)}
                    >
                      Open
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 32, opacity: 0.3 }}>📁</span>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>Select a file to preview</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Applications View (icon/list) ── */}
        {viewMode !== 'column' && currentView === 'applications' && (
          <div className="finder-icon-grid">
            {availableApps.map(app => (
              <button
                key={app.tag}
                className="finder-icon-item"
                onDoubleClick={() => handleOpenApp(app.tag, app.label)}
                title={`Open ${app.label}`}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: `linear-gradient(145deg, ${app.color}cc, ${app.color})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 3px 8px ${app.color}55, inset 0 1px 0 rgba(255,255,255,0.4)`,
                  color: '#fff', fontWeight: 700, fontSize: app.abbr.length > 3 ? 9 : 12,
                }}>
                  {app.abbr}
                </div>
                <span className="finder-icon-label">{app.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Icon View ── */}
        {viewMode === 'icon' && displayedFiles && (
          <div className="finder-icon-grid">
            {displayedFiles.map(file => (
              <button
                key={file.id}
                className={`finder-icon-item ${selectedId === file.id ? 'finder-icon-selected' : ''}`}
                onClick={e => { e.stopPropagation(); setSelectedId(file.id); }}
                onDoubleClick={e => { e.stopPropagation(); handleFileDoubleClick(file); }}
              >
                <FileIcon file={file} size={52} />
                <span className={`finder-icon-label ${selectedId === file.id ? 'selected' : ''}`}>
                  {file.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── List View ── */}
        {viewMode === 'list' && displayedFiles && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="finder-list-header">
                <th onClick={() => handleSort('name')} style={{ width: '45%' }}>
                  Name{sortArrow('name')}
                </th>
                <th onClick={() => handleSort('date')} style={{ width: '22%' }}>
                  Date Modified{sortArrow('date')}
                </th>
                <th onClick={() => handleSort('kind')} style={{ width: '16%' }}>
                  Kind{sortArrow('kind')}
                </th>
                <th onClick={() => handleSort('size')} style={{ width: '12%', textAlign: 'right' }}>
                  Size{sortArrow('size')}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedFiles.map(file => (
                <tr
                  key={file.id}
                  className={`finder-list-row ${selectedId === file.id ? 'finder-list-row-selected' : ''}`}
                  onClick={e => { e.stopPropagation(); setSelectedId(file.id); }}
                  onDoubleClick={e => { e.stopPropagation(); handleFileDoubleClick(file); }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileIcon file={file} size={16} />
                      <span>{file.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#666' }}>{file.dateModified}</td>
                  <td style={{ color: '#666' }}>{file.kind}</td>
                  <td style={{ textAlign: 'right', color: '#666' }}>{file.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Empty state */}
        {viewMode !== 'column' && displayedFiles?.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 8, opacity: 0.4 }}>
            <FolderSVG />
            <span style={{ fontSize: 12, color: '#666' }}>This folder is empty</span>
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div className="aqua-finder-statusbar">
        {statusText()}
      </div>
    </div>
  );
}
