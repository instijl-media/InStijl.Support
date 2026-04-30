import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate from '@docusaurus/Translate';
import type {Product} from '@site/plugins/products-data';
import PlatformBadge from './PlatformBadge';
import StatusBadge from './StatusBadge';
import styles from './ProductCard.module.css';

function priceLabel(p: Product['pricing']): string | null {
  if (!p) return null;
  if (typeof p === 'string') return p;
  const parts = [p.price, p.interval].filter(Boolean);
  return parts.join(' / ') || p.plan || null;
}

export default function ProductCard({product}: {product: Product}) {
  const logo = useBaseUrl(product.logo ?? 'img/logo.svg');
  const price = priceLabel(product.pricing);
  return (
    <Link to={product.permalink} className={styles.card}>
      <div className={styles.header}>
        <img src={logo} alt="" className={styles.logo} aria-hidden />
        <div className={styles.titleWrap}>
          <h3 className={styles.title}>{product.title}</h3>
          <span className={styles.type}>
            {product.type === 'app' ? (
              <Translate id="type.app">App</Translate>
            ) : (
              <Translate id="type.theme">Theme</Translate>
            )}
          </span>
        </div>
      </div>
      {product.summary && <p className={styles.summary}>{product.summary}</p>}
      <div className={styles.meta}>
        <PlatformBadge platform={product.platform} />
        <StatusBadge status={product.status} />
        {price && <span className={styles.price}>{price}</span>}
      </div>
    </Link>
  );
}
