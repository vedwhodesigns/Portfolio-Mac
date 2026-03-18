"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import MenuBar from './MenuBar';
import AquaWindow from './AquaWindow';
import Finder from './Finder';
import MediaViewer from './MediaViewer';
import Dock from './Dock';

// ── Power overlays ─────────────────────────────────────────

function SleepOverlay({ onWake }: { onWake: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onWake}
    >
      <div style={{ textAlign: 'center', userSelect: 'none' }}>
        {/* Breathing glow */}
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: '#fff',
          margin: '0 auto',
          animation: 'sleep-breathe 3s ease-in-out infinite',
        }} />
        <style>{`
          @keyframes sleep-breathe {
            0%, 100% { opacity: 0.1; box-shadow: 0 0 4px #fff; }
            50% { opacity: 0.9; box-shadow: 0 0 16px #fff; }
          }
        `}</style>
        <div style={{ color: '#333', fontSize: 12, marginTop: 20 }}>Click to wake</div>
      </div>
    </div>
  );
}

function ShutdownScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onRestart}
    >
      <div style={{ color: '#333', fontSize: 12, userSelect: 'none' }}>Click to restart</div>
    </div>
  );
}

// ── Desktop Icon ───────────────────────────────────────────

interface DesktopIconProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}

function DesktopIcon({ label, icon, selected, onSelect, onOpen }: DesktopIconProps) {
  return (
    <button
      className={`desktop-icon ${selected ? 'selected' : ''}`}
      onClick={e => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={e => { e.stopPropagation(); onOpen(); }}
    >
      <div style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span className="desktop-icon-label">{label}</span>
    </button>
  );
}

// Drive icon for desktop
function DriveIcon() {
  return (
    <svg width="52" height="48" viewBox="0 0 52 48" fill="none">
      <rect x="2" y="6" width="48" height="32" rx="4" fill="#b8c0d0" stroke="#8090a8" strokeWidth="1"/>
      <rect x="2" y="6" width="48" height="14" rx="4" fill="#d0d8e8"/>
      <rect x="2" y="17" width="48" height="3" fill="#d0d8e8"/>
      <circle cx="42" cy="13" r="4" fill="#809098"/>
      <circle cx="42" cy="13" r="2" fill="#a8b8c0"/>
      <rect x="8" y="27" width="22" height="4" rx="2" fill="#8090a8"/>
      {/* Shine */}
      <path d="M4 8 Q26 6 48 8 L48 14 Q26 12 4 14 Z" fill="rgba(255,255,255,0.3)"/>
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="44" height="54" viewBox="0 0 44 54" fill="none">
      <path d="M4 2 L30 2 L40 12 L40 52 Q40 54 38 54 L6 54 Q4 54 4 52 Z" fill="#f8f8f6" stroke="#d0d0d0" strokeWidth="1"/>
      <path d="M30 2 L30 12 L40 12 Z" fill="#e0e0de"/>
      {/* Text lines */}
      <rect x="8" y="18" width="24" height="1.5" rx="0.75" fill="#bbb"/>
      <rect x="8" y="22" width="28" height="1.5" rx="0.75" fill="#ccc"/>
      <rect x="8" y="26" width="26" height="1.5" rx="0.75" fill="#ccc"/>
      <rect x="8" y="30" width="20" height="1.5" rx="0.75" fill="#ccc"/>
      <rect x="8" y="34" width="28" height="1.5" rx="0.75" fill="#ccc"/>
      <rect x="8" y="38" width="22" height="1.5" rx="0.75" fill="#ccc"/>
    </svg>
  );
}

// ── AquaDesktop ─────────────────────────────────────────────

export default function AquaDesktop() {
  const { powerState, setPowerState, windows, openWindow, activeFile } = useOSStore();
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState<string | null>(null);

  const handleDesktopClick = useCallback(() => {
    useOSStore.setState({ activeWindowId: null });
    setSelectedDesktopIcon(null);
  }, []);

  const openFinder = (view: string, title: string) => {
    openWindow({ id: `finder-${view}`, type: 'finder', title, x: 80, y: 50, width: 760, height: 500, finderView: view });
  };

  const desktopIcons = [
    {
      id: 'macintosh-hd',
      label: 'Macintosh HD',
      icon: <DriveIcon />,
      onOpen: () => openFinder('desktop', 'Macintosh HD'),
    },
    {
      id: 'welcome',
      label: 'Welcome!',
      icon: <DocumentIcon />,
      onOpen: () => openWindow({ id: 'about', type: 'about', title: 'Welcome!', x: 200, y: 100, width: 480, height: 360 }),
    },
  ];

  return (
    <div
      className="aqua-wallpaper"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
      onClick={handleDesktopClick}
    >
      {/* Menu Bar */}
      <MenuBar />

      {/* Desktop Icons — top-right column */}
      <div style={{
        position: 'absolute',
        top: 32,
        right: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        zIndex: 100,
      }}>
        {desktopIcons.map(icon => (
          <DesktopIcon
            key={icon.id}
            label={icon.label}
            icon={icon.icon}
            selected={selectedDesktopIcon === icon.id}
            onSelect={() => setSelectedDesktopIcon(icon.id)}
            onOpen={icon.onOpen}
          />
        ))}
      </div>

      {/* Windows */}
      {windows.map(win => (
        <AquaWindow key={win.id} win={win}>
          {win.type === 'finder' && (
            <Finder windowId={win.id} initialView={win.finderView ?? 'desktop'} />
          )}
          {win.type === 'media' && activeFile && (
            <MediaViewer file={activeFile} />
          )}
          {win.type === 'about' && (
            <AboutWindow title={win.title} />
          )}
        </AquaWindow>
      ))}

      {/* Dock */}
      <Dock />

      {/* Power Overlays */}
      {powerState === 'sleep' && (
        <SleepOverlay onWake={() => setPowerState('active')} />
      )}
      {powerState === 'shutdown' && (
        <ShutdownScreen onRestart={() => { setPowerState('active'); }} />
      )}
    </div>
  );
}

// ── About/Welcome Window Content ───────────────────────────

function AboutWindow({ title }: { title: string }) {
  const isWelcome = title.includes('Welcome');
  const isContact = title.includes('Contact');

  if (isContact) {
    return (
      <div style={{ padding: 24, background: '#f7f7f7', height: '100%', fontFamily: 'inherit' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: '#222' }}>Get In Touch</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Email', value: 'vedant@example.com' },
            { label: 'GitHub', value: 'github.com/vedwhodesigns' },
            { label: 'Location', value: 'Mumbai, India' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 12, fontSize: 13, alignItems: 'center' }}>
              <span style={{ width: 70, color: '#666', textAlign: 'right', fontWeight: 500 }}>{label}:</span>
              <span style={{ color: '#333' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isWelcome) {
    return (
      <div style={{ padding: 28, background: '#f7f7f7', height: '100%', fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 32,
            background: 'linear-gradient(135deg, #4a90d9, #1a5fa8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0,
          }}>
            👋
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Welcome to my Portfolio</h2>
            <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.5 }}>
              Double-click any folder to explore my work.<br/>
              Use the Dock below to navigate sections.
            </p>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, background: '#fff', borderRadius: 4, padding: 12, border: '1px solid #e0e0e0' }}>
          <strong>Tips:</strong><br/>
          • Double-click <em>Macintosh HD</em> to browse all work<br/>
          • Use <em>View → as Columns</em> for Finder-style navigation<br/>
          • Click the menus in the menu bar to explore<br/>
          • All windows are draggable and resizable
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f7f7f7', height: '100%', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 32,
          background: 'linear-gradient(135deg, #4a90d9, #1a5fa8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 28, flexShrink: 0,
        }}>
          V
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Vedant Parikh</h2>
          <p style={{ fontSize: 12, color: '#555', margin: 0 }}>Visual Designer & Motion Artist</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 48, fontSize: 12, marginBottom: 16 }}>
        {[['Processor', 'Creative Brain'], ['Memory', 'Unlimited ideas'], ['System', 'Mac OS X Jaguar']].map(([k, v]) => (
          <div key={k}>
            <div style={{ color: '#888', marginBottom: 2 }}>{k}</div>
            <div style={{ fontWeight: 500, color: '#333' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: '#ddd', margin: '16px 0' }} />
      <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6, margin: 0 }}>
        Motion Designer & Visual Artist specializing in 3D, VFX, and brand identity.
        Crafting compelling visuals that tell stories and move people.
      </p>
    </div>
  );
}
