import { useState } from 'react'
import PlusGrid from '../components/PlusGrid'
import GlassButton from '../components/GlassButton'
import TemplateView from '../components/TemplateView'
import TextSheet from '../components/TextSheet'
import backIcon from '../assets/back.svg'
import downloadIcon from '../assets/download.svg'
import plusIcon from '../assets/add.svg'
import { FORMATS, MAX_PHOTOS, type Format, type Photo } from '../lib/formats'
import { TEMPLATES } from '../lib/templates'
import { exportAll } from '../lib/exportImages'

type Props = {
  format: Format
  photos: Photo[]
  onBack: () => void
  onAddMore: () => void
  onUpdatePhoto: (id: string, patch: Partial<Photo>) => void
  onDownloaded: () => void
}

// Figma: Grid view (node 1:2131)
export default function PhotoGrid({ format, photos, onBack, onAddMore, onUpdatePhoto, onDownloaded }: Props) {
  const { label, plural } = FORMATS[format]
  const template = TEMPLATES[format]
  const [busy, setBusy] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [textId, setTextId] = useState<string | null>(null)
  const textPhoto = photos.find((p) => p.id === textId)

  async function downloadAll() {
    setActiveId(null)
    setBusy(true)
    try {
      await exportAll(photos, format)
      onDownloaded()
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative min-h-dvh bg-black" onClick={() => setActiveId(null)}>
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
            <GlassButton
              onClick={onAddMore}
              className="flex size-full flex-col items-center justify-center gap-3 rounded-none"
            >
              <img src={plusIcon} alt="" width={28} height={28} />
              <span className="text-lg leading-none text-cream">Add more</span>
              <span className="text-xs leading-none text-sand">
                {photos.length}/{MAX_PHOTOS}
              </span>
            </GlassButton>
          </li>
        )}
        {photos.map((photo, i) => (
          <li key={photo.id} onClick={(e) => e.stopPropagation()}>
            <TemplateView
              template={template}
              photo={photo}
              label={`${label} ${i + 1}`}
              active={activeId === photo.id}
              onActivate={() => setActiveId(photo.id)}
              onCropChange={(crop) => onUpdatePhoto(photo.id, { crop })}
              onTextTap={() => setTextId(photo.id)}
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

      {textPhoto && (
        <TextSheet
          template={template}
          initial={textPhoto.text}
          onDone={(text) => {
            onUpdatePhoto(textPhoto.id, { text })
            setTextId(null)
          }}
        />
      )}
    </main>
  )
}
