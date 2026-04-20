import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '**/dist/',
      '**/test/_fixtures/',
      '**/test/_scenarios/',
      '**/test/_snapshots/',
      '**/client/',
      'test-projects/',
    ],
  },
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
