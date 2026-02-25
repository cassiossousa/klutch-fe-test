<script lang="ts">
  import { onMount } from 'svelte'
  import type { ListableTask, TaskTableColumnConfig } from './types'
  import { MOCK_TASKS } from './mockData'
  import { initializeMockAPI, getMockAPI } from './mockApi'
  import TaskTableRow from './components/TaskTableRow.svelte'

  let tasks: ListableTask[] = []
  let selectedTaskIds = new Set<string>()

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

  function handleTaskSelected(event: CustomEvent<ListableTask>): void {
    console.log('Task selected:', event.detail)
    alert(`Opened task: ${event.detail.title}`)
  }

  function handleTaskUpdated(event: CustomEvent<ListableTask>): void {
    const updatedTask = event.detail
    tasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
  }

  function handleCheckboxChange(
    event: CustomEvent<{
      taskId: string
      selected: boolean
      shiftKey: boolean
      rowIndex?: number
    }>
  ): void {
    const { taskId, selected } = event.detail

    if (selected) {
      selectedTaskIds.add(taskId)
    } else {
      selectedTaskIds.delete(taskId)
    }
    selectedTaskIds = selectedTaskIds // Trigger reactivity
  }

  function selectAll(): void {
    selectedTaskIds = new Set(tasks.map((t) => t.id))
  }

  function clearSelection(): void {
    selectedTaskIds = new Set()
  }

  $: isSelectColumnVisible = selectedTaskIds.size > 0 || true
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
      <strong>{selectedTaskIds.size}</strong> task{selectedTaskIds.size === 1
        ? ''
        : 's'} selected
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
                indeterminate={selectedTaskIds.size > 0 &&
                  selectedTaskIds.size < tasks.length}
                on:change={(e) => {
                  if (e.currentTarget.checked) {
                    selectAll()
                  } else {
                    clearSelection()
                  }
                }}
              />
            </th>
          {/if}
          {#if columnConfig.showStatus}<th style="min-width: 80px;">Status</th
            >{/if}
          {#if columnConfig.showNumber}<th style="min-width: 100px;">Number</th
            >{/if}
          {#if columnConfig.showTitle}<th>Title</th>{/if}
          {#if columnConfig.showProjectName}<th style="min-width: 180px;"
              >Project</th
            >{/if}
          {#if columnConfig.showDueDate}<th style="min-width: 120px;"
              >Due Date</th
            >{/if}
          {#if columnConfig.showCoordinator}<th style="min-width: 80px;"
              >Coordinator</th
            >{/if}
          {#if columnConfig.showAssignedTo}<th style="min-width: 120px;"
              >Assigned To</th
            >{/if}
          {#if columnConfig.showUpdates}<th style="min-width: 120px;"
              >Updates</th
            >{/if}
          {#if columnConfig.showTags}<th style="min-width: 150px;">Tags</th
            >{/if}
          {#if columnConfig.showWorkOrder}<th style="min-width: 120px;"
              >Work Order</th
            >{/if}
          {#if columnConfig.showArea}<th style="min-width: 120px;">Area</th
            >{/if}
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

  <div class="p-4 bg-white border rounded-lg" style="margin-top: 2rem;">
    <h2 style="font-size: 1.25rem; font-weight: 600; margin-top: 0;">
      Your Tasks
    </h2>
    <ul style="line-height: 1.8;">
      <li>
        <strong>Task 1:</strong> Implement inline editing for the task title field
      </li>
      <li><strong>Task 2:</strong> Add batch update API and bulk actions UI</li>
    </ul>
    <p style="margin-top: 1rem; color: #52525b;">
      <strong>Current state:</strong> Titles are read-only. Selection works but no
      bulk actions yet.
    </p>
  </div>
</div>
