import React, {useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useHistory} from '@docusaurus/router';
import styles from './index.module.css';

export default function Home(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const history = useHistory();
  const [query, setQuery] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // Route to the local search results page.
    history.push(`${siteConfig.baseUrl}search?q=${encodeURIComponent(q)}`);
  };

  return (
    <Layout
      title={translate({id: 'home.title', message: 'InStijl Support'})}
      description={translate({
        id: 'home.description',
        message: 'Documentation for all InStijl apps and themes for Lightspeed and Shopify.',
      })}>
      <header className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>
              <em>
                <Translate id="home.heroTitle.accent">Apps & Themes</Translate>
              </em>{' '}
              <Translate id="home.heroTitle.prefix">by InStijl</Translate>{' '}

            </h1>
            <p className={styles.heroSubtitle}>
              <Translate id="home.heroSubtitle">
                Guides, references and release notes for all InStijl apps and themes.
              </Translate>
            </p>

            <form className={styles.bigSearch} role="search" onSubmit={onSubmit}>
              <svg
                className={styles.bigSearchIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
                width="22"
                height="22">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <line
                  x1="16.5"
                  y1="16.5"
                  x2="21"
                  y2="21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                className={styles.bigSearchInput}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={translate({
                  id: 'home.searchPlaceholder',
                  message: 'Search the docs…',
                })}
                aria-label={translate({
                  id: 'home.searchPlaceholder',
                  message: 'Search the docs…',
                })}
              />
              <button type="submit" className={styles.bigSearchSubmit}>
                <Translate id="home.searchSubmit">Search</Translate>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className={`container ${styles.section}`}>
        <div className={styles.chooserHead}>
          <h2 className={styles.chooserTitle}>
            <Translate id="home.chooseHeading">Browse by category</Translate>
          </h2>
          <p className={styles.chooserSubtitle}>
            <Translate id="home.chooseSubtitle">
              Pick a category to filter products and read their documentation.
            </Translate>
          </p>
        </div>

        <div className={styles.chooser}>
          <Link to="/apps" className={styles.chooserCard}>
            <div className={styles.chooserIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.7" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.7" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
              </svg>
            </div>
            <h3 className={styles.chooserCardTitle}>
              <Translate id="home.appsCard.title">Apps</Translate>
            </h3>
            <p className={styles.chooserCardText}>
              <Translate id="home.appsCard.text">
                Tools that extend your Lightspeed or Shopify store.
              </Translate>
            </p>
            <span className={styles.chooserCta}>
              <Translate id="home.appsCard.cta">Browse apps</Translate>
              <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link to="/themes" className={styles.chooserCard}>
            <div className={styles.chooserIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path
                  d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4V5z"
                  fill="currentColor"
                />
                <path
                  d="M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9z"
                  fill="currentColor"
                  opacity="0.55"
                />
              </svg>
            </div>
            <h3 className={styles.chooserCardTitle}>
              <Translate id="home.themesCard.title">Themes</Translate>
            </h3>
            <p className={styles.chooserCardText}>
              <Translate id="home.themesCard.text">
                Storefront themes designed and built by InStijl.
              </Translate>
            </p>
            <span className={styles.chooserCta}>
              <Translate id="home.themesCard.cta">Browse themes</Translate>
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </main>
    </Layout>
  );
}
