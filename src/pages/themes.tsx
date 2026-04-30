import React from 'react';
import ProductListPage, {themesPageStrings} from '@site/src/components/ProductListPage';

export default function ThemesPage(): React.ReactElement {
  const s = themesPageStrings();
  return <ProductListPage type="theme" {...s} />;
}
