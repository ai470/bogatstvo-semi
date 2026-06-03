# AGENTS.md

Guide for AI assistants working in this repo. Read this first — it explains the
non-obvious architecture so you don't have to re-derive it.

## What this is

A **single-page marketing landing** for the event "Богатство Семьи — Форум"
(Family Wealth Forum). UI text is **Russian**.

**Pure static site — no framework, no build step, no package manager.**
There is no `package.json`, no `node_modules`, no bundler, no tests, no lint.
The entire site is three things:

| Path          | What it is                                                        |
|---------------|-------------------------------------------------------------------|
| `index.html`  | All markup + two inline `<script>` blocks (Metrika; layout/JS).   |
| `styles.css`  | All styles (~3300 lines, one file).                               |
| `assets/`     | Images/SVGs, named by section (`sN-*`). Plus root `*.pdf` (legal).|

To preview: open `index.html` in a browser, or serve the folder statically
(`python -m http.server`). Node.js is available on the machine for ad-hoc
scripts, but the project itself has zero JS dependencies.

## The core architecture: "scale-to-fit" desktop

This is the single most important thing to understand before editing layout.

The page is a vertical stack of sections: `hero`, then `s2` … `s11`, then
`footer`. **Every numbered section is authored at a fixed design width of
`1600px`** with its children **absolutely positioned at pixel coordinates**
(pixel-exact from a Figma comp). The design is then scaled to the viewport.

Markup pattern for each section:

```html
<div class="sN-viewport">          <!-- sets the scaled height; clips overflow -->
  <section class="sN"> … </section> <!-- fixed 1600px-wide canvas, transform:scale() -->
</div>
```

The inline `<script>` at the bottom of `index.html` does the scaling:

- `scaleAll()` / `scaleSections(scale)` set
  `.sN { transform: scale(vw / 1600) }` and
  `.sN-viewport { height: designHeight * scale }`. Runs on load and `resize`.
- Per-section design heights live as JS consts **`S2_H` … `S11_H`** (plus
  `HERO_W = 1600`, `HERO_H = 792`), and a `sections` array maps
  `['.sN', '.sN-viewport', SN_H]`.
- The hero is special: scaled by `max(vw/1600, vh/792)` and absolutely centered
  (cover behavior), not by width alone.

> ⚠️ **`SN_H` (JS) must equal the `height:` in that section's `.sN { }` CSS rule.**
> They are two copies of the same number. If you resize a section vertically,
> change **both** or the layout breaks (gap or clipping).

## Mobile (`@media (max-width: 767px)`)

Mobile does **not** scale. A media block in `styles.css` overrides the desktop
canvas: `transform: none !important; height: auto !important; position:
relative`, switching sections to real document flow (flex columns) with real
`px` font sizes.

Consequently, several sections ship **two parallel layouts**:

- Desktop: absolutely-positioned `.sN__*` elements.
- Mobile: a separate block of `.m-sN-*` elements (e.g. `.m-s11-card`).
- Desktop CSS hides the `.m-*` block; the mobile media block hides the desktop
  elements.

**Editing visible content often means changing it in both places.** Check for a
matching `.m-sN-*` block before assuming one edit is enough.

## Conventions

- **CSS naming:** BEM-ish. `.sN__element`, modifiers `.sN__element--variant`.
  Mobile-only variants are prefixed `.m-sN-*`. The hero uses unprefixed names
  (`.hero`, `.badge`, `.cta-btn`, `.tagline`, …).
- **Assets:** named by section — `assets/sN-<purpose>.{png,svg,jpg}`
  (e.g. `s11-bg.png`, `s9-photo-dmitry.jpg`). Many images ship both `.png` and
  `.svg`.
- **Encoding:** UTF-8 **without BOM**, **CRLF** line endings (`index.html` is
  pure CRLF; `styles.css` is mostly CRLF with a few lone LFs). Content is
  Cyrillic. **Preserve encoding and line endings when editing** — large
  programmatic edits should emit `\r\n`, or git will show whole-file churn.
- **Git:** branch `master`; conventional commit messages (`feat:`, `fix:`).

## Animation & interaction (centralized — easy to miss)

- **Scroll reveal:** `initRevealMotion()` in the inline script fades elements in
  on scroll via `IntersectionObserver` (adds `.reveal`, then `.is-visible`,
  then cleans up). It is driven by **one big hardcoded selector array**. A new
  element will **not** animate unless you add its selector to that array.
- **Motion tokens** in `:root`: `--motion-ease`, `--motion-fast` (180ms),
  `--motion-medium` (560ms), `--motion-hover` (260ms).
- **Hover / active / focus-visible** are *not* defined per-component. They live
  in large shared selector lists near the end of `styles.css`: a `:not(.reveal)`
  transition list, a `@media (hover: hover)` hover-lift list, an `:active`
  press list, and a `:focus-visible` outline list. **Append new interactive
  elements to these lists** to inherit consistent behavior.

## Design tokens

- **Fonts** (Google Fonts, loaded in `<head>`): **Playfair Display** (serif
  headings, e.g. `.s11__title`), **Manrope** (UI / buttons / labels),
  **Inter** (body copy).
- **Colors:**
  - Green accent (titles): `#378755`, `#1e8856`
  - Primary "book" button: navy gradient `linear-gradient(157deg,#172545,#2e416b,#172646)` + `1px solid white` border
  - Gold button: `linear-gradient(251deg,#ffe2ac,#fff1d8,#ffe2ac)`, text `#4f411b`
  - Navy text: `#2b406d`
- **Buttons:** pill-shaped (`border-radius: 999px`), uppercase, Manrope 700.

## Integrations

- **Yandex.Metrika** (counter `109448035`) — inline in `<head>`.
- **GetCourse pre-registration widget** — the S11 section's tariff cards were
  replaced by a single CTA that opens a GetCourse form. Implementation lives at
  the bottom of `index.html` (markup `<div class="prereg">` + a dedicated
  `<script>`) and the `.prereg*` styles at the end of `styles.css`:
  - Opens a **full-frame overlay** (`.prereg`, `position: fixed; inset: 0`),
    not a modal — fixes desktop height clipping. Scrollable; fixed close cross;
    `Escape` to close; background scroll locked while open.
  - The iframe (`https://fincontour.ru/pl/lite/widget/widget?id=1613589`) is
    **preloaded** on page load so the CTA opens instantly.
  - Triggered by **any element with `[data-prereg-open]`** (currently the S11
    button). Add the attribute to wire up more CTAs.
  - `withTracking(baseSrc)` forwards `utm_*` and `ref` from the **current page
    URL** into the iframe src (names lowercased; the widget's own `id` is never
    overwritten) — replicating what GetCourse's native loader does.
  - Iframe height is synced from GetCourse `postMessage`
    (`{ uniqName: '92d40…', height }`) so there's no white tail / clipping.

## Recipes (common edits)

- **Resize a section's height:** edit `.sN { height }` in `styles.css` **and**
  `SN_H` in the inline JS — keep them equal.
- **Move/restyle desktop content:** edit the absolute coords in the `.sN__*`
  rules (1600px coordinate space).
- **…and don't forget mobile:** apply the matching change in the
  `@media (max-width: 767px)` block (often a `.m-sN-*` rule).
- **Add an animated/interactive element:** add its selector to the reveal array
  (JS) and to the transition / hover / active / focus-visible lists (CSS).
- **Always** keep UTF-8 (no BOM) + CRLF.
