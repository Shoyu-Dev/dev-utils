module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // PRIVACY-CRITICAL: Warn about potential network calls
    'no-restricted-globals': [
      'error',
      {
        name: 'fetch',
        message: 'Network calls are not allowed for privacy. Use local processing only.'
      },
      {
        name: 'XMLHttpRequest',
        message: 'Network calls are not allowed for privacy. Use local processing only.'
      },
      {
        name: 'WebSocket',
        message: 'Network calls are not allowed for privacy. Use local processing only.'
      },
      {
        name: 'EventSource',
        message: 'Network calls are not allowed for privacy. Use local processing only.'
      }
    ]
  },
};
