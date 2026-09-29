import { useState } from 'react'
import PlusGrid from '../components/PlusGrid'
import GlassButton from '../components/GlassButton'
import backIcon from '../assets/back.svg'
import downloadIcon from '../assets/download.svg'
import { FORMATS, type Format, type Photo } from '../lib/formats'
import { exportAll } from '../lib/exportImages'

type Props = {
  format: Format
  photos: Photo[]
  onBack: () => void
  onDownloaded: () => void
}

// Figma: Grid view (node 1:2131)
export default function PhotoGrid({ format, photos, onBack, onDownloaded }: Props) {
  const { plural, width, height } = FORMATS[format]
  const [busy, setBusy] = useState(false)

  async function downloadAll() {
    setBusy(true)
    try {
      await exportAll(photos, format)
      onDownloaded()
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative min-h-dvh bg-black">
      <PlusGrid className="fixed" />

      <header className="relative px-[30px] pt-[calc(env(safe-area-inset-top)+36px)]">
        <button
          type="button"
          onClick={onBack}
          className="-m-2.5 flex min-h-11 cursor-pointer items-center gap-[15px] p-2.5"
        >
          <img src={backIcon} alt="" width={24} height={24} />
          <span className="text-xl leading-[0.85] text-cream">{plural}</span>
        </button>
      </header>

      <ul className="relative grid grid-cols-2 gap-6 px-[30px] pt-9 pb-[calc(max(env(safe-area-inset-bottom),34px)+140px)]">
        {photos.map((photo, i) => (
          <li key={photo.id} className="overflow-hidden bg-white" style={{ aspectRatio: `${width} / ${height}` }}>
            <img
              src={photo.url}
              alt={`${FORMATS[format].label} ${i + 1}`}
              className="size-full object-cover"
              decoding="async"
            />
          </li>
        ))}
      </ul>

      {/* Fixed Download all bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 rounded-t-[35px] bg-black px-[13px] pt-4 pb-[calc(max(env(safe-area-inset-bottom),34px)+8px)]">
        <GlassButton
          onClick={downloadAll}
          disabled={busy || photos.length === 0}
          className="flex h-[90px] w-full items-end justify-center gap-[7px] pb-[33px]"
        >
          <img src={downloadIcon} alt="" width={27} height={24} />
          <span className="text-[22px] leading-none text-cream">{busy ? 'Preparing…' : 'Download all'}</span>
        </GlassButton>
      </div>
    </main>
  )
}
