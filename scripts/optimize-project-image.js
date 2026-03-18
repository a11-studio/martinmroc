#!/usr/bin/env node
/**
 * Optimize project images to WebP quality 93 (sweet spot: ~200KB, good quality).
 * Usage: node scripts/optimize-project-image.js <source.jpg|png> [output.webp]
 * Example: node scripts/optimize-project-image.js realitiez-big.jpg public/images/projects/realitiez.webp
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const QUALITY = 93;
const EFFORT = 6;

const [src, dest] = process.argv.slice(2);
if (!src) {
  console.error("Usage: node scripts/optimize-project-image.js <source> [output.webp]");
  process.exit(1);
}

const srcPath = path.resolve(src);
const destPath = dest
  ? path.resolve(dest)
  : path.join(
      path.dirname(srcPath),
      path.basename(srcPath, path.extname(srcPath)) + ".webp"
    );

if (!fs.existsSync(srcPath)) {
  console.error("Source not found:", srcPath);
  process.exit(1);
}

sharp(srcPath)
  .webp({ quality: QUALITY, effort: EFFORT })
  .toFile(destPath)
  .then((info) => {
    const kb = Math.round(info.size / 1024);
    console.log(`Created ${destPath} (${kb} KB, quality ${QUALITY})`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
