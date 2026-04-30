import React from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import type {ProductPlatform} from '@site/plugins/products-data';
import styles from './FilterBar.module.css';

export type PlatformFilter = ProductPlatform | 'all';

export interface ProductFilters {
  platform: PlatformFilter;
  query: string;
}

export const DEFAULT_FILTERS: ProductFilters = {
  platform: 'all',
  query: '',
};

interface Props {
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
}

interface ChipOption<V extends string> {
  value: V;
  label: string;
}

interface ChipGroupProps<V extends string> {
  legend: string;
  value: V;
  options: ChipOption<V>[];
  onSelect: (next: V) => void;
}

function ChipGroup<V extends string>({legend, value, options, onSelect}: ChipGroupProps<V>) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={legend}>
      <span className={styles.legend}>{legend}</span>
      <div className={styles.chips}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              className={clsx(styles.chip, active && styles.chipActive)}
              onClick={() => onSelect(opt.value)}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterBar({filters, onChange}: Props) {
  const set = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) =>
    onChange({...filters, [key]: value});

  const allLabel = translate({id: 'filter.all', message: 'All'});

  return (
    <div className={styles.bar}>
      <input
        className={styles.search}
        type="search"
        value={filters.query}
        onChange={(e) => set('query', e.target.value)}
        placeholder={translate({id: 'filter.searchPlaceholder', message: 'Search…'})}
        aria-label={translate({id: 'filter.searchPlaceholder', message: 'Search…'})}
      />

      <ChipGroup<PlatformFilter>
        legend={translate({id: 'filter.platform', message: 'Platform'})}
        value={filters.platform}
        onSelect={(v) => set('platform', v)}
        options={[
          {value: 'all', label: allLabel},
          {value: 'lightspeed', label: 'Lightspeed'},
          {value: 'shopify', label: 'Shopify'},
        ]}
      />
    </div>
  );
}
