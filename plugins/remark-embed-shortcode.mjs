/**
 * remark-embed-shortcode
 *
 * Replaces [embed:id] shortcodes in MDX content with raw HTML defined in the
 * file's own frontmatter under an `embeds` array:
 *
 *   embeds:
 *     - id: video1
 *       html: '<iframe src="..." ...></iframe>'
 *
 * Usage in body: write `[embed:video1]` on its own line (as a paragraph).
 * The plugin swaps the paragraph for a raw HTML node at build time.
 */

import { createRequire } from 'node:module';
import { visit } from 'unist-util-visit';

const require = createRequire(import.meta.url);
const matter = require('gray-matter');

/** @type {import('unified').Plugin} */
export default function remarkEmbedShortcode() {
  return (tree, vfile) => {
    // Docusaurus stores parsed frontmatter at vfile.data.frontMatter (capital M).
    // Try both casings and also fall back to parsing the yaml AST node directly.
    let embeds =
      vfile.data?.frontMatter?.embeds ??
      vfile.data?.frontmatter?.embeds;

    if (!embeds) {
      for (const node of tree.children ?? []) {
        if (node.type === 'yaml') {
          try {
            embeds = matter('---\n' + node.value + '\n---').data?.embeds;
          } catch (e) {
            console.error('[embed-shortcode] YAML parse error:', e.message);
          }
          break;
        }
      }
    }

    if (!Array.isArray(embeds) || embeds.length === 0) return;

    /** @type {Record<string, string>} */
    const embedMap = Object.fromEntries(
      embeds
        .filter((e) => e?.id && e?.html)
        .map((e) => [String(e.id).trim(), e.html]),
    );

    if (Object.keys(embedMap).length === 0) return;

    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index == null) return;

      let embedId = null;

      if (node.children.length === 1) {
        const child = node.children[0];

        if (child.type === 'text') {
          // Plain text: [embed:id]
          const match = child.value.trim().match(/^\[embed:([^\]]+)\]$/);
          if (match) embedId = match[1].trim();
        } else if (child.type === 'linkReference') {
          // Markdown linkReference: identifier is "embed:id"
          const id = child.identifier?.trim() ?? '';
          if (id.startsWith('embed:')) embedId = id.slice('embed:'.length).trim();
        }
      } else if (node.children.length === 3) {
        // remark-directive splits [embed:id] into:
        //   text("[embed") + textDirective(name="id") + text("]")
        const [first, middle, last] = node.children;
        if (
          first.type === 'text' &&
          first.value.trim() === '[embed' &&
          middle.type === 'textDirective' &&
          last.type === 'text' &&
          last.value.trim() === ']'
        ) {
          embedId = middle.name;
        }
      }

      if (!embedId) return;

      const html = embedMap[embedId];
      if (!html) return;

      // Replace the paragraph with a raw HTML node
      parent.children.splice(index, 1, {
        type: 'html',
        value: html,
      });
    });
  };
}
