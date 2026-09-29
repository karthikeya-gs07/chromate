// Placeholder until the Figma landing screen (node 1:2) can be read.
export default function Landing() {
  return (
    <main className="flex min-h-dvh flex-col px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),16px)]">
      <p className="pt-6 text-sm tracking-[0.3em] text-muted uppercase">Chromate</p>
      <div className="flex flex-1 flex-col justify-end gap-3 pb-6">
        <h1 className="text-[clamp(2.5rem,12vw,3.5rem)] leading-none font-semibold">
          Stories &amp; posts, in seconds.
        </h1>
        <p className="text-muted">Landing screen coming from Figma.</p>
      </div>
    </main>
  )
}
