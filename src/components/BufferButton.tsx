import useApp from '../hooks/useApp'
import { BufferIcon } from './icons'

// Opens the buffer panel. Sits in the top-right of every screen's header, with a count badge.
export default function BufferButton({ className = '' }: { className?: string }) {
  const { buffer, setPanelOpen } = useApp()
  return (
    <button
      type="button"
      onClick={() => setPanelOpen(true)}
      aria-label={`Open buffer, ${buffer.length} ${buffer.length === 1 ? 'story' : 'stories'}`}
      className={`relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-card-border bg-card-fill backdrop-blur-[5.2px] transition-transform active:scale-95 ${className}`}
    >
      <BufferIcon />
      {buffer.length > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cream px-1 text-[11px] leading-none text-black tabular-nums">
          {buffer.length}
        </span>
      )}
    </button>
  )
}
