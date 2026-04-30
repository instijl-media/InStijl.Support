import path from 'node:path';
import fs from 'node:fs';
import matter from 'gray-matter';
import type {LoadContext, Plugin} from '@docusaurus/types';

function listProductSlugs(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, {withFileTypes: true})
    .filter((e) => e.isDirectory())
    .filter((e) => fs.existsSync(path.join(root, e.name, 'index.mdx')))
    .map((e) => e.name);
}

export type ProductType = 'app' | 'theme';
export type ProductPlatform = 'lightspeed' | 'shopify' | 'both';
export type ProductStatus = 'active' | 'beta' | 'deprecated';

export interface ProductLink {
  label: string;
  url: string;
}

export interface ProductPricing {
  plan?: string;
  price?: string;
  interval?: string;
  currency?: string;
}

export interface Product {
  slug: string;
  type: ProductType;
  platform: ProductPlatform;
  status: ProductStatus;
  title: string;
  summary: string;
  logo?: string;
  cover?: string;
  pricing?: ProductPricing | string;
  links?: ProductLink[];
  order?: number;
  /** Permalink for current locale, e.g. `/en/apps/ai`. */
  permalink: string;
}

interface ProductsGlobalData {
  products: Product[];
}

interface ResolvedSource {
  type: ProductType;
  /** Absolute path to the directory holding `index.mdx` for this product/locale. */
  dir: string;
  slug: string;
}

/**
 * Resolve the on-disk content directory for a given (type, locale) pair.
 * EN content lives in `content/{apps,themes}/`, NL translations live in
 * `i18n/nl/docusaurus-plugin-content-docs-{apps,themes}/current/`.
 */
function localeContentRoot(
  siteDir: string,
  type: ProductType,
  locale: string,
  defaultLocale: string,
): string {
  if (locale === defaultLocale) {
    return path.join(siteDir, 'content', type === 'app' ? 'apps' : 'themes');
  }
  return path.join(
    siteDir,
    'i18n',
    locale,
    `docusaurus-plugin-content-docs-${type === 'app' ? 'apps' : 'themes'}`,
    'current',
  );
}

async function collectProducts(
  siteDir: string,
  baseUrl: string,
  locale: string,
  defaultLocale: string,
): Promise<Product[]> {
  const products: Product[] = [];

  for (const type of ['app', 'theme'] as ProductType[]) {
    const localeRoot = localeContentRoot(siteDir, type, locale, defaultLocale);
    const fallbackRoot = localeContentRoot(siteDir, type, defaultLocale, defaultLocale);

    // Always enumerate slugs from the default-locale content (it's the source of truth);
    // each slug then prefers its translated `index.mdx` if it exists.
    if (!fs.existsSync(fallbackRoot)) continue;

    const slugs = listProductSlugs(fallbackRoot);
    for (const slug of slugs) {
      const rel = path.join(slug, 'index.mdx');
      const translated = path.join(localeRoot, rel);
      const fallback = path.join(fallbackRoot, rel);
      const file = fs.existsSync(translated) ? translated : fallback;

      const raw = fs.readFileSync(file, 'utf8');
      const {data} = matter(raw);

      const routeBase = type === 'app' ? 'apps' : 'themes';
      // Store the locale-agnostic permalink. Docusaurus `<Link>` will prefix
      // it with the current locale's baseUrl at render time.
      const permalink = `/${routeBase}/${slug}`;

      products.push({
        slug,
        type,
        platform: (data.platform as ProductPlatform) ?? 'both',
        status: (data.status as ProductStatus) ?? 'active',
        title: (data.title as string) ?? slug,
        summary: (data.summary as string) ?? '',
        logo: data.logo as string | undefined,
        cover: data.cover as string | undefined,
        pricing: data.pricing as ProductPricing | string | undefined,
        links: (data.links as ProductLink[]) ?? [],
        order: typeof data.order === 'number' ? data.order : undefined,
        permalink,
      });
    }
  }

  products.sort((a, b) => {
    const ao = a.order ?? 1000;
    const bo = b.order ?? 1000;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });

  return products;
}

export default function productsDataPlugin(context: LoadContext): Plugin<ProductsGlobalData> {
  const {siteDir, baseUrl, i18n} = context;

  return {
    name: 'products-data',

    async loadContent() {
      const products = await collectProducts(
        siteDir,
        baseUrl,
        i18n.currentLocale,
        i18n.defaultLocale,
      );
      return {products};
    },

    async contentLoaded({content, actions}) {
      const {setGlobalData} = actions;
      setGlobalData(content);
    },

    getPathsToWatch() {
      return [
        path.join(siteDir, 'content', 'apps', '**/*.{md,mdx}'),
        path.join(siteDir, 'content', 'themes', '**/*.{md,mdx}'),
        path.join(siteDir, 'i18n', '**/*.{md,mdx}'),
      ];
    },
  };
}
