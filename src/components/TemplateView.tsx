import { useLayoutEffect, useRef, useState } from 'react'
import type { Crop, DetailTune, Photo } from '../lib/formats'
import { templateFont, type Template } from '../lib/templates'
import { DETAIL_MAX_ZOOM, detailTuneFrom, resolveCrop, resolveDetailCrop } from '../lib/crop'
import { fitText, wrapLines } from '../lib/text'
import PhotoBox from './PhotoBox'

type Props = {
  template: Template
  photo: Photo
  label: string
  // Editable: photo boxes take drag/pinch and the text slots are live inputs.
  editable?: boolean
  // Slot currently being typed into; while set, the photo is locked.
  editingSlot?: number | null
  onCropChange?: (crop: Crop) => void
  // Double-tap on the main photo: back to centered, no zoom.
  onCropReset?: () => void
  // Drag/pinch/double-tap on the close-up box (templates with `detail`). null = follow the main box.
  onDetailChange?: (tune: DetailTune | null) => void
  // Tap on an empty gray box (no image yet): pick a photo.
  onPhotoTap?: () => void
  onTextChange?: (slot: number, text: string) => void
  onTextFocus?: (slot: number) => void
  onTextBlur?: () => void
}

// Renders the template at its real pixel size, scaled down to fit the container width.
export default function TemplateView({
  template,
  photo,
  label,
  editable = false,
  editingSlot = null,
  onCropChange,
  onCropReset,
  onDetailChange,
  onPhotoTap,
  onTextChange,
  onTextFocus,
  onTextBlur,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const empty = photo.file === null
  const photoMovable = editable && editingSlot === null && !empty

  useLayoutEffect(() => {
    const el = wrapRef.current!
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / template.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [template.width])

  const box = template.photo
  const slots = template.slots[photo.layout]
  const font = templateFont(template)
  const { detail } = template

  // Read-only previews (e.g. Templates page) just show the plain gray box.
  const emptyButton = (withLabel: boolean) =>
    editable && (
      <button
        type="button"
        disabled={!onPhotoTap}
        onClick={onPhotoTap}
        aria-label={withLabel ? undefined : 'Add a photo'}
        className="flex size-full cursor-pointer flex-col items-center justify-center gap-10 text-white disabled:cursor-default"
      >
        {withLabel && (
          // 1080px canvas, so type here is large (shown scaled down).
          <>
            <svg width="160" height="160" viewBox="0 0 106 106" fill="none" aria-hidden>
              <path d="M35.3333 53H53M53 53H70.6667M53 53V35.3333M53 53V70.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="53" cy="53" r="44.1667" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="text-[52px] leading-none">Tap to add a photo</span>
          </>
        )}
      </button>
    )

  const { textStyle } = template
  const slotStyle = (slot: (typeof slots)[number]) => ({
    left: slot.x,
    top: slot.y,
    width: slot.w,
    textAlign: slot.align,
    fontSize: textStyle.fontSize,
    lineHeight: `${textStyle.lineHeight}px`,
    fontWeight: textStyle.fontWeight,
    color: textStyle.color,
  })

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden" style={{ aspectRatio: `${template.width} / ${template.height}` }}>
      {scale > 0 && (
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: template.width, height: template.height, background: template.background, transform: `scale(${scale})` }}
        >
          <PhotoBox
            box={box}
            photo={photo}
            crop={resolveCrop(photo, box)}
            label={label}
            movable={photoMovable}
            onCropChange={onCropChange}
            onReset={onCropReset}
            empty={emptyButton(true)}
          />

          {/* Close-up: same photo, follows the main box, with its own fine-tune */}
          {detail && (
            <PhotoBox
              box={detail.box}
              photo={photo}
              crop={resolveDetailCrop(photo, box, detail)}
              label={`${label}, close-up`}
              movable={photoMovable}
              maxZoom={DETAIL_MAX_ZOOM}
              onCropChange={(c) => onDetailChange?.(detailTuneFrom(photo, box, detail, c))}
              onReset={() => onDetailChange?.(null)}
              empty={emptyButton(false)}
            />
          )}

          {/* Text slots: typed into directly, no separate field. Text wraps downward. */}
          {slots.map((slot, i) => {
            const value = photo.texts[i]
            const lines = value ? wrapLines(value, font, slot.w) : [slot.placeholder]
            const height = Math.max(1, lines.length) * textStyle.lineHeight
            if (!editable) {
              return (
                <div key={i} className="absolute whitespace-pre" style={{ ...slotStyle(slot), height, opacity: value ? 1 : 0.5 }}>
                  {lines.join('\n')}
                </div>
              )
            }
            return (
              <textarea
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el
                }}
                value={value}
                rows={1}
                onChange={(e) => onTextChange?.(i, fitText(value, e.target.value, font, slot.w, slot.maxLines))}
                onFocus={() => onTextFocus?.(i)}
                onBlur={onTextBlur}
                placeholder={slot.placeholder}
                aria-label={`${slot.placeholder} for ${label}`}
                data-text-slot={i}
                autoComplete="off"
                spellCheck={false}
                className="absolute resize-none overflow-hidden bg-transparent p-0 break-words whitespace-pre-wrap outline-none placeholder:text-current placeholder:opacity-50"
                style={{ ...slotStyle(slot), height }}
              />
            )
          })}

          {/* Big tap zones below the photo so a tiny text line is easy to hit before zooming in */}
          {editable &&
            editingSlot === null &&
            slots.map((_, i) => {
              const { y: top, h: height } = template.textZone
              const left = slots.length === 1 ? 0 : i === 0 ? 0 : template.width / 2
              return (
                <button
                  key={`zone-${i}`}
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => inputRefs.current[i]?.focus()}
                  className="absolute cursor-text"
                  style={{ left, top, width: template.width / slots.length, height }}
                />
              )
            })}
        </div>
      )}
    </div>
  )
}
