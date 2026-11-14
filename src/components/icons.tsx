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

export function TrashIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="#FFF0C1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
