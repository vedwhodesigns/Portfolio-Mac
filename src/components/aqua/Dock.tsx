"use client";

import React, { useCallback, useRef, useState, forwardRef } from 'react';
import { useOSStore } from '@/store/useOSStore';

const STORAGE = 'https://gegzhrnbszueufkcryit.supabase.co/storage/v1/object/public/portfolio-media';
const CHEETAH = `${STORAGE}/Mac-OS-X-Cheetah-master`;
const APPS    = `${CHEETAH}/128x128/apps`;
const PLACES  = `${CHEETAH}/128x128/places`;

// Magnification constants
const BASE_SIZE = 56;   // px — layout size of each icon slot
const MAX_SCALE = 1.85; // peak visual scale at cursor
const SPREAD    = 96;   // px — half-width of magnification bell curve

function getScale(clientX: number | null, el: HTMLLIElement | null): number {
  if (clientX === null || !el) return 1;
  const rect   = el.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  const dist   = Math.abs(clientX - center);
  if (dist >= SPREAD) return 1;
  // Cosine bell: 1 at center, smooth falloff to 1 at SPREAD
  const t = dist / SPREAD;
  return 1 + (MAX_SCALE - 1) * Math.cos(t * Math.PI * 0.5) ** 2;
}

// ── Sub-components ──────────────────────────────────────────

function DockImg({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src} alt={alt} draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
    />
  );
}

function TrashIcon({ full }: { full?: boolean }) {
  return (
    <img
      src={full ? `${PLACES}/user-trash-full.png` : `${PLACES}/user-trash.png`}
      alt={full ? 'Trash (Full)' : 'Trash'} draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
    />
  );
}

// ── Dock ───────────────────────────────────────────────────

export default function Dock() {
  const { openWindow, windows, restoreWindow } = useOSStore();

  // clientX tracked across the whole dock for magnification
  const [clientX,    setClientX]    = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Refs to each <li> so we can measure their bounding rects
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const isOpen    = useCallback((id: string) => windows.some(w => w.id === id && !w.isMinimized), [windows]);
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

  const handleMouseMove  = useCallback((e: React.MouseEvent) => setClientX(e.clientX), []);
  const handleMouseLeave = useCallback(() => { setClientX(null); setHoveredIdx(null); }, []);

  const apps = [
    { id: 'finder-desktop',      label: 'Finder',      icon: <DockImg src={`${APPS}/file-manager.png`}      alt="Finder" />,      action: () => openFinder('desktop', 'Macintosh HD') },
    { id: 'about',               label: 'About Me',    icon: <DockImg src={`${APPS}/frontrow.png`}          alt="About Me" />,    action: () => openWindow({ id: 'about', type: 'about', title: 'About Vedant', x: 220, y: 100, width: 500, height: 380 }) },
    { id: 'finder-applications', label: 'Design Work', icon: <DockImg src={`${APPS}/gimp.png`}              alt="Design Work" />, action: () => openFinder('applications', 'Design Work') },
    { id: 'finder-projects',     label: '3D & VFX',    icon: <DockImg src={`${APPS}/cinelerra.png`}         alt="3D & VFX" />,    action: () => openFinder('projects', '3D & VFX') },
    { id: 'media',               label: 'Showreel',    icon: <DockImg src={`${APPS}/quicktime.png`}         alt="Showreel" />,    action: () => openWindow({ id: 'media', type: 'media', title: 'Showreel', x: 180, y: 80, width: 640, height: 400 }) },
    { id: 'contact',             label: 'Contact',     icon: <DockImg src={`${APPS}/mozilla_mail.png`}      alt="Contact" />,     action: () => openWindow({ id: 'contact', type: 'about', title: 'Contact', x: 260, y: 120, width: 480, height: 340 }) },
    { id: 'github',              label: 'GitHub',      icon: <DockImg src={`${APPS}/mozilla.png`}           alt="GitHub" />,      action: () => window.open('https://github.com/vedwhodesigns', '_blank') },
    { id: 'admin',               label: 'Admin',       icon: <DockImg src={`${APPS}/systempreferences.png`} alt="Admin" />,       action: () => openWindow({ id: 'admin', type: 'admin', title: 'Admin Panel', x: 140, y: 60, width: 740, height: 520 }) },
  ];

  const minimized = windows
    .filter(w => w.isMinimized)
    .map(w => ({
      id: w.id, label: w.title,
      icon: (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#e0e0e0,#c0c0c0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
          {w.type === 'finder' ? '📁' : '🖼️'}
        </div>
      ),
      action: () => restoreWindow(w.id),
    }));

  const allApps  = [...apps, ...minimized];
  const trashIdx = allApps.length;

  return (
    <nav
      className="aqua-dock"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ul className="dock-list">
        {allApps.map((item, i) => (
          <DockItem
            key={item.id}
            ref={el => { itemRefs.current[i] = el; }}
            label={item.label}
            icon={item.icon}
            scale={getScale(clientX, itemRefs.current[i] ?? null)}
            isActive={isOpen(item.id)}
            showLabel={hoveredIdx === i}
            onMouseEnter={() => setHoveredIdx(i)}
            onClick={item.action}
          />
        ))}

        <li className="dock-separator" role="separator" />

        <DockItem
          ref={el => { itemRefs.current[trashIdx] = el; }}
          label="Trash"
          icon={<TrashIcon />}
          scale={getScale(clientX, itemRefs.current[trashIdx] ?? null)}
          isActive={false}
          showLabel={hoveredIdx === trashIdx}
          onMouseEnter={() => setHoveredIdx(trashIdx)}
          onClick={() => {}}
        />
      </ul>
    </nav>
  );
}

// ── DockItem ───────────────────────────────────────────────

interface DockItemProps {
  label: string;
  icon: React.ReactNode;
  scale: number;
  isActive: boolean;
  showLabel: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}

const DockItem = forwardRef<HTMLLIElement, DockItemProps>(
  function DockItem({ label, icon, scale, isActive, showLabel, onMouseEnter, onClick }, ref) {
    const [bouncing, setBouncing] = useState(false);

    const handleClick = () => {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 650);
      onClick();
    };

    return (
      <li ref={ref} className="dock-item" onMouseEnter={onMouseEnter}>
        {/* Tooltip — positioned above max possible icon height */}
        <span className="dock-item-label" style={{ opacity: showLabel ? 1 : 0 }}>
          {label}
        </span>

        {/* Icon — transform-only magnification, layout stays BASE_SIZE */}
        <div
          className={`dock-item-icon-wrap${bouncing ? ' dock-bouncing' : ''}`}
          style={{
            transform: `scale(${scale.toFixed(4)})`,
            transformOrigin: 'bottom center',
          }}
          onClick={handleClick}
        >
          {icon}
        </div>

        {/* Active indicator — upward triangle */}
        {isActive && <span className="dock-active-dot" />}
      </li>
    );
  }
);
