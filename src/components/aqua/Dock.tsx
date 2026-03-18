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

/** Mac OS X Leopard-style blue ribbed folder */
function FinderIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
      <defs>
        <linearGradient id="fold-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#d8eaf8"/>
          <stop offset="40%"  stopColor="#b2d4f0"/>
          <stop offset="100%" stopColor="#7ab4e0"/>
        </linearGradient>
        <linearGradient id="fold-tab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c0ddf5"/>
          <stop offset="100%" stopColor="#90c0e8"/>
        </linearGradient>
        <linearGradient id="fold-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0)"/>
          <stop offset="100%" stopColor="rgba(60,100,160,0.18)"/>
        </linearGradient>
        <linearGradient id="fold-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.7)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>

      {/* Folder tab */}
      <path d="M12 38 L12 30 Q12 24 18 24 L48 24 Q54 24 57 30 L63 38 Z"
        fill="url(#fold-tab)" stroke="#6ea8d8" strokeWidth="0.8"/>
      <path d="M12 35 L12 30 Q12 24 18 24 L48 24 Q54 24 57 30 L62 35 Z"
        fill="rgba(255,255,255,0.28)"/>

      {/* Folder body */}
      <rect x="8" y="36" width="112" height="80" rx="6"
        fill="url(#fold-body)" stroke="#5a9cc8" strokeWidth="1"/>

      {/* Horizontal ridges */}
      {[44, 51, 58, 65, 72, 79, 86, 93, 100, 107].map((y, i) => (
        <React.Fragment key={i}>
          <line x1="14" y1={y} x2="114" y2={y}
            stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"/>
          <line x1="14" y1={y + 1} x2="114" y2={y + 1}
            stroke="rgba(90,140,200,0.28)" strokeWidth="0.8"/>
        </React.Fragment>
      ))}

      {/* Body shade overlay */}
      <rect x="8" y="36" width="112" height="80" rx="6" fill="url(#fold-shade)"/>

      {/* Top gloss */}
      <rect x="9" y="37" width="110" height="30" rx="5"
        fill="url(#fold-gloss)" opacity="0.6"/>

      {/* Outer border gloss line */}
      <rect x="9" y="37" width="110" height="79" rx="5.5"
        fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
    </svg>
  );
}

/** iTunes-style blue music note */
function AboutIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
      <defs>
        <linearGradient id="itunes-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4a9fe8"/>
          <stop offset="50%"  stopColor="#1a6fd0"/>
          <stop offset="100%" stopColor="#0a4aa8"/>
        </linearGradient>
        <linearGradient id="itunes-note" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="40%"  stopColor="#cce4f8"/>
          <stop offset="100%" stopColor="#88c0f0"/>
        </linearGradient>
        <linearGradient id="itunes-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.72)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        <radialGradient id="itunes-rim" cx="50%" cy="0%" r="80%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.3)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>

      {/* Background square */}
      <rect width="128" height="128" rx="22" fill="url(#itunes-bg)"/>
      {/* Subtle rim light */}
      <rect width="128" height="128" rx="22" fill="url(#itunes-rim)"/>

      {/* Music note — filled shape */}
      {/* Left note head */}
      <ellipse cx="40" cy="96" rx="15" ry="11" fill="url(#itunes-note)"/>
      <ellipse cx="40" cy="96" rx="15" ry="11" fill="rgba(255,255,255,0.15)"/>
      {/* Right note head */}
      <ellipse cx="82" cy="87" rx="15" ry="11" fill="url(#itunes-note)"/>
      <ellipse cx="82" cy="87" rx="15" ry="11" fill="rgba(255,255,255,0.15)"/>
      {/* Left stem */}
      <rect x="52" y="40" width="8" height="58" rx="4" fill="url(#itunes-note)"/>
      {/* Right stem */}
      <rect x="94" y="30" width="8" height="59" rx="4" fill="url(#itunes-note)"/>
      {/* Beam connecting the two stems */}
      <path d="M53 42 L101 30 L101 45 L53 57 Z" fill="url(#itunes-note)"/>

      {/* Gloss — top half */}
      <path d="M0 0 Q64 0 128 0 L128 55 Q64 75 0 55 Z" rx="22"
        fill="url(#itunes-gloss)" opacity="0.5"
        clipPath="url(#bg-clip)"/>
      <defs>
        <clipPath id="bg-clip">
          <rect width="128" height="128" rx="22"/>
        </clipPath>
      </defs>
      <rect x="1" y="1" width="126" height="62" rx="21"
        fill="url(#itunes-gloss)" opacity="0.38" clipPath="url(#bg-clip)"/>
    </svg>
  );
}

