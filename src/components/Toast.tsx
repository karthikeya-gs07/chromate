import { glassSurface } from './GlassButton'

// Short message below the header (bottom of the screen is taken by action bars). Parent controls visibility.
export default function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+96px)] z-50 flex justify-center px-4 transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
    >
      <p className={`${glassSurface} bg-black/70 px-6 py-3.5 text-base text-cream`}>{message}</p>
    </div>
  )
}
