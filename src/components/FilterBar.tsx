import React from 'react';
import {translate} from '@docusaurus/Translate';
import type {ProductPlatform, ProductStatus, ProductType} from '@site/plugins/products-data';
import styles from './FilterBar.module.css';

export interface ProductFilters {
  platform: ProductPlatform | 'all';
  type: ProductType | 'all';
  status: ProductStatus | 'all';
  query: string;
}

export const DEFAULT_FILTERS: ProductFilters = {
  platform: 'all',
  type: 'all',
  status: 'all',
  query: '',
};

interface Props {
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
}

export default function FilterBar({filters, onChange}: Props) {
  const set = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) =>
    onChange({...filters, [key]: value});

  return (
    <div className={styles.bar}>
      <input
        className={styles.search}
        type="search"
        value={filters.query}
        onChange={(e) => set('query', e.target.value)}
        placeholder={translate({id: 'filter.searchPlaceholder', message: 'Search apps & themes…'})}
        aria-label={translate({id: 'filter.searchPlaceholder', message: 'Search apps & themes…'})}
      />

      <label className={styles.field}>
        <span>{translate({id: 'filter.platform', message: 'Platform'})}</span>
        <select
          value={filters.platform}
          onChange={(e) => set('platform', e.target.value as ProductFilters['platform'])}>
          <option value="all">{translate({id: 'filter.all', message: 'All'})}</option>
          <option value="lightspeed">Lightspeed</option>
          <option value="shopify">Shopify</option>
          <option value="both">Lightspeed + Shopify</option>
        </select>
      </label>

      <label className={styles.field}>
        <span>{translate({id: 'filter.type', message: 'Type'})}</span>
        <select
          value={filters.type}
          onChange={(e) => set('type', e.target.value as ProductFilters['type'])}>
          <option value="all">{translate({id: 'filter.all', message: 'All'})}</option>
          <option value="app">{translate({id: 'type.app', message: 'App'})}</option>
          <option value="theme">{translate({id: 'type.theme', message: 'Theme'})}</option>
        </select>
      </label>

      <label className={styles.field}>
        <span>{translate({id: 'filter.status', message: 'Status'})}</span>
        <select
          value={filters.status}
          onChange={(e) => set('status', e.target.value as ProductFilters['status'])}>
          <option value="all">{translate({id: 'filter.all', message: 'All'})}</option>
          <option value="active">{translate({id: 'status.active', message: 'Active'})}</option>
          <option value="beta">{translate({id: 'status.beta', message: 'Beta'})}</option>
          <option value="deprecated">
            {translate({id: 'status.deprecated', message: 'Deprecated'})}
          </option>
        </select>
      </label>
    </div>
  );
}
