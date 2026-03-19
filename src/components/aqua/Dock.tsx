"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

// ── Storage base URL ───────────────────────────────────────
const STORAGE = 'https://gegzhrnbszueufkcryit.supabase.co/storage/v1/object/public/portfolio-media';

// ── Magnification config ───────────────────────────────────
const BASE   = 56;   // resting icon size (px)
const MAX    = 110;  // peak magnified size (px)
const EXTRA  = MAX - BASE;
const RADIUS = 160;  // px influence radius on each side

function getSize(mouseX: number, centerX: number): number {
  const dist = Math.abs(mouseX - centerX);
  if (dist >= RADIUS) return BASE;
  const t = 1 - dist / RADIUS;
  return BASE + EXTRA * (t * t);
}

// ── Dock icon image ────────────────────────────────────────
function DockImg({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
    />
  );
}

// ── Trash icon (no uploaded asset) ────────────────────────
function TrashIcon({ full }: { full?: boolean }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none">
      <path d="M13 22 L16 52 Q16 54 18 54 L42 54 Q44 54 44 52 L47 22 Z"
        fill={full ? '#c0b8a8' : '#d4cfc0'} stroke="#a09880" strokeWidth="0.8"/>
      {full && <>
        <line x1="24" y1="30" x2="24" y2="50" stroke="#a09880" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="30" y1="28" x2="30" y2="50" stroke="#a09880" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="36" y1="30" x2="36" y2="50" stroke="#a09880" strokeWidth="1.2" strokeLinecap="round"/>
      </>}
      <rect x="10" y="17" width="40" height="5" rx="2.5" fill="#b8b0a0" stroke="#908880" strokeWidth="0.8"/>
      <rect x="23" y="11" width="14" height="7" rx="3" fill="#b8b0a0" stroke="#908880" strokeWidth="0.8"/>
      <rect x="12" y="17.5" width="36" height="2" rx="1" fill="rgba(255,255,255,0.35)"/>
    </svg>
  );
}

// ── Dock ──────────────────────────────────────────────────

export default function Dock() {
  const { openWindow, windows, restoreWindow } = useOSStore();
  const dockRef  = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const restCenters = useRef<number[]>([]);

  const [sizes,   setSizes]   = useState<number[]>([]);
  const [dockHov, setDockHov] = useState(false);
  const [hovIdx,  setHovIdx]  = useState<number | null>(null);

  const isOpen    = useCallback((id: string) => windows.some(w => w.id === id && !w.isMinimized), [windows]);
  const hasWindow = useCallback((id: string) => windows.some(w => w.id === id), [windows]);

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
    { id: 'finder-desktop',      label: 'Finder',      icon: <DockImg src={`${STORAGE}/nautilus.png`}             alt="Finder" />,      action: () => openFinder('desktop', 'Macintosh HD') },
    { id: 'about',               label: 'About Me',    icon: <DockImg src={`${STORAGE}/rhythmbox-notplaying.png`} alt="About Me" />,    action: () => openWindow({ id: 'about', type: 'about', title: 'About Vedant', x: 220, y: 100, width: 500, height: 380 }) },
    { id: 'finder-applications', label: 'Design Work', icon: <DockImg src={`${STORAGE}/image-x-psd.png`}          alt="Design Work" />, action: () => openFinder('applications', 'Design Work') },
    { id: 'finder-projects',     label: '3D & VFX',    icon: <DockImg src={`${STORAGE}/blender.png`}              alt="3D & VFX" />,    action: () => openFinder('projects', '3D & VFX') },
    { id: 'media',               label: 'Showreel',    icon: <DockImg src={`${STORAGE}/VLC.png`}                  alt="Showreel" />,    action: () => openWindow({ id: 'media', type: 'media', title: 'Showreel', x: 180, y: 80, width: 640, height: 400 }) },
    { id: 'contact',             label: 'Contact',     icon: <DockImg src={`${STORAGE}/emblem-sound.png`}         alt="Contact" />,     action: () => openWindow({ id: 'contact', type: 'about', title: 'Contact', x: 260, y: 120, width: 480, height: 340 }) },
    { id: 'github',              label: 'GitHub',      icon: <DockImg src={`${STORAGE}/gnome-web-browser.png`}    alt="GitHub" />,      action: () => window.open('https://github.com/vedwhodesigns', '_blank') },
    { id: 'admin',               label: 'Admin',       icon: <DockImg src={`${STORAGE}/gnome-panel-launcher.png`} alt="Admin" />,       action: () => openWindow({ id: 'admin', type: 'admin', title: 'Admin Panel', x: 140, y: 60, width: 740, height: 520 }) },
  ];

  const minimized: Entry[] = windows
    .filter(w => w.isMinimized)
    .map(w => ({
      id: w.id, label: w.title,
      icon: (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#e0e0e0,#c0c0c0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
          {w.type === 'finder' ? '📁' : '🖼️'}
        </div>
      ),
      action: () => restoreWindow(w.id),
    }));

  const allApps   = [...apps, ...minimized];
  const trashIdx  = allApps.length;
  const totalItems = allApps.length + 1; // +1 for trash

  const handleMouseEnter = () => { setDockHov(true); snapshotCenters(); };
  const handleMouseLeave = () => { setDockHov(false); setSizes([]); setHovIdx(null); };

  const handleMouseMove = (e: React.MouseEvent) => {
    const mx = e.clientX;
    setSizes(
      Array.from({ length: totalItems }, (_, i) => {
        const cx = restCenters.current[i] ?? 0;
        return cx === 0 ? BASE : getSize(mx, cx);
      })
    );
  };

  const sz = (i: number) => sizes[i] ?? BASE;

  return (
    <div
      className="aqua-dock"
      ref={dockRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {allApps.map((item, i) => (
        <DockItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          size={sz(i)}
          isActive={isOpen(item.id)}
          dockHovered={dockHov}
          itemRef={el => { itemRefs.current[i] = el; }}
          onHover={show => setHovIdx(show ? i : null)}
          isHovered={hovIdx === i}
          onClick={item.action}
        />
      ))}

      <div className="dock-separator" />

      <DockItem
        label="Trash"
        icon={<TrashIcon full={false} />}
        size={sz(trashIdx)}
        isActive={false}
        dockHovered={dockHov}
        itemRef={el => { itemRefs.current[trashIdx] = el; }}
        onHover={show => setHovIdx(show ? trashIdx : null)}
        isHovered={hovIdx === trashIdx}
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
  dockHovered: boolean;
  isHovered: boolean;
  itemRef: (el: HTMLDivElement | null) => void;
  onHover: (show: boolean) => void;
  onClick: () => void;
}

function DockItem({ label, icon, size, isActive, dockHovered, isHovered, itemRef, onHover, onClick }: DockItemProps) {
  const [bouncing, setBouncing] = useState(false);

  const handleClick = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 650);
    onClick();
  };

  return (
    <div
      className="dock-item"
      ref={itemRef}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Label tooltip — only show when dock is hovered and this icon is hovered */}
      <span
        className="dock-item-label"
        style={{ opacity: dockHovered && isHovered ? 1 : 0 }}
      >
        {label}
      </span>

      {/* Icon — grows upward because dock uses align-items:flex-end */}
      <div
        className={`dock-item-icon-wrap${bouncing ? ' dock-bouncing' : ''}`}
        style={{ width: size, height: size }}
        onClick={handleClick}
      >
        {icon}
      </div>

      {/* Active dot */}
      <div className={isActive ? 'dock-active-dot' : 'dock-dot-placeholder'} />
    </div>
  );
}
