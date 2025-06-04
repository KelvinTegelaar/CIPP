import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        window: 'readonly',
        document: 'readonly'
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: false  // This disables unused directive warnings
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['off', { //this one
        varsIgnorePattern: '^React$',
        argsIgnorePattern: '^(props|_)', // Allow 'props' or anything starting with _
        ignoreRestSiblings: true
      }],
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'off', // This should disable stop-color warnings
      'no-useless-escape': 'off',
      'no-undef': 'off',
      'no-prototype-builtins': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/no-children-prop': 'off',
      'no-empty': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react/display-name': 'off',
      'no-control-regex': 'off',
      'react/jsx-key': 'off', // this one
      'no-self-assign': 'off',
      'no-redeclare': 'off',
      'valid-typeof': 'off',
      'react/jsx-no-undef': 'warn', //this one
      'no-dupe-keys': 'off', //this one
      'no-case-declarations': 'off', 
    }
  }
];