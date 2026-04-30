import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import {usePluginData} from '@docusaurus/useGlobalData';
import type {Product, ProductType} from '@site/plugins/products-data';
import ProductCard from '@site/src/components/ProductCard';
import FilterBar, {
  DEFAULT_FILTERS,
  type ProductFilters,
} from '@site/src/components/FilterBar';
import styles from '@site/src/pages/index.module.css';

interface Props {
  type: ProductType;
  title: string;
  description: string;
  heading: string;
  empty: string;
}

function readFiltersFromUrl(): ProductFilters {
  if (typeof window === 'undefined') return DEFAULT_FILTERS;
  const p = new URLSearchParams(window.location.search);
  const platform = p.get('platform');
  return {
    platform:
      platform === 'lightspeed' || platform === 'shopify' ? platform : 'all',
    query: p.get('q') || '',
  };
}

function writeFiltersToUrl(f: ProductFilters) {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams();
  if (f.platform !== 'all') p.set('platform', f.platform);
  if (f.query) p.set('q', f.query);
  const qs = p.toString();
  const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
  window.history.replaceState(null, '', next);
}

function matches(p: Product, f: ProductFilters): boolean {
  if (f.platform !== 'all') {
    // Products on 'both' match either Lightspeed or Shopify filter.
    if (p.platform !== f.platform && p.platform !== 'both') return false;
  }
  if (f.query) {
    const q = f.query.toLowerCase();
    const haystack = `${p.title} ${p.summary} ${p.slug}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export default function ProductListPage({
  type,
  title,
  description,
  heading,
  empty,
}: Props): React.ReactElement {
  const {products} = usePluginData('products-data') as {products: Product[]};
  const ofType = useMemo(() => products.filter((p) => p.type === type), [products, type]);

  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    setFilters(readFiltersFromUrl());
  }, []);

  useEffect(() => {
    writeFiltersToUrl(filters);
  }, [filters]);

  const filtered = useMemo(() => ofType.filter((p) => matches(p, filters)), [ofType, filters]);

  return (
    <Layout title={title} description={description}>
      <header className={styles.listHero}>
        <div className="container">
          <div className={styles.listHeroInner}>
            {/* <span className={styles.eyebrow}>
              {type === 'app'
                ? translate({id: 'home.appsCard.title', message: 'Apps'})
                : translate({id: 'home.themesCard.title', message: 'Themes'})}
            </span> */}
            <h1 className={styles.heroTitle}>
              <em>{heading}</em>
            </h1>
            <p className={styles.heroSubtitle}>{description}</p>
          </div>
        </div>
      </header>

      <main className={`container ${styles.section}`}>
        <FilterBar filters={filters} onChange={setFilters} />

        <div className={styles.sectionHead}>
          <span className={styles.count}>
            {filtered.length} / {ofType.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className={styles.empty}>{empty}</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((p) => (
              <ProductCard key={`${p.type}-${p.slug}`} product={p} />
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}

export function appsPageStrings() {
  return {
    title: translate({id: 'apps.title', message: 'Apps'}),
    description: translate({
      id: 'apps.description',
      message: 'All InStijl apps for Lightspeed and Shopify.',
    }),
    heading: translate({id: 'apps.heading', message: 'Apps'}),
    empty: translate({id: 'apps.empty', message: 'No apps match these filters.'}),
  };
}

export function themesPageStrings() {
  return {
    title: translate({id: 'themes.title', message: 'Themes'}),
    description: translate({
      id: 'themes.description',
      message: 'All InStijl themes for Lightspeed and Shopify.',
    }),
    heading: translate({id: 'themes.heading', message: 'Themes'}),
    empty: translate({id: 'themes.empty', message: 'No themes match these filters.'}),
  };
}

// Re-export for convenience.
export {Translate};
