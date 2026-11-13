import { useState } from 'react'
import PlusGrid from '../components/PlusGrid'
import GlassButton from '../components/GlassButton'
import TemplateView from '../components/TemplateView'
import BufferButton from '../components/BufferButton'
import { BufferIcon } from '../components/icons'
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
  onDeletePhoto: (id: string) => void
  onAddAllToBuffer: () => Promise<void>
  onDownloaded: () => void
}

// Figma: Grid view (node 1:2131)
export default function PhotoGrid({ format, photos, onBack, onAddMore, onOpenPhoto, onDeletePhoto, onAddAllToBuffer, onDownloaded }: Props) {
  const { label, plural } = FORMATS[format]
  const template = TEMPLATES[format]
  const [busy, setBusy] = useState<'download' | 'buffer' | null>(null)

  async function downloadAll() {
    setBusy('download')
    try {
      if (await exportAll(photos, format)) onDownloaded()
    } finally {
      setBusy(null)
    }
  }

  async function addAllToBuffer() {
    setBusy('buffer')
    try {
      await onAddAllToBuffer()
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="relative min-h-dvh bg-black">
      <PlusGrid className="fixed" />

      {/* Fixed title bar: only the thumbnails scroll */}
      <header className="sticky top-0 z-10 flex items-center justify-between rounded-b-[35px] bg-black px-[30px] pt-[calc(env(safe-area-inset-top)+26px)] pb-2.5">
        <button
          type="button"
          onClick={onBack}
          className="-m-2.5 flex min-h-11 cursor-pointer items-center gap-[15px] p-2.5"
        >
          <img src={backIcon} alt="" width={24} height={24} />
          <span className="text-xl leading-[0.85] text-cream">{plural}</span>
        </button>
        <BufferButton className="-mr-2.5" />
      </header>

      <ul className="relative grid grid-cols-2 gap-6 px-[30px] pt-4 pb-[calc(max(env(safe-area-inset-bottom),34px)+140px)]">
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
          <li key={photo.id} className="relative">
            <button
              type="button"
              onClick={() => onOpenPhoto(photo.id)}
              aria-label={`Open ${label} ${i + 1}`}
              className="block w-full cursor-pointer transition-transform duration-150 active:scale-[0.97]"
            >
              <TemplateView template={template} photo={photo} label={`${label} ${i + 1}`} />
            </button>
            {/* Delete: 44px touch target around a 26px visual button, overlapping the top-right corner */}
            <button
              type="button"
              onClick={() => onDeletePhoto(photo.id)}
              aria-label={`Delete ${label} ${i + 1}`}
              className="absolute -top-[13px] -right-[13px] flex size-11 cursor-pointer items-center justify-center"
            >
              <span className="flex size-[26px] items-center justify-center rounded-full border border-card-border bg-black/80 backdrop-blur-[5.2px] transition-transform active:scale-90">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1 1L9 9M9 1L1 9" stroke="#FFF0C1" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Fixed action bar: Add all to buffer / Download all */}
      <div className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-2 gap-2.5 rounded-t-[35px] bg-black px-[13px] pt-4 pb-[calc(max(env(safe-area-inset-bottom),34px)+8px)]">
        <GlassButton
          onClick={addAllToBuffer}
          disabled={busy !== null || photos.length === 0}
          className="flex h-[90px] items-center justify-center gap-2"
        >
          <BufferIcon />
          <span className="text-lg leading-none text-cream">{busy === 'buffer' ? 'Adding…' : 'Add to buffer'}</span>
        </GlassButton>
        <GlassButton
          onClick={downloadAll}
          disabled={busy !== null || photos.length === 0}
          className="flex h-[90px] items-center justify-center gap-[7px]"
        >
          <img src={downloadIcon} alt="" width={27} height={24} />
          <span className="text-lg leading-none text-cream">{busy === 'download' ? 'Preparing…' : 'Download all'}</span>
        </GlassButton>
      </div>
    </main>
  )
}
