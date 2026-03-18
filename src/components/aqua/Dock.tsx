"use client";

import React, { useCallback, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

// ── Sizes ─────────────────────────────────────────────────

const BASE_SIZE = 52;
const MAX_SIZE  = 80;

function getMagnifiedSize(i: number, hovered: number | null): number {
  if (hovered === null) return BASE_SIZE;
  const dist = Math.abs(i - hovered);
  if (dist === 0) return MAX_SIZE;
  if (dist === 1) return 66;
  if (dist === 2) return 57;
  return BASE_SIZE;
}

// ── Dock Icon SVGs ────────────────────────────────────────
// Placeholder SVGs — user will replace with real icon images

function FinderDockIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 52 52" fill="none">
      <rect x="2" y="2" width="48" height="48" rx="10" fill="#5a8fd8"/>
      <circle cx="22" cy="24" r="10" fill="#f0f0f0" stroke="#ccc" strokeWidth="1"/>
      <circle cx="22" cy="24" r="6" fill="#fff"/>
      <circle cx="22" cy="24" r="2" fill="#7aa8d8"/>
      <rect x="29" y="31" width="14" height="4" rx="2" transform="rotate(45 29 31)" fill="#ccc"/>
      <rect x="4" y="38" width="44" height="10" rx="5" fill="#4a7fc8"/>
      <circle cx="12" cy="43" r="3" fill="#f0c040"/>
      <circle cx="22" cy="43" r="3" fill="#40c040"/>
      <circle cx="32" cy="43" r="3" fill="#e04040"/>
      <circle cx="42" cy="43" r="3" fill="#8080f0"/>
    </svg>
  );
}

function AboutDockIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 52 52" fill="none">
      <rect x="2" y="2" width="48" height="48" rx="10" fill="#60b870"/>
      <circle cx="26" cy="18" r="8" fill="#fff" opacity="0.9"/>
      <path d="M12 42 C12 32 40 32 40 42" fill="#fff" opacity="0.9"/>
    </svg>
  );
}

function ProjectsDockIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 52 52" fill="none">
      <rect x="2" y="2" width="48" height="48" rx="10" fill="#e87040"/>
      <rect x="8" y="10" width="16" height="14" rx="2" fill="#fff" opacity="0.9"/>
      <rect x="28" y="10" width="16" height="14" rx="2" fill="#fff" opacity="0.9"/>
      <rect x="8" y="28" width="16" height="14" rx="2" fill="#fff" opacity="0.9"/>
      <rect x="28" y="28" width="16" height="14" rx="2" fill="#fff" opacity="0.9"/>
    </svg>
  );
}

function ContactDockIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 52 52" fill="none">
      <rect x="2" y="2" width="48" height="48" rx="10" fill="#4090e0"/>
      <rect x="8" y="14" width="36" height="24" rx="3" fill="#fff" opacity="0.9"/>
      <path d="M8 17 L26 27 L44 17" stroke="#4090e0" strokeWidth="2" fill="none"/>
    </svg>
  );
}

function GitHubDockIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 52 52" fill="none">
      <rect x="2" y="2" width="48" height="48" rx="10" fill="#2a2a2a"/>
      <circle cx="26" cy="24" r="14" fill="#fff"/>
      <path d="M26 12 C19 12 13 18 13 26 C13 32.5 17 38 23 40 C23.5 40.1 23.7 39.8 23.7 39.5 L23.7 37 C20 37.8 19.3 35.3 19.3 35.3 C18.8 34 18 33.6 18 33.6 C16.9 32.8 18.1 32.8 18.1 32.8 C19.3 32.9 20 34 20 34 C21.1 35.9 22.9 35.4 23.6 35.1 C23.7 34.3 24 33.7 24.4 33.4 C21.2 33 17.8 31.7 17.8 26 C17.8 24.3 18.4 22.9 19.4 21.8 C19.2 21.3 18.7 19.7 19.6 17.6 C19.6 17.6 20.7 17.2 23.6 19.2 C24.8 18.8 26.1 18.6 27.4 18.6 C28.7 18.6 30 18.8 31.2 19.2 C34.1 17.2 35.2 17.6 35.2 17.6 C36.1 19.7 35.6 21.3 35.4 21.8 C36.4 22.9 37 24.3 37 26 C37 31.7 33.6 33 30.4 33.4 C30.9 33.9 31.4 34.8 31.4 36.2 L31.4 39.5 C31.4 39.8 31.6 40.1 32.1 40 C38 38 42 32.5 42 26 C42 18 36 12 29 12 Z" fill="#2a2a2a"/>
    </svg>
  );
}

