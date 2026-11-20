# 史鉴 · 历史人物原型测试

A personality quiz that matches you with a figure from Chinese history (Shang dynasty to late Ming), based on 24 scenario questions drawn from real historical episodes.

- `src/data` — dimensions, 44 figures (22 male / 22 female), 32 questions
- `src/engine` — question picking, scoring, profile matching (Pearson correlation), share codes
- `src/ui`, `src/export` — DOM rendering and the downloadable result poster

## Commands

```bash
npm install
npm run dev          # local dev server
npm test             # engine tests
npm run build:html   # single self-contained HTML -> 历史人物测试.html and docs/index.html
```

`docs/index.html` is what GitHub Pages serves.
