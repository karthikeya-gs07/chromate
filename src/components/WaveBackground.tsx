// Landing background: the Figma black → sand gradient, with soft wave layers drifting over it
// in the same two colors so the gradient edge ripples. Transform-only animation (GPU friendly);
// motion is switched off for prefers-reduced-motion in index.css.

// Two identical wave periods side by side (0–1440, 1440–2880), so sliding the layer by -50% loops seamlessly.
const WAVE =
  'M0,40 C240,0 480,0 720,40 C960,80 1200,80 1440,40 C1680,0 1920,0 2160,40 C2400,80 2640,80 2880,40 L2880,400 L0,400 Z'

type Layer = {
  id: string
  top: string
  color: string
  from: number
  to: number
  duration: string
  reverse?: boolean
  flip?: boolean
}

const LAYERS: Layer[] = [
  // Black wave hanging from the top: darkens the upper part in a moving, wavy line.
  { id: 'shade', top: '-8%', color: '#000000', from: 0, to: 0.7, duration: '22s', flip: true },
  // Sand waves rising from the bottom.
  { id: 'sand-back', top: '32%', color: 'var(--color-bg-end)', from: 0, to: 0.45, duration: '16s', reverse: true },
  { id: 'sand-front', top: '48%', color: 'var(--color-bg-end)', from: 0, to: 0.4, duration: '11s' },
]

export default function WaveBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-linear-to-b from-black from-[22%] to-bg-end">
      {LAYERS.map((l) => (
        <div
          key={l.id}
          className="wave-bob absolute inset-x-0"
          style={{ top: l.top, height: l.flip ? '60%' : undefined, bottom: l.flip ? undefined : 0, animationDuration: `calc(${l.duration} * 0.6)` }}
        >
          <div className="absolute inset-0" style={{ transform: l.flip ? 'scaleY(-1)' : undefined }}>
            <svg
              className="wave-drift absolute top-0 left-0 h-full w-[200%]"
              style={{ animationDuration: l.duration, animationDirection: l.reverse ? 'reverse' : 'normal' }}
              viewBox="0 0 2880 400"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`g-${l.id}`} x1="0" y1="0" x2="0" y2="1">
                  {/* Soft edge at the crests, then ramp up quickly so the wave shape reads */}
                  <stop offset="0" style={{ stopColor: l.color, stopOpacity: l.from }} />
                  <stop offset="0.1" style={{ stopColor: l.color, stopOpacity: l.from }} />
                  <stop offset="0.4" style={{ stopColor: l.color, stopOpacity: l.to * 0.8 }} />
                  <stop offset="1" style={{ stopColor: l.color, stopOpacity: l.to }} />
                </linearGradient>
              </defs>
              <path d={WAVE} fill={`url(#g-${l.id})`} />
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}
