// Small inline icons in the app's line style (cream, 1.5 stroke).

export function BufferIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="3" width="11" height="15" rx="2" stroke="#FFF0C1" strokeOpacity="0.5" strokeWidth="1.5" />
      <rect x="4" y="6" width="11" height="15" rx="2" fill="#000" stroke="#FFF0C1" strokeWidth="1.5" />
    </svg>
  )
}

export function CloseIcon({ size = 10, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M1 1L9 9M9 1L1 9" stroke="#FFF0C1" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}
