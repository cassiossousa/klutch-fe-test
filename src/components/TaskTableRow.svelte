<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte'
  import type { ListableTask, TaskTableColumnConfig } from '../types'
  import { getMockAPI } from '../mockApi'
  import Tr from './stubs/Tr.svelte'
  import Td from './stubs/Td.svelte'
  import StatusBadge from './stubs/StatusBadge.svelte'
  import UserAvatar from './stubs/UserAvatar.svelte'
  import Pill from './stubs/Pill.svelte'
  import MediaThumbnail from './stubs/MediaThumbnail.svelte'
  import { formatDisplayDate } from '../utils'

  export let task: ListableTask
  export let columnConfig: TaskTableColumnConfig
  export let isSelected: boolean = false
  export let isSelectColumnVisible: boolean = true
  export let rowIndex: number = 0
  export let isBatchUpdating: boolean = false // NEW: controlled by parent

  const dispatch = createEventDispatcher<{
    selected: ListableTask
    updated: ListableTask
    checkboxSelectionChange: {
      taskId: string
      selected: boolean
      shiftKey: boolean
      rowIndex: number
    }
  }>()

  const api = getMockAPI()

  // ─────────────────────────────
  // Inline Editing State
  // ─────────────────────────────
  let isEditing = false
  let editedTitle = ''
  let isSaving = false
  let errorMessage: string | null = null
  let inputEl: HTMLInputElement | null = null

  function handleClick(): void {
    if (!isEditing) {
      dispatch('selected', task)
    }
  }

  function handleCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement
    const mouseEvent = event as MouseEvent & { currentTarget: HTMLInputElement }

    dispatch('checkboxSelectionChange', {
      taskId: task.id,
      selected: target.checked,
      shiftKey: mouseEvent.shiftKey || false,
      rowIndex
    })
  }

  async function startEditing(event: MouseEvent) {
    event.stopPropagation()
    if (isBatchUpdating) return

    isEditing = true
    editedTitle = task.title
    errorMessage = null

    await tick()
    inputEl?.focus()
    inputEl?.select()
  }

  function cancelEditing() {
    isEditing = false
    editedTitle = task.title
    errorMessage = null
  }

  async function saveTitle() {
    if (editedTitle.trim() === task.title) {
      cancelEditing()
      return
    }

    isSaving = true
    errorMessage = null

    try {
      const updatedTask = await api.updateTask(task.id, {
        title: editedTitle.trim()
      })

      dispatch('updated', updatedTask)
      isEditing = false
    } catch (error: unknown) {
      if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = 'Failed to update title'
      }
    } finally {
      isSaving = false
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      saveTitle()
    } else if (event.key === 'Escape') {
      cancelEditing()
    }
  }
</script>

<Tr on:click={handleClick}>
  {#if isSelectColumnVisible && columnConfig.showCheckbox}
    <Td
      style="text-align: center; padding-top: 0.5rem; padding-bottom: 0.5rem;"
      on:click={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={isSelected}
        disabled={isBatchUpdating}
        on:change={handleCheckboxChange}
        on:click={(e) => e.stopPropagation()}
      />
    </Td>
  {/if}

  {#if columnConfig.showStatus}
    <Td>
      <StatusBadge status={task.status} />
    </Td>
  {/if}

  {#if columnConfig.showNumber}
    <Td>
      <span style="font-family: monospace; color: #71717a;">
        {task.number}
      </span>
    </Td>
  {/if}

  {#if columnConfig.showTitle}
    <Td>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        {#if task.photoCount > 0}
          <MediaThumbnail
            src={task.featuredPhotoUrl}
            alt={task.title}
            photoCount={task.photoCount}
            on:click={(e) => {
              e.stopPropagation()
              alert(
                `View ${task.photoCount} photo${task.photoCount > 1 ? 's' : ''}`
              )
            }}
          />
        {/if}

        {#if isEditing}
          <div style="display: flex; flex-direction: column; width: 100%;">
            <input
              bind:this={inputEl}
              bind:value={editedTitle}
              disabled={isSaving}
              on:keydown={handleKeydown}
              style="padding: 0.25rem; font-size: 0.875rem;"
            />

            {#if errorMessage}
              <span style="color: red; font-size: 0.75rem;">
                {errorMessage}
              </span>
            {/if}
          </div>
        {:else}
          <span style="cursor: pointer;" on:click={startEditing}>
            {task.title}
          </span>
        {/if}

        {#if isSaving}
          <span style="font-size: 0.75rem; color: #71717a;"> Saving... </span>
        {/if}
      </div>
    </Td>
  {/if}

  {#if columnConfig.showProjectName}
    <Td>{task.projectName}</Td>
  {/if}

  {#if columnConfig.showDueDate}
    <Td>
      {task.dueDate ? formatDisplayDate(task.dueDate) : '—'}
    </Td>
  {/if}

  {#if columnConfig.showCoordinator}
    <Td>
      {#if task.coordinatorInitials}
        <UserAvatar
          initials={task.coordinatorInitials}
          fullName={task.coordinatorName || undefined}
        />
      {:else}
        <span style="color: #a1a1aa;">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showAssignedTo}
    <Td>
      {#if task.assignedToInitials}
        <UserAvatar
          initials={task.assignedToInitials}
          fullName={task.assignedToName || undefined}
        />
      {:else}
        <span style="color: #a1a1aa;">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showUpdates}
    <Td>
      {#if task.updatesCount > 0}
        <span style="font-size: 0.875rem; color: #71717a;">
          {task.updatesCount} update{task.updatesCount > 1 ? 's' : ''}
        </span>
      {:else}
        <span style="color: #a1a1aa;">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showTags}
    <Td>
      {#if task.tags && task.tags.length > 0}
        <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
          {#each task.tags.slice(0, 2) as tag, i (tag + `-${i}`)}
            <Pill {tag} />
          {/each}
          {#if task.tags.length > 2}
            <Pill label={`+${task.tags.length - 2}`} variant="default" />
          {/if}
        </div>
      {:else}
        <span style="color: #a1a1aa;">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showWorkOrder}
    <Td>
      {#if task.workOrderId}
        <a
          href={`/work-orders/${task.workOrderId}`}
          style="color: #3b82f6; text-decoration: underline; cursor: pointer;"
          on:click={(e) => {
            e.stopPropagation()
            alert(`View work order: ${task.workOrderId}`)
          }}
        >
          #{task.workOrderNumber}
        </a>
      {:else}
        <span style="color: #a1a1aa;">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showArea}
    <Td>
      {task.areaName || '—'}
    </Td>
  {/if}
</Tr>
