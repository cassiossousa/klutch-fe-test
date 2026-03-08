import type { UserConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export const getViteBaseConfig = (command: 'build' | 'serve'): UserConfig => ({
  plugins: [svelte()],
  base: command === 'build' ? '/klutch-fe-test/' : '/',
  server: {
    port: 5173
  }
})
