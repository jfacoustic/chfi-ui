#!/usr/bin/env node
// Copies the world-atlas TopoJSON into public/topo so the heat map can
// fetch it without bundling it into the JS chunk. Run once after install.

import { mkdirSync, copyFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const src = resolve(root, "node_modules/world-atlas/countries-110m.json");
const destDir = resolve(root, "public/topo");
const dest = resolve(destDir, "world-110m.json");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
const size = statSync(dest).size;
console.log(`Wrote ${dest} (${size} bytes)`);
