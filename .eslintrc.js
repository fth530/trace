module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off',
  },
  overrides: [
    {
      files: ["scripts/**/*.js", "babel.config.js", "jest.config.js"],
      env: { node: true },
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ],
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'web-build/'],
};
