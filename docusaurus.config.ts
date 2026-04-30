import {themes as prismThemes} from 'prism-react-renderer';
import path from 'node:path';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkEmbedShortcode from './plugins/remark-embed-shortcode.mjs';

const config: Config = {
  title: 'InStijl Support',
  tagline: 'Documentation for InStijl apps and themes',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
    faster: true,
  },

  url: 'https://instijl.support',
  baseUrl: '/',
  trailingSlash: false,

  organizationName: 'instijl',
  projectName: 'instijl.support',

  stylesheets: [
    {
      href: './src/css/custom.css',
      type: 'text/css',
    },
  ],

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en-US', path: 'en'},
      nl: {label: 'Nederlands', htmlLang: 'nl-NL', path: 'nl'},
    },
  },

  presets: [
    [
      'classic',
      {
        // Disable the default `docs` plugin instance — we use two custom instances below.
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'apps',
        path: 'content/apps',
        routeBasePath: 'apps',
        sidebarPath: './sidebars.apps.ts',
        remarkPlugins: [remarkEmbedShortcode],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'themes',
        path: 'content/themes',
        routeBasePath: 'themes',
        sidebarPath: './sidebars.themes.ts',
        remarkPlugins: [remarkEmbedShortcode],
      },
    ],
    path.resolve(__dirname, 'plugins/products-data'),
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Reserved for future static-path redirects (e.g. legacy URL aliases).
        redirects: [],
      },
    ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en', 'nl'],
        docsPluginIdForPreferredVersion: 'apps',
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: ['/apps', '/themes'],
        docsDir: ['content/apps', 'content/themes'],
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: '',
      logo: {
        alt: 'InStijl',
        src: 'img/logo.svg',
      },
      hideOnScroll: false,
      items: [
        {to: '/apps', label: 'Apps', position: 'left', activeBaseRegex: '^/(?:[a-z]{2}/)?apps(?:/|$|\\?)'},
        {to: '/themes', label: 'Themes', position: 'left', activeBaseRegex: '^/(?:[a-z]{2}/)?themes(?:/|$|\\?)'},
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Apps', to: '/apps'},
            {label: 'Themes', to: '/themes'},
          ],
        },
        {
          title: 'InStijl',
          items: [
            {label: 'Website', href: 'https://instijlmedia.nl'},
            {label: 'Contact', href: 'mailto:support@instijlmedia.nl'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} InStijl Media.`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
