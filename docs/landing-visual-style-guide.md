# Landing Visual Style Guide

How to reproduce the visual system of the "Богатство Семьи — Форум" landing in
another project. Rules are extracted from `styles.css` / `index.html`.

## 1. Visual direction

- **Mood:** premium, editorial, "wealth" feel — deep dark hero opening into
  bright, airy content sections.
- **Layout:** pixel-precise, magazine-like composition (authored at a fixed
  `1600px` canvas, then scaled to viewport). Generous whitespace; one focal
  idea per section.
- **Detail level:** minimal text, high polish. Depth is built with **layered
  glows, blurred orbs, soft radial light, and frosted-glass cards** rather than
  hard lines.
- **Hierarchy:** large serif display headings → medium sans subtitles → small
  uppercase labels/badges. Color and gold accents mark the most important CTAs.
- **Depth toolkit:** blurred glow orbs (`filter: blur()`), radial light
  ellipses, `backdrop-filter` glass, large soft drop shadows, low-opacity
  overlay layers.

## 2. Color palette

| Role | HEX | Notes |
|------|-----|-------|
| Page background (root) | `#010c06` | near-black green |
| Hero base | gradient `#378755 → #41311e` | green→brown |
| Section background | `#fff` / `#fffcf5` | bright sections |
| Primary text (light bg) | `#000` | body on white |
| Text on dark | `#fff`, `rgba(255,255,255,0.6)` | muted = 60% white |
| Green accent | `#378755`, `#1e8856`, `#378255` | titles, ticks |
| Navy text / CTA | `#2b406d`, `#172545`, `#2e416b` | book button |
| Gold accent | `#ffe2ac`, `#ffdb9f`, `#faaf32`, `#f69a00` | highlights, glow |
| Warm brown text | `#6b4300`, `#c87d01` | gold-on-dark text |
| Border (light) | `rgba(255,255,255,0.9)` / `#f69a00` | button outlines |
| Border (subtle) | `rgba(255,255,255,0.06–0.2)` | glass edges |
| Muted surface | `rgba(255,255,255,0.55)` | translucent cards |

## 3. Gradients

```css
/* Hero base (green → brown, horizontal) */
background: linear-gradient(to right, #378755, #41311e);

/* Dark edge overlay (fades content into the dark) */
background: linear-gradient(to right, #010c06 28%, rgba(0,0,0,0));

/* Primary "book" button — navy */
background: linear-gradient(157deg, #172545, #2e416b, #172646);

/* Gold button */
background: linear-gradient(to right, #ffdb9f, #faaf32);   /* or */
background: linear-gradient(251deg, #ffe2ac, #fff1d8, #ffe2ac);

/* Green pill / chip */
background: linear-gradient(to right, #378755, #2f2f48);

/* Gradient text (clip to text) */
background-image: linear-gradient(to right, #ffe2ac, #fff2d9);
-webkit-background-clip: text; background-clip: text;
-webkit-text-fill-color: transparent;

/* Glow orb */
background: #ffe2ac; border-radius: 50%; filter: blur(60.75px);

/* Soft radial light ellipse */
background: radial-gradient(ellipse at center,
  rgba(255,255,255,0.3) 0%, transparent 70%);

/* White section fade (top/bottom) */
background: linear-gradient(to bottom, #fff 0%, #fff 45%, transparent 100%);
```

Tailwind equivalents: `bg-gradient-to-r from-[#378755] to-[#41311e]`,
`bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3),transparent_70%)]`,
`bg-clip-text text-transparent`.

## 4. Typography

