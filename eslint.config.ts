import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'

export default [
  // Ignore build output
  {
    ignores: ['dist', 'node_modules', '.svelte-kit']
  },

  // Base JS config
  js.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  // Svelte config
  ...svelte.configs['flat/recommended'],

  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte']
      },
      globals: {
        ...globals.browser
      }
    }
  },

  {
    files: ['**/*.ts', '**/*.svelte'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },

  // Vitest globals
  {
    files: ['**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },

  // Disable formatting conflicts
  prettier
]
