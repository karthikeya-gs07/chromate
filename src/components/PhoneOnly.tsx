import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function PhoneOnly() {
  const url = window.location.origin
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#0B0B0C', light: '#F5F5F0' } }).then(setQr)
  }, [url])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center gap-8 text-center">
        <p className="text-sm tracking-[0.3em] text-muted uppercase">Chromate</p>
        <h1 className="text-4xl leading-tight font-semibold">
          Whoa, that's a big screen.
        </h1>
        <p className="text-lg text-muted">
          Chromate only lives on phones. Why not open it on yours instead?
        </p>
        <div className="size-44 rounded-2xl bg-paper p-3">
          {qr && <img src={qr} alt={`QR code for ${url}`} width={152} height={152} className="size-full" />}
        </div>
        <p className="text-sm text-muted">Scan with your phone camera</p>
        <button
          type="button"
          onClick={copyLink}
          className="min-h-11 cursor-pointer rounded-full bg-paper px-6 py-3 font-medium text-ink transition-transform active:scale-95"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </main>
  )
}
