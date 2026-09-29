# Chromate

Mobile-first Progressive Web App (PWA). Phone only for now, not tablet or desktop yet. Runs on iOS Safari and Android Chrome, and can be installed to the home screen.

Also read before any work:
- `RULES.md`: coding, performance and responsive rules
- `DESIGN.md`: design and Figma workflow

## What the app does

A personal tool for Karthikeya to make Instagram stories and posts from their own photos.

1. **Choose a format:** Story (1080×1920) or Post (1080×1350).
2. **Choose a template:** the template page. There's 1 template for now, and it's built so more can be added later.
3. **Pick photos:** open the phone gallery, select up to 10 photos, then tap Update.
4. **Place the photos:** each photo fills the template's gray box, and the part outside the box is cropped.
5. **Browse the grid:** a scrollable 2×N grid. You can:
   - drag a photo inside its gray box, and pinch to zoom it
   - reorder the tiles
   - delete a tile
6. **Expand one:** tap a tile for the full view. From there you can:
   - swipe left and right between photos
   - adjust the photo (drag and zoom)
   - add text that's unique to each image, styled by the template in Figma
7. **Download all:** save every image to Photos, using the Share sheet on iOS.

**Rules:**
- **Font:** Nohemi (the user provides the files).
- **No storage:** no saving, no users, no backend. Everything runs on the phone.
- **Leave warning:** warn before you leave or refresh if there's work that hasn't been downloaded.
- **Templates are data:** so new ones can be added without rewriting the app.

## How we talk

- Keep answers short, clear and crisp. Use simple language.
- No long explanations unless asked.
- Use bullet points over paragraphs.
- Only ask what's necessary.

## How we work (every request)

1. **Read first.** Go through everything the user shares (text, Figma, files) in detail before doing anything.
2. **Ask, then build.** Before executing, reply with a short list of:
   - Questions: only what's unclear or blocking
   - Suggestions: improvements to the request, if any
3. **Wait** for the user's answers, then execute.
4. **Verify.** Check the result in the browser at phone sizes before saying it's done.
5. **Report briefly.** Say what changed, in 2–4 lines.

Skip step 2 only for tiny, unambiguous changes (typo, color tweak).

## Stack and hosting

- Repo: Git on GitHub
- Hosting: Vercel (auto-deploy from `main`, preview deploys for branches)
- App stack: see `RULES.md`

## Models and dependencies

When the user describes a feature that needs an extra library or model, list what to install and why before installing it. Keep the bundle small.

## Project status

- [x] Project brief from the user
- [x] Stack set up: React, Vite, TypeScript, Tailwind v4, vite-plugin-pwa
- [x] Phone-only gate, with QR code and Copy link
- [x] Nohemi font in `public/fonts`
- [x] Local Git repo
- [ ] GitHub repo and Vercel deploy
- [x] Figma MCP connected
- [x] Landing screen from Figma, node 1:2

Dev server: `npx vite --port 5173 --host`
