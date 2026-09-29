import { glassSurface } from './GlassButton'

// Short message pinned above the bottom safe area. Parent controls visibility.
export default function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),16px)+16px)] z-30 flex justify-center px-4 transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <p className={`${glassSurface} bg-black/70 px-6 py-3.5 text-base text-cream`}>{message}</p>
    </div>
  )
}
