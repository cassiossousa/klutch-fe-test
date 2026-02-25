<script lang="ts">
  import type { TaskStatus } from '../../types'

  export let status: TaskStatus

  const statusConfig: Record<
    TaskStatus,
    { icon: string; color: string; label: string }
  > = {
    Open: { icon: 'circle', color: '#a1a1aa', label: 'Open' },
    InProgress: {
      icon: 'clock_loader_40',
      color: '#22c55e',
      label: 'In Progress'
    },
    InReview: { icon: 'pending', color: '#f59e0b', label: 'In Review' },
    Completed: { icon: 'check_circle', color: '#22c55e', label: 'Completed' },
    Canceled: { icon: 'cancel', color: '#71717a', label: 'Canceled' }
  }

  $: config = statusConfig[status]
</script>

<div class="flex items-center gap-1" title={config.label}>
  <span
    class="material-symbols-rounded"
    style="color: {config.color}; font-size: 20px;"
  >
    {config.icon}
  </span>
  <div>{config.label}</div>
</div>