/** Blender icon — orange body + circular arrow + blue sphere */
function ProjectsIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
      <defs>
        <radialGradient id="bl-bg" cx="40%" cy="30%" r="75%">
          <stop offset="0%"   stopColor="#ffc840"/>
          <stop offset="55%"  stopColor="#f07800"/>
          <stop offset="100%" stopColor="#c04400"/>
        </radialGradient>
        <radialGradient id="bl-sphere" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#a0d8f8"/>
          <stop offset="40%"  stopColor="#3090e0"/>
          <stop offset="100%" stopColor="#084888"/>
        </radialGradient>
        <linearGradient id="bl-arrow-hi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffe090"/>
          <stop offset="100%" stopColor="#e07000"/>
        </linearGradient>
        <radialGradient id="bl-shine" cx="38%" cy="28%" r="55%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.85)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>

      {/* Orange base bg */}
      <rect width="128" height="128" rx="22" fill="url(#bl-bg)"/>

      {/* Circular donut arrow — the outer ring */}
      <circle cx="66" cy="66" r="50" fill="none"
        stroke="url(#bl-arrow-hi)" strokeWidth="22" opacity="0.95"/>
      {/* Cut the left portion to make it look like an open arrow ring */}
      <path d="M16 66 Q16 16 66 16 Q116 16 116 66 Q116 108 80 118 L64 116 Q50 112 38 102"
        fill="none" stroke="#ffd060" strokeWidth="24" strokeLinecap="round"/>
      {/* Arrow tip pointing right-downward */}
      <polygon points="28,92 10,116 52,108" fill="#ffe080"/>
      <polygon points="28,92 10,116 52,108" fill="rgba(255,255,255,0.3)"/>

      {/* Blue sphere */}
      <circle cx="66" cy="66" r="26" fill="url(#bl-sphere)"/>
      {/* Sphere highlight */}
      <ellipse cx="58" cy="56" rx="11" ry="8"
        fill="url(#bl-shine)" opacity="0.9"/>
      {/* Sphere rim */}
      <circle cx="66" cy="66" r="26" fill="none"
        stroke="rgba(0,40,100,0.4)" strokeWidth="1.5"/>

      {/* Overall gloss */}
      <rect x="1" y="1" width="126" height="58" rx="21"
        fill="rgba(255,255,255,0.2)" clipPath="url(#bg-clip2)"/>
      <defs>
        <clipPath id="bg-clip2">
          <rect width="128" height="128" rx="22"/>
        </clipPath>
      </defs>
    </svg>
  );
}

