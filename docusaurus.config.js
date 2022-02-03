// @no-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/vsLight');
const darkCodeTheme = require('prism-react-renderer/themes/vsDark');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CyberDrain Improved Partner Portal',
  tagline: 'Multi-tenant management for Microsoft 365 done right...',
  url: 'https://tender-shirley-88a2cf.netlify.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/CyberDrainIconOrangeWhite.png',
  organizationName: 'KelvinTegelaar', // Usually your GitHub org/user name.
  projectName: 'CIPP', // Usually your repo name.
  trailingSlash: true,
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs/user',
          routeBasePath: 'docs/user',
          sidebarPath: require.resolve('./sidebarsUser.js'),
          editUrl: 'https://github.com/KelvinTegelaar/CIPP/tree/docs/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          sidebarCollapsible: true,
          sidebarCollapsed: false,
        },
        blog: false,
        theme: {
          customCss: [
            require.resolve('./src/scss/custom.scss'),
          ],
        },

      }),
    ],
    [
      'redocusaurus',
      {
        specs: [
          {
            spec: 'data/cippapi.yaml',
            routePath: '/docs/api/',
          },
        ],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: 'keywords',
          content:
            'CIPP, CyberDrain Improved Partner Portal, Microsoft 365, Management, Multi-Tenant, MSP, Azure, Microsoft Partner, Lighthouse',
        },
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      announcementBar: {
        id: 'announcementBar-1', // Increment on change
        //content: `<span aria-label="star" role="img">⭐</span> If you like CIPP, please <a href="https://github.com/KelvinTegelaar/CIPP" target="_blank" rel="noopener noreferrer">star the project on GitHub</a> and <a href="https://github.com/sponsors/KelvinTegelaar" target="_blank" rel="noopener noreferrer">consider Sponsoring the project on GitHub</a>. Thanks! <span aria-label="heart" role="img">❤️</span>`,
        content: `<span aria-label="warning" role="img">⚠️</span> This site is still under development. Please check <a href="https://cipp.app">cipp.app</a> for the latest live documentation and information on CIPP.`,
      },
      navbar: {
        title: `CyberDrain Improved Partner Portal`,
        logo: {
          alt: 'CIPP Logo',
          src: 'img/CyberDrainIconOrangeWhite.png',
        },
        items: [
          {
            type: 'dropdown',
            position: 'left',
            label: 'Documentation',
            items: [
              {
                type: 'doc',
                docId: 'index',
                label: 'User',
                docsPluginId: 'default',
              },
              {
                type: 'doc',
                docId: 'index',
                label: 'Developer',
                docsPluginId: 'dev',
              },
              {
                label: 'API',
                to: '/docs/api/',
              },
              {
                label: 'FAQ',
                to: '/faq/',
              }
            ],
          },
          { to: 'changelog', label: 'Changelog', position: 'left' },
          { to: 'contributing', label: 'Contributing', position: 'left' },
          { to: 'troubleshooting', label: 'Troubleshooting', position: 'left' },
          { to: 'https://discord.gg/cyberdrain', label: 'Community', position: 'left', target: '_blank' },
          {
            type: 'dropdown',
            position: 'right',
            label: 'Repositories',
            items: [
              {
                to: 'https://github.com/KelvinTegelaar/CIPP',
                'aria-label': 'GitHub',
                label: 'CIPP',
              },
              {
                to: 'https://github.com/KelvinTegelaar/CIPP-API',
                'aria-label': 'GitHub',
                label: 'CIPP-API'
              },
            ]
          }
        ],
      },
      footer: {
        logo: {
          alt: 'Docusaurus Logo',
          src: 'img/Docusaurus.svg',
          href: 'https://docusaurus.io',
          height: 50,
          width: 50,
        },
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'User Guide',
                to: '/docs/user/',
              },
              {
                label: 'Developer Guide',
                to: '/docs/dev/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/cyberdrain',
              },
              {
                label: 'Reddit',
                href: 'https://reddit.com/r/msp',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                href: 'https://cyberdrain.com',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/KelvinTegelaar/CIPP',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CyberDrain. Built with <a href="https://docusaurus.io">Docusaurus</a>.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['powershell'],
      },
      hideableSidebar: true,
    }),
  plugins: [
    require.resolve('docusaurus-plugin-sass'),
    require.resolve('@docusaurus/plugin-client-redirects'),
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'dev',
        path: 'docs/dev',
        routeBasePath: 'docs/dev',
        sidebarPath: require.resolve('./sidebarsDev.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        sidebarCollapsible: true,
        sidebarCollapsed: false,
      },
    ],
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        indexDocs: true,
        indexDocSidebarParentCategories: 3,
        indexBlog: false,
        indexPages: true,
        language: "en",
      }
    ]
  ]
};

module.exports = config;
