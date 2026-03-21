"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import MenuBar from './MenuBar';
import AquaWindow from './AquaWindow';
import Finder from './Finder';
import MediaViewer from './MediaViewer';
import Dock from './Dock';
import AdminPanel from './AdminPanel';
import BootScreen from './BootScreen';

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

// ── Storage base URL ───────────────────────────────────────
const STORAGE    = 'https://gegzhrnbszueufkcryit.supabase.co/storage/v1/object/public/portfolio-media';
const DEVICES128 = `${STORAGE}/128x128/devices`;
const MIMES128   = `${STORAGE}/128x128/mimetypes`;

function DriveIcon() {
  return (
    <img src={`${DEVICES128}/drive-harddisk.png`} alt="Macintosh HD"
      width={52} height={52} style={{ objectFit: 'contain', display: 'block' }} draggable={false} />
  );
}

function DocumentIcon() {
  return (
    <img src={`${MIMES128}/text-x-generic.png`} alt="Document"
      width={52} height={52} style={{ objectFit: 'contain', display: 'block' }} draggable={false} />
  );
}

// ── AquaDesktop ─────────────────────────────────────────────

const BOOT_KEY = 'portfolio_last_boot';
const BOOT_TTL = 5 * 60 * 1000; // 5 minutes in ms

function hasBootedRecently(): boolean {
  try {
    const ts = localStorage.getItem(BOOT_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) < BOOT_TTL;
  } catch {
    return false;
  }
}

function markBooted() {
  try { localStorage.setItem(BOOT_KEY, Date.now().toString()); } catch { /* ignore */ }
}

export default function AquaDesktop() {
  const { powerState, setPowerState, windows, openWindow, activeFile, files, loadFromSupabase } = useOSStore();
  // Skip boot if the user was here within the last 5 minutes
  const [booted, setBooted] = useState(() =>
    typeof window !== 'undefined' && hasBootedRecently()
  );

  // Load data from Supabase on mount (falls back to local data if not configured)
  useEffect(() => { loadFromSupabase(); }, [loadFromSupabase]);
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
    <>
    {!booted && <BootScreen onComplete={() => { markBooted(); setBooted(true); }} />}
    <div className="aqua-outer-frame" style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <div className="aqua-frame">
        {/* Wallpaper + all desktop content */}
        <div
          className="aqua-wallpaper"
          style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
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
          {windows.map(win => {
            // Each media window resolves its own file via fileId (fixes shared-activeFile bug)
            const mediaFile = win.type === 'media'
              ? (files.find(f => f.id === win.fileId) ?? activeFile)
              : null;
            return (
              <AquaWindow key={win.id} win={win}>
                {win.type === 'finder' && (
                  <Finder windowId={win.id} initialView={win.finderView ?? 'desktop'} />
                )}
                {win.type === 'media' && mediaFile && (
                  <MediaViewer file={mediaFile} />
                )}
                {win.type === 'about' && (
                  <AboutWindow title={win.title} />
                )}
                {win.type === 'admin' && (
                  <AdminPanel />
                )}
              </AquaWindow>
            );
          })}

          {/* Dock */}
          <Dock />

          {/* Power Overlays */}
          {powerState === 'sleep' && (
            <SleepOverlay onWake={() => setPowerState('active')} />
          )}
          {powerState === 'shutdown' && (
            <ShutdownScreen onRestart={() => { window.location.reload(); }} />
          )}
        </div>

        {/* CRT Scanlines — on top of everything */}
        <div className="crt-overlay" />
      </div>
    </div>
    </>
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
