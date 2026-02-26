/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require('prettier-plugin-svelte')],
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
