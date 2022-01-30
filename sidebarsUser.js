/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  userSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      link: {
        type: 'generated-index',
        title: 'Getting Started',
        description: "Work through the steps below to install and configure CIPP and get it connected to your Microsoft 365 customer tenants.",
        slug: '/gettingstarted',
      },
      collapsed: false,
      items: [
        'gettingstarted/prerequisites/prerequisites',
        'gettingstarted/permissions/permissions',
        'gettingstarted/installation/installation',
        'gettingstarted/postinstall/postinstall',
        'gettingstarted/roles/roles'
      ]
    },
    {
      type: 'category',
      label: 'Using CIPP',
      link: {
        type: 'generated-index',
        title: 'Using CIPP',
        description: "Find out about the interface of CIPP and what information you might find on each page. Includes known issues or limitations.",
        slug: '/usingcipp',
      },
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Identity Management',
          link: {
            type: 'generated-index',
            title: 'Identity Management',
            description: "This area of CIPP is used to manage identities, groups and roles. It also contains the offboarding wizard and identity related reporting.",
            slug: '/usingcipp/identitymanagement',
          },
          collapsed: true,
          items: [
            'usingcipp/identitymanagement/users',
            'usingcipp/identitymanagement/groups',
          ],
        },
        {
          type: 'category',
          label: 'Tenant Administration',
          link: {
            type: 'generated-index',
            title: 'Tenant Administration',
            description: "This area of CIPP is used to manage your tenants and their settings. It also contains the conditional access policies administration area and the standards and best practices tools.",
            slug: '/usingcipp/tenantadministration',
          },
          collapsed: true,
          items: [
            'usingcipp/tenantadministration/tenants',
            'usingcipp/tenantadministration/standards',
            'usingcipp/tenantadministration/bestpracticeanalyser',
            'usingcipp/tenantadministration/domainanalyser',
          ],
        },
        {
          type: 'category',
          label: 'Security & Compliance',
          link: {
            type: 'generated-index',
            title: 'Security & Compliance',
            description: "This area of CIPP is used to stay on top of security and compliance for your tenants.",
            slug: '/usingcipp/securitycompliance',
          },
          collapsed: true,
          items: [
            'usingcipp/securitycompliance/alerts',
          ],
        },
        {
          type: 'category',
          label: 'Endpoint Management',
          link: {
            type: 'generated-index',
            title: 'Endpoint Management',
            description: "This area of CIPP is used to monitor and manage Microsoft Endpoint Manager, Microsoft Defender and Autopilot.",
            slug: '/usingcipp/endpointmanagement',
          },
          collapsed: true,
          items: [
            'usingcipp/endpointmanagement/applications',
            'usingcipp/endpointmanagement/addchocoapp',
            'usingcipp/endpointmanagement/autopilotdevices',
            'usingcipp/endpointmanagement/autopilotprofiles',
            'usingcipp/endpointmanagement/autopilotstatuspage',
            'usingcipp/endpointmanagement/mempolicytemplates',
            'usingcipp/endpointmanagement/defender',
          ],
        },
        {
          type: 'category',
          label: 'Teams & Sharepoint',
          link: {
            type: 'generated-index',
            title: 'Teams & Sharepoint',
            description: "This area of CIPP is used to manage Teams, OneDrive and Sharepoint.",
            slug: '/usingcipp/teamssharepoint',
          },
          collapsed: true,
          items: [
            'usingcipp/teamssharepoint/onedrive',
          ],
        },
        {
          type: 'category',
          label: 'Email & Exchange',
          link: {
            type: 'generated-index',
            title: 'Email & Exchange',
            description: "This area of CIPP is used to view and manage email and Exchange.",
            slug: '/usingcipp/emailexchange',
          },
          collapsed: true,
          items: [
            'usingcipp/emailexchange/mailboxes',
          ],
        },
        {
          type: 'category',
          label: 'Settings',
          link: {
            type: 'generated-index',
            title: 'Settings',
            description: "This area of CIPP is used to view and manage the CIPP application's settings.",
            slug: '/usingcipp/settings',
          },
          collapsed: true,
          items: [
            'usingcipp/settings/configurationsettings',
            'usingcipp/settings/backendaccess',
          ],
        },
      ],
    },
    'updating/updating',
    'security/security',
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Tutorial',
      items: ['hello'],
    },
  ],
   */
};

module.exports = sidebars;
