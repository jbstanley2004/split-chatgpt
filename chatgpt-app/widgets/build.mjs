import { build, context } from "esbuild";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const widgets = [
  "auth-widget",
  "business-info-widget",
  "owner-info-widget",
  "business-address-widget",
  "bank-account-widget",
  "processing-details-widget",
  "confirmation-widget",
];

const distDir = join(__dirname, "dist");
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

async function buildWidgets() {
  for (const widget of widgets) {
    const result = await build({
      entryPoints: [join(__dirname, `src/${widget}.tsx`)],
      bundle: true,
      format: "esm",
      minify: true,
      write: false,
      jsx: "automatic",
      loader: { ".tsx": "tsx", ".ts": "ts" },
    });

    const js = result.outputFiles[0].text;
    
    // Get the widget name without -widget suffix
    const widgetName = widget.replace("-widget", "");
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">${js}</script>
</body>
</html>`;

    writeFileSync(join(distDir, `${widgetName}.html`), html);
    console.log(`Built ${widgetName}.html`);
  }
}

const isWatch = process.argv.includes("--watch");

if (isWatch) {
  console.log("Watching for changes...");
  // For watch mode, rebuild on file changes
  const ctx = await context({
    entryPoints: widgets.map((w) => join(__dirname, `src/${w}.tsx`)),
    bundle: true,
    format: "esm",
    outdir: distDir,
    jsx: "automatic",
    loader: { ".tsx": "tsx", ".ts": "ts" },
  });
  await ctx.watch();
} else {
  await buildWidgets();
  console.log("Build complete!");
}
