<script lang="ts">
  import type { ListableTask, TaskStatus, TaskTableColumnConfig } from './types'
  import { MOCK_TASKS } from './mockData'
  import { initializeMockAPI, getMockAPI } from './mockApi'
  import TaskTableRow from './components/TaskTableRow.svelte'
  import { onMount } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'

  let tasks: ListableTask[] = []
  let selectedTaskIds = new SvelteSet<string>()
  let isBatchUpdating = false
  let errorMessage: string | null = null
  let uniqueAssignees: string[] = []

  const columnConfig: TaskTableColumnConfig = {
    showCheckbox: true,
    showStatus: true,
    showNumber: true,
    showTitle: true,
    showProjectName: true,
    showDueDate: true,
    showCoordinator: true,
    showAssignee: true,
    showAssignedTo: true,
    showUpdates: true,
    showTags: true,
    showWorkOrder: true,
    showArea: true,
    editTitle: true,
    editStatus: true,
    editAssignee: true
  }

  onMount(() => {
    initializeMockAPI(MOCK_TASKS)
    const api = getMockAPI()
    tasks = api.getAllTasks()
  })

  function handleTaskSelected(event: CustomEvent) {
    const task = event.detail as ListableTask
    alert(`Opened task: ${task.title}`)
  }

  function handleTaskUpdated(event: CustomEvent) {
    const updatedTask = event.detail as ListableTask
    tasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
  }

  function handleCheckboxChange(event: CustomEvent) {
    const detail = event.detail as {
      taskId: string
      selected: boolean
      shiftKey: boolean
      rowIndex?: number
    }

    if (detail.selected) {
      selectedTaskIds.add(detail.taskId)
    } else {
      selectedTaskIds.delete(detail.taskId)
    }

    selectedTaskIds = new SvelteSet(selectedTaskIds)
  }

  function handleSelectAllChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    if (input.checked) {
      selectAll()
    } else {
      clearSelection()
    }
  }

  function selectAll() {
    selectedTaskIds = new SvelteSet(tasks.map((t) => t.id))
  }

  function clearSelection() {
    selectedTaskIds = new SvelteSet()
    errorMessage = null
  }

  function canBulkUpdate() {
    return (
      (columnConfig.editStatus === true && columnConfig.showStatus === true) ||
      (columnConfig.editAssignee === true && columnConfig.showAssignee === true)
    )
  }

  function getUpdatedUniqueAssignees() {
    const assigness = new SvelteSet<string>(uniqueAssignees)

    tasks.forEach((task) => {
      if (task.assignedToName) {
        assigness.add(task.assignedToName.trim())
      }
    })

    uniqueAssignees = Array.from(assigness).sort()
    return uniqueAssignees
  }

  async function handleBulkUpdate(field: 'status' | 'assignee', value: string) {
    const api = getMockAPI()
    isBatchUpdating = true

    try {
      const updates: Partial<ListableTask> =
        field === 'status'
          ? { status: value as TaskStatus }
          : { assignedToName: value || null }

      const updatedTasks = await api.updateTasksBatch(
        Array.from(selectedTaskIds),
        updates
      )

      tasks = tasks.map((t) => {
        const updated = updatedTasks.find((u) => u.id === t.id)
        return updated ? updated : t
      })

      clearSelection()
    } catch (error: unknown) {
      if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = `Bulk update failed: ${String(error)}`
      }
    } finally {
      isBatchUpdating = false
    }
  }

  function handleBulkStatusChange(event: Event) {
    const select = event.currentTarget as HTMLSelectElement
    const newStatus = select.value
    if (newStatus) {
      handleBulkUpdate('status', newStatus)
      select.value = ''
    }
  }

  function handleBulkAssigneeChange(event: Event) {
    const select = event.currentTarget as HTMLSelectElement
    const newAssignee = select.value
    handleBulkUpdate('assignee', newAssignee)
    select.value = ''
  }

  const isSelectColumnVisible = true
</script>

