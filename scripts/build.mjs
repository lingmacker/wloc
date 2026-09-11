import { build } from "esbuild";
import { fileURLToPath } from "node:url";

await build({
  absWorkingDir: fileURLToPath(new URL("..", import.meta.url)),
  entryPoints: ["src/wloc.js", "src/wloc-settings.js"],
  outdir: "dist",
  bundle: true,
  format: "iife",
  platform: "neutral",
  target: "es2022",
  external: ["fs", "path"],
  minify: true,
  legalComments: "inline",
  banner: {
    js: "/* Generated from src/ by npm run build. License: AGPL-3.0. */",
  },
  logLevel: "info",
});
