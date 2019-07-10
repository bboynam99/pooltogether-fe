module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    "plugin:jest/recommended",
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['jest'],
  env: {
    commonjs: true,
    es6: true,
    "jest/globals": true,
    node: true,
  },
  globals: {
    atob: false
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-explicit-any': 0,
  },
}
