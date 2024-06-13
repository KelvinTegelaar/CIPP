module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      // added for `import {component} from 'src/component' style imports`
      'eslint-import-resolver-custom-alias': {
        alias: {
          src: './src',
        },
        extensions: ['.js', '.jsx', '.json'],
      },
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react-hooks', 'import'],
  rules: {
    'no-unused-vars': 'off',
    'react/prop-types': 'warn',
    // this rule is annoying on strings with quotes in them
    'react/no-unescaped-entities': 'off',
  },
}
