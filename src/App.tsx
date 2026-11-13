import { lazy, Suspense } from 'react'
import useIsPhone from './hooks/useIsPhone'
import Chromate from './components/Chromate'

// Loaded only on tablets/desktops so phones don't download the QR library.
const PhoneOnly = lazy(() => import('./components/PhoneOnly'))

export default function App() {
  const isPhone = useIsPhone()
  if (!isPhone) {
    return (
      <Suspense fallback={null}>
        <PhoneOnly />
      </Suspense>
    )
  }
  return <Chromate />
}
