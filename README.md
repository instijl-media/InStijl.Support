# InStijl Support

Documentation site for InStijl apps and themes for **Lightspeed** and **Shopify**, available in English and Dutch.

Built with [Docusaurus 3](https://docusaurus.io) and edited via [PagesCMS](https://pagescms.org).

## Stack

- Docusaurus 3 (TypeScript) with two `docs` plugin instances: `apps` and `themes`.
- i18n: `en` (default) and `nl`. Following Docusaurus convention the default locale is unprefixed and Dutch lives under `/nl/...`. URLs:
  - English: `instijl.support/apps/<slug>` and `instijl.support/themes/<slug>`
  - Dutch: `instijl.support/nl/apps/<slug>` and `instijl.support/nl/themes/<slug>`
- Local search via `@easyops-cn/docusaurus-search-local`.
- Build-time frontmatter aggregation via the custom `plugins/products-data` plugin powers the homepage filter/overview.
- PagesCMS schema lives at [.pages.yml](.pages.yml).
- Deployed to GitHub Pages from `main` via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Local development

```bash
corepack enable pnpm
pnpm install
pnpm start         # English
pnpm start:nl      # Dutch
pnpm build && pnpm serve
```

Node ≥ 20 required.

## Content model

Each product (app or theme) is a folder under `content/apps/<slug>/` or `content/themes/<slug>/` with:

- `index.mdx` — landing page with the canonical frontmatter (title, slug, type, platform, status, summary, logo, pricing, links, order).
- `*.mdx` — subpages (sidebar position drives ordering).

Dutch translations mirror the EN tree under:

- `i18n/nl/docusaurus-plugin-content-docs-apps/current/<slug>/...`
- `i18n/nl/docusaurus-plugin-content-docs-themes/current/<slug>/...`

### Frontmatter schema

| Field             | Type                                        | Notes                                  |
| ----------------- | ------------------------------------------- | -------------------------------------- |
| `title`           | string                                      | Required                               |
| `slug`            | string                                      | URL slug (e.g. `/ai`)                  |
| `type`            | `app` \| `theme`                            | Required                               |
| `platform`        | `lightspeed` \| `shopify` \| `both`         | Required                               |
| `status`          | `active` \| `beta` \| `deprecated`          | Required                               |
| `summary`         | string                                      | Shown on overview cards                |
| `logo`            | path under `static/img/products/`           | Optional                               |
| `cover`           | path under `static/img/products/`           | Optional                               |
| `order`           | number                                      | Sort order on overview                 |
| `pricing`         | string OR object `{plan,price,interval,currency}` | Shown as a chip on cards               |
| `links`           | array of `{label,url}`                      | External links (marketplace, demo)     |

## Adding a new product

1. Create `content/{apps,themes}/<slug>/index.mdx` with the frontmatter above.
2. Add subpages as additional `.mdx` files in the same folder.
3. Mirror the folder under `i18n/nl/docusaurus-plugin-content-docs-{apps,themes}/current/<slug>/` for the Dutch translation (the EN version is used as fallback if missing).
4. Drop the logo SVG/PNG into `static/img/products/<slug>.svg` and reference it from frontmatter as `img/products/<slug>.svg`.
5. Run `pnpm start` and verify the product appears on the homepage and renders at `/apps/<slug>` (or `/themes/<slug>`) for English and `/nl/apps/<slug>` for Dutch.

## Editorial workflow (PagesCMS)

1. Connect this repo in [PagesCMS](https://app.pagescms.org).
2. Editors pick a collection (e.g. _Apps (EN)_ or _Themes (NL)_), edit fields/markdown, and commit through the UI.
3. Commits to `main` (directly or via PR merge) trigger the GitHub Pages deploy.

## Deployment

GitHub Pages is the primary host (`static/CNAME` = `instijl.support`). The workflow builds the static site and publishes the `build/` artifact.

To deploy to Forge / Nginx instead, replace the deploy job with an `rsync` over SSH step that uploads `build/` to the document root — the build step is unchanged.
