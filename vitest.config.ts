import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // If you are testing components client-side, you need to set up a DOM environment.
      // If not all your files should have this environment, you can use a
      // `// @vitest-environment jsdom` comment at the top of the test files instead.
      environment: 'jsdom',
      globals: true,
      watch: false,
      coverage: {
        provider: 'v8',
        exclude: [
          ...(configDefaults.coverage.exclude || []),
          'svelte.config.js',
          'src/main.ts'
        ]
      }
    }
  })
)
