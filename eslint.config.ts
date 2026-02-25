import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import vitest from '@vitest/eslint-plugin'
import svelte from 'eslint-plugin-svelte'
import svelteConfig from './svelte.config.js'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),

  // Base JS config
  js.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  // Svelte config
  ...svelte.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },

  {
    files: ['src/**/*.{ts,tsx,svelte}'],
    languageOptions: {
      // Specify a parser for each language, if needed:
      // parser: {
      //   ts: ts.parser,
      //   js: espree,    // Use espree for .js files (add: import espree from 'espree')
      //   typescript: ts.parser
      // },
      parser: tseslint.parser,
      parserOptions: {
        extraFileExtensions: ['.svelte'], // Add support for additional file extensions, such as .svelte
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        // We recommend importing and specifying svelte.config.js.
        // By doing so, some rules in eslint-plugin-svelte will automatically read the configuration and adjust their behavior accordingly.
        // While certain Svelte settings may be statically loaded from svelte.config.js even if you don’t specify it,
        // explicitly specifying it ensures better compatibility and functionality.
        //
        // If non-serializable properties are included, running ESLint with the --cache flag will fail.
        // In that case, please remove the non-serializable properties. (e.g. `svelteConfig: { ...svelteConfig, kit: { ...svelteConfig.kit, typescript: undefined }}`)
        svelteConfig
      },
      globals: {
        ...globals.browser
      }
    }
  },

  // Node config files
  {
    files: ['*.config.ts', 'eslint.config.ts'],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.node
    }
  },

  // Vitest config
  {
    files: ['src/**/*.test.{ts,tsx,svelte}'],
    plugins: {
      vitest
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals
      }
    },
    rules: {
      ...vitest.configs.recommended.rules
    }
  },

  // Disable formatting rules that conflict with Prettier
  eslintConfigPrettier
])
