import { configDefaults, defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  test: {
    // If you are testing components client-side, you need to set up a DOM environment.
    // If not all your files should have this environment, you can use a
    // `// @vitest-environment jsdom` comment at the top of the test files instead.
    environment: 'jsdom',
    globals: true,
    watch: false,
    coverage: {
      provider: 'v8',
      exclude: [...(configDefaults.coverage.exclude || []), 'svelte.config.js']
    }
  }
})