Loaded from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;800&family=Manrope:wght@400;600&family=Playfair+Display:wght@500;700&display=swap" rel="stylesheet">
```

- **Display / headings:** `'Playfair Display', serif` — weights 500/700,
  `line-height: 1.2`, often `text-transform: uppercase` for section titles;
  sizes ~31–44px.
- **UI / buttons / labels:** `'Manrope', sans-serif` — 600/700, uppercase,
  `letter-spacing: 0.3–0.8px`.
- **Body copy:** `'Inter', sans-serif` — 400/500/600/800; sizes 14–22px;
  `line-height: 1.351` for paragraphs.
- **Button text:** Manrope/Inter, 700/800, uppercase, small letter-spacing.
- **Fallbacks:** generic `serif` (Playfair) and `sans-serif` (Manrope/Inter).

## 5. Layout and spacing

- **Design canvas:** every section authored at fixed **`1600px`** width with
  children absolutely positioned, then JS scales the whole section by
  `viewportWidth / 1600` (hero uses cover-scale `max(vw/1600, vh/792)`).
- **Pattern per section:**
  ```html
  <div class="sN-viewport"><!-- scaled height, clips overflow -->
    <section class="sN">…</section><!-- 1600px canvas, transform: scale() -->
  </div>
  ```
- **Content widths:** body text blocks capped ~525–813px inside the canvas.
- **Responsive:** single breakpoint `@media (max-width: 767px)`. Mobile drops
  scaling (`transform: none; height: auto; position: relative`) and switches to
  **real flex-column flow** with px font sizes — i.e. two parallel layouts
  (desktop absolute `.sN__*`, mobile `.m-sN-*`).
- **Card spacing:** cards are large rounded panels with internal padding ~20–30px
  and clear vertical rhythm between stacked items.

> To port to a normal responsive app, treat the `1600px` coordinates as a
> max-width container and convert absolute positions to fl/grid layout.

## 6. Component styles

- **Buttons (pill):** `border-radius: 999px`, uppercase Manrope 700, navy or
  gold gradient, `1–1.5px` light border, soft drop shadow, hover lift.
  ```css
  .btn {
    border-radius: 999px; padding: 0 36px; color: #fff;
    background: linear-gradient(157deg,#172545,#2e416b,#172646);
    border: 1.5px solid rgba(255,255,255,0.9);
    box-shadow: 0 18px 48px rgba(23,37,69,0.32);
    text-transform: uppercase; font: 700 22px 'Manrope', sans-serif;
  }
  ```
- **Cards:** white or translucent surface, large radius (`16–36px`), often
  `backdrop-filter: blur(17–42px)` for glass, thin light border.
- **Badges / chips:** pill (`border-radius: 999px`), translucent gold fill
  `linear-gradient(135deg, rgba(255,226,172,.18), rgba(255,204,100,.06))`,
  `inset 0 0 0 1px rgba(255,255,255,.06)`, small uppercase Inter/Manrope text.
- **Navigation:** none — single-page scroll; CTAs smooth-scroll to the
  pre-registration block.
- **Hero:** full-viewport, dark green→brown gradient, layered glow orbs +
  blurred texture overlay + dark edge gradient; centered logo, tagline, gold CTA
  and speaker glass cards.
- **CTA / form block:** primary CTA opens a **centered modal** overlay
  (`position: fixed; inset: 0`, dimmed backdrop `rgba(13,18,33,0.55)`, flex
  center) holding a capped box (`max-width: 560px; max-height: 90vh;
  border-radius: 18px`) with a corner close button.

## 7. Shadows, borders, blur

- **Border radius scale:** `14–19px` (small cards/icons) → `22–23px` (panels) →
  `36px` (feature cards) → `999px` (pills/badges).
- **Shadows (soft, large-spread, low-opacity):**
  - elevated button: `0 18px 48px rgba(23,37,69,0.32)`
  - small button: `0 12px 28px rgba(23,37,69,0.28)`
  - modal: `0 30px 90px rgba(13,18,33,0.45)`
  - badge inset edge: `inset 0 0 0 1px rgba(255,255,255,0.06), 0 12px 30px rgba(0,0,0,0.2)`
  - gold halo: `0 0 14px rgba(255,204,100,0.55)`
- **Backdrop blur (glass):** `backdrop-filter: blur(17.6px)` … `blur(41.926px)`.
- **Opacity layers:** background textures `opacity: 0.45` + `mix-blend-mode:
  overlay`; decorative ellipses `0.2–0.6`.
- **Glow effects:** absolutely-positioned circle, solid warm fill (`#ffe2ac`),
  `filter: blur(40–61px)`, `pointer-events: none`.

## 8. Implementation notes

- **Motion tokens** (`:root`): `--motion-ease: cubic-bezier(0.22,1,0.36,1)`,
  `--motion-fast: 180ms`, `--motion-medium: 560ms`, `--motion-hover: 260ms`.
- **Scroll reveal:** elements start `opacity:0; translate:0 16px`, gain
  `.is-visible` (`opacity:1; translate:0 0`) via `IntersectionObserver`.
- **Hover:** lift with `translate: 0 -2px; scale: 1.015`; active `scale: 0.995`;
  focus-visible `outline: 2px solid rgba(255,226,172,0.75)`.
- **Tailwind mapping:**
  - pills → `rounded-full`; panels → `rounded-[22px]`/`rounded-[36px]`
  - glass → `backdrop-blur-lg bg-white/55 border border-white/20`
  - glow → an absolutely-positioned `blur-3xl` circle with a warm bg color
  - gradient text → `bg-clip-text text-transparent bg-gradient-to-r`
  - ease → `ease-[cubic-bezier(0.22,1,0.36,1)]`, durations `duration-200/500`
- **Decorative layers** must be `pointer-events: none` so full-size glow/overlay
  divs don't block clicks on buttons beneath them.
- **Fonts:** Playfair Display (headings) / Manrope (UI) / Inter (body) — keep
  the same role split for a faithful look.
