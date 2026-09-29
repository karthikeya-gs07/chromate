let measureCtx: CanvasRenderingContext2D | null = null

export function textWidth(text: string, font: string) {
  measureCtx ??= document.createElement('canvas').getContext('2d')!
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

// Trims newly typed/pasted text so it never overflows a fixed-width text slot.
export function fitText(prev: string, next: string, font: string, maxWidth: number) {
  while (next.length > prev.length && textWidth(next, font) > maxWidth) next = next.slice(0, -1)
  return next
}
