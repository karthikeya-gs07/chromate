import { useState } from 'react'
import PlusGrid from '../components/PlusGrid'
import GlassButton from '../components/GlassButton'
import TemplateView from '../components/TemplateView'
import backIcon from '../assets/back.svg'
import downloadIcon from '../assets/download.svg'
import addIcon from '../assets/add-circle.svg'
import { FORMATS, MAX_PHOTOS, type Format, type Photo } from '../lib/formats'
import { TEMPLATES } from '../lib/templates'
import { exportAll } from '../lib/exportImages'

type Props = {
  format: Format
  photos: Photo[]
  onBack: () => void
  onAddMore: () => void
  onOpenPhoto: (id: string) => void
  onDownloaded: () => void
}

// Figma: Grid view (node 1:2131)
export default function PhotoGrid({ format, photos, onBack, onAddMore, onOpenPhoto, onDownloaded }: Props) {
  const { label, plural } = FORMATS[format]
  const template = TEMPLATES[format]
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
        {photos.length < MAX_PHOTOS && (
          <li style={{ aspectRatio: `${template.width} / ${template.height}` }}>
            {/* Figma: Add more tile (node 1:11392). Sizes in cqw so it scales with the tile (155px wide in Figma). */}
            <button
              type="button"
              onClick={onAddMore}
              className="@container relative size-full cursor-pointer rounded-[18px] border border-card-border bg-card-fill backdrop-blur-[5.2px] transition-transform duration-150 active:scale-[0.97]"
            >
              <img
                src={addIcon}
                alt=""
                width={106}
                height={106}
                className="absolute top-[calc(50%-14.2cqw)] left-1/2 size-[68.4cqw] -translate-1/2"
              />
              <span className="absolute inset-x-0 top-[calc(50%+46.5cqw)] text-center text-[10.3cqw] leading-none text-cream">
                Add more
              </span>
              <span className="absolute inset-x-0 top-[calc(50%+63.2cqw)] text-center text-[7.75cqw] leading-none text-cream/50">
                {photos.length}/{MAX_PHOTOS}
              </span>
            </button>
          </li>
        )}
        {photos.map((photo, i) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => onOpenPhoto(photo.id)}
              aria-label={`Open ${label} ${i + 1}`}
              className="block w-full cursor-pointer transition-transform duration-150 active:scale-[0.97]"
            >
              <TemplateView template={template} photo={photo} label={`${label} ${i + 1}`} />
            </button>
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
