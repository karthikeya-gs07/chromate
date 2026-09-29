import { useEffect, useRef, useState } from 'react'
import type { Template } from '../lib/templates'
import { templateFont } from '../lib/templates'

type Props = {
  template: Template
  initial: string
  onDone: (text: string) => void
}

let measureCtx: CanvasRenderingContext2D | null = null
function textWidth(text: string, font: string) {
  measureCtx ??= document.createElement('canvas').getContext('2d')!
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

// Bottom sheet for typing a photo's text. Input is capped to what fits the template's fixed text slot.
export default function TextSheet({ template, initial, onDone }: Props) {
  const [value, setValue] = useState(initial)
  const inputRef = useRef<HTMLInputElement>(null)
  const font = templateFont(template)
  const full = textWidth(value, font) >= template.text.w * 0.98

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function onChange(next: string) {
    // Trim anything that would overflow the fixed text slot (e.g. a long paste).
    while (next.length > value.length && textWidth(next, font) > template.text.w) next = next.slice(0, -1)
    setValue(next)
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/60" onClick={() => onDone(value)}>
      <form
        className="w-full rounded-t-[35px] bg-black px-[13px] pt-5 pb-[calc(max(env(safe-area-inset-bottom),16px)+8px)]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          onDone(value)
        }}
      >
        <label className="mb-3 block px-2 text-sm text-sand" htmlFor="photo-text">
          Text {full && <span className="text-cream/60">· line is full</span>}
        </label>
        <div className="flex gap-2">
          <input
            id="photo-text"
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={template.text.placeholder}
            enterKeyHint="done"
            autoComplete="off"
            className="min-h-12 flex-1 rounded-2xl border border-card-border bg-card-fill px-4 text-base text-cream outline-none placeholder:text-cream/30 focus:border-cream/60"
          />
          <button type="submit" className="min-h-12 cursor-pointer rounded-2xl bg-cream px-5 text-base text-black">
            Done
          </button>
        </div>
      </form>
    </div>
  )
}