/** Mac OS X Mail — @ symbol on a chrome coil spring */
function ContactIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
      <defs>
        <radialGradient id="mail-base" cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#e8e8e8"/>
          <stop offset="50%"  stopColor="#b0b0b0"/>
          <stop offset="100%" stopColor="#787878"/>
        </radialGradient>
        <linearGradient id="mail-coil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#c0c0c0"/>
          <stop offset="35%"  stopColor="#f0f0f0"/>
          <stop offset="65%"  stopColor="#e0e0e0"/>
          <stop offset="100%" stopColor="#909090"/>
        </linearGradient>
        <radialGradient id="mail-disc" cx="50%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#f8f8f8"/>
          <stop offset="60%"  stopColor="#d0d0d0"/>
          <stop offset="100%" stopColor="#909090"/>
        </radialGradient>
        <radialGradient id="mail-at-bg" cx="42%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#e8f0ff"/>
          <stop offset="100%" stopColor="#c0d0f0"/>
        </radialGradient>
        <linearGradient id="at-color" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3060c8"/>
          <stop offset="100%" stopColor="#1030a0"/>
        </linearGradient>
      </defs>

      {/* Pedestal base — wide flat disc at bottom */}
      <ellipse cx="64" cy="116" rx="46" ry="10" fill="url(#mail-base)"/>
      <ellipse cx="64" cy="112" rx="46" ry="10" fill="url(#mail-base)"/>
      <path d="M18 112 Q18 120 64 122 Q110 120 110 112 L110 116 Q110 124 64 126 Q18 124 18 116 Z"
        fill="#606060" opacity="0.6"/>
      {/* Base gloss */}
      <ellipse cx="64" cy="108" rx="38" ry="5" fill="rgba(255,255,255,0.45)"/>

      {/* Coil spring — series of elliptical arcs */}
      {[95, 88, 81, 74, 67, 60, 53].map((y, i) => (
        <ellipse key={i} cx="64" cy={y} rx={22 - i * 0.4} ry="5"
          fill="none" stroke="url(#mail-coil)" strokeWidth="5"
          opacity={0.92 - i * 0.02}/>
      ))}
      {/* Shading on coil left */}
      {[95, 88, 81, 74, 67, 60, 53].map((y, i) => (
        <ellipse key={i} cx="64" cy={y} rx={22 - i * 0.4} ry="5"
          fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2.5"
          strokeDasharray="22 66" strokeDashoffset="0"/>
      ))}

      {/* Top disc holding the @ */}
      <ellipse cx="64" cy="44" rx="38" ry="10" fill="url(#mail-disc)"/>
      <ellipse cx="64" cy="38" rx="38" ry="32" fill="url(#mail-at-bg)"
        stroke="#b0b8d0" strokeWidth="1"/>
      <ellipse cx="64" cy="36" rx="36" ry="30" fill="rgba(255,255,255,0.5)"/>

      {/* @ symbol */}
      <text x="64" y="50" textAnchor="middle" dominantBaseline="middle"
        fontFamily="-apple-system, Helvetica, Arial, sans-serif"
        fontSize="38" fontWeight="bold" fill="url(#at-color)">@</text>

      {/* Disc top gloss */}
      <ellipse cx="55" cy="28" rx="20" ry="12" fill="rgba(255,255,255,0.55)" opacity="0.7"/>
    </svg>
  );
}

/** Safari-style blue Earth globe */
function GitHubIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
      <defs>
        <radialGradient id="globe-bg" cx="38%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#60b8f8"/>
          <stop offset="45%"  stopColor="#1878d8"/>
          <stop offset="100%" stopColor="#042880"/>
        </radialGradient>
        <radialGradient id="globe-shine" cx="35%" cy="22%" r="50%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.95)"/>
          <stop offset="55%"  stopColor="rgba(255,255,255,0.15)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        <clipPath id="globe-clip">
          <circle cx="64" cy="64" r="58"/>
        </clipPath>
      </defs>

      {/* Globe sphere */}
      <circle cx="64" cy="64" r="58" fill="url(#globe-bg)"/>

      {/* Latitude lines */}
      <ellipse cx="64" cy="64" rx="58" ry="18" fill="none"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1" clipPath="url(#globe-clip)"/>
      <ellipse cx="64" cy="46" rx="52" ry="12" fill="none"
        stroke="rgba(255,255,255,0.15)" strokeWidth="1" clipPath="url(#globe-clip)"/>
      <ellipse cx="64" cy="82" rx="52" ry="12" fill="none"
        stroke="rgba(255,255,255,0.15)" strokeWidth="1" clipPath="url(#globe-clip)"/>
      {/* Equator */}
      <line x1="6" y1="64" x2="122" y2="64"
        stroke="rgba(255,255,255,0.2)" strokeWidth="1" clipPath="url(#globe-clip)"/>
      {/* Longitude lines */}
      <ellipse cx="64" cy="64" rx="24" ry="58" fill="none"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1" clipPath="url(#globe-clip)"/>
      <line x1="64" y1="6" x2="64" y2="122"
        stroke="rgba(255,255,255,0.2)" strokeWidth="1" clipPath="url(#globe-clip)"/>

      {/* Continents — simplified shapes */}
      {/* North America */}
      <path d="M16 36 Q22 28 34 30 Q42 32 44 40 Q46 50 40 56 Q32 62 22 58 Q14 52 16 36 Z"
        fill="rgba(255,255,255,0.75)" clipPath="url(#globe-clip)"/>
      <path d="M36 58 Q42 60 44 70 Q42 78 36 80 Q28 78 26 70 Q28 60 36 58 Z"
        fill="rgba(255,255,255,0.72)" clipPath="url(#globe-clip)"/>
      {/* Europe */}
      <path d="M60 28 Q68 24 76 26 Q82 30 80 36 Q76 42 68 42 Q60 40 58 34 Q57 30 60 28 Z"
        fill="rgba(255,255,255,0.72)" clipPath="url(#globe-clip)"/>
      {/* Africa */}
      <path d="M62 46 Q70 44 74 50 Q78 58 76 72 Q74 84 66 86 Q58 84 56 72 Q54 58 58 50 Q60 46 62 46 Z"
        fill="rgba(255,255,255,0.7)" clipPath="url(#globe-clip)"/>
      {/* Asia */}
      <path d="M82 28 Q96 24 108 28 Q116 34 114 46 Q110 56 100 58 Q88 60 80 52 Q76 44 78 36 Q80 30 82 28 Z"
        fill="rgba(255,255,255,0.72)" clipPath="url(#globe-clip)"/>
      {/* Australia */}
      <path d="M96 72 Q104 70 108 76 Q112 82 108 88 Q102 92 96 88 Q90 82 92 76 Q93 72 96 72 Z"
        fill="rgba(255,255,255,0.68)" clipPath="url(#globe-clip)"/>

      {/* Gloss highlight */}
      <ellipse cx="46" cy="36" rx="28" ry="20"
        fill="url(#globe-shine)" opacity="0.9"/>

      {/* Outer rim */}
      <circle cx="64" cy="64" r="57.5" fill="none"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      <circle cx="64" cy="64" r="58" fill="none"
        stroke="rgba(0,40,120,0.4)" strokeWidth="1"/>
    </svg>
  );
}

