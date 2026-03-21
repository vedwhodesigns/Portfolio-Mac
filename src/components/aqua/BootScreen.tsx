"use client";

import React, { useEffect, useMemo, useState } from 'react';

const BOOT_STEPS = [
  'Tuning system',
  'Cleaning up',
  'Configuring network',
  'Cleaning up',
  'Initializing network',
  'Starting crash reporter',
  'Starting AppleTalk',
  'Starting port mapper',
  'Starting directory services',
  'Configuring network time',
  'Starting authentication service',
  'Starting application services',
  'Starting network file system',
  'Starting SecurityServer',
  'Starting timed execution services',
  'Starting Sendmail',
  'Starting accounting',
];

// Random helpers
function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Upload mac-startup.mp3 to Supabase at this path to enable the boot chime
const STARTUP_SOUND =
  'https://gegzhrnbszueufkcryit.supabase.co/storage/v1/object/public/portfolio-media/sounds/mac-startup.mp3';

// ── Aqua Apple Logo (blue glossy, classic Mac OS X style) ──

function AquaAppleLogo() {
  return (
    <svg viewBox="0 0 24 30" width="76" height="95">
      <defs>
        <linearGradient id="abl" x1="0.35" y1="0" x2="0.55" y2="1">
          <stop offset="0%"   stopColor="#b8e4ff" />
          <stop offset="22%"  stopColor="#56bbf5" />
          <stop offset="58%"  stopColor="#1878d4" />
          <stop offset="82%"  stopColor="#0050a0" />
          <stop offset="100%" stopColor="#003878" />
        </linearGradient>
        <linearGradient id="abl-shine" x1="0.05" y1="0" x2="0.45" y2="0.65">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.72)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="abl-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.6" floodColor="rgba(0,30,100,0.45)" />
        </filter>
      </defs>
      {/* Leaf / stem */}
      <path
        fill="url(#abl)"
        d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83
           -1.207.052-2.662.805-3.532 1.818
           -.78.896-1.454 2.338-1.273 3.714
           1.338.104 2.715-.688 3.559-1.701"
      />
      {/* Body */}
      <path
        fill="url(#abl)"
        filter="url(#abl-shadow)"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04
           -2.04.027-3.91 1.183-4.961 3.014
           -2.117 3.675-.54 9.103 1.519 12.09
           1.013 1.454 2.208 3.09 3.792 3.039
           1.52-.065 2.09-.987 3.935-.987
           1.831 0 2.35.987 3.96.948
           1.637-.026 2.676-1.48 3.676-2.948
           1.156-1.688 1.636-3.325 1.662-3.415
           -.039-.013-3.182-1.221-3.22-4.857
           -.026-3.04 2.48-4.494 2.597-4.559
           -1.429-2.09-3.623-2.324-4.39-2.376
           -2-.156-3.675 1.09-4.61 1.09z"
      />
      {/* Gloss highlight */}
      <path
        fill="url(#abl-shine)"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04
           -2.04.027-3.91 1.183-4.961 3.014
           -.6 1.04-.85 2.2-.78 3.38
           2.2-1.28 5.1-1.8 8.5-1.3
           1.4-1.65 2.05-3.4 2.59-4.56
           -1.43-2.09-3.62-2.32-4.39-2.38
           -2-.156-3.675 1.09-4.61 1.09z"
        opacity="0.55"
      />
    </svg>
  );
}

// ── Happy Mac icon (classic pre-OS X startup) ─────────────

