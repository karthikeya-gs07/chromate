import FormatCard from '../components/FormatCard'
// Repeating tile of the Figma plus mark (12×12 on a 23×24 grid)
import plusMark from '../assets/plus-tile.svg'

export type Format = 'story' | 'post'

type Props = {
  onSelectFormat?: (format: Format) => void
}

// Figma: Landing (node 1:2)
export default function Landing({ onSelectFormat }: Props) {
  return (
    <main
      className="relative flex min-h-dvh flex-col overflow-hidden bg-linear-to-b from-black from-[22%] to-bg-end px-3 pt-[max(calc(env(safe-area-inset-top)+24px),15.5dvh)] pb-[calc(max(env(safe-area-inset-bottom),34px)+8px)]"
    >
      {/* Plus-mark grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("${plusMark}")`,
          backgroundSize: '23px 24px',
          backgroundPosition: '7px 12px',
        }}
      />

      <header className="relative pl-5">
        <h1 className="bg-linear-to-b from-cream to-title-end bg-clip-text -mt-[0.1em] pt-[0.1em] text-[clamp(64px,min(30.5vw,14dvh),140px)] leading-[0.85] text-transparent">
          Chro
          <br />
          mate
        </h1>
        <p className="mt-[15px] max-w-[213px] pl-1 text-[19px] leading-[1.1] text-cream/40">
          Karthikeya's way of storytelling
        </p>
      </header>

      <div className="relative mt-auto grid grid-cols-2 gap-3 pt-10">
        <FormatCard label="Story" size="1080 x 1920" previewHeight={64} onSelect={() => onSelectFormat?.('story')} />
        <FormatCard label="Post" size="1080 x 1350" previewHeight={45} onSelect={() => onSelectFormat?.('post')} />
      </div>
    </main>
  )
}
