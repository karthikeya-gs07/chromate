let measureCtx: CanvasRenderingContext2D | null = null

export function textWidth(text: string, font: string) {
  measureCtx ??= document.createElement('canvas').getContext('2d')!
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

// Greedy word wrap (long words break by character), keeping manual line breaks.
// Shared by the preview and the export so both show the same lines.
export function wrapLines(text: string, font: string, maxWidth: number): string[] {
  return text.split('\n').flatMap((paragraph) => wrapParagraph(paragraph, font, maxWidth))
}

function wrapParagraph(text: string, font: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word
    if (textWidth(candidate, font) <= maxWidth) {
      line = candidate
      continue
    }
    if (line) lines.push(line)
    line = word
    // A single word wider than the slot: break it by character.
    while (textWidth(line, font) > maxWidth && line.length > 1) {
      let cut = line.length - 1
      while (cut > 1 && textWidth(line.slice(0, cut), font) > maxWidth) cut--
      lines.push(line.slice(0, cut))
      line = line.slice(cut)
    }
  }
  lines.push(line)
  return lines
}

// Trims typed/pasted text past the slot's line limit.
export function fitText(prev: string, next: string, font: string, maxWidth: number, maxLines: number) {
  next = next.replace(/\r\n?/g, '\n')
  while (next.length > prev.length && wrapLines(next, font, maxWidth).length > maxLines) next = next.slice(0, -1)
  return next
}
