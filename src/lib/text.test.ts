import { beforeAll, describe, expect, it } from 'vitest'

// No real canvas in Node: every character measures 10px wide.
beforeAll(() => {
  globalThis.document = {
    createElement: () => ({ getContext: () => ({ font: '', measureText: (t: string) => ({ width: t.length * 10 }) }) }),
  } as unknown as Document
})

const { wrapLines, fitText } = await import('./text')
const FONT = "400 24px 'Google Sans'"

describe('wrapLines', () => {
  it('keeps short text on one line', () => {
    expect(wrapLines('hello world', FONT, 200)).toEqual(['hello world'])
  })

  it('wraps at word boundaries when the width is reached', () => {
    // 100px = 10 characters per line
    expect(wrapLines('the quick brown fox jumps', FONT, 100)).toEqual(['the quick', 'brown fox', 'jumps'])
  })

  it('breaks a single word longer than the line', () => {
    expect(wrapLines('abcdefghijklmnop', FONT, 50)).toEqual(['abcde', 'fghij', 'klmno', 'p'])
  })

  it('keeps manual line breaks', () => {
    expect(wrapLines('line one\nline two', FONT, 200)).toEqual(['line one', 'line two'])
    expect(wrapLines('a\n\nb', FONT, 200)).toEqual(['a', '', 'b'])
  })
})

describe('fitText', () => {
  it('allows text within the line limit', () => {
    expect(fitText('', 'the quick brown', FONT, 100, 2)).toBe('the quick brown')
  })

  it('trims typed/pasted text that would go past the line limit', () => {
    const out = fitText('', 'the quick brown fox jumps over', FONT, 100, 2)
    expect(wrapLines(out, FONT, 100).length).toBeLessThanOrEqual(2)
    expect('the quick brown fox jumps over'.startsWith(out)).toBe(true)
  })

  it('counts manual line breaks toward the limit', () => {
    expect(fitText('a\nb', 'a\nb\nc', FONT, 100, 2)).toBe('a\nb')
  })

  it('never blocks deleting', () => {
    expect(fitText('a\nb\nc', 'a\nb', FONT, 100, 2)).toBe('a\nb')
  })

  it('normalises Windows line endings', () => {
    expect(fitText('', 'a\r\nb', FONT, 100, 5)).toBe('a\nb')
  })
})
