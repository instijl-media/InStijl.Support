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

import { visit } from 'unist-util-visit';
import matter from 'gray-matter';

/** @type {import('unified').Plugin} */
export default function remarkEmbedShortcode() {
  return (tree, vfile) => {
    // Try vfile.data.frontMatter (Docusaurus) first, then parse from yaml AST node
    let embeds = vfile.data?.frontMatter?.embeds;

    if (!embeds) {
      // Parse the yaml frontmatter node directly from the AST
      for (const node of tree.children ?? []) {
        if (node.type === 'yaml') {
          try {
            const fm = matter('---\n' + node.value + '\n---').data;
            embeds = fm?.embeds;
          } catch {}
          break;
        }
      }
    }

    if (!Array.isArray(embeds) || embeds.length === 0) return;

    /** @type {Record<string, string>} */
    const embedMap = Object.fromEntries(
      embeds
        .filter((e) => e?.id && e?.html)
        .map((e) => [e.id, e.html]),
    );

    if (Object.keys(embedMap).length === 0) return;

    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index == null) return;
      if (node.children.length !== 1) return;

      const child = node.children[0];
      if (child.type !== 'text') return;

      const match = child.value.trim().match(/^\[embed:([^\]]+)\]$/);
      if (!match) return;

      const html = embedMap[match[1]];
      if (!html) return;

      // Replace the paragraph with a raw HTML node
      parent.children.splice(index, 1, {
        type: 'html',
        value: html,
      });
    });
  };
}
