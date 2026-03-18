"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

// ── Config ────────────────────────────────────────────────
const BASE  = 52;
const MAX   = 90;
const EXTRA = MAX - BASE;   // 38px added at cursor center

/** cos^12 falloff — pmndrs/react-spring reference formula */
function getSize(mouseX: number, centerX: number, dockW: number): number {
  const ratio = (mouseX - centerX) / dockW;
  const scale = Math.cos((ratio * Math.PI) / 2) ** 12;
  return BASE + EXTRA * scale;
}

// ── Icon SVGs ─────────────────────────────────────────────

function FinderIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="13" fill="url(#fi-bg)"/>
      <defs>
        <linearGradient id="fi-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ba8f5"/>
          <stop offset="100%" stopColor="#3a6fd8"/>
        </linearGradient>
      </defs>
      {/* Face */}
      <ellipse cx="30" cy="32" rx="20" ry="18" fill="#fff" opacity="0.95"/>
      {/* Left eye */}
      <ellipse cx="22" cy="26" rx="5" ry="6" fill="#1a1a2e"/>
      <ellipse cx="22" cy="26" rx="5" ry="6" fill="url(#eye-l)"/>
      <circle cx="23.5" cy="24.5" r="1.5" fill="#fff"/>
      {/* Right eye */}
      <ellipse cx="38" cy="26" rx="5" ry="6" fill="#1a1a2e"/>
      <ellipse cx="38" cy="26" rx="5" ry="6" fill="url(#eye-r)"/>
      <circle cx="39.5" cy="24.5" r="1.5" fill="#fff"/>
      {/* Divider nose */}
      <rect x="29" y="22" width="2" height="14" rx="1" fill="#d0d8e8"/>
      {/* Smile */}
      <path d="M22 37 Q30 43 38 37" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <defs>
        <radialGradient id="eye-l" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4fa8e8"/>
          <stop offset="100%" stopColor="#1a5fa8"/>
        </radialGradient>
        <radialGradient id="eye-r" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4fa8e8"/>
          <stop offset="100%" stopColor="#1a5fa8"/>
        </radialGradient>
      </defs>
      {/* Gloss */}
      <ellipse cx="30" cy="8" rx="20" ry="7" fill="rgba(255,255,255,0.22)"/>
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="13" fill="url(#ab-bg)"/>
      <defs>
        <linearGradient id="ab-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6fd87a"/>
          <stop offset="100%" stopColor="#34a84a"/>
        </linearGradient>
      </defs>
      <circle cx="30" cy="22" r="10" fill="#fff" opacity="0.92"/>
      <path d="M14 48 C14 36 46 36 46 48" fill="#fff" opacity="0.92"/>
      <ellipse cx="30" cy="8" rx="20" ry="7" fill="rgba(255,255,255,0.2)"/>
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="13" fill="url(#pj-bg)"/>
      <defs>
        <linearGradient id="pj-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8a060"/>
          <stop offset="100%" stopColor="#e05820"/>
        </linearGradient>
      </defs>
      <rect x="8" y="10" width="19" height="17" rx="3" fill="#fff" opacity="0.88"/>
      <rect x="33" y="10" width="19" height="17" rx="3" fill="#fff" opacity="0.88"/>
      <rect x="8" y="33" width="19" height="17" rx="3" fill="#fff" opacity="0.88"/>
      <rect x="33" y="33" width="19" height="17" rx="3" fill="#fff" opacity="0.88"/>
      <ellipse cx="30" cy="8" rx="20" ry="7" fill="rgba(255,255,255,0.2)"/>
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="13" fill="url(#co-bg)"/>
      <defs>
        <linearGradient id="co-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ab8f8"/>
          <stop offset="100%" stopColor="#2070d8"/>
        </linearGradient>
      </defs>
      <rect x="8" y="16" width="44" height="28" rx="4" fill="#fff" opacity="0.92"/>
      <path d="M8 20 L30 33 L52 20" stroke="url(#co-bg)" strokeWidth="2.5" fill="none"/>
      <ellipse cx="30" cy="8" rx="20" ry="7" fill="rgba(255,255,255,0.2)"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="13" fill="#1b1f23"/>
      <circle cx="30" cy="29" r="16" fill="#fff"/>
      <path d="M30 14.5C22.5 14.5 16.5 20.5 16.5 28C16.5 34 20 39 25.5 41C26.1 41.1 26.3 40.8 26.3 40.5L26.3 38.2C22.8 39 22.1 36.7 22.1 36.7C21.6 35.4 20.8 35 20.8 35C19.8 34.3 20.9 34.3 20.9 34.3C22 34.4 22.6 35.4 22.6 35.4C23.6 37.1 25.2 36.6 25.9 36.3C26 35.5 26.3 35 26.7 34.7C23.8 34.3 20.7 33.1 20.7 27.8C20.7 26.3 21.2 25.1 22.1 24.1C21.9 23.7 21.4 22.2 22.2 20.2C22.2 20.2 23.2 19.9 26.2 21.8C27.3 21.4 28.5 21.2 29.8 21.2C31.1 21.2 32.3 21.4 33.4 21.8C36.4 19.8 37.4 20.2 37.4 20.2C38.2 22.2 37.7 23.7 37.5 24.1C38.4 25.1 38.9 26.3 38.9 27.8C38.9 33.1 35.8 34.3 32.9 34.7C33.4 35.2 33.8 36 33.8 37.3L33.8 40.5C33.8 40.8 34 41.1 34.6 41C40 39 43.5 34 43.5 28C43.5 20.5 37.5 14.5 30 14.5Z" fill="#1b1f23"/>
      <ellipse cx="30" cy="8" rx="20" ry="7" fill="rgba(255,255,255,0.1)"/>
    </svg>
  );
}

