#!/usr/bin/env node
/**
 * sync-translations.js
 *
 * Reads `nl` frontmatter from each EN source index.mdx and writes the
 * corresponding NL i18n files so Docusaurus can serve them.
 *
 * EN source field layout (managed via PagesCMS):
 *   nl_title: "..."
 *   nl_summary: "..."   (index pages only)
 *   nl_body: |
 *     # NL content
 *
 * Run automatically before `build` and `start` via package.json scripts.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');

// Map of { enDir, i18nDir, type } for each product plugin
const PLUGINS = [
  {
    enDir: path.join(ROOT, 'content', 'apps'),
    i18nDir: path.join(ROOT, 'i18n', 'nl', 'docusaurus-plugin-content-docs-apps', 'current'),
  },
  {
    enDir: path.join(ROOT, 'content', 'themes'),
    i18nDir: path.join(ROOT, 'i18n', 'nl', 'docusaurus-plugin-content-docs-themes', 'current'),
  },
];

let synced = 0;
let skipped = 0;

/**
 * Recursively collect all .mdx files under `dir`.
 * Returns an array of paths relative to `dir`.
 */
function walkMdx(dir, base = '') {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...walkMdx(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.mdx')) {
      results.push(rel);
    }
  }
  return results;
}

/**
 * Write a single NL file from flat `nl_title` / `nl_summary` / `nl_body`
 * frontmatter keys on the EN source file.
 * @param {object}  fm       - Full frontmatter of the EN source file
 * @param {string}  nlFile   - Absolute path to write the NL output file
 * @param {boolean} isIndex  - Whether this is a product index (includes summary)
 */
function syncFile(fm, nlFile, isIndex) {
  if (!fm.nl_title && !fm.nl_body) {
    skipped++;
    return;
  }

  const nlFm = { title: fm.nl_title || fm.title };
  if (fm.sidebar_position !== undefined) nlFm.sidebar_position = fm.sidebar_position;
  if (isIndex && fm.nl_summary) nlFm.summary = fm.nl_summary;
  if (Array.isArray(fm.embeds) && fm.embeds.length > 0) nlFm.embeds = fm.embeds;

  const nlBody = fm.nl_body || '';
  fs.writeFileSync(nlFile, matter.stringify(nlBody, nlFm), 'utf8');
  console.log(`  synced → ${path.relative(ROOT, nlFile)}`);
  synced++;
}

for (const { enDir, i18nDir } of PLUGINS) {
  if (!fs.existsSync(enDir)) continue;

  const products = fs.readdirSync(enDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const product of products) {
    const productEnDir = path.join(enDir, product);
    const productNlDir = path.join(i18nDir, product);

    const mdxFiles = walkMdx(productEnDir);

    for (const relPath of mdxFiles) {
      const enFile = path.join(productEnDir, relPath);
      const { data: fm } = matter.read(enFile);

      if (!fm.nl_title && !fm.nl_body) { skipped++; continue; }

      const nlFile = path.join(productNlDir, relPath);
      fs.mkdirSync(path.dirname(nlFile), { recursive: true });
      syncFile(fm, nlFile, path.basename(relPath) === 'index.mdx');
    }
  }
}

console.log(`\nsync-translations: ${synced} file(s) written, ${skipped} skipped (no nl field).`);
