import { useSyncExternalStore } from 'react'

// Tablet/desktop if the shortest screen side is over 600px, or a mouse/trackpad is the main pointer.
const TABLET_MIN_SIDE = 600

function detectPhone() {
  const shortSide = Math.min(window.screen.width, window.screen.height)
  const hasMouse = window.matchMedia('(pointer: fine) and (hover: hover)').matches
  return shortSide <= TABLET_MIN_SIDE && !hasMouse
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia('(pointer: fine) and (hover: hover)')
  window.addEventListener('resize', onChange)
  window.addEventListener('orientationchange', onChange)
  mq.addEventListener('change', onChange)
  return () => {
    window.removeEventListener('resize', onChange)
    window.removeEventListener('orientationchange', onChange)
    mq.removeEventListener('change', onChange)
  }
}

export default function useIsPhone() {
  return useSyncExternalStore(subscribe, detectPhone, () => true)
}
