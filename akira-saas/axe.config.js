/**
 * Axe Core Accessibility Testing Configuration
 * WCAG 2.1 Level AA compliance
 */

module.exports = {
  branding: {
    brand: 'AKIRA SaaS',
    application: 'Accessibility Audit',
  },

  rules: [
    {
      id: 'color-contrast',
      enabled: true,
      options: {
        // WCAG AA: 4.5:1 for normal text, 3:1 for large text
        contrastRatio: 4.5,
      },
    },
    {
      id: 'aria-valid-attr-value',
      enabled: true,
    },
    {
      id: 'aria-required-children',
      enabled: true,
    },
    {
      id: 'aria-required-parent',
      enabled: true,
    },
    {
      id: 'button-name',
      enabled: true,
    },
    {
      id: 'form-field-multiple-labels',
      enabled: true,
    },
    {
      id: 'heading-order',
      enabled: true,
    },
    {
      id: 'image-alt',
      enabled: true,
    },
    {
      id: 'landmark-main-is-top-level',
      enabled: true,
    },
    {
      id: 'link-name',
      enabled: true,
    },
    {
      id: 'list',
      enabled: true,
    },
    {
      id: 'page-has-heading-one',
      enabled: true,
    },
    {
      id: 'region',
      enabled: true,
    },
  ],

  /**
   * Pages to audit on deployment
   */
  pages: [
    {
      name: 'Dashboard',
      url: 'http://localhost:5173',
      selectors: ['main', '[role="main"]'],
    },
    {
      name: 'Clients',
      url: 'http://localhost:5173/clients',
    },
    {
      name: 'Projects',
      url: 'http://localhost:5173/projects',
    },
    {
      name: 'Finance',
      url: 'http://localhost:5173/finance',
    },
    {
      name: 'Offers',
      url: 'http://localhost:5173/offers',
    },
    {
      name: 'Invoices',
      url: 'http://localhost:5173/invoices',
    },
  ],

  /**
   * Reporting options
   */
  reporting: {
    format: 'json',
    outputDir: './a11y-reports',
    failOnError: false, // Don't fail CI on warnings yet
    verbose: true,
  },
};
