import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "packed");
const repo = join(root, "..", "..");
const index = readFileSync(join(root, "index.tsv"), "utf8").trim().split("\n");
const groups = new Map();
for (const line of index) {
  const [dest, name] = line.split("\t");
  if (!groups.has(dest)) groups.set(dest, []);
  groups.get(dest).push(name);
}
for (const [dest, names] of groups) {
  names.sort();
  const b64 = names.map((n) => readFileSync(join(root, n), "utf8").trim()).join("");
  const out = join(repo, dest);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(b64, "base64"));
}
