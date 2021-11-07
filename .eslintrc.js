module.exports = {
  env: {
    browser: true,
    node: true,
    jquery: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'script',
  },
  plugins: ['html'],
  settings: {
    'html/indent': '+2',
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  globals: {
    feather: 'readonly',
    bootstrap: 'readonly',
  },
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    'no-var': 'warn',
    'no-unused-vars': 'warn',
  },
};
