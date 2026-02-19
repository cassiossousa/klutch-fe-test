<script lang="ts">
  let className: string = ''
  export {className as class}
  export let truncate: boolean = true
</script>

<td {...$$restProps} class={className} class:text-ellipsis={truncate} on:click>
  <slot />
</td>
