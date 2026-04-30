import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import {usePluginData} from '@docusaurus/useGlobalData';
import type {Product} from '@site/plugins/products-data';
import ProductCard from '@site/src/components/ProductCard';
import FilterBar, {DEFAULT_FILTERS, type ProductFilters} from '@site/src/components/FilterBar';
import styles from './index.module.css';

function readFiltersFromUrl(): ProductFilters {
  if (typeof window === 'undefined') return DEFAULT_FILTERS;
  const p = new URLSearchParams(window.location.search);
  return {
    platform: (p.get('platform') as ProductFilters['platform']) || 'all',
    type: (p.get('type') as ProductFilters['type']) || 'all',
    status: (p.get('status') as ProductFilters['status']) || 'all',
    query: p.get('q') || '',
  };
}

function writeFiltersToUrl(f: ProductFilters) {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams();
  if (f.platform !== 'all') p.set('platform', f.platform);
  if (f.type !== 'all') p.set('type', f.type);
  if (f.status !== 'all') p.set('status', f.status);
  if (f.query) p.set('q', f.query);
  const qs = p.toString();
  const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
  window.history.replaceState(null, '', next);
}

function matches(p: Product, f: ProductFilters): boolean {
  if (f.platform !== 'all' && p.platform !== f.platform) return false;
  if (f.type !== 'all' && p.type !== f.type) return false;
  if (f.status !== 'all' && p.status !== f.status) return false;
  if (f.query) {
    const q = f.query.toLowerCase();
    const haystack = `${p.title} ${p.summary} ${p.slug}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export default function Home(): React.ReactElement {
  const {products} = usePluginData('products-data') as {products: Product[]};
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    setFilters(readFiltersFromUrl());
  }, []);

  useEffect(() => {
    writeFiltersToUrl(filters);
  }, [filters]);

  const filtered = useMemo(() => products.filter((p) => matches(p, filters)), [products, filters]);

  return (
    <Layout
      title={translate({id: 'home.title', message: 'InStijl Support'})}
      description={translate({
        id: 'home.description',
        message: 'Documentation for all InStijl apps and themes for Lightspeed and Shopify.',
      })}>
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            <Translate id="home.heroTitle">InStijl Support</Translate>
          </h1>
          <p className={styles.heroSubtitle}>
            <Translate id="home.heroSubtitle">
              Documentation for our apps and themes for Lightspeed and Shopify.
            </Translate>
          </p>
        </div>
      </header>

      <main className="container margin-vert--lg">
        <FilterBar filters={filters} onChange={setFilters} />

        {filtered.length === 0 ? (
          <p className={styles.empty}>
            <Translate id="home.empty">No apps or themes match these filters.</Translate>
          </p>
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
