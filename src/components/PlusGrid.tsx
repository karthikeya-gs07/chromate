// Repeating tile of the Figma plus mark (12×12 on a 23×24 grid)
import plusMark from '../assets/plus-tile.svg'

export default function PlusGrid({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none inset-0 ${className}`}
      style={{
        backgroundImage: `url("${plusMark}")`,
        backgroundSize: '23px 24px',
        backgroundPosition: '7px 12px',
      }}
    />
  )
}
