import React from 'react';
import ProductListPage, {appsPageStrings} from '@site/src/components/ProductListPage';

export default function AppsPage(): React.ReactElement {
  const s = appsPageStrings();
  return <ProductListPage type="app" {...s} />;
}