function TrashDockIcon({ hasItems }: { hasItems?: boolean }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 52 52" fill="none">
      {/* Can body */}
      <path d="M12 20 L14 46 Q14 48 16 48 L36 48 Q38 48 38 46 L40 20 Z" fill={hasItems ? '#c8c0b0' : '#d8d0c0'} stroke="#a0988a" strokeWidth="0.8"/>
      {/* Horizontal lines */}
      {hasItems && <>
        <line x1="20" y1="28" x2="20" y2="44" stroke="#a0988a" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="26" y1="26" x2="26" y2="44" stroke="#a0988a" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="32" y1="28" x2="32" y2="44" stroke="#a0988a" strokeWidth="1.2" strokeLinecap="round"/>
      </>}
      {/* Lid */}
      <rect x="10" y="16" width="32" height="4" rx="2" fill="#b8b0a0" stroke="#908880" strokeWidth="0.8"/>
      {/* Handle on lid */}
      <rect x="21" y="12" width="10" height="5" rx="2" fill="#b8b0a0" stroke="#908880" strokeWidth="0.8"/>
    </svg>
  );
}

// ── Dock Item ─────────────────────────────────────────────

interface DockItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  size: number;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function DockItem({ label, icon, size, isActive, onMouseEnter, onMouseLeave, onClick }: DockItemProps) {
  const [bouncing, setBouncing] = useState(false);

  const handleClick = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 700);
    onClick();
  };

  return (
    <div
      className="dock-item"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="dock-item-label">{label}</span>
      <div
        className={`dock-item-icon-wrap ${bouncing ? 'dock-bouncing' : ''}`}
        style={{ width: size, height: size }}
        onClick={handleClick}
      >
        {icon}
      </div>
      {isActive ? <div className="dock-active-dot" /> : <div style={{ height: 9 }} />}
    </div>
  );
}

// ── Dock ─────────────────────────────────────────────────

export default function Dock() {
  const { openWindow, windows, restoreWindow } = useOSStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const isOpen = useCallback((id: string) => windows.some(w => w.id === id && !w.isMinimized), [windows]);
  const hasWindow = useCallback((id: string) => windows.some(w => w.id === id), [windows]);

  const openFinder = (view: string, title: string) => {
    const id = `finder-${view}`;
    if (hasWindow(id)) {
      const win = windows.find(w => w.id === id);
      if (win?.isMinimized) restoreWindow(id);
      else useOSStore.getState().focusWindow(id);
    } else {
      openWindow({ id, type: 'finder', title, x: 80, y: 50, width: 760, height: 500, finderView: view });
    }
  };

  // Minimized windows appear in dock
  const minimizedWindows = windows.filter(w => w.isMinimized);

  interface DockEntry {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
  }

  const dockItems: DockEntry[] = [
    {
      id: 'finder-desktop',
      label: 'Finder',
      icon: <FinderDockIcon />,
      action: () => openFinder('desktop', 'Macintosh HD'),
    },
    {
      id: 'about',
      label: 'About Me',
      icon: <AboutDockIcon />,
      action: () => openWindow({ id: 'about', type: 'about', title: 'About Vedant', x: 220, y: 100, width: 500, height: 380 }),
    },
    {
      id: 'finder-applications',
      label: 'Projects',
      icon: <ProjectsDockIcon />,
      action: () => openFinder('applications', 'Applications'),
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: <ContactDockIcon />,
      action: () => openWindow({ id: 'contact', type: 'about', title: 'Contact', x: 260, y: 120, width: 480, height: 340 }),
    },
    {
      id: 'github',
      label: 'GitHub',
      icon: <GitHubDockIcon />,
      action: () => window.open('https://github.com/vedwhodesigns', '_blank'),
    },
  ];

  // Minimized window entries
  const minimizedEntries: DockEntry[] = minimizedWindows.map(w => ({
    id: w.id,
    label: w.title,
    icon: (
      <div style={{
        width: '100%', height: '100%', background: 'linear-gradient(135deg,#e0e0e0,#c0c0c0)',
        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', border: '1px solid rgba(0,0,0,0.1)',
      }}>
        {w.type === 'finder' ? '📁' : '🖼️'}
      </div>
    ),
    action: () => restoreWindow(w.id),
  }));

  // Trash entry
  const trashEntry: DockEntry = {
    id: 'trash',
    label: 'Trash',
    icon: <TrashDockIcon hasItems={false} />,
    action: () => { /* easter egg — could show alert */ },
  };

  // All entries (including separator logic)
  const allEntries = [...dockItems, ...minimizedEntries];
  const totalCount = allEntries.length + 1 /* separator */ + 1 /* trash */;

  return (
    <div className="aqua-dock">
      {/* App icons */}
      {allEntries.map((item, i) => (
        <DockItem
          key={item.id}
          id={item.id}
          label={item.label}
          icon={item.icon}
          size={getMagnifiedSize(i, hoveredIdx)}
          isActive={isOpen(item.id)}
          onMouseEnter={() => setHoveredIdx(i)}
          onMouseLeave={() => setHoveredIdx(null)}
          onClick={item.action}
        />
      ))}

      {/* Separator before trash */}
      <div className="dock-separator" />

      {/* Trash */}
      <DockItem
        id="trash"
        label={trashEntry.label}
        icon={trashEntry.icon}
        size={getMagnifiedSize(allEntries.length + 1, hoveredIdx)}
        isActive={false}
        onMouseEnter={() => setHoveredIdx(allEntries.length + 1)}
        onMouseLeave={() => setHoveredIdx(null)}
        onClick={trashEntry.action}
      />
    </div>
  );
}
