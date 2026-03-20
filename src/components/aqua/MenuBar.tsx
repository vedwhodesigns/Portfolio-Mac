"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

// ── Storage base URL ───────────────────────────────────────
const STORAGE  = 'https://gegzhrnbszueufkcryit.supabase.co/storage/v1/object/public/portfolio-media';
const CHEETAH  = `${STORAGE}/Mac-OS-X-Cheetah-master`;
const APPS128  = `${CHEETAH}/128x128/apps`;
const STATUS_S = `${CHEETAH}/scalable/status`;

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

// ── Weather Applet ─────────────────────────────────────────

interface WeatherData {
  temp: number;
  unit: string;
  text: string;
  icon: string;
  city: string;
  country: string;
}

type GeoState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'

const WEATHER_CACHE_KEY = 'aw_weather_cache'
const WEATHER_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

function getCachedWeather(): WeatherData | null {
  try {
    const raw = sessionStorage.getItem(WEATHER_CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > WEATHER_CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCachedWeather(data: WeatherData) {
  try {
    sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* ignore */ }
}

function WeatherApplet() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [geoState, setGeoState] = useState<GeoState>('idle');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(`/api/weather?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`);
      if (!res.ok) return;
      const data: WeatherData = await res.json();
      setWeather(data);
      setCachedWeather(data);
    } catch { /* silently fail */ }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState('unavailable');
      return;
    }

    // Check cache first
    const cached = getCachedWeather();
    if (cached) {
      setWeather(cached);
      setGeoState('granted');
      return;
    }

    setGeoState('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState('granted');
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGeoState('denied');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchWeather]);

  // Auto-request on mount if permission was previously granted
  useEffect(() => {
    if (!navigator.permissions) { requestLocation(); return; }
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') requestLocation();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh every 10 minutes when granted
  useEffect(() => {
    if (geoState !== 'granted') return;
    const id = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {}
      );
    }, WEATHER_CACHE_TTL);
    return () => clearInterval(id);
  }, [geoState, fetchWeather]);

  const weatherSvg = weather
    ? (() => {
        const t = weather.text.toLowerCase();
        if (t.includes('storm') || t.includes('thunder')) return `${STATUS_S}/weather-storm.svg`;
        if (t.includes('snow'))   return `${STATUS_S}/weather-snow.svg`;
        if (t.includes('shower') || t.includes('rain') || t.includes('drizzle')) return `${STATUS_S}/weather-showers.svg`;
        if (t.includes('fog') || t.includes('mist') || t.includes('haze')) return `${STATUS_S}/weather-fog.svg`;
        if (t.includes('cloud')) return `${STATUS_S}/weather-few-clouds.svg`;
        return `${STATUS_S}/stock_weather-few-clouds.svg`;
      })()
    : null;

  const label = geoState === 'idle' || geoState === 'requesting'
    ? null
    : geoState === 'denied'
    ? null
    : geoState === 'unavailable'
    ? null
    : weather
    ? `${weather.temp}°${weather.unit}`
    : null;

  if (geoState === 'unavailable') return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`menubar-item ${open ? 'open' : ''}`}
        style={{ cursor: 'default', fontSize: 11, fontVariantNumeric: 'tabular-nums', padding: '0 4px', display: 'flex', alignItems: 'center', gap: 3 }}
        onMouseDown={(e) => {
          e.preventDefault();
          if (geoState === 'idle' || geoState === 'denied') requestLocation();
          if (weather) setOpen(v => !v);
        }}
        title={weather ? `${weather.text} in ${weather.city}` : 'Click to enable weather'}
      >
        {geoState === 'requesting'
          ? <span style={{ fontSize: 10, opacity: 0.6 }}>⟳</span>
          : weatherSvg
          ? <img src={weatherSvg} alt="weather" width={14} height={14} style={{ objectFit: 'contain' }} draggable={false} />
          : <span style={{ fontSize: 11, opacity: 0.5 }}>☼</span>
        }
        {label && <span>{label}</span>}
      </button>

      {open && weather && (
        <div
          className="aqua-dropdown"
          style={{ right: 0, top: '100%', width: 180, padding: '10px 12px', boxSizing: 'border-box' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, lineHeight: 1.2 }}>{weather.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
              {weather.temp}°{weather.unit}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{weather.text}</div>
            <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>
              {weather.city}{weather.country ? `, ${weather.country}` : ''}
            </div>
          </div>
          <div style={{ marginTop: 10, borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 6, textAlign: 'center' }}>
            <button
              className="aqua-menu-item"
              style={{ fontSize: 10, padding: '2px 8px', width: '100%' }}
              onClick={() => {
                const cached = getCachedWeather();
                if (!cached) return;
                // force refresh
                sessionStorage.removeItem(WEATHER_CACHE_KEY);
                navigator.geolocation?.getCurrentPosition(
                  (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                  () => {}
                );
                setOpen(false);
              }}
            >
              ⟳ Refresh
            </button>
            <div style={{ fontSize: 9, opacity: 0.4, marginTop: 4 }}>Powered by AccuWeather</div>
          </div>
        </div>
      )}

      {geoState === 'idle' && (
        <div
          className="aqua-dropdown"
          style={{ right: 0, top: '100%', width: 200, padding: '10px 12px', boxSizing: 'border-box', display: open ? 'block' : 'none' }}
        />
      )}
    </div>
  );
}

