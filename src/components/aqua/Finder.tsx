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

// ── Storage base URL ──────────────────────────────────────
const STORAGE  = 'https://gegzhrnbszueufkcryit.supabase.co/storage/v1/object/public/portfolio-media';
const APPS128  = `${STORAGE}/128x128/apps`;
const PLACES128 = `${STORAGE}/128x128/places`;
const ACTIONS128 = `${STORAGE}/128x128/actions`;
const SCALABLE_PLACES = `${STORAGE}/scalable/places`;

// Shortcut icons — real Aqua images from Supabase storage
const ComputerSVG     = () => <img src={`${PLACES128}/computer.png`}           alt="Computer"     width={28} height={28} style={{ objectFit: 'contain' }} draggable={false} />;
const HomeSVG         = () => <img src={`${PLACES128}/user-home.png`}          alt="Home"         width={28} height={28} style={{ objectFit: 'contain' }} draggable={false} />;
const FavoritesSVG    = () => <img src={`${ACTIONS128}/bookmark-new.png`}      alt="Favorites"    width={28} height={28} style={{ objectFit: 'contain' }} draggable={false} />;
const ApplicationsSVG = () => <img src={`${APPS128}/expose.png`}               alt="Applications" width={28} height={28} style={{ objectFit: 'contain' }} draggable={false} />;

// ── File/folder icon images from Supabase storage ─────────
const MIME_ICONS: Record<string, string> = {
  Video:       `${PLACES128}/folder-video.png`,   // overridden per-kind below
  Image:       `${PLACES128}/folder-pictures.png`,
  PDF:         `${PLACES128}/folder-documents.png`,
  Application: `${APPS128}/expose.png`,
  Folder:      `${PLACES128}/folder-documents.png`,
};

// Scalable mime icons (SVG, crisp at any size)
const SCALABLE = `${STORAGE}/scalable`;
const FILE_MIME_ICONS: Record<string, string> = {
  Video:       `${SCALABLE}/mimetypes/video-x-generic.svg`,
  Image:       `${SCALABLE}/mimetypes/image-x-generic.svg`,
  PDF:         `${SCALABLE}/mimetypes/application-pdf.svg`,
  Application: `${SCALABLE}/mimetypes/application-x-executable.svg`,
};

const FolderSVG = ({ color: _color }: { color?: string }) => (
  <img src={`${PLACES128}/folder-documents.png`} alt="Folder"
    width={52} height={44} style={{ objectFit: 'contain', display: 'block' }} draggable={false} />
);

const DriveSVG = () => (
  <img src={`${STORAGE}/128x128/devices/drive-harddisk.png`} alt="Drive"
    width={52} height={52} style={{ objectFit: 'contain', display: 'block' }} draggable={false} />
);

const FileSVG = ({ kind }: { kind: string }) => {
  const src = FILE_MIME_ICONS[kind] ?? `${SCALABLE}/mimetypes/text-x-generic.svg`;
  return (
    <img src={src} alt={kind}
      width={44} height={52} style={{ objectFit: 'contain', display: 'block' }} draggable={false} />
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
          <img
            src={`${SCALABLE_PLACES}/go-previous-symbolic.svg`}
            alt="Back"
            width={14}
            height={14}
            style={{ objectFit: 'contain', opacity: canGoBack ? 1 : 0.35, filter: 'brightness(0)' }}
            draggable={false}
          />
          <span style={{ fontSize: 11, marginLeft: 3 }}>Back</span>
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
                  <img src={`${PLACES128}/folder-documents.png`} alt="folder" width={16} height={16} style={{ objectFit: 'contain', flexShrink: 0 }} draggable={false} />
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
                      setColSel([colSel[0], item.id]);
                    }}
                    onDoubleClick={e => {
                      e.stopPropagation();
                      if (item.type === 'file') handleFileDoubleClick(item.fileData);
                      else navigateTo(item.id);
                    }}
                  >
                    {item.type === 'folder'
                      ? <img src={`${PLACES128}/folder-open.png`} alt="folder" width={16} height={16} style={{ objectFit: 'contain', flexShrink: 0 }} draggable={false} />
                      : <img src={`${PLACES128}/user-desktop.png`} alt="file" width={16} height={16} style={{ objectFit: 'contain', flexShrink: 0 }} draggable={false} />
                    }
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
                    <img src={`${PLACES128}/folder-open.png`} alt="folder" width={48} height={48} style={{ objectFit: 'contain', opacity: 0.3 }} draggable={false} />
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
