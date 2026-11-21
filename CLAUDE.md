# CLAUDE.md

Context for continuing work on this project in a new session.

## What this is

"史鉴 · 历史人物原型测试" — a personality quiz that matches the user with a figure from Chinese history.
It is a ground-up rewrite of someone else's single-file quiz page; all content (figures, bios, questions,
dimension texts) was written fresh for this project. Do not copy content back from the original page.

- Live site: https://yummy-sunny.github.io/figure-atlas/ (GitHub Pages, serves `docs/index.html` from `main`)
- Repo: https://github.com/yummy-sunny/figure-atlas (public)
- Stack: Vite + vanilla TypeScript, no framework, no runtime dependencies. Vitest for tests.

## Layout

- `src/data/` — `dimensions.ts` (8 dims + per-dim archetype texts), `figures.ts` (44 figures, each with its own 8-dim `vec`), `questions.ts` (32 questions, 24 drawn per run)
- `src/engine/` — pure logic, no DOM: `quiz.ts` (draw + shuffle, avoids recently seen via localStorage), `scoring.ts`, `matching.ts` (Pearson correlation on profile shape), `profile.ts` (report), `share.ts` (`?r=` result code)
- `src/ui/` — tiny hyperscript `h()` helper, screens, SVG radar; `src/export/` — canvas poster + save/share
- `scripts/build-single.mjs` — builds ONE self-contained HTML (inline CSS, classic IIFE script) to `历史人物测试.html` and `docs/index.html`

## Commands

```bash
npm run dev          # dev server
npm test             # engine tests (must stay green)
npm run typecheck
npm run build:html   # regenerate the single HTML + docs/ for Pages
```

To update the live site: `npm run build:html`, then commit and push `main`. Pages redeploys in ~1–2 minutes.

## Decisions and constraints

- **Every figure must be reachable.** The original page shared one vector per archetype, so most figures could never win. `tests/engine.test.ts` checks that each figure is the top match for its own vector and that a 6000-run simulation reaches ≥80% of each pool with no figure above 20%. When adding or editing figures, give each a distinct vector and re-run tests.
- Keep male and female figure counts equal (test asserts 22/22; update the test if the total changes).
- Content standard (the user asked for the voice of a history teacher with 30 years' experience): bios state only well-attested facts; legendary/literary figures get `legendary: true`; figures are pre-Qing only (intro text says “先秦到明末”).
- `says` lines are invented and labelled “可能会对你说” — never present them as real quotations.
- Options do not reveal their dimension, and option order is shuffled every time.
- The single HTML must keep working when opened via `file://` (double-click on PC, phone file manager): no module scripts, no external assets. `main.ts` hides the share-link button and skips `history.replaceState` under `file:`.
- No access gate / paywall SDK — the user explicitly dropped it.

## Environment notes

- Windows; `python` on PATH is the Microsoft Store stub and does nothing — use Node for scripts.
- GitHub CLI is logged in as `yummy-sunny`.
- The user wants replies in Simplified Chinese (see their global CLAUDE.md); code, comments and commit messages stay English.
