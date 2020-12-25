module.exports = {
  parser: 'babel-eslint',
  env: {
    'browser': true,
    'node': true,
    'jquery': true,
    'mocha': true,
    'jasmine': true,
    'webdriverio/wdio': true,
    'es6': true,
  },
  globals: {
    __DEV__: true,
    GA_TRACKING_ID: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: [
    'babel',
    'react',
    'jasmine',
    'webdriverio',
  ],
  rules: {
    'indent': 0,
    'linebreak-style': [
      'error',
      'unix',
    ],
    'no-case-declarations': 0,
    'no-extra-boolean-cast': 0,
    'no-useless-escape': 0,
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'always',
    ],
    'react/jsx-indent': 0,
    'react/no-string-refs': 0,
    'react/no-unescaped-entities': 0,
    'react/prop-types': 0,
  },
};
