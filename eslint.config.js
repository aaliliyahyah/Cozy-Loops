
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/components/**', '@/providers/**', '@/services/**', '@/types/**', '@/theme', '@/theme/**'],
          message: 'Keep routes thin: import feature screens or navigators and put application logic outside src/app.',
        }],
      }],
    },
  },
]);
