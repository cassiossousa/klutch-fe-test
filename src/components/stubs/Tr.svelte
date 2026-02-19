<script lang="ts">
  export let draggable: string | boolean = false
</script>

<tr {...$$restProps} {draggable}>
  <slot />
</tr>
