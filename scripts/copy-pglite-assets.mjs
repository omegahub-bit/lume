import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const assetNames = ["pglite.data", "pglite.wasm", "initdb.wasm"];
const assetDir = join(root, "node_modules/@electric-sql/pglite/dist");

function walk(dir, hits) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const path = join(dir, ent.name);
    if (ent.isDirectory()) walk(path, hits);
    else if (ent.name.includes("pglite") && ent.name.endsWith(".mjs")) hits.add(dir);
  }
}

const hits = new Set();
walk(join(root, ".vercel/output"), hits);
if (hits.size === 0) {
  console.error("[pglite] bundled module not found under .vercel/output");
  process.exit(1);
}

for (const dir of hits) {
  for (const name of assetNames) {
    const src = join(assetDir, name);
    if (!existsSync(src)) {
      console.error("[pglite] missing", src);
      process.exit(1);
    }
    const dest = join(dir, name);
    copyFileSync(src, dest);
    console.log("[pglite]", dest, statSync(dest).size);
  }
}
