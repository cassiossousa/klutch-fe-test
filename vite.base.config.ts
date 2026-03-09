import type { UserConfig } from 'vite'

import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

export const getViteBaseConfig = (command: 'build' | 'serve'): UserConfig => ({
  plugins: [
    svelte(),
    svelteTesting() // Add this line
  ],
  base: command === 'build' ? '/klutch-fe-test/' : '/',
  server: {
    port: 5173
  }
})
