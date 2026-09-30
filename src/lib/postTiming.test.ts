import { describe, expect, it } from 'vitest'
import { postTimingMessage } from './postTiming'

const at = (h: number, m: number) => new Date(2026, 8, 30, h, m)

describe('postTimingMessage', () => {
  it.each([
    [0, 0, 'Best to post in 18h'],
    [9, 24, 'Best to post in 8h 36m'],
    [17, 0, 'Best to post in 1h'],
    [17, 59, 'Best to post in 1m'],
    [18, 0, 'Perfect time to post'],
    [19, 30, 'Perfect time to post'],
    [20, 59, 'Perfect time to post'],
    [21, 0, 'Best to post in 21h'],
    [21, 45, 'Best to post in 20h 15m'],
    [22, 0, 'Keep them ready for tomorrow'],
    [23, 59, 'Keep them ready for tomorrow'],
  ])('%i:%i → %s', (h, m, expected) => {
    expect(postTimingMessage(at(h, m))).toBe(expected)
  })
})
