import { create } from 'zustand'

export type PowerState = 'active' | 'sleep' | 'shutdown'

export interface FileData {
  id: string
  name: string
  fileUrl: string
  thumbnailUrl?: string
  tags: string[]
  dateModified: string
  kind: 'Image' | 'Video' | 'PDF' | 'Application' | 'Folder'
  size: string
}

export interface Track {
  id: string
  title: string
  artist: string
  duration: number // seconds
  url: string
  albumArt?: string
}

export interface OSWindow {
  id: string
  type: 'finder' | 'media' | 'about' | 'contact'
  title: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  prevBounds?: { x: number; y: number; width: number; height: number }
  zIndex: number
  finderView?: 'desktop' | 'favorites' | 'applications' | string
}

interface OSStore {
  // Power State
  powerState: PowerState
  setPowerState: (state: PowerState) => void

  // Window Manager
  windows: OSWindow[]
  topZIndex: number
  activeWindowId: string | null
  openWindow: (config: Omit<OSWindow, 'zIndex' | 'isMinimized' | 'isMaximized' | 'prevBounds'>) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowPos: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void
  setWindowBounds: (id: string, x: number, y: number, width: number, height: number) => void

  // Audio State (controlled by MenuBar's audio element)
  tracks: Track[]
  currentTrackIndex: number
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  setIsPlaying: (playing: boolean) => void
  nextTrack: () => void
  prevTrack: () => void
  setVolume: (v: number) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void

  // Active File (for media viewer)
  activeFile: FileData | null
  openFile: (file: FileData) => void
  closeFile: () => void

  // Master File Database
  files: FileData[]
}

import { MASTER_FILES } from '@/data/masterFiles'
import { TRACKS } from '@/data/masterFiles'

export const useOSStore = create<OSStore>((set) => ({
  // Power
  powerState: 'active',
  setPowerState: (powerState) => set({ powerState }),

  // Windows
  windows: [],
  topZIndex: 10,
  activeWindowId: null,

  openWindow: (config) =>
    set((state) => {
      const existing = state.windows.find((w) => w.id === config.id)
      if (existing) {
        const newZ = state.topZIndex + 1
        return {
          windows: state.windows.map((w) =>
            w.id === config.id ? { ...w, isMinimized: false, zIndex: newZ } : w
          ),
          topZIndex: newZ,
          activeWindowId: config.id,
        }
      }
      const newZ = state.topZIndex + 1
      return {
        windows: [
          ...state.windows,
          { ...config, isMinimized: false, isMaximized: false, zIndex: newZ },
        ],
        topZIndex: newZ,
        activeWindowId: config.id,
      }
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),

  restoreWindow: (id) =>
    set((state) => {
      const newZ = state.topZIndex + 1
      return {
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, isMinimized: false, zIndex: newZ } : w
        ),
        topZIndex: newZ,
        activeWindowId: id,
      }
    }),

  maximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w
        if (w.isMaximized) {
          return {
            ...w,
            isMaximized: false,
            x: w.prevBounds?.x ?? 100,
            y: w.prevBounds?.y ?? 50,
            width: w.prevBounds?.width ?? 700,
            height: w.prevBounds?.height ?? 500,
            prevBounds: undefined,
          }
        }
        return {
          ...w,
          isMaximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 0,
          y: 22,
          width: typeof window !== 'undefined' ? window.innerWidth : 1280,
          height: typeof window !== 'undefined' ? window.innerHeight - 22 : 758,
        }
      }),
    })),

  focusWindow: (id) =>
    set((state) => {
      const newZ = state.topZIndex + 1
      return {
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, zIndex: newZ } : w
        ),
        topZIndex: newZ,
        activeWindowId: id,
      }
    }),

  updateWindowPos: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
    })),

  updateWindowSize: (id, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, width, height } : w)),
    })),

  setWindowBounds: (id, x, y, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, x, y, width, height } : w)),
    })),

  // Audio
  tracks: TRACKS,
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  nextTrack: () =>
    set((state) => ({
      currentTrackIndex: (state.currentTrackIndex + 1) % state.tracks.length,
      currentTime: 0,
    })),
  prevTrack: () =>
    set((state) => ({
      currentTrackIndex:
        (state.currentTrackIndex - 1 + state.tracks.length) % state.tracks.length,
      currentTime: 0,
    })),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),

  // Active File
  activeFile: null,
  openFile: (file) =>
    set((state) => {
      const mediaWindowId = `media-${file.id}`
      const newZ = state.topZIndex + 1
      const existing = state.windows.find((w) => w.id === mediaWindowId)
      if (existing) {
        return {
          activeFile: file,
          windows: state.windows.map((w) =>
            w.id === mediaWindowId
              ? { ...w, isMinimized: false, zIndex: newZ, title: file.name }
              : w
          ),
          topZIndex: newZ,
          activeWindowId: mediaWindowId,
        }
      }
      return {
        activeFile: file,
        windows: [
          ...state.windows,
          {
            id: mediaWindowId,
            type: 'media',
            title: file.name,
            x: 200 + Math.random() * 100,
            y: 80 + Math.random() * 60,
            width: 720,
            height: 540,
            isMinimized: false,
            isMaximized: false,
            zIndex: newZ,
          },
        ],
        topZIndex: newZ,
        activeWindowId: mediaWindowId,
      }
    }),
  closeFile: () => set({ activeFile: null }),

  // Master DB
  files: MASTER_FILES,
}))
