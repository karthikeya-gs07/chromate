# Chromate

Mobile-first Progressive Web App (PWA). Phone only for now, not tablet or desktop yet. Runs on iOS Safari and Android Chrome, and can be installed to the home screen.

Also read before any work:
- `RULES.md`: coding, performance and responsive rules
- `DESIGN.md`: design and Figma workflow

## What the app does

A personal tool for Karthikeya to make Instagram stories from their own photos.

**Flow:** Landing → Story → **Templates** → the template's editor → **Buffer** → Save all

1. **Landing:** choose Story (1080×1920) or Post. Post is on hold and shows a "Posts are coming soon" message.
2. **Templates page:** the story templates. Each is listed in `STORY_TEMPLATES` in `src/lib/templates.ts`.
   - **Batch** (first): pick up to 10 photos and see them in a 2×N grid. Tap a tile to open it full screen. Each tile has ✕ to delete, and the grid has **Add to buffer** and **Download all**.
   - **Photo + text**: an empty template. Tap the gray box to pick a photo, then:
     - choose single or double text, and type straight into the template
     - drag and pinch the photo, or double-tap to reset it
     - use the ↻ corner button to change the photo
     - tap **Download** or **Add to buffer**
   - After **Add to buffer**, the editor stays open, so you can swap the photo and add another story.
3. **Buffer:** a cart of finished stories, at most 10. The panel slides in from the left, and the button for it is at the top right of every screen.
   - Tap a story to re-open it ("Update buffer").
   - Tap ✕ to delete it.
   - **Save all** saves every story at once, then empties the buffer.
   - It's stored in the app's private IndexedDB, only for the session. It's never sent anywhere, survives iOS killing the app in the background, is deleted after Save all, and expires after 12h.
4. **Coming later:** templates with several photo boxes (gray boxes = photo slots). The user gives the specs for each template.

**Rules:**
- **Font:** Nohemi (the user provides the files).
- **No server:** no accounts, no backend. Everything runs on the phone, and only the buffer is kept temporarily, in the app's IndexedDB.
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

## Pushing and deploying

- **Never `git push` or deploy unless the user asks in that message.** A push to `main` goes live on Vercel automatically.
- Committing locally is fine. When work is ready, say "Ready to push" and wait.

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
- [x] Live at https://chromate-five.vercel.app, from the private repo github.com/karthikeya-gs07/chromate
- [x] Vercel auto-deploy from GitHub. Pushing to `main` deploys to production.
- [x] Figma MCP connected
- [x] Landing screen from Figma, node 1:2
- [x] Grid screen from Figma, node 1:2131, with Add more
- [x] Story template from Figma, node 1:9542, lives in `src/lib/templates.ts`
- [ ] Post template, on hold for v1. The Post card shows a "Posts are coming soon" message.
- [x] Delete (✕ on each tile). No reorder, by decision.
- [x] Expanded view from Figma, node 1:5852: single/double toggle, typing straight into the text area with zoom
- [ ] Swipe between photos in the expanded view
- [x] Templates page, single-photo editor and buffer side panel (branch `templates-and-buffer`)
- [x] Double layout from Figma, node 1:9537

Dev server: `npx vite --port 5173 --host`
