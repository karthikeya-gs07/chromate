# Design

## Figma workflow

- The user shares Figma links through the Figma MCP.
- For each link:
  1. Read the design and match it closely: spacing, type, color, radius.
  2. Pull tokens from Figma variables into the shared token file.
  3. Reuse existing components before making new ones.
  4. Ask about anything that is missing, such as states, edge cases or behavior on small screens.
- If a design is made for one phone size, adapt it fluidly to 320–480px.

## Figma frame setup

- Main frame: **393×852** (iPhone 16 / 15 Pro), at 1x.
- Check frames: 360×800 (Android) and 320×568 (small phones), for key screens only.
- Safe areas: status bar 59px at the top and home indicator 34px at the bottom. Mark them, but don't put content under them.
- Use auto layout everywhere and an 8pt grid, with 4pt allowed for small gaps.
- Keep 16px side margins, and touch targets at least 44×44.
- Put colors, type, spacing and radius in Figma variables and styles.
- Name layers and components clearly.
- Put icons in SVG components. Export images at 2x or 3x.

## Look and feel

- Aim for a beautiful, polished, native-app feel.
- Smooth, subtle motion, with no janky transitions.
- Details to be filled in once the user shares the brand and designs.

## Tokens

To be defined from Figma, for example colors, type scale, spacing, radius, shadows and motion.
