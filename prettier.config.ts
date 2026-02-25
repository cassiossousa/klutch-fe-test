import sveltePlugin from 'prettier-plugin-svelte'

export default {
  plugins: [sveltePlugin],
  trailingComma: 'none',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte'
      }
    }
  ]
}
