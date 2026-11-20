// Build the whole app into ONE self-contained HTML file that works when
// double-clicked on a computer or opened from a phone's file manager (file://).
//
// - JS is bundled as a classic IIFE script (module scripts are blocked on file://
//   in many browsers) and placed at the end of <body>.
// - CSS is inlined into a <style> tag.
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, ".single-tmp");
const outFile = join(root, "历史人物测试.html");
// GitHub Pages serves the site from /docs on the main branch
const pagesDir = join(root, "docs");

await build({
  root,
  configFile: false,
  base: "./",
  logLevel: "warn",
  build: {
    outDir: tmp,
    emptyOutDir: true,
    target: "es2017",
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    modulePreload: false,
    rolldownOptions: {
      output: { format: "iife", entryFileNames: "app.js", assetFileNames: "[name][extname]" },
    },
  },
});

// Collect every emitted JS/CSS file, wherever Vite placed it
const assets = tmp;
const files = readdirSync(assets, { recursive: true }).map(String);
const js = files.filter((f) => f.endsWith(".js")).map((f) => readFileSync(join(assets, f), "utf8")).join("\n");
const css = files.filter((f) => f.endsWith(".css")).map((f) => readFileSync(join(assets, f), "utf8")).join("\n");
if (!js) throw new Error("No JS bundle produced");

// Prevent a stray "</script" inside string data from closing the tag early
const safeJs = js.replace(/<\/script/gi, "<\\/script");

let html = readFileSync(join(tmp, "index.html"), "utf8")
  .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>\s*/g, "")
  .replace(/<link[^>]*rel="stylesheet"[^>]*>\s*/g, "")
  .replace("</head>", () => `    <style>\n${css}\n    </style>\n  </head>`)
  .replace("</body>", () => `    <script>\n${safeJs}\n    </script>\n  </body>`);

if (/<script[^>]*\ssrc=/i.test(html) || /<link[^>]*rel="stylesheet"/i.test(html)) {
  throw new Error("External asset reference left in output");
}

writeFileSync(outFile, html, "utf8");
mkdirSync(pagesDir, { recursive: true });
writeFileSync(join(pagesDir, "index.html"), html, "utf8");
// Skip Jekyll processing on GitHub Pages; the page is already final HTML
writeFileSync(join(pagesDir, ".nojekyll"), "", "utf8");
rmSync(tmp, { recursive: true, force: true });
console.log(`Wrote ${outFile} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
