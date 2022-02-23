// @no-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/vsLight');
const darkCodeTheme = require('prism-react-renderer/themes/vsDark');
const a11yEmoji = require('@fec/remark-a11y-emoji');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CyberDrain Improved Partner Portal',
  tagline: 'Free and open-source multi-tenant management for Microsoft 365...',
  url: 'https://tender-shirley-88a2cf.netlify.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
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
          editUrl: 'https://github.com/KelvinTegelaar/CIPP/tree/website/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          sidebarCollapsible: true,
          sidebarCollapsed: false,
          remarkPlugins: [a11yEmoji],
          admonitions: {
            customTypes: {
              discord: {
                keyword: `discord`,
                infima: true,
                svg: '<svg width="512px" height="512px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#006591" d="M218.4 24.72c-14.2 0-30.5 3.56-49.5 11.88 77.2 8.6 65.9 91.4 14.1 106.2-65.4 18.7-131.31-23.7-98.34-99.2-39.67 18.95-42.17 80.8-12.93 111.5C141.3 227.9 56.9 279 37.25 200.7-1.929 326.2 60.34 489.5 258.7 489.5c250.7 0 282-374.7 129.2-415.04 26.5 43.04-13.1 70.94-24.9 73.14-51.3 9.9-58.1-122.89-144.6-122.88zm37.5 118.08c4.5 0 9.4 1.1 12.8 2.9l115.9 67.1c7.4 4.1 7.4 10.9 0 15.2l-115.9 66.9c-7.2 4.3-18.5 4.3-25.7 0L126.8 228c-7.3-4.3-7.3-11.1 0-15.2L243 145.7c3.4-1.8 7.9-2.9 12.9-2.9zm-89 62.6c-21.6-.4-33.1 15-18.2 24.3 9.6 4.8 23.7 4.4 32.7-.8 8.8-5.3 9.5-13.7 1.5-19.4-4.3-2.5-10-4-16-4.1zm178.6.1c-20.8.4-31.3 15.5-16.3 24.5 9.6 4.9 23.9 4.6 33-.7 8.9-5.3 9.5-13.9 1.2-19.6-4.2-2.4-9.9-4-15.9-4.2h-2zm-89 0c-6.6-.1-13 1.5-17.7 4.2-10.2 5.6-10.4 15.1-.6 20.9 9.9 5.8 25.8 5.6 35.1-.6 15-9 4.6-24.3-16.8-24.5zm-141 41c1.5.1 3.4.5 5.6 1.6l111.5 64.5c7.2 4.1 12.9 14.2 12.9 22.5v119.7c0 8.3-5.7 11.7-12.9 7.6L121.2 398c-7.4-4.3-13.2-14.2-13.2-22.6V255.7c0-6.2 3-9.2 7.5-9.2zm281.3 0c4.2 0 7.2 3 7.2 9.2v119.7c0 8.4-6 18.3-13 22.6l-111.5 64.4c-7.2 4.1-12.9.7-12.9-7.6V335.1c0-8.3 5.7-18.4 12.9-22.5L391 248.1c2.1-1.1 4.2-1.5 5.8-1.6zm-185 65.5h-1.1c-5.3.4-8.5 4.8-8.5 11.6-.6 10.4 7.2 24.1 16.9 29.8 9.8 5.6 17.6 1.1 17.2-9.9.2-14.2-13.3-31.1-24.5-31.5zm130.9 21.8c-11.2.1-24.8 17.2-24.7 31.4.1 10.4 7.7 14.4 17.2 8.9 9.4-5.5 17-18.3 17.1-28.8 0-6.7-3.3-11.1-8.5-11.5h-1.1zm-216.9 22.5c-5.4.3-8.7 4.7-8.7 11.6-.5 10.5 7.3 24.1 17 29.8 9.8 5.5 17.6 1 17.2-10.1 0-14.5-14.1-31.8-25.5-31.3z"/></svg>'
              },
            }
          },
        },
        blog: {
          blogTitle: 'Releases',
          blogDescription: 'CIPP release notes and updates...',
          blogSidebarTitle: 'Releases',
          blogSidebarCount: 0,
          path: 'releases',
          postsPerPage: 'ALL',
          archiveBasePath: null,
          routeBasePath: 'releases',
          showReadingTime: false,
          remarkPlugins: [a11yEmoji],
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} CyberDrain`,
          },
        },
        theme: {
          customCss: [
            require.resolve('./src/scss/custom.scss'),
            require.resolve('./src/scss/montserrat.scss'),
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
      colorMode: {
        respectPrefersColorScheme: true,
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      announcementBar: {
        id: 'announcementBar-2', // Increment on change
        content: `<span aria-label="star" role="img">⭐</span> If you like CIPP, please <a href="https://github.com/KelvinTegelaar/CIPP" target="_blank" rel="noopener noreferrer">star the project</a> and <a href="https://github.com/sponsors/KelvinTegelaar" target="_blank" rel="noopener noreferrer">consider Sponsoring the project</a>. Thanks! <span aria-label="heart" role="img">❤️</span>`,
        //content: `<span aria-label="warning" role="img">⚠️</span> This site is still under development. Please check <a href="https://cipp.app">cipp.app</a> for the latest live documentation and information on CIPP.`,
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
                type: 'doc',
                docId: 'knownbugs',
                label: 'Known Bugs',
                docsPluginId: 'general',
              }
            ],
          },
          {
            type: 'dropdown',
            position: 'left',
            label: 'Project',
            items: [
              {
                to: 'releases',
                label: 'Releases',
              },
              {
                label: 'Contributors',
                to: 'contributors',
              },
              {
                label: 'How to Contribute',
                to: 'contributing',
              },
              {
                type: 'doc',
                docId: 'faq',
                label: 'FAQ',
                docsPluginId: 'general',
              },
            ],
          },
          { 
            type: 'doc',
            docId: 'troubleshooting',
            label: 'Troubleshooting',
            position: 'left',
            docsPluginId: 'general',
          },
          { 
            type: 'dropdown',
            position: 'left',
            label: 'Security',
            items: [
              {
                to: 'security',
                label: 'Security Policy',
              },
              {
                to: 'vdp',
                label: 'Vulnerability Disclosure',
              },
            ]
          },
          { 
            to: 'https://discord.gg/cyberdrain',
            "aria-label": 'Discord',
            position: 'right',
            target: '_blank',
            className: 'discord-link',
          },
          {
            type: 'dropdown',
            position: 'right',
            label: 'GitHub',
            className: 'github-link',
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
              {
                label: 'API Documentation',
                to: '/docs/api/',
              },
              {
                label: 'Frequently Asked Questions',
                to: '/faq/',
              },
              {
                label: 'Known Bugs',
                to: '/docs/general/knownbugs/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Contributors',
                to: 'contributors',
              },
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
                label: 'CyberDrain Blog',
                href: 'https://cyberdrain.com',
              },
              {
                label: 'CyberDrain CtF',
                href: 'https://ctf.cyberdrain.com',
              },
              {
                label: 'Submit Feature Request',
                href: 'https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=feature_request.md&title=FEATURE+REQUEST%3A+',
              },
              {
                label: 'Submit Bug Report',
                href: 'https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+',
              },

            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CyberDrain. Built with <a href="https://docusaurus.io">Docusaurus</a>.<br /><span class="designedBy">Designed with <svg xmlns="http://www.w3.org/2000/svg" class="heart" width="24" height="24" viewBox="0 0 24 24"><path d="M14 20.408c-.492.308-.903.546-1.192.709-.153.086-.308.17-.463.252h-.002a.75.75 0 01-.686 0 16.709 16.709 0 01-.465-.252 31.147 31.147 0 01-4.803-3.34C3.8 15.572 1 12.331 1 8.513 1 5.052 3.829 2.5 6.736 2.5 9.03 2.5 10.881 3.726 12 5.605 13.12 3.726 14.97 2.5 17.264 2.5 20.17 2.5 23 5.052 23 8.514c0 3.818-2.801 7.06-5.389 9.262A31.146 31.146 0 0114 20.408z"/></svg>
        by <a href="https://homotechsual.dev">homotechsual</a></span>.`,
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
    [
      require.resolve('@docusaurus/plugin-client-redirects'),
      {
        redirects: [
          {
            to: '/docs/user/updating',
            from: '/GettingStarted/Updating/',
          },
          {
            to: '/docs/user/gettingstarted/',
            from: '/GettingStarted/Installation/',
          },
          {
            to: '/docs/user/gettingstarted/roles/',
            from: '/GettingStarted/Roles/',
          },
          {
            to: '/docs/general/faq/',
            from: '/GettingStarted/FAQ/',
          },
          {
            to: '/security/',
            from: '/GettingStarted/Security/',
          },
          {
            to: '/changelog/',
            from: '/GettingStarted/Changelog/',
          },
          {
            to: '/contributing/',
            from: '/GettingStarted/Contributions/',
          },
          {
            to: '/docs/user/usingcipp/identitymanagement/users/',
            from: '/IdentityManagement/Users/',
          },
          {
            to: '/docs/user/usingcipp/identitymanagement/groups/',
            from: '/IdentityManagement/Groups/',
          },
          {
            to: '/docs/user/usingcipp/tenantadministration/tenants/',
            from: '/TenantAdministration/Tenants/',
          },
          {
            to: '/docs/user/usingcipp/tenantadministration/standards/',
            from: '/TenantAdministration/Standards/',
          },
          {
            to: '/docs/user/usingcipp/tenantadministration/bestpracticeanalyser/',
            from: '/TenantAdministration/BestPracticesAnalyser/',
          },
          {
            to: '/docs/user/usingcipp/tenantadministration/domainsanalyser/',
            from: '/TenantAdministration/DomainAnalyser/',
          },
          {
            to: '/docs/user/usingcipp/endpointmanagement/applications/',
            from: '/EndpointManagement/Applications/',
          },
          {
            to: '/docs/user/usingcipp/endpointmanagement/addchocoapp/',
            from: '/EndpointManagement/AddChocoApp/',
          },
          {
            to: '/docs/user/usingcipp/endpointmanagement/autopilotdevices/',
            from: '/EndpointManagement/AutopilotDevices/',
          },
          {
            to: '/docs/user/usingcipp/endpointmanagement/autopilotprofiles/',
            from: '/EndpointManagement/AutopilotProfiles/',
          },
          {
            to: '/docs/user/usingcipp/endpointmanagement/autopilotstatuspage/',
            from: '/EndpointManagement/AutopilotStatusPage/',
          },
          {
            to: '/docs/user/usingcipp/endpointmanagement/mempolicytemplates/',
            from: '/EndpointManagement/IntunePolicyTemplates/',
          },
          {
            to: '/docs/user/usingcipp/endpointmanagement/defender/',
            from: '/EndpointManagement/Defender/',
          },
          {
            to: '/docs/user/usingcipp/teamsonedrivesharepoint/',
            from: '/OneDriveTeamsSharepoint/OneDrive/',
          },
          {
            to: '/docs/user/usingcipp/settings/settings/',
            from: '/CIPPSettings/ConfigurationSettings/',
          },
          {
            to: '/docs/user/usingcipp/settings/backendaccess/',
            from: '/CIPPSettings/BackendAccess/',
          },
          {
            to: '/docs/general/faq/',
            from: '/FAQ/FAQ/',
          },
          {
            to: '/docs/general/faq/',
            from: '/faq/',
          },
          {
            to: '/docs/general/troubleshooting/',
            from: '/troubleshooting/',
          },
          {
            to: '/docs/general/knownbugs/',
            from: '/knownbugs/',
          }
        ]
      }
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'dev',
        path: 'docs/dev',
        routeBasePath: 'docs/dev',
        sidebarPath: require.resolve('./sidebarsDev.js'),
        editUrl: 'https://github.com/KelvinTegelaar/CIPP/tree/website/',
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        sidebarCollapsible: true,
        sidebarCollapsed: false,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'general',
        path: 'docs/general',
        routeBasePath: 'docs/general',
        editUrl: 'https://github.com/KelvinTegelaar/CIPP/tree/website/',
        sidebarPath: require.resolve('./sidebarsGeneral.js'),
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
    ],
    [
      'docusaurus-plugin-plausible',
      {
        domain: 'cipp.app',
      },
    ],
  ],
  i18n: {
    defaultLocale: 'en-GB',
    locales: [
      'en-GB'
    ]
  },
};

module.exports = config;
