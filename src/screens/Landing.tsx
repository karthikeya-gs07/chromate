import FormatCard from '../components/FormatCard'
import PlusGrid from '../components/PlusGrid'
import type { Format } from '../lib/formats'

type Props = {
  onSelectFormat: (format: Format) => void
}

// Figma: Landing (node 1:2)
export default function Landing({ onSelectFormat }: Props) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-linear-to-b from-black from-[22%] to-bg-end px-3 pt-[max(calc(env(safe-area-inset-top)+25px),9.9dvh)] pb-[calc(max(env(safe-area-inset-bottom),34px)+8px)]">
      <PlusGrid className="absolute" />

      <header className="relative pl-5">
        <h1 className="-mt-[0.1em] bg-linear-to-b from-cream to-title-end bg-clip-text pt-[0.1em] text-[59px] leading-[0.85] text-transparent">
          Chro
          <br />
          mate
        </h1>
        <p className="mt-2 text-[19px] leading-[1.2] whitespace-nowrap text-cream/40">Every story matters</p>
      </header>

      <div className="relative mt-auto grid grid-cols-2 gap-3 pt-10">
        <FormatCard label="Story" size="1080 x 1920" previewHeight={64} onSelect={() => onSelectFormat('story')} />
        <FormatCard label="Post" size="1080 x 1350" previewHeight={45} onSelect={() => onSelectFormat('post')} />
      </div>
    </main>
  )
}
