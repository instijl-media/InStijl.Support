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

The `sync-translations` script runs automatically before `start`, `start:nl`, and `build` — no manual step needed.

## Content model

Each product (app or theme) is a folder under `content/apps/<slug>/` or `content/themes/<slug>/` with:

- `index.mdx` — overview page with `sidebar_position: 1` so it always sorts above subpages. Contains canonical EN frontmatter plus inline `nl_*` keys for Dutch (see below).
- `*.mdx` — subpages. Sidebar ordering is controlled by `sidebar_position`; use values ≥ 2 to keep them below the overview.

Only products with `status: active` are shown on the homepage overview. Products with `status: beta` or `status: deprecated` are published but hidden from the listing.

### Frontmatter schema (EN source files)

| Field             | Type                                        | Notes                                         |
| ----------------- | ------------------------------------------- | --------------------------------------------- |
| `title`           | string                                      | Required                                      |
| `sidebar_position`| number                                      | `1` on `index.mdx`; ≥ 2 on subpages           |
| `type`            | `app` \| `theme`                            | Required                                      |
| `platform`        | `lightspeed` \| `shopify` \| `both`         | Required                                      |
| `status`          | `active` \| `beta` \| `deprecated`          | Required; only `active` appears on homepage   |
| `summary`         | string                                      | Shown on overview cards (index only)          |
| `logo`            | path under `static/img/products/`           | Optional                                      |
| `cover`           | path under `static/img/products/`           | Optional                                      |
| `order`           | number                                      | Sort order on overview                        |
| `nl_title`        | string                                      | Dutch title (all pages)                       |
| `nl_summary`      | string                                      | Dutch summary (index only)                    |
| `nl_body`         | string                                      | Dutch body/markdown (all pages)               |

## Translations

Dutch translations are stored **inline** in the EN source files using `nl_title`, `nl_summary`, and `nl_body` frontmatter keys. The build-time script [`scripts/sync-translations.js`](scripts/sync-translations.js) reads these keys and writes the corresponding NL i18n files to:

- `i18n/nl/docusaurus-plugin-content-docs-apps/current/<slug>/...`
- `i18n/nl/docusaurus-plugin-content-docs-themes/current/<slug>/...`

The script runs automatically before every `start` and `build`. **Do not edit the NL i18n files directly** — they are overwritten on every run.

The `plugins/products-data` plugin always reads structural metadata (`type`, `platform`, `status`, `logo`, `order`) from the EN source file so that filters work correctly on translated pages. Only `title` and `summary` are overridden from the translated file.

## Adding a new product

1. Create `content/{apps,themes}/<slug>/index.mdx` with `sidebar_position: 1` and the frontmatter fields above.
2. Set `status: active` to show the product on the homepage, or `beta`/`deprecated` to publish but hide it.
3. Add subpages as additional `.mdx` files in the same folder, using `sidebar_position: 2` and higher.
4. Fill in `nl_title`, `nl_summary`, and `nl_body` in every file. The sync script generates the NL i18n files automatically.
5. Drop the logo SVG/PNG into `static/img/products/<slug>.svg` and reference it in frontmatter as `img/products/<slug>.svg`.
6. Add the product to [.pages.yml](.pages.yml) following the existing per-product group pattern (one `file` entry for the overview, one `collection` entry scoped to the product folder for subpages).
7. Run `pnpm start` and verify the product appears on the homepage and renders correctly in both EN and NL.

## Editorial workflow (PagesCMS)

1. Connect this repo in [PagesCMS](https://app.pagescms.org).
2. Products are organised in per-product groups in the sidebar. Each group has an **Overview** file entry and a **Subpages** collection scoped to that product's folder.
3. Every content field has both an EN and NL variant side by side (`title (EN)` / `nl_title (NL)`, etc.). Editors fill in both languages in one place; the sync script handles the rest at build time.
4. Commits to `main` (directly or via PR merge) trigger the GitHub Pages deploy.

## Deployment

GitHub Pages is the primary host (`static/CNAME` = `instijl.support`). The workflow builds the static site and publishes the `build/` artifact.

To deploy to Forge / Nginx instead, replace the deploy job with an `rsync` over SSH step that uploads `build/` to the document root — the build step is unchanged.
