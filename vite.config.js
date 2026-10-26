import { defineConfig } from "vite";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

// Saved VMs only restore on the image they were saved from, so the build records which image it ships.
let imageId = "none";
try { imageId = createHash("sha256").update(readFileSync("public/alpine/fs.json")).digest("hex").slice(0, 16); } catch { /* no image built yet */ }

// Lists what the service worker downloads on install, so the app works offline after one visit.
// The Linux image (40 MB) and Spot's engine are cached the first time they're used instead.
function precacheList() {
  const skip = /^(alpine|vendor\/wllama|precache\.json|sw\.js)/;
  return {
    name: "precache-list",
    writeBundle({ dir }) {
      const files = readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter(f => f.isFile())
        .map(f => relative(dir, join(f.parentPath, f.name)).split("\\").join("/"))
        .filter(f => !skip.test(f) && !f.endsWith(".map"));
      writeFileSync(join(dir, "precache.json"), JSON.stringify(files));
    },
  };
}

// Relative base so the same build works on GitHub Pages (/edu-code-camp/) and from start.command (/).
export default defineConfig({
  base: "./",
  plugins: [precacheList()],
  define: { __IMAGE_ID__: JSON.stringify(imageId) },
  server: { port: 5281, strictPort: true },
  preview: { port: 5281, strictPort: true },
  worker: { format: "es" },
  build: { target: "es2022", chunkSizeWarningLimit: 1200 },
});