/** VLC — orange traffic cone */
function VLCIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
      <defs>
        <linearGradient id="vlc-cone" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%"   stopColor="#ffcc44"/>
          <stop offset="35%"  stopColor="#ff8c00"/>
          <stop offset="100%" stopColor="#e06000"/>
        </linearGradient>
        <linearGradient id="vlc-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffaa00"/>
          <stop offset="100%" stopColor="#cc6000"/>
        </linearGradient>
        <linearGradient id="vlc-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#d0d8c8"/>
          <stop offset="20%"  stopColor="#f8f8f8"/>
          <stop offset="50%"  stopColor="#ffffff"/>
          <stop offset="80%"  stopColor="#f0f0f0"/>
          <stop offset="100%" stopColor="#c8ccc0"/>
        </linearGradient>
        <radialGradient id="vlc-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(120,60,0,0.4)"/>
          <stop offset="100%" stopColor="rgba(120,60,0,0)"/>
        </radialGradient>
      </defs>

      {/* Base shadow ellipse */}
      <ellipse cx="64" cy="115" rx="52" ry="10" fill="rgba(0,0,0,0.22)"/>

      {/* Base platform */}
      <path d="M14 112 Q14 122 64 122 Q114 122 114 112 L106 104 Q106 110 64 112 Q22 110 22 104 Z"
        fill="url(#vlc-base)"/>
      <path d="M22 104 Q22 112 64 114 Q106 112 106 104 L108 102 Q108 111 64 113 Q20 111 20 102 Z"
        fill="url(#vlc-base)"/>
      <ellipse cx="64" cy="104" rx="44" ry="9" fill="url(#vlc-base)"/>
      <ellipse cx="64" cy="100" rx="42" ry="8" fill="url(#vlc-base)" opacity="0.9"/>
      {/* Base top gloss */}
      <ellipse cx="52" cy="97" rx="22" ry="4" fill="rgba(255,220,100,0.45)"/>

      {/* Cone body */}
      <path d="M50 96 L36 72 L28 50 L40 26 L64 8 L88 26 L100 50 L92 72 L78 96 Z"
        fill="url(#vlc-cone)"/>
      {/* Cone left shadow */}
      <path d="M50 96 L36 72 L28 50 L40 26 L64 8 L56 12 L36 30 L26 54 L34 78 L46 98 Z"
        fill="rgba(160,60,0,0.35)"/>

      {/* Reflective band 1 (lower) */}
      <path d="M36 74 Q64 80 92 74 L96 84 Q64 92 32 84 Z"
        fill="url(#vlc-band)"/>
      {/* Dot pattern on band 1 */}
      {[42,50,58,66,74,82].map((x,i) => (
        <circle key={i} cx={x} cy={i%2===0?78:80} r="1.8"
          fill="rgba(160,160,140,0.7)"/>
      ))}

      {/* Reflective band 2 (upper) */}
      <path d="M52 36 Q64 40 76 36 L80 46 Q64 52 48 46 Z"
        fill="url(#vlc-band)"/>
      {/* Dot pattern on band 2 */}
      {[54,60,66,72,78].map((x,i) => (
        <circle key={i} cx={x} cy={i%2===0?40:42} r="1.6"
          fill="rgba(160,160,140,0.7)"/>
      ))}

      {/* Cone tip highlight */}
      <ellipse cx="64" cy="10" rx="8" ry="5" fill="rgba(255,240,160,0.7)"/>
      {/* Left edge highlight */}
      <path d="M64 8 L44 28 L38 48 Q36 50 38 52 Q44 32 68 10 Z"
        fill="rgba(255,230,120,0.3)"/>
    </svg>
  );
}

