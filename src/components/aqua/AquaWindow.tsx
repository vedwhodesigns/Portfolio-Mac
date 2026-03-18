"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore, OSWindow } from '@/store/useOSStore';

interface AquaWindowProps {
  win: OSWindow;
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
}

export default function AquaWindow({
  win,
  children,
  minWidth = 300,
  minHeight = 180,
}: AquaWindowProps) {
  const {
    closeWindow, minimizeWindow, maximizeWindow,
    focusWindow, updateWindowPos, updateWindowSize, activeWindowId,
  } = useOSStore();

  const [pos,  setPos]  = useState({ x: win.x, y: win.y });
  const [size, setSize] = useState({ width: win.width, height: win.height });
  const [entering, setEntering] = useState(true);

  const isActive = activeWindowId === win.id;

  // Sync from store (e.g. maximize)
  useEffect(() => { setPos({ x: win.x, y: win.y }); }, [win.x, win.y]);
  useEffect(() => { setSize({ width: win.width, height: win.height }); }, [win.width, win.height]);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 160);
    return () => clearTimeout(t);
  }, []);

  // ── Drag ──────────────────────────────────────────────
  const dragStart = useRef<{ mx: number; my: number; wx: number; wy: number } | null>(null);
  const livePos   = useRef(pos);
  livePos.current = pos;

  const onTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.traffic-lights')) return;
    if (win.isMaximized) return;
    e.preventDefault();
    focusWindow(win.id);
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const nx = dragStart.current.wx + ev.clientX - dragStart.current.mx;
      const ny = Math.max(22, dragStart.current.wy + ev.clientY - dragStart.current.my);
      setPos({ x: nx, y: ny });
    };
    const onUp = () => {
      updateWindowPos(win.id, livePos.current.x, livePos.current.y);
      dragStart.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [win.id, win.isMaximized, pos, focusWindow, updateWindowPos]);

  // ── Resize ────────────────────────────────────────────
  const resizeStart = useRef<{ mx: number; my: number; w: number; h: number } | null>(null);
  const liveSize    = useRef(size);
  liveSize.current  = size;

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(win.id);
    resizeStart.current = { mx: e.clientX, my: e.clientY, w: size.width, h: size.height };

    const onMove = (ev: MouseEvent) => {
      if (!resizeStart.current) return;
      const nw = Math.max(minWidth,  resizeStart.current.w + ev.clientX - resizeStart.current.mx);
      const nh = Math.max(minHeight, resizeStart.current.h + ev.clientY - resizeStart.current.my);
      setSize({ width: nw, height: nh });
    };
    const onUp = () => {
      updateWindowSize(win.id, liveSize.current.width, liveSize.current.height);
      resizeStart.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [win.id, size, focusWindow, updateWindowSize, minWidth, minHeight]);

  if (win.isMinimized) return null;

  const isMax = win.isMaximized;

  return (
    <div
      className={`aqua-window ${entering ? 'aqua-window-entering' : ''}`}
      style={{
        position: 'fixed',
        left:   isMax ? 0        : pos.x,
        top:    isMax ? 22       : pos.y,
        width:  isMax ? '100vw'  : size.width,
        height: isMax ? 'calc(100vh - 22px)' : size.height,
        zIndex: win.zIndex,
        borderRadius: isMax ? 0 : 6,
        boxShadow: isActive
          ? '0 22px 65px rgba(0,0,0,0.58), 0 0 0 1px rgba(0,0,0,0.28)'
          : '0 10px 32px rgba(0,0,0,0.38), 0 0 0 1px rgba(0,0,0,0.22)',
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        className={`aqua-titlebar ${isActive ? 'aqua-titlebar-active' : 'aqua-titlebar-inactive'}`}
        onMouseDown={onTitleMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        style={{ cursor: 'default', userSelect: 'none', flexShrink: 0 }}
      >
        {/* Traffic Lights */}
        <div className="traffic-lights">
          <button
            className="tl tl-red"
            onClick={e => { e.stopPropagation(); closeWindow(win.id); }}
            title="Close"
          >
            <span className="tl-icon">✕</span>
          </button>
          <button
            className="tl tl-yellow"
            onClick={e => { e.stopPropagation(); minimizeWindow(win.id); }}
            title="Minimize"
          >
            <span className="tl-icon">−</span>
          </button>
          <button
            className="tl tl-green"
            onClick={e => { e.stopPropagation(); maximizeWindow(win.id); }}
            title={isMax ? 'Restore' : 'Zoom'}
          >
            <span className="tl-icon">+</span>
          </button>
        </div>

        {/* Centered title */}
        <span className="aqua-window-title">
          {win.type === 'finder' && (
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ opacity: isActive ? 0.7 : 0.4, flexShrink: 0 }}>
              <rect x="1" y="2" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1"/>
              <rect x="3" y="4" width="8" height="1.5" rx="0.75" fill="currentColor" opacity="0.6"/>
              <rect x="3" y="6.5" width="6" height="1.5" rx="0.75" fill="currentColor" opacity="0.4"/>
            </svg>
          )}
          {win.title}
        </span>
      </div>

      {/* Content */}
      <div className="aqua-window-content">
        {children}
      </div>

      {/* Resize handle */}
      {!isMax && (
        <div className="aqua-resize-handle" onMouseDown={onResizeMouseDown} />
      )}
    </div>
  );
}
