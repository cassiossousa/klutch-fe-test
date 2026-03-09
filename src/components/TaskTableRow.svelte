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

  function handleEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const mouseEvent = e as unknown as MouseEvent
      startEditing(mouseEvent)
    }
  }
</script>

<Tr on:click={handleClick} role="row" id={`task-row-${task.id}`}>
  {#if isSelectColumnVisible && columnConfig.showCheckbox}
    <Td class="text-center py-2" on:click={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={isSelected}
        disabled={isBatchUpdating}
        on:change={handleCheckboxChange}
        on:click={(e) => e.stopPropagation()}
        aria-label={`Select task ${task.title}`}
        aria-describedby={`task-row-${task.id}`}
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
      <span class="font-mono text-zinc-400">
        {task.number}
      </span>
    </Td>
  {/if}

  {#if columnConfig.showTitle}
    <Td>
      <div class="flex items-center gap-2">
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
          <div class="flex flex-col w-full">
            <input
              bind:this={inputEl}
              bind:value={editedTitle}
              disabled={isSaving}
              class="p-1 text-sm"
              id={`edit-title-${task.id}`}
              aria-label={`Edit task title for ${task.title}`}
              aria-describedby={errorMessage ? `error-${task.id}` : undefined}
              aria-invalid={errorMessage ? 'true' : 'false'}
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  saveTitle()
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  cancelEditing()
                }
              }}
            />

            {#if errorMessage}
              <span
                class="text-red-600 text-xs"
                id={`error-${task.id}`}
                role="alert"
                aria-live="polite"
              >
                {errorMessage}
              </span>
            {/if}
          </div>
        {:else}
          <span
            id={`title-${task.id}`}
            role="button"
            tabindex="0"
            aria-label={`Task: ${task.title}`}
          >
            {task.title}
          </span>
        {/if}
      </div>
    </Td>
    {#if columnConfig.editTitle}
      <Td>
        <div class="flex items-center gap-2">
          {#if isEditing}
            <button
              type="button"
              disabled={isSaving}
              aria-label="Save"
              title="Save"
              on:click={saveTitle}
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  saveTitle()
                }
              }}
              class="bg-none border-none cursor-pointer p-0"
            >
              <span class="material-symbols-rounded"> Save </span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              aria-label="Cancel"
              title="Cancel"
              on:click={cancelEditing}
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  cancelEditing()
                }
              }}
              class="bg-none border-none cursor-pointer p-0"
            >
              <span class="material-symbols-rounded"> Cancel </span>
            </button>
            {#if isSaving}
              <span class="text-blue-500" role="alert" aria-live="polite">
                Saving...
              </span>
            {/if}
          {:else}
            <button
              type="button"
              on:click={startEditing}
              on:keydown={handleEditKeydown}
              aria-label="Edit"
              title="Edit"
              class="bg-none border-none cursor-pointer p-0"
            >
              <span class="material-symbols-rounded"> Edit </span>
            </button>
          {/if}
        </div>
      </Td>
    {/if}
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
        <span class="flex items-center justify-center text-zinc-400">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showAssignee}
    <Td>
      {task.assignedToName || '—'}
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
        <span class="flex items-center justify-center text-zinc-400">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showUpdates}
    <Td>
      {#if task.updatesCount > 0}
        <span class="text-sm text-zinc-600">
          {task.updatesCount} update{task.updatesCount > 1 ? 's' : ''}
        </span>
      {:else}
        <span class="text-zinc-400">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showTags}
    <Td>
      {#if task.tags && task.tags.length > 0}
        <div class="flex gap-1 flex-wrap">
          {#each task.tags.slice(0, 2) as tag, i (tag + `-${i}`)}
            <Pill {tag} />
          {/each}
          {#if task.tags.length > 2}
            <Pill label={`+${task.tags.length - 2}`} variant="default" />
          {/if}
        </div>
      {:else}
        <span class="text-zinc-400">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showWorkOrder}
    <Td>
      {#if task.workOrderId}
        <a
          href={`/work-orders/${task.workOrderId}`}
          class="text-blue-500 underline cursor-pointer"
          on:click={(e) => {
            e.stopPropagation()
            alert(`View work order: ${task.workOrderId}`)
          }}
        >
          #{task.workOrderNumber}
        </a>
      {:else}
        <span class="text-zinc-400">—</span>
      {/if}
    </Td>
  {/if}

  {#if columnConfig.showArea}
    <Td>
      {task.areaName || '—'}
    </Td>
  {/if}
</Tr>
