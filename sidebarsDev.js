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
  devSidebar: [
    'settingup',
    'preparing',
    {
      type: 'category',
      label: 'CIPP React UI',
      link: {
        type: 'generated-index',
        title: 'CIPP React UI',
        description: "This is documentation for people developing the CIPP React UI.",
        slug: '/cipp',
      },
      collapsed: false,
      items: [
        'CIPP/structure'
      ],
    }
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
