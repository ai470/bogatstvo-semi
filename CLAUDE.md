# CLAUDE.md

This project keeps its full guidance in **[AGENTS.md](./AGENTS.md)** so there is
a single source of truth for every AI tool. Read it before editing.

@AGENTS.md

## Quick reminders for Claude Code

- **Static site, no tooling.** No build/test/lint — preview by opening
  `index.html` or serving the folder. Don't look for `package.json`.
- **Scaled layout.** Sections are authored at a fixed `1600px` width and scaled
  by JS. If you change a section's height, update **both** the `.sN { height }`
  in `styles.css` and the matching `SN_H` constant in the inline `<script>`.
- **Two layouts per section.** Desktop (absolute `.sN__*`) and mobile
  (`.m-sN-*` inside `@media (max-width: 767px)`). Edits usually touch both.
- **Shared behavior lists.** New animated elements go in the reveal selector
  array (JS); new interactive elements go in the hover/active/focus/transition
  lists (end of `styles.css`).
- **Encoding.** Preserve UTF-8 (no BOM) + CRLF line endings; emit `\r\n` in
  programmatic edits to avoid whole-file diffs.
