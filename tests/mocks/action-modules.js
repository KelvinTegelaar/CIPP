// Import before CippUniversalSearchV2 to give its Actions scope real modules (see require-context.js).
globalThis.__cippActionModules = import.meta.glob(
  '/src/components/**/*Actions.jsx',
  { eager: true }
)
