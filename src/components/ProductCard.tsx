import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate from '@docusaurus/Translate';
import type {Product} from '@site/plugins/products-data';
import styles from './ProductCard.module.css';

export default function ProductCard({product}: {product: Product}) {
  const cover = useBaseUrl(product.cover ?? product.logo ?? 'img/logo.svg');
  return (
    <Link to={product.permalink} className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={cover} alt="" className={styles.image} aria-hidden />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{product.title}</h3>
        {product.summary && <p className={styles.summary}>{product.summary}</p>}
        <span className={styles.cta}>
          <Translate id="product.readDocs">Read documentation</Translate>
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
