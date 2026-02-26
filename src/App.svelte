<script lang="ts">
  // eslint-disable-next-line svelte/no-svelte-internal
  import { onMount } from 'svelte/internal'
  import type { ListableTask, TaskTableColumnConfig } from './types'
  import { MOCK_TASKS } from './mockData'
  import { initializeMockAPI, getMockAPI } from './mockApi'
  import TaskTableRow from './components/TaskTableRow.svelte'

  let tasks: ListableTask[] = []
  let selectedTaskIds: Set<string> = new Set()

  const columnConfig: TaskTableColumnConfig = {
    showCheckbox: true,
    showStatus: true,
    showNumber: true,
    showTitle: true,
    showProjectName: true,
    showDueDate: true,
    showCoordinator: true,
    showAssignedTo: true,
    showUpdates: true,
    showTags: true,
    showWorkOrder: true,
    showArea: true
  }

  onMount(() => {
    initializeMockAPI(MOCK_TASKS)
    const api = getMockAPI()
    tasks = api.getAllTasks()
  })

  // ─────────────────────────────
  // Event Handlers
  // ─────────────────────────────

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

    // Trigger reactivity
    selectedTaskIds = new Set(selectedTaskIds)
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
    selectedTaskIds = new Set(tasks.map((t) => t.id))
  }

  function clearSelection() {
    selectedTaskIds = new Set()
  }

  // Keep column always visible
  const isSelectColumnVisible = true
</script>

<div class="p-4">
  <div
    class="flex items-center justify-between gap-4"
    style="margin-bottom: 1rem;"
  >
    <h1 style="font-size: 1.5rem; font-weight: 600; margin: 0;">
      Task Management Table
    </h1>

    <div class="flex gap-2">
      <button on:click={selectAll}>Select All</button>
      <button on:click={clearSelection}>Clear Selection</button>
    </div>
  </div>

  {#if selectedTaskIds.size > 0}
    <div class="p-4 bg-white border rounded-lg" style="margin-bottom: 1rem;">
      <strong>{selectedTaskIds.size}</strong>
      task{selectedTaskIds.size === 1 ? '' : 's'} selected
    </div>
  {/if}

  <div class="rounded-lg shadow" style="overflow-x: auto;">
    <table>
      <thead>
        <tr>
          {#if columnConfig.showCheckbox}
            <th style="width: 50px; text-align: center;">
              <input
                type="checkbox"
                checked={selectedTaskIds.size === tasks.length &&
                  tasks.length > 0}
                on:change={handleSelectAllChange}
              />
            </th>
          {/if}
          {#if columnConfig.showStatus}<th>Status</th>{/if}
          {#if columnConfig.showNumber}<th>Number</th>{/if}
          {#if columnConfig.showTitle}<th>Title</th>{/if}
          {#if columnConfig.showProjectName}<th>Project</th>{/if}
          {#if columnConfig.showDueDate}<th>Due Date</th>{/if}
          {#if columnConfig.showCoordinator}<th>Coordinator</th>{/if}
          {#if columnConfig.showAssignedTo}<th>Assigned To</th>{/if}
          {#if columnConfig.showUpdates}<th>Updates</th>{/if}
          {#if columnConfig.showTags}<th>Tags</th>{/if}
          {#if columnConfig.showWorkOrder}<th>Work Order</th>{/if}
          {#if columnConfig.showArea}<th>Area</th>{/if}
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
            on:selected={handleTaskSelected}
            on:updated={handleTaskUpdated}
            on:checkboxSelectionChange={handleCheckboxChange}
          />
        {/each}
      </tbody>
    </table>
  </div>
</div>