/** Mac OS X sharing/network globe — blue with white node network */
function NetworkGlobeIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
      <defs>
        <radialGradient id="ng-sphere" cx="35%" cy="28%" r="75%">
          <stop offset="0%"   stopColor="#5ab0f8"/>
          <stop offset="40%"  stopColor="#1060c8"/>
          <stop offset="100%" stopColor="#04148c"/>
        </radialGradient>
        <radialGradient id="ng-gloss" cx="32%" cy="20%" r="55%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.9)"/>
          <stop offset="50%"  stopColor="rgba(200,230,255,0.3)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        <radialGradient id="ng-glow" cx="50%" cy="50%" r="50%">
          <stop offset="60%"  stopColor="rgba(255,255,255,0)"/>
          <stop offset="100%" stopColor="rgba(120,180,255,0.25)"/>
        </radialGradient>
        <clipPath id="ng-clip">
          <circle cx="64" cy="64" r="58"/>
        </clipPath>
      </defs>

      {/* Outer glow */}
      <circle cx="64" cy="64" r="63" fill="url(#ng-glow)"/>
      {/* Globe */}
      <circle cx="64" cy="64" r="58" fill="url(#ng-sphere)"/>

      {/* Network node positions */}
      {/* Define nodes: [cx, cy] */}
      {(() => {
        const nodes: [number,number][] = [
          [64, 16], [28, 36], [100, 36], [16, 64], [112, 64],
          [28, 92], [100, 92], [64, 112], [64, 64], [46, 52], [82, 52], [46, 76], [82, 76],
        ];
        const edges: [number,number][] = [
          [0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[6,7],
          [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],
          [1,9],[2,10],[3,9],[4,10],[5,11],[6,12],[9,10],[11,12],
          [9,11],[10,12],[8,9],[8,10],[8,11],[8,12],
        ];
        return (
          <g clipPath="url(#ng-clip)">
            {edges.map(([a,b],i) => (
              <line key={i}
                x1={nodes[a][0]} y1={nodes[a][1]}
                x2={nodes[b][0]} y2={nodes[b][1]}
                stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"
                strokeLinecap="round"/>
            ))}
            {nodes.map(([cx,cy],i) => (
              <React.Fragment key={i}>
                <circle cx={cx} cy={cy} r={i===8?5:3.5}
                  fill="white" opacity="0.92"/>
                <circle cx={cx} cy={cy} r={i===8?8:6}
                  fill="rgba(255,255,255,0.15)"/>
              </React.Fragment>
            ))}
          </g>
        );
      })()}

      {/* Gloss */}
      <ellipse cx="44" cy="32" rx="26" ry="18" fill="url(#ng-gloss)"/>
      {/* Rim */}
      <circle cx="64" cy="64" r="57.5" fill="none"
        stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <circle cx="64" cy="64" r="58" fill="none"
        stroke="rgba(0,20,100,0.5)" strokeWidth="1"/>
    </svg>
  );
}

