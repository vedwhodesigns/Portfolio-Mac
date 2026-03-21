"use client";

import React, {
  createContext, useCallback, useContext,
  useEffect, useRef, useState,
} from 'react';
import { animated, useSpringValue } from '@react-spring/web';
import { useOSStore } from '@/store/useOSStore';

// ── Constants ──────────────────────────────────────────────

const STORAGE      = 'https://gegzhrnbszueufkcryit.supabase.co/storage/v1/object/public/portfolio-media';
const CHEETAH      = `${STORAGE}/Mac-OS-X-Cheetah-master`;
const APPS         = `${CHEETAH}/128x128/apps`;
const PLACES       = `${CHEETAH}/128x128/places`;

const INITIAL_SIZE = 56;   // base icon size (px)
const MAX_EXTRA    = 48;   // max size gain on hover → peak = 104 px

// ── Dock Context ────────────────────────────────────────────

type DockCtx = { hovered: boolean; width: number };
const DockContext  = createContext<DockCtx>({ hovered: false, width: 0 });
const useDockCtx   = () => useContext(DockContext);

// ── Helper components ───────────────────────────────────────

function DockImg({ src, alt }: { src: string; alt: string }) {
  return (
    <img src={src} alt={alt} draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
  );
}

function TrashIcon({ full }: { full?: boolean }) {
  return (
    <img
      src={full ? `${PLACES}/user-trash-full.png` : `${PLACES}/user-trash.png`}
      alt={full ? 'Trash (Full)' : 'Trash'} draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
  );
}

// ── Dock ───────────────────────────────────────────────────

export default function Dock() {
  const { openWindow, windows, restoreWindow } = useOSStore();
  const dockRef   = useRef<HTMLElement>(null);
  const [hovered,   setHovered]   = useState(false);
  const [dockWidth, setDockWidth] = useState(0);

  // Measure dock width — shared with items for magnification formula
  useEffect(() => {
    const measure = () => {
      if (dockRef.current) setDockWidth(dockRef.current.clientWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

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

  const allApps = [...apps, ...minimized];

  return (
    <DockContext.Provider value={{ hovered, width: dockWidth }}>
      <nav
        ref={dockRef}
        className="aqua-dock"
        onMouseEnter={() => { setHovered(true);  if (dockRef.current) setDockWidth(dockRef.current.clientWidth); }}
        onMouseLeave={() => setHovered(false)}
      >
        <ul className="dock-list">
          {allApps.map(item => (
            <DockItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={isOpen(item.id)}
              onClick={item.action}
            />
          ))}

          <li className="dock-separator" role="separator" />

          <DockItem
            label="Trash"
            icon={<TrashIcon />}
            isActive={false}
            onClick={() => {}}
          />
        </ul>
      </nav>
    </DockContext.Provider>
  );
}

// ── DockItem ───────────────────────────────────────────────

interface DockItemProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function DockItem({ label, icon, isActive, onClick }: DockItemProps) {
  const dock      = useDockCtx();
  const dockState = useRef(dock);
  dockState.current = dock;          // always-current ref, no stale closure

  const itemRef   = useRef<HTMLLIElement>(null);
  const [showLabel, setShowLabel] = useState(false);

  // Spring: mass 0.1 + tension 320 = very snappy, Mac-authentic feel
  const size = useSpringValue(INITIAL_SIZE, {
    config: { mass: 0.1, tension: 320 },
  });

  // Global mousemove — matches reference exactly.
  // elCenterX is re-read from DOM each call so no stale ref needed.
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const { hovered, width } = dockState.current;
      if (!hovered || width === 0 || !itemRef.current) return;
      const rect     = itemRef.current.getBoundingClientRect();
      const centerX  = rect.left + rect.width / 2;
      const dist     = e.clientX - centerX;
      const val      = INITIAL_SIZE + MAX_EXTRA *
        Math.cos(((dist / width) * Math.PI) / 2) ** 12;
      size.start(Math.min(INITIAL_SIZE + MAX_EXTRA, Math.max(INITIAL_SIZE, val)));
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [size]);  // size spring ref is stable

  // Reset to base size when dock loses hover
  useEffect(() => {
    if (!dock.hovered) size.start(INITIAL_SIZE);
  }, [dock.hovered, size]);

  return (
    // animated.li: width = spring value → pushes siblings apart horizontally.
    // height is FIXED in CSS (56px) so the shelf never grows.
    <animated.li
      ref={itemRef}
      className="dock-item"
      style={{ width: size }}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
    >
      {/* Tooltip */}
      <span className="dock-item-label" style={{ opacity: showLabel ? 1 : 0 }}>
        {label}
      </span>

      {/* Icon — absolutely pinned to bottom of the li.
          As height grows it overflows upward above the fixed shelf. */}
      <animated.div
        className="dock-item-icon-wrap"
        style={{ width: size, height: size }}
        onClick={onClick}
      >
        {icon}
      </animated.div>

      {/* Active indicator — upward triangle at dock surface */}
      {isActive && <span className="dock-active-dot" />}
    </animated.li>
  );
}