<div class="flex flex-col p-4 gap-4">
  <div class="flex items-center justify-between gap-4">
    <h1 style="font-size: 1.5rem; font-weight: 600; margin: 0;">
      Task Management Table
    </h1>

    <div class="flex gap-2">
      <button on:click={selectAll}> Select All </button>
      <button disabled={!selectedTaskIds.size} on:click={clearSelection}>
        Clear Selection
      </button>
    </div>
  </div>

  {#if selectedTaskIds.size > 0 && canBulkUpdate()}
    <div class="p-4 bg-white border rounded-lg flex items-center gap-4">
      <strong>
        ✓ {selectedTaskIds.size}
        task{selectedTaskIds.size === 1 ? '' : 's'} selected
      </strong>

      {#if columnConfig.editStatus === true && columnConfig.showStatus === true}
        <select on:change={handleBulkStatusChange} disabled={isBatchUpdating}>
          <option value="">Change Status</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="InReview">In Review</option>
          <option value="Completed">Completed</option>
          <option value="Canceled">Canceled</option>
        </select>
      {/if}

      {#if columnConfig.editAssignee === true && columnConfig.showAssignee === true}
        <select on:change={handleBulkAssigneeChange} disabled={isBatchUpdating}>
          <option value="">Change Assignee</option>
          <option value="">Unassign</option>
          {#each getUpdatedUniqueAssignees() as assignee (assignee)}
            <option value={assignee}>{assignee}</option>
          {/each}
        </select>
      {/if}

      <button on:click={clearSelection} disabled={isBatchUpdating}>
        Cancel
      </button>

      {#if isBatchUpdating}
        <span class="text-blue-500" role="alert" aria-live="polite">
          Updating selected task{selectedTaskIds.size === 1 ? '' : 's'}...
        </span>
      {:else if errorMessage}
        <span class="text-red-600 text-xs" role="alert" aria-live="polite">
          {errorMessage}
        </span>
      {/if}
    </div>
  {/if}

  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          {#if columnConfig.showCheckbox}
            <th style="width: 50px;" class="text-center">
              <input
                type="checkbox"
                checked={selectedTaskIds.size === tasks.length &&
                  tasks.length > 0}
                on:change={handleSelectAllChange}
              />
            </th>
          {/if}
          {#if columnConfig.showStatus}
            <th style="min-width: 80px;">Status</th>
          {/if}
          {#if columnConfig.showNumber}
            <th style="min-width: 100px;">Number</th>
          {/if}
          {#if columnConfig.showTitle}
            <th>Title</th>
            {#if columnConfig.editTitle}
              <th style="min-width: 150px;">Edit Title</th>
            {/if}
          {/if}
          {#if columnConfig.showProjectName}
            <th style="min-width: 180px;">Project</th>
          {/if}
          {#if columnConfig.showDueDate}
            <th style="min-width: 120px;">Due Date</th>
          {/if}
          {#if columnConfig.showCoordinator}
            <th style="min-width: 80px;">Coordinator</th>
          {/if}
          {#if columnConfig.showAssignee}
            <th style="min-width: 120px;">Assignee</th>
          {/if}
          {#if columnConfig.showAssignedTo}
            <th style="min-width: 120px;">Assigned To</th>
          {/if}
          {#if columnConfig.showUpdates}
            <th style="min-width: 120px;">Updates</th>
          {/if}
          {#if columnConfig.showTags}
            <th style="min-width: 150px;">Tags</th>
          {/if}
          {#if columnConfig.showWorkOrder}
            <th style="min-width: 120px;">Work Order</th>
          {/if}
          {#if columnConfig.showArea}
            <th style="min-width: 120px;">Area</th>
          {/if}
        </tr>
      </thead>

      <tbody>
        {#each tasks as task, index (task.id)}
          <TaskTableRow
            {task}
            {columnConfig}
            isSelected={selectedTaskIds.has(task.id)}
            {isSelectColumnVisible}
            rowIndex={index}
            {isBatchUpdating}
            on:selected={handleTaskSelected}
            on:updated={handleTaskUpdated}
            on:checkboxSelectionChange={handleCheckboxChange}
          />
        {/each}
      </tbody>
    </table>
  </div>
</div>
