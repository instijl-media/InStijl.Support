/**
 * Swizzle (wrap) of DocBreadcrumbs to inject the product name between the
 * home icon and the first sidebar breadcrumb.
 *
 * URL structure:  /{locale}/{routeBase}/{productSlug}/...
 *   routeBase = "apps" or "themes"
 */

import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useSidebarBreadcrumbs} from '@docusaurus/plugin-content-docs/client';
import {useHomePageRoute} from '@docusaurus/theme-common/internal';
import {useLocation} from '@docusaurus/router';
import {usePluginData} from '@docusaurus/useGlobalData';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import HomeBreadcrumbItem from '@theme/DocBreadcrumbs/Items/Home';
import DocBreadcrumbsStructuredData from '@theme/DocBreadcrumbs/StructuredData';

import type {Product} from '../../../plugins/products-data';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Parse `/{locale?}/{routeBase}/{slug}/...` → `{routeBase, slug}` or null. */
function parseProductFromPath(
  pathname: string,
): {routeBase: string; slug: string} | null {
  // Strip leading slash and split
  const parts = pathname.replace(/^\//, '').split('/');

  // Parts may start with a locale prefix ("en" / "nl") — skip it.
  const bases = ['apps', 'themes'];
  for (let i = 0; i < parts.length - 1; i++) {
    if (bases.includes(parts[i])) {
      const slug = parts[i + 1];
      if (slug) return {routeBase: parts[i], slug};
    }
  }
  return null;
}

// ─── sub-components (mirrors the originals to keep rendering consistent) ─────

function BreadcrumbsItemLink({
  children,
  href,
  isLast,
}: {
  children: ReactNode;
  href: string | undefined;
  isLast: boolean;
}): ReactNode {
  const className = 'breadcrumbs__link';
  if (isLast) {
    return <span className={className}>{children}</span>;
  }
  return href ? (
    <Link className={className} href={href}>
      <span>{children}</span>
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}

function BreadcrumbsItem({
  children,
  active,
}: {
  children: ReactNode;
  active?: boolean;
}): ReactNode {
  return (
    <li
      className={clsx('breadcrumbs__item', {
        'breadcrumbs__item--active': active,
      })}>
      {children}
    </li>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function DocBreadcrumbs(): ReactNode {
  const breadcrumbs = useSidebarBreadcrumbs();
  const homePageRoute = useHomePageRoute();
  const {pathname} = useLocation();

  // Access products registered by the products-data plugin
  const pluginData = usePluginData('products-data') as
    | {products: Product[]}
    | undefined;
  const products: Product[] = pluginData?.products ?? [];

  // Resolve the injected product crumb
  const parsed = parseProductFromPath(pathname);
  const product = parsed
    ? products.find(
        (p) =>
          p.slug === parsed.slug &&
          (parsed.routeBase === 'apps' ? p.type === 'app' : p.type === 'theme'),
      )
    : null;

  if (!breadcrumbs) return null;

  const hasSidebarCrumbs = breadcrumbs.length > 0;

  return (
    <>
      <DocBreadcrumbsStructuredData breadcrumbs={breadcrumbs} />
      <nav
        className={clsx(
          ThemeClassNames.docs.docBreadcrumbs,
          'breadcrumbsContainer_src-theme-DocBreadcrumbs-styles-module',
        )}
        aria-label={translate({
          id: 'theme.docs.breadcrumbs.navAriaLabel',
          message: 'Breadcrumbs',
          description: 'The ARIA label for the breadcrumbs',
        })}>
        <ul className="breadcrumbs">
          {homePageRoute && <HomeBreadcrumbItem />}

          {/* Injected product crumb */}
          {product && (
            <BreadcrumbsItem active={!hasSidebarCrumbs}>
              <BreadcrumbsItemLink
                href={product.permalink}
                isLast={!hasSidebarCrumbs}>
                {product.title}
              </BreadcrumbsItemLink>
            </BreadcrumbsItem>
          )}

          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const href =
              item.type === 'category' && item.linkUnlisted
                ? undefined
                : item.href;
            return (
              <BreadcrumbsItem key={idx} active={isLast}>
                <BreadcrumbsItemLink href={href} isLast={isLast}>
                  {item.label}
                </BreadcrumbsItemLink>
              </BreadcrumbsItem>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
