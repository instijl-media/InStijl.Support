import React from 'react';
import clsx from 'clsx';
import type {ProductPlatform} from '@site/plugins/products-data';
import styles from './styles.module.css';

const LABELS: Record<ProductPlatform, string> = {
  lightspeed: 'Lightspeed',
  shopify: 'Shopify',
  both: 'Lightspeed + Shopify',
};

export default function PlatformBadge({platform}: {platform: ProductPlatform}) {
  return (
    <span
      className={clsx(styles.badge, styles[`platform_${platform}`])}
      aria-label={`Platform: ${LABELS[platform]}`}>
      {LABELS[platform]}
    </span>
  );
}
