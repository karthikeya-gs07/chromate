# Rules

## Target

- Phone only: from 320px (iPhone SE) to about 480px wide, portrait first.
- Test widths: 320, 360, 375, 390, 393, 412, 430.
- Platforms: iOS Safari 16.4+ and Android Chrome, both in the browser and installed as a PWA.

## Figma to code sizing

- Figma is designed at 393px wide, but the code must fit every phone from 320–480px.
- Nothing is fixed to 393. Use fluid widths, flex/grid and `clamp()` for type and spacing.
- Test every screen at all the test widths.

## Phone-only gate

- On tablets, desktops and laptops, don't show the app. Show a quirky full-screen message instead, e.g. "Chromate only lives on phones. Why not open it on yours?"
- Include a **Copy link** button with "Copied!" feedback.
- Detection: the shortest screen side is over 600px, OR the device has a mouse or trackpad (`pointer: fine` + `hover: hover`).
- Check it again on resize and rotation.
- The gate must be light and load instantly.

## Stack (default, confirm with the user)

- React + TypeScript + Vite
- Tailwind CSS v4
- `vite-plugin-pwa` for the manifest and service worker (Workbox)
- Deploy on Vercel

## Performance

- Budget: LCP under 2.5s on mid-range Android over 4G. JS under about 150KB gzipped for the first load.
- Lazy-load routes and heavy components.
- Images: WebP or AVIF, with explicit `width` and `height`, and `loading="lazy"` below the fold.
- Fonts: self-host, use `font-display: swap`, and preload only the main weight.
- No layout shift: reserve space for images and async content.
- Animate only `transform` and `opacity`. Respect `prefers-reduced-motion`.
- Avoid heavy libraries when a small one or native code works.

## Responsive and mobile layout

- Build mobile-first. Use fluid layouts (flex/grid, `%`, `clamp()`), not fixed pixel widths.
- Use `100dvh` rather than `100vh` for full-height screens.
- Respect safe areas: `env(safe-area-inset-*)` for the notch, home bar and status bar.
- Viewport meta: `width=device-width, initial-scale=1, viewport-fit=cover`.
- Touch targets must be at least 44×44px.
- Inputs use a font size of at least 16px so iOS doesn't zoom.
- No horizontal scroll, ever.
- Put primary actions within thumb reach, in the bottom half of the screen.
- Handle the on-screen keyboard so inputs aren't hidden behind it.

## PWA

- Manifest: name, short_name, icons (192, 512, maskable), `display: standalone`, theme and background colors.
- iOS: `apple-touch-icon`, status bar meta, and splash screens.
- Service worker: precache the app shell. Use network-first for data and cache-first for static assets.
- Offline: show a friendly offline state and never a blank screen.
- Update flow: when a new version is available, prompt the user to refresh.
- Add-to-home-screen prompt: Android uses `beforeinstallprompt`. iOS gets manual instructions.

## Code quality

- TypeScript strict mode, and no `any` unless justified.
- Write small components, one job each.
- Design tokens (colors, spacing, radius, type) live in one place, and hard-coded values are not allowed.
- Use semantic HTML. Add aria labels on icon buttons and a visible focus state.
- Color contrast meets WCAG AA.
- Keep state local first. Only add global state when it's needed.
- Handle loading, empty and error states on every screen.
- No console errors or warnings when shipping.

## Git and deploy

- `main` is always deployable.
- Put features on branches, which get Vercel preview URLs.
- Write short, clear commit messages.
- Don't commit secrets. Use `.env` with Vercel env vars.
