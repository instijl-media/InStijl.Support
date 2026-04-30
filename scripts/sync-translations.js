#!/usr/bin/env node
/**
 * sync-translations.js
 *
 * Reads `nl` frontmatter from each EN source index.mdx and writes the
 * corresponding NL i18n files so Docusaurus can serve them.
 *
 * EN source field layout (managed via PagesCMS):
 *   nl:
 *     title: "..."
 *     summary: "..."
 *     body: |
 *       # NL content
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

for (const { enDir, i18nDir } of PLUGINS) {
  if (!fs.existsSync(enDir)) continue;

  const products = fs.readdirSync(enDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const product of products) {
    const enFile = path.join(enDir, product, 'index.mdx');
    if (!fs.existsSync(enFile)) continue;

    const { data: fm, content: enContent } = matter.read(enFile);

    if (!fm.nl) {
      skipped++;
      continue;
    }

    const nl = fm.nl;
    const nlDir = path.join(i18nDir, product);
    const nlFile = path.join(nlDir, 'index.mdx');

    fs.mkdirSync(nlDir, { recursive: true });

    // Build NL frontmatter — inherit non-translatable keys from EN
    const nlFm = {
      title: nl.title || fm.title,
    };
    if (fm.sidebar_position !== undefined) nlFm.sidebar_position = fm.sidebar_position;
    if (nl.summary) nlFm.summary = nl.summary;

    const nlBody = nl.body || '';
    const nlFileContent = matter.stringify(nlBody, nlFm);

    fs.writeFileSync(nlFile, nlFileContent, 'utf8');
    console.log(`  synced → ${path.relative(ROOT, nlFile)}`);
    synced++;
  }
}

console.log(`\nsync-translations: ${synced} file(s) written, ${skipped} skipped (no nl field).`);
