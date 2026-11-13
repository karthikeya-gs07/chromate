import { createContext, useContext } from 'react'
import type { Photo } from '../lib/formats'

export type BufferItem = { id: string; createdAt: number; photo: Photo }

export type AppState = {
  buffer: BufferItem[]
  bufferFull: boolean
  // Returns the new item id, or null if the buffer is full / photo has no image.
  addToBuffer: (photo: Photo) => Promise<string | null>
  updateBufferItem: (id: string, photo: Photo) => Promise<void>
  removeFromBuffer: (id: string) => Promise<void>
  emptyBuffer: () => Promise<void>
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  showToast: (message: string) => void
}

export const AppContext = createContext<AppState | null>(null)

export default function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
