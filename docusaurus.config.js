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
          customCss: require.resolve('./src/scss/custom.scss'),
        },

      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'CyberDrain Improved Partner Portal',
        logo: {
          alt: 'CIPP Logo',
          src: 'img/CIPPLogo.png',
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
            ],
          },
          { to: 'changelog', label: 'Changelog', position: 'left' },
          { to: 'contributing', label: 'Contributing', position: 'left' },
          { to: 'troubleshooting', label: 'Troubleshooting', position: 'left' },
          { href: 'https://cyberdrain.com', label: 'CyberDrain', position: 'left' },
          {
            to: 'https://github.com/KelvinTegelaar/CIPP',
            'aria-label': 'GitHub',
            position: 'right',
            className: 'header-github-link',
          },
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
  ]
};

module.exports = config;