function HappyMacIcon() {
  return (
    <svg viewBox="0 0 56 70" width="56" height="70" style={{ imageRendering: 'pixelated' }}>
      {/* Mac body — platinum beige */}
      <rect x="4" y="2" width="48" height="58" rx="4" ry="4" fill="#c8c8c8" />
      <rect x="4" y="2" width="48" height="58" rx="4" ry="4" fill="none" stroke="#888" strokeWidth="1.5" />

      {/* Screen bezel */}
      <rect x="9" y="7" width="38" height="32" rx="2" ry="2" fill="#555" />

      {/* Screen (dark greenish-gray like CRT) */}
      <rect x="11" y="9" width="34" height="28" rx="1" ry="1" fill="#2a3a2a" />

      {/* Happy face — white on dark screen */}
      {/* Eyes */}
      <rect x="18" y="16" width="5" height="5" fill="#fff" />
      <rect x="33" y="16" width="5" height="5" fill="#fff" />
      {/* Mouth — wide smile */}
      <rect x="17" y="27" width="4" height="3" fill="#fff" />
      <rect x="21" y="29" width="4" height="3" fill="#fff" />
      <rect x="25" y="30" width="6" height="3" fill="#fff" />
      <rect x="31" y="29" width="4" height="3" fill="#fff" />
      <rect x="35" y="27" width="4" height="3" fill="#fff" />

      {/* Lower body / chin area */}
      <rect x="4" y="44" width="48" height="10" rx="0" fill="#b8b8b8" />
      <rect x="4" y="44" width="48" height="1" fill="#999" />

      {/* Disk slot */}
      <rect x="14" y="48" width="20" height="3" rx="1" fill="#888" />

      {/* Power LED */}
      <circle cx="40" cy="49" r="2" fill="#5cce5c" />

      {/* Base / stand */}
      <rect x="16" y="54" width="24" height="6" rx="2" fill="#b8b8b8" />
      <rect x="16" y="54" width="24" height="1" fill="#999" />
      <rect x="10" y="59" width="36" height="4" rx="2" fill="#b0b0b0" />
    </svg>
  );
}

// ── BootScreen ────────────────────────────────────────────

type Phase = 'happy-mac' | 'jaguar';

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [phase,     setPhase]    = useState<Phase>('happy-mac');
  const [stepIdx,   setStepIdx]  = useState(0);
  const [progress,  setProgress] = useState(0);
  const [fadeOut,   setFadeOut]  = useState(false);

  // Randomise durations once on mount
  const happyMacMs  = useMemo(() => Math.round(randBetween(3000, 8000)), []);
  // Total jaguar visible time (ms): 5000–7000. Reserve 1000ms for hold+fade.
  const jaguarRunMs = useMemo(() => Math.round(randBetween(5000, 7000)), []);
  const stepDuration = useMemo(
    () => Math.round((jaguarRunMs - 1000) / BOOT_STEPS.length),
    [jaguarRunMs]
  );

  // Phase 1: Happy Mac
  useEffect(() => {
    const t = setTimeout(() => setPhase('jaguar'), happyMacMs);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: Jaguar boot screen
  useEffect(() => {
    if (phase !== 'jaguar') return;

    // Try startup chime
    const audio = new Audio(STARTUP_SOUND);
    audio.volume = 0.65;
    audio.play().catch(() => {});

    const total = BOOT_STEPS.length;
    let current = 0;

    const tick = setInterval(() => {
      current++;
      const pct = Math.min((current / total) * 100, 100);
      setStepIdx(Math.min(current, total - 1));
      setProgress(pct);

      if (current >= total) {
        clearInterval(tick);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 600);
        }, 400);
      }
    }, stepDuration);

    return () => {
      clearInterval(tick);
      audio.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Happy Mac screen ──
  if (phase === 'happy-mac') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: '#888',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <HappyMacIcon />
      </div>
    );
  }

  // ── Jaguar boot screen ──
  return (
    <div className={`boot-screen${fadeOut ? ' boot-fadeout' : ''}`}>
      <div className="boot-panel">
        <div className="boot-apple">
          <AquaAppleLogo />
        </div>
        <div className="boot-title">Mac OS X</div>
        <div className="boot-bar-track">
          <div className="boot-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="boot-step">{BOOT_STEPS[stepIdx]}</div>
      </div>
    </div>
  );
}
