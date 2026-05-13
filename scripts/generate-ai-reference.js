#!/usr/bin/env node
/**
 * generate-ai-reference.js
 *
 * Combines all .mdx files for each app / theme product into a single
 * markdown file for use as AI training / reference material.
 * Output goes to ai-reference/{apps,themes}/<slug>.md — not published.
 *
 * Run automatically after `docusaurus build` via the build script.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'ai-reference');

const PLUGINS = [
  {
    type: 'apps',
    enDir: path.join(ROOT, 'content', 'apps'),
    nlDir: path.join(ROOT, 'i18n', 'nl', 'docusaurus-plugin-content-docs-apps', 'current'),
  },
  {
    type: 'themes',
    enDir: path.join(ROOT, 'content', 'themes'),
    nlDir: path.join(ROOT, 'i18n', 'nl', 'docusaurus-plugin-content-docs-themes', 'current'),
  },
];

/**
 * Recursively collect all .mdx / .md files under `dir`.
 * Returns an array of { abs, rel } objects.
 */
function walkMdx(dir, base = '') {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...walkMdx(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      results.push({ abs: path.join(dir, entry.name), rel });
    }
  }
  return results;
}

/**
 * Strip MDX-specific syntax from content body.
 * Removes import/export statements and collapses excessive blank lines.
 */
function cleanMdx(content) {
  return content
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parse and sort .mdx files for a product directory.
 * index.mdx always comes first; remaining files sorted by sidebar_position.
 */
function parseProductFiles(dir) {
  return walkMdx(dir)
    .map(({ abs, rel }) => {
      const raw = fs.readFileSync(abs, 'utf8');
      const { data: fm, content } = matter(raw);
      return { rel, fm, content };
    })
    .sort((a, b) => {
      const aIdx = path.basename(a.rel) === 'index.mdx';
      const bIdx = path.basename(b.rel) === 'index.mdx';
      if (aIdx && !bIdx) return -1;
      if (!aIdx && bIdx) return 1;
      return (a.fm.sidebar_position ?? 999) - (b.fm.sidebar_position ?? 999);
    });
}

/**
 * Render all files for one language as a section.
 */
function renderLangSection(files, langLabel) {
  const parts = [`## ${langLabel}\n`];

  for (const { rel, fm, content } of files) {
    const title = fm.title || rel;
    const cleaned = cleanMdx(content);
    if (cleaned) {
      parts.push(`### ${title}\n\n${cleaned}`);
    }
  }

  return parts.join('\n\n');
}

// ── Main ────────────────────────────────────────────────────────────────────

let generated = 0;

for (const { type, enDir, nlDir } of PLUGINS) {
  if (!fs.existsSync(enDir)) continue;

  const outDir = path.join(OUTPUT_DIR, type);
  fs.mkdirSync(outDir, { recursive: true });

  const products = fs.readdirSync(enDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const slug of products) {
    const productEnDir = path.join(enDir, slug);
    const productNlDir = path.join(nlDir, slug);

    const enFiles = parseProductFiles(productEnDir);
    const productTitle =
      enFiles.find(f => path.basename(f.rel) === 'index.mdx')?.fm.title || slug;

    const sections = [`# ${productTitle}\n`];
    sections.push(renderLangSection(enFiles, 'English'));

    if (fs.existsSync(productNlDir)) {
      const nlFiles = parseProductFiles(productNlDir);
      sections.push(renderLangSection(nlFiles, 'Nederlands'));
    }

    const outPath = path.join(outDir, `${slug}.md`);
    fs.writeFileSync(outPath, sections.join('\n\n---\n\n') + '\n', 'utf8');
    console.log(`  → ${path.relative(ROOT, outPath)}`);
    generated++;
  }
}

console.log(`\ngenerate-ai-reference: ${generated} file(s) written to ai-reference/`);
