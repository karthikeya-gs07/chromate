import { useEffect, useState } from 'react'

// Current time, re-rendering at each new minute.
export default function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number
    const untilNextMinute = (d: Date) => 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds())
    const tick = () => {
      const d = new Date()
      setNow(d)
      timer = window.setTimeout(tick, untilNextMinute(d))
    }
    timer = window.setTimeout(tick, untilNextMinute(new Date()))
    // Catch up right away when the app comes back from the background.
    const onVisible = () => document.visibilityState === 'visible' && setNow(new Date())
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return now
}