// ── Music Applet ───────────────────────────────────────────

function MusicApplet() {
  const {
    tracks, currentTrackIndex, isPlaying, volume,
    setIsPlaying, nextTrack, prevTrack, currentTime, duration,
    setCurrentTime, setDuration,
  } = useOSStore();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const track = tracks[currentTrackIndex];

  // Create / manage audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onEnded = () => nextTrack();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync track URL
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.url) return;
    const playing = !audio.paused;
    audio.src = track.url;
    audio.load();
    if (playing || isPlaying) {
      audio.play().catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, track?.url]);

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`menubar-item ${open ? 'open' : ''}`}
        style={{ fontSize: 12, padding: '0 4px', display: 'flex', alignItems: 'center', gap: 2 }}
        onMouseDown={(e) => { e.preventDefault(); setOpen(v => !v); }}
        title={isPlaying ? `Now playing: ${track?.title}` : 'Music'}
      >
        <img src={`${APPS128}/music.png`} alt="Music" width={14} height={14} style={{ objectFit: 'contain' }} draggable={false} />
      </button>

      {open && (
        <div
          className="aqua-dropdown"
          style={{ right: 0, top: '100%', width: 220, padding: '10px 12px', boxSizing: 'border-box' }}
        >
          {/* Track info */}
          <div style={{ marginBottom: 8, textAlign: 'center' }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {track?.title ?? 'No Track'}
            </div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 1 }}>
              {track?.artist ?? ''}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 6 }}>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#1a6ccf' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, opacity: 0.55, marginTop: 1 }}>
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <button
              className="aqua-menu-item"
              onClick={prevTrack}
              style={{ padding: '4px 8px', fontSize: 14, borderRadius: 4 }}
              title="Previous"
            >⏮</button>
            <button
              className="aqua-menu-item"
              onClick={togglePlay}
              style={{ padding: '4px 12px', fontSize: 16, borderRadius: 4, fontWeight: 600 }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              className="aqua-menu-item"
              onClick={nextTrack}
              style={{ padding: '4px 8px', fontSize: 14, borderRadius: 4 }}
              title="Next"
            >⏭</button>
          </div>

          {/* Track list */}
          <div style={{ marginTop: 8, borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 6 }}>
            {tracks.map((t, i) => (
              <button
                key={t.id}
                className="aqua-menu-item"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  fontSize: 10,
                  padding: '3px 6px',
                  fontWeight: i === currentTrackIndex ? 600 : 400,
                  background: i === currentTrackIndex ? 'rgba(26,108,207,0.12)' : undefined,
                }}
                onClick={() => {
                  useOSStore.setState({ currentTrackIndex: i, currentTime: 0 });
                  setIsPlaying(true);
                }}
              >
                {i === currentTrackIndex && isPlaying ? '▶ ' : '  '}{t.title}
              </button>
            ))}
          </div>
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

  const volIcon = volume === 0
    ? `${STATUS_S}/audio-volume-muted.svg`
    : volume < 0.4
    ? `${STATUS_S}/audio-volume-low.svg`
    : volume < 0.75
    ? `${STATUS_S}/audio-volume-medium.svg`
    : `${STATUS_S}/audio-volume-high.svg`;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`menubar-item ${open ? 'open' : ''}`}
        style={{ fontSize: 12, padding: '0 4px', display: 'flex', alignItems: 'center' }}
        onMouseDown={(e) => { e.preventDefault(); setOpen(v => !v); }}
        title="Volume"
      >
        <img src={volIcon} alt="Volume" width={14} height={14} style={{ objectFit: 'contain' }} draggable={false} />
      </button>
      {open && (
        <div className="aqua-dropdown" style={{ right: 0, top: '100%', width: 48, padding: '10px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <img src={`${STATUS_S}/audio-volume-high.svg`} alt="High" width={12} height={12} draggable={false} />
            <input
              type="range" min={0} max={1} step={0.02}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 70, cursor: 'default' }}
            />
            <img src={`${STATUS_S}/audio-volume-muted.svg`} alt="Mute" width={12} height={12} draggable={false} />
          </div>
        </div>
      )}
    </div>
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

      {/* Right — system tray: WiFi | Weather | Music | Volume | Clock */}
      <div className="menubar-right">
        <img
          src={`${STATUS_S}/nm-signal-100.svg`}
          alt="WiFi"
          width={14} height={14}
          style={{ objectFit: 'contain', margin: '0 4px', opacity: 0.85 }}
          draggable={false}
          title="AirPort"
        />
        <WeatherApplet />
        <MusicApplet />
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