/** Mac OS X Finder face */
function MacFinderIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
      <defs>
        <linearGradient id="mf-bg-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#8aabcc"/>
          <stop offset="100%" stopColor="#4a7aaa"/>
        </linearGradient>
        <linearGradient id="mf-bg-r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#6a9ed8"/>
          <stop offset="100%" stopColor="#3568b8"/>
        </linearGradient>
        <linearGradient id="mf-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.5)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        <clipPath id="mf-clip">
          <rect width="128" height="128" rx="22"/>
        </clipPath>
      </defs>

      {/* Background — left half silver-blue, right half brighter blue */}
      <rect width="128" height="128" rx="22" fill="url(#mf-bg-r)"/>
      <path d="M0 0 L64 0 L64 128 L0 128 Z" fill="url(#mf-bg-l)"
        clipPath="url(#mf-clip)"/>

      {/* Subtle center divider */}
      <line x1="64" y1="8" x2="64" y2="120"
        stroke="rgba(0,0,0,0.12)" strokeWidth="1" clipPath="url(#mf-clip)"/>

      {/* Face */}
      {/* Left eye — frowning D shape (opening left) */}
      <path d="M32 46 Q22 54 32 62 Q36 62 36 54 Q36 46 32 46 Z"
        fill="#1a1a1a" clipPath="url(#mf-clip)"/>
      {/* Right eye — smiling D shape (opening right) */}
      <path d="M96 46 Q106 54 96 62 Q92 62 92 54 Q92 46 96 46 Z"
        fill="#1a1a1a" clipPath="url(#mf-clip)"/>

      {/* Nose dot */}
      <circle cx="64" cy="60" r="2.5" fill="rgba(0,0,0,0.35)"
        clipPath="url(#mf-clip)"/>

      {/* Mouth — slight asymmetric smile (left slight frown, right smile) */}
      <path d="M40 80 Q52 74 64 78 Q76 82 88 76"
        stroke="#1a1a1a" strokeWidth="4" fill="none"
        strokeLinecap="round" clipPath="url(#mf-clip)"/>

      {/* Gloss */}
      <rect x="1" y="1" width="126" height="54" rx="21"
        fill="url(#mf-gloss)" clipPath="url(#mf-clip)"/>

      {/* Border */}
      <rect x="0.5" y="0.5" width="127" height="127" rx="22"
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"
        clipPath="url(#mf-clip)"/>
    </svg>
  );
}

/** Adobe Photoshop Ps icon */
function PhotoshopIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
      <defs>
        <linearGradient id="ps-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a2a4a"/>
          <stop offset="100%" stopColor="#0a1428"/>
        </linearGradient>
        <linearGradient id="ps-text" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#a8d4f8"/>
          <stop offset="100%" stopColor="#7ab8f0"/>
        </linearGradient>
      </defs>

      {/* Dark bg */}
      <rect width="128" height="128" rx="18" fill="url(#ps-bg)"/>

      {/* Ps text — large, centered */}
      <text
        x="64" y="82"
        textAnchor="middle"
        fontFamily="-apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontSize="64"
        fontWeight="300"
        letterSpacing="-2"
        fill="url(#ps-text)"
      >Ps</text>

      {/* Subtle inner border */}
      <rect x="1" y="1" width="126" height="126" rx="17"
        fill="none" stroke="rgba(100,160,220,0.2)" strokeWidth="1.5"/>
      {/* Top gloss */}
      <rect x="2" y="2" width="124" height="40" rx="16"
        fill="rgba(255,255,255,0.04)"/>
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
    { id: 'finder-desktop',      label: 'Finder',      icon: <MacFinderIcon />,     action: () => openFinder('desktop', 'Macintosh HD') },
    { id: 'about',               label: 'About Me',    icon: <AboutIcon />,         action: () => openWindow({ id: 'about', type: 'about', title: 'About Vedant', x: 220, y: 100, width: 500, height: 380 }) },
    { id: 'finder-applications', label: 'Design Work', icon: <PhotoshopIcon />,     action: () => openFinder('applications', 'Design Work') },
    { id: 'finder-projects',     label: '3D & VFX',    icon: <ProjectsIcon />,      action: () => openFinder('projects', '3D & VFX') },
    { id: 'media',               label: 'Showreel',    icon: <VLCIcon />,           action: () => openWindow({ id: 'media', type: 'media', title: 'Showreel', x: 180, y: 80, width: 640, height: 400 }) },
    { id: 'contact',             label: 'Contact',     icon: <ContactIcon />,       action: () => openWindow({ id: 'contact', type: 'about', title: 'Contact', x: 260, y: 120, width: 480, height: 340 }) },
    { id: 'github',              label: 'GitHub',      icon: <NetworkGlobeIcon />,  action: () => window.open('https://github.com/vedwhodesigns', '_blank') },
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