function TrashIcon({ full }: { full?: boolean }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none">
      {/* Can body */}
      <path d="M13 22 L16 52 Q16 54 18 54 L42 54 Q44 54 44 52 L47 22 Z"
        fill={full ? '#c0b8a8' : '#d4cfc0'} stroke="#a09880" strokeWidth="0.8"/>
      {/* Vertical lines when full */}
      {full && <>
        <line x1="24" y1="30" x2="24" y2="50" stroke="#a09880" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="30" y1="28" x2="30" y2="50" stroke="#a09880" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="36" y1="30" x2="36" y2="50" stroke="#a09880" strokeWidth="1.2" strokeLinecap="round"/>
      </>}
      {/* Lid */}
      <rect x="10" y="17" width="40" height="5" rx="2.5" fill="#b8b0a0" stroke="#908880" strokeWidth="0.8"/>
      {/* Handle */}
      <rect x="23" y="11" width="14" height="7" rx="3" fill="#b8b0a0" stroke="#908880" strokeWidth="0.8"/>
      {/* Lid gloss */}
      <rect x="12" y="17.5" width="36" height="2" rx="1" fill="rgba(255,255,255,0.35)"/>
    </svg>
  );
}

// ── Dock ──────────────────────────────────────────────────

export default function Dock() {
  const { openWindow, windows, restoreWindow } = useOSStore();
  const dockRef  = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Resting (un-magnified) center X for each item, computed once on mount/resize
  const restCenters = useRef<number[]>([]);

  // Per-item sizes driven by mouse
  const [sizes, setSizes] = useState<number[]>([]);

  const isOpen    = useCallback((id: string) => windows.some(w => w.id === id && !w.isMinimized), [windows]);
  const hasWindow = useCallback((id: string) => windows.some(w => w.id === id), [windows]);

  // Compute resting centers from current DOM positions
  const snapshotCenters = useCallback(() => {
    restCenters.current = itemRefs.current.map(el => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    });
  }, []);

  useEffect(() => {
    snapshotCenters();
    window.addEventListener('resize', snapshotCenters);
    return () => window.removeEventListener('resize', snapshotCenters);
  }, [snapshotCenters]);

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

  interface Entry { id: string; label: string; icon: React.ReactNode; action: () => void; }

  const apps: Entry[] = [
    { id: 'finder-desktop',      label: 'Finder',   icon: <FinderIcon />,   action: () => openFinder('desktop', 'Macintosh HD') },
    { id: 'about',               label: 'About Me', icon: <AboutIcon />,    action: () => openWindow({ id: 'about', type: 'about', title: 'About Vedant', x: 220, y: 100, width: 500, height: 380 }) },
    { id: 'finder-applications', label: 'Projects', icon: <ProjectsIcon />, action: () => openFinder('applications', 'Applications') },
    { id: 'contact',             label: 'Contact',  icon: <ContactIcon />,  action: () => openWindow({ id: 'contact', type: 'about', title: 'Contact', x: 260, y: 120, width: 480, height: 340 }) },
    { id: 'github',              label: 'GitHub',   icon: <GitHubIcon />,   action: () => window.open('https://github.com/vedwhodesigns', '_blank') },
  ];

  const minimized: Entry[] = windows
    .filter(w => w.isMinimized)
    .map(w => ({
      id: w.id, label: w.title,
      icon: (
        <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#e0e0e0,#c0c0c0)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px' }}>
          {w.type === 'finder' ? '📁' : '🖼️'}
        </div>
      ),
      action: () => restoreWindow(w.id),
    }));

  const allApps = [...apps, ...minimized];
  // Trash is last (after separator), its index in sizes array = allApps.length
  const trashIdx = allApps.length;

  const totalItems = allApps.length + 1; // +1 for trash

  const handleMouseEnter = () => snapshotCenters();

  const handleMouseMove = (e: React.MouseEvent) => {
    const dock = dockRef.current;
    if (!dock || restCenters.current.length === 0) return;
    const dockW = dock.clientWidth;
    const mx    = e.clientX;
    const next  = Array.from({ length: totalItems }, (_, i) => {
      const cx = restCenters.current[i] ?? 0;
      return cx === 0 ? BASE : getSize(mx, cx, dockW);
    });
    setSizes(next);
  };

  const handleMouseLeave = () => setSizes([]);

  const sz = (i: number) => sizes[i] ?? BASE;

  return (
    <div
      className="aqua-dock"
      ref={dockRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* App icons */}
      {allApps.map((item, i) => (
        <DockItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          size={sz(i)}
          isActive={isOpen(item.id)}
          itemRef={el => { itemRefs.current[i] = el; }}
          onClick={item.action}
        />
      ))}

      {/* Separator */}
      <div className="dock-separator" />

      {/* Trash */}
      <DockItem
        label="Trash"
        icon={<TrashIcon full={false} />}
        size={sz(trashIdx)}
        isActive={false}
        itemRef={el => { itemRefs.current[trashIdx] = el; }}
        onClick={() => {}}
      />
    </div>
  );
}

// ── DockItem ──────────────────────────────────────────────

interface DockItemProps {
  label: string;
  icon: React.ReactNode;
  size: number;
  isActive: boolean;
  itemRef: (el: HTMLDivElement | null) => void;
  onClick: () => void;
}

function DockItem({ label, icon, size, isActive, itemRef, onClick }: DockItemProps) {
  const [bouncing, setBouncing] = useState(false);

  const handleClick = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 650);
    onClick();
  };

  return (
    <div className="dock-item" ref={itemRef}>
      <span className="dock-item-label">{label}</span>
      <div
        className={`dock-item-icon-wrap${bouncing ? ' dock-bouncing' : ''}`}
        style={{ width: size, height: size }}
        onClick={handleClick}
      >
        {icon}
      </div>
      <div className={isActive ? 'dock-active-dot' : 'dock-dot-placeholder'} />
    </div>
  );
}
