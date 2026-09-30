// Followers are most active 6–9 PM (from Instagram insights).
const PEAK_START = 18 * 60 // 6:00 PM, in minutes since midnight
const PEAK_END = 21 * 60 // 9:00 PM (exclusive)
const TOMORROW_FROM = 22 * 60 // 10:00 PM until midnight

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Tagline under the clock on the landing page.
export function postTimingMessage(now: Date) {
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (minutes >= PEAK_START && minutes < PEAK_END) return 'Perfect time to post'
  if (minutes >= TOMORROW_FROM) return 'Keep them ready for tomorrow'
  // Before 6 PM today, or 9–10 PM (counts to 6 PM tomorrow).
  const untilPeak = (PEAK_START - minutes + 24 * 60) % (24 * 60)
  return `Best to post in ${formatDuration(untilPeak)}`
}
