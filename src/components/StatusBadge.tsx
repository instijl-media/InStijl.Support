import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import type {ProductStatus} from '@site/plugins/products-data';
import styles from './styles.module.css';

export default function StatusBadge({status}: {status: ProductStatus}) {
  const label =
    status === 'active' ? (
      <Translate id="status.active">Active</Translate>
    ) : status === 'beta' ? (
      <Translate id="status.beta">Beta</Translate>
    ) : (
      <Translate id="status.deprecated">Deprecated</Translate>
    );
  return <span className={clsx(styles.badge, styles[`status_${status}`])}>{label}</span>;
}
