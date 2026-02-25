<script lang="ts">
  let className: string = ''
  let style: string = 'padding-top: 0.5rem; padding-bottom: 0.5rem;'
  export { className as class }
  export { style }
  export let truncate: boolean = true
</script>

<td
  {...$$restProps}
  class={className}
  class:text-ellipsis={truncate}
  {style}
  on:click
>
  <slot />
</td>
