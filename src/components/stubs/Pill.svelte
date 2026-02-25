<script lang="ts">
  import type { Tag } from '../../types'

  export let tag: Tag | undefined = undefined
  export let label: string | undefined = undefined
  export let variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' =
    'default'

  const variantColors: Record<typeof variant, string> = {
    default: '#e4e4e7',
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  }

  $: displayText = tag?.name ?? label ?? ''
  $: backgroundColor = tag?.backgroundColor ?? variantColors[variant]
</script>

<span class="pill" style="background-color: {backgroundColor}">
  {displayText}
</span>
