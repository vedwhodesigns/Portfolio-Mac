"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

// ── Types ─────────────────────────────────────────────────

type MenuItemDef =
  | { kind: 'item'; label: string; shortcut?: string; disabled?: boolean; action?: () => void; checked?: boolean }
  | { kind: 'separator' }

// ── Clock ─────────────────────────────────────────────────

function AquaClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = dayNames[now.getDay()];
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;

  return (
    <span className="menubar-item" style={{ cursor: 'default', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
      {day} {h12}:{m} {ampm}
    </span>
  );
}

// ── Dropdown Menu ─────────────────────────────────────────

interface AquaMenuProps {
  label: string;
  bold?: boolean;
  items: MenuItemDef[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  alignRight?: boolean;
}

function AquaMenu({ label, bold, items, isOpen, onOpen, onClose, alignRight }: AquaMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`menubar-item ${bold ? 'menubar-item-bold' : ''} ${isOpen ? 'open' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); isOpen ? onClose() : onOpen(); }}
        onMouseEnter={() => { /* handled by parent */ }}
      >
        {label}
      </button>
      {isOpen && (
        <div
          className="aqua-dropdown"
          style={{ left: alignRight ? 'auto' : 0, right: alignRight ? 0 : 'auto', top: '100%' }}
        >
          {items.map((item, i) => {
            if (item.kind === 'separator') {
              return <div key={i} className="aqua-menu-divider" />;
            }
            return (
              <button
                key={i}
                className={`aqua-menu-item ${item.disabled ? 'disabled' : ''}`}
                disabled={item.disabled}
                onClick={() => {
                  if (item.action) {
                    item.action();
                    onClose();
                  }
                }}
              >
                {item.checked && <span className="checkmark">✓</span>}
                <span>{item.label}</span>
                {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Volume Applet ─────────────────────────────────────────

function VolumeApplet() {
  const { volume, setVolume } = useOSStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const icon = volume === 0 ? '🔇' : volume < 0.4 ? '🔉' : '🔊';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`menubar-item ${open ? 'open' : ''}`}
        style={{ fontSize: 12, padding: '0 6px' }}
        onMouseDown={(e) => { e.preventDefault(); setOpen(v => !v); }}
        title="Volume"
      >
        {icon}
      </button>
      {open && (
        <div className="aqua-dropdown" style={{ right: 0, top: '100%', width: 48, padding: '10px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10 }}>🔊</span>
            <input
              type="range" min={0} max={1} step={0.02}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 70, cursor: 'default' }}
            />
            <span style={{ fontSize: 10 }}>🔇</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MenuBar ───────────────────────────────────────────────

export default function MenuBar() {
  const { openWindow, windows, setPowerState } = useOSStore();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const openFinder = useCallback((view: string, title: string) => {
    const id = `finder-${view}`;
    openWindow({ id, type: 'finder', title, x: 80, y: 50, width: 760, height: 500, finderView: view });
  }, [openWindow]);

  const toggleMenu = (name: string) => setOpenMenu(prev => prev === name ? null : name);
  const closeAll = () => setOpenMenu(null);

  // Close menus on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Slide-across: when a menu is open, hovering another opens it
  const handleMenuEnter = (name: string) => {
    if (openMenu && openMenu !== name) setOpenMenu(name);
  };

  const menus: { name: string; label: string; bold?: boolean; items: MenuItemDef[] }[] = [
    {
      name: 'apple',
      label: '⌘',
      bold: true,
      items: [
        { kind: 'item', label: 'About This Portfolio', action: () => openWindow({ id: 'about', type: 'about', title: 'About This Portfolio', x: 200, y: 120, width: 480, height: 360 }) },
        { kind: 'separator' },
        { kind: 'item', label: 'System Preferences…', disabled: true },
        { kind: 'item', label: 'Dock', disabled: true, shortcut: '▶' },
        { kind: 'separator' },
        { kind: 'item', label: 'Recent Items', disabled: true, shortcut: '▶' },
        { kind: 'separator' },
        { kind: 'item', label: 'Force Quit Finder', disabled: true, shortcut: '⌥⌘⎋' },
        { kind: 'separator' },
        { kind: 'item', label: 'Sleep', action: () => setPowerState('sleep') },
        { kind: 'item', label: 'Restart…', action: () => { setPowerState('active'); window.location.reload(); } },
        { kind: 'item', label: 'Shut Down…', action: () => setPowerState('shutdown') },
        { kind: 'separator' },
        { kind: 'item', label: 'Log Out…', shortcut: '⇧⌘Q', disabled: true },
      ],
    },
    {
      name: 'finder',
      label: 'Finder',
      items: [
        { kind: 'item', label: 'About the Finder' },
        { kind: 'separator' },
        { kind: 'item', label: 'Preferences…', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Empty Trash…', shortcut: '⇧⌘⌫', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Services', shortcut: '▶', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Hide Finder', shortcut: '⌘H', disabled: true },
        { kind: 'item', label: 'Hide Others', shortcut: '⌥⌘H', disabled: true },
        { kind: 'item', label: 'Show All', disabled: true },
      ],
    },
    {
      name: 'file',
      label: 'File',
      items: [
        { kind: 'item', label: 'New Finder Window', shortcut: '⌘N', action: () => openFinder('desktop', 'Macintosh HD') },
        { kind: 'item', label: 'New Folder', shortcut: '⇧⌘N', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Open', shortcut: '⌘O', disabled: true },
        { kind: 'item', label: 'Close Window', shortcut: '⌘W', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Show Info', shortcut: '⌘I', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Duplicate', shortcut: '⌘D', disabled: true },
        { kind: 'item', label: 'Make Alias', shortcut: '⌘L', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Move to Trash', shortcut: '⌘⌫', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Find…', shortcut: '⌘F', disabled: true },
      ],
    },
    {
      name: 'edit',
      label: 'Edit',
      items: [
        { kind: 'item', label: "Can't Undo", shortcut: '⌘Z', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Cut', shortcut: '⌘X', disabled: true },
        { kind: 'item', label: 'Copy', shortcut: '⌘C', disabled: true },
        { kind: 'item', label: 'Paste', shortcut: '⌘V', disabled: true },
        { kind: 'item', label: 'Select All', shortcut: '⌘A', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Show Clipboard', disabled: true },
      ],
    },
    {
      name: 'view',
      label: 'View',
      items: [
        { kind: 'item', label: 'as Icons', shortcut: '⌘1', disabled: true },
        { kind: 'item', label: 'as List', shortcut: '⌘2', disabled: true },
        { kind: 'item', label: 'as Columns', shortcut: '⌘3', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Clean Up', disabled: true },
        { kind: 'item', label: 'Arrange by Name', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Hide Toolbar', shortcut: '⌘B', disabled: true },
        { kind: 'item', label: 'Customize Toolbar…', disabled: true },
        { kind: 'item', label: 'Show Status Bar', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Show View Options', shortcut: '⌘J', disabled: true },
      ],
    },
    {
      name: 'go',
      label: 'Go',
      items: [
        { kind: 'item', label: 'Computer', shortcut: '⌥⌘C', action: () => openFinder('computer', 'Computer') },
        { kind: 'item', label: 'Home', shortcut: '⌥⌘H', action: () => openFinder('home', 'Vedant') },
        { kind: 'item', label: 'Favorites', shortcut: '▶', action: () => openFinder('favorites', 'Favorites') },
        { kind: 'item', label: 'Applications', shortcut: '⌥⌘A', action: () => openFinder('applications', 'Applications') },
        { kind: 'separator' },
        { kind: 'item', label: 'Recent Folders', shortcut: '▶', disabled: true },
        { kind: 'item', label: 'Go to Folder…', shortcut: '⌘~', disabled: true },
        { kind: 'item', label: 'Back', shortcut: '⌘[', disabled: true },
        { kind: 'separator' },
        { kind: 'item', label: 'Connect to Server…', shortcut: '⌘K', disabled: true },
      ],
    },
    {
      name: 'window',
      label: 'Window',
      items: [
        { kind: 'item', label: 'Zoom Window', disabled: windows.length === 0 },
        { kind: 'item', label: 'Minimize Window', shortcut: '⌘M', disabled: windows.length === 0 },
        { kind: 'separator' },
        { kind: 'item', label: 'Bring All to Front', disabled: windows.length === 0 },
        ...(windows.length > 0 ? [
          { kind: 'separator' as const },
          ...windows.filter(w => !w.isMinimized).map(w => ({
            kind: 'item' as const,
            label: w.title,
            action: () => useOSStore.getState().focusWindow(w.id),
          })),
        ] : []),
      ],
    },
    {
      name: 'help',
      label: 'Help',
      items: [
        { kind: 'item', label: 'Mac Help', shortcut: '⌘?', disabled: true },
      ],
    },
  ];

  return (
    <div className="aqua-menubar">
      {/* Left — menus */}
      <div className="menubar-left">
        {menus.map(menu => (
          <div
            key={menu.name}
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMenuEnter(menu.name)}
          >
            <button
              className={`menubar-item ${menu.bold ? 'menubar-item-bold' : ''} ${openMenu === menu.name ? 'open' : ''}`}
              style={menu.name === 'apple' ? { fontSize: 16, letterSpacing: -1, paddingBottom: 1 } : {}}
              onMouseDown={e => { e.preventDefault(); toggleMenu(menu.name); }}
            >
              {menu.label}
            </button>
            {openMenu === menu.name && (
              <div
                className="aqua-dropdown"
                style={{ left: 0, top: '100%', minWidth: menu.name === 'help' ? 140 : 200 }}
              >
                {menu.items.map((item, i) => {
                  if (item.kind === 'separator') return <div key={i} className="aqua-menu-divider" />;
                  return (
                    <button
                      key={i}
                      className={`aqua-menu-item ${item.disabled ? 'disabled' : ''}`}
                      disabled={item.disabled}
                      onClick={() => { item.action?.(); closeAll(); }}
                    >
                      {item.checked && <span className="checkmark">✓</span>}
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right — system tray */}
      <div className="menubar-right">
        <VolumeApplet />
        <AquaClock />
      </div>

      {/* Click-outside overlay to close menus */}
      {openMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9400 }}
          onMouseDown={closeAll}
        />
      )}
      {/* Re-render menus above overlay */}
      {openMenu && (
        <style>{`.aqua-dropdown { z-index: 9600; } .menubar-item.open { z-index: 9600; }`}</style>
      )}
    </div>
  );
}
