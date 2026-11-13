import { useEffect } from 'react'

// Browser "Leave site?" prompt on refresh/close while there's unsaved work.
export default function useLeaveWarning(active: boolean) {
  useEffect(() => {
    if (!active) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active])
}
