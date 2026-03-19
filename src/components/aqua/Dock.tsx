"use client";

import React, { useCallback, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

const STORAGE = 'https://gegzhrnbszueufkcryit.supabase.co/storage/v1/object/public/portfolio-media';

const MAX_ADDITIONAL_SIZE = 8; // px lean offset

function scaleValue(value: number, from: [number, number], to: [number, number]) {
  const scale = (to[1] - to[0]) / (from[1] - from[0]);
  const capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return Math.floor(capped * scale + to[0]);
}

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

function TrashIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none">
      <path d="M13 22 L16 52 Q16 54 18 54 L42 54 Q44 54 44 52 L47 22 Z"
        fill="#d4cfc0" stroke="#a09880" strokeWidth="0.8" />
      <rect x="10" y="17" width="40" height="5" rx="2.5" fill="#b8b0a0" stroke="#908880" strokeWidth="0.8" />
      <rect x="23" y="11" width="14" height="7" rx="3" fill="#b8b0a0" stroke="#908880" strokeWidth="0.8" />
      <rect x="12" y="17.5" width="36" height="2" rx="1" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

export default function Dock() {
  const { openWindow, windows, restoreWindow } = useOSStore();
  const dockRef = useRef<HTMLDivElement>(null);
  const [hovIdx, setHovIdx] = useState<number | null>(null);

  const isOpen    = useCallback((id: string) => windows.some(w => w.id === id && !w.isMinimized), [windows]);
  const hasWindow = useCallback((id: string) => windows.some(w => w.id === id), [windows]);

  // Mirror of the reference handleAppHover — maps cursor X within icon → lean offset CSS vars
  const handleAppHover = useCallback((ev: React.MouseEvent<HTMLLIElement>) => {
    if (!dockRef.current) return;
    const rect    = ev.currentTarget.getBoundingClientRect();
    const cursor  = (ev.clientX - rect.left) / rect.width;
    const offset  = scaleValue(cursor, [0, 1], [-MAX_ADDITIONAL_SIZE, MAX_ADDITIONAL_SIZE]);
    dockRef.current.style.setProperty('--dock-offset-left',  `${-offset}px`);
    dockRef.current.style.setProperty('--dock-offset-right', `${offset}px`);
  }, []);

  const handleDockLeave = useCallback(() => {
    setHovIdx(null);
    dockRef.current?.style.removeProperty('--dock-offset-left');
    dockRef.current?.style.removeProperty('--dock-offset-right');
  }, []);

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

  const apps = [
    { id: 'finder-desktop',      label: 'Finder',      icon: <DockImg src={`${STORAGE}/nautilus.png`}             alt="Finder" />,      action: () => openFinder('desktop', 'Macintosh HD') },
    { id: 'about',               label: 'About Me',    icon: <DockImg src={`${STORAGE}/rhythmbox-notplaying.png`} alt="About Me" />,    action: () => openWindow({ id: 'about', type: 'about', title: 'About Vedant', x: 220, y: 100, width: 500, height: 380 }) },
    { id: 'finder-applications', label: 'Design Work', icon: <DockImg src={`${STORAGE}/image-x-psd.png`}          alt="Design Work" />, action: () => openFinder('applications', 'Design Work') },
    { id: 'finder-projects',     label: '3D & VFX',    icon: <DockImg src={`${STORAGE}/blender.png`}              alt="3D & VFX" />,    action: () => openFinder('projects', '3D & VFX') },
    { id: 'media',               label: 'Showreel',    icon: <DockImg src={`${STORAGE}/VLC.png`}                  alt="Showreel" />,    action: () => openWindow({ id: 'media', type: 'media', title: 'Showreel', x: 180, y: 80, width: 640, height: 400 }) },
    { id: 'contact',             label: 'Contact',     icon: <DockImg src={`${STORAGE}/emblem-sound.png`}         alt="Contact" />,     action: () => openWindow({ id: 'contact', type: 'about', title: 'Contact', x: 260, y: 120, width: 480, height: 340 }) },
    { id: 'github',              label: 'GitHub',      icon: <DockImg src={`${STORAGE}/gnome-web-browser.png`}    alt="GitHub" />,      action: () => window.open('https://github.com/vedwhodesigns', '_blank') },
    { id: 'admin',               label: 'Admin',       icon: <DockImg src={`${STORAGE}/gnome-panel-launcher.png`} alt="Admin" />,       action: () => openWindow({ id: 'admin', type: 'admin', title: 'Admin Panel', x: 140, y: 60, width: 740, height: 520 }) },
  ];

  const minimized = windows
    .filter(w => w.isMinimized)
    .map(w => ({
      id: w.id,
      label: w.title,
      icon: (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#e0e0e0,#c0c0c0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
          {w.type === 'finder' ? '📁' : '🖼️'}
        </div>
      ),
      action: () => restoreWindow(w.id),
    }));

  const allApps  = [...apps, ...minimized];
  const trashIdx = allApps.length;

  return (
    <nav ref={dockRef} className="aqua-dock" onMouseLeave={handleDockLeave}>
      <ul className="dock-list">
        {allApps.map((item, i) => (
          <DockItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={isOpen(item.id)}
            isHovered={hovIdx === i}
            onMouseMove={handleAppHover}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            onClick={item.action}
          />
        ))}

        <li className="dock-separator" role="separator" />

        <DockItem
          label="Trash"
          icon={<TrashIcon />}
          isActive={false}
          isHovered={hovIdx === trashIdx}
          onMouseMove={handleAppHover}
          onMouseEnter={() => setHovIdx(trashIdx)}
          onMouseLeave={() => setHovIdx(null)}
          onClick={() => {}}
        />
      </ul>
    </nav>
  );
}

// ── DockItem ──────────────────────────────────────────────

interface DockItemProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isHovered: boolean;
  onMouseMove: (ev: React.MouseEvent<HTMLLIElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function DockItem({ label, icon, isActive, isHovered, onMouseMove, onMouseEnter, onMouseLeave, onClick }: DockItemProps) {
  const [bouncing, setBouncing] = useState(false);

  const handleClick = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 650);
    onClick();
  };

  return (
    <li
      className="dock-item"
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Tooltip */}
      <span className="dock-item-label" style={{ opacity: isHovered ? 1 : 0 }}>
        {label}
      </span>

      {/* Icon */}
      <div
        className={`dock-item-icon-wrap${bouncing ? ' dock-bouncing' : ''}`}
        onClick={handleClick}
      >
        {icon}
      </div>

      {/* Active dot */}
      {isActive && <span className="dock-active-dot" />}
    </li>
  );
}
