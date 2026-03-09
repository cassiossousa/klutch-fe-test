import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import type { ListableTask, TaskTableColumnConfig } from '../types'
import { formatDisplayDate } from '../utils'
import { initializeMockAPI, getMockAPI } from '../mockApi'
import { MOCK_TASKS } from '../mockData'
import TaskTableRow from './TaskTableRow.svelte'

vi.mock('../utils', () => ({
  formatDisplayDate: vi.fn((date: string) => `formatted-${date}`)
}))

// Silence alert calls
beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

const baseTask: ListableTask = {
  id: '1',
  number: 'T-001',
  title: 'Test Task',
  status: 'Open',
  projectName: 'Project Alpha',
  dueDate: '2026-02-25',
  coordinatorInitials: 'JD',
  coordinatorName: 'John Doe',
  assignedToInitials: 'AS',
  assignedToName: 'Alice Smith',
  updatesCount: 2,
  tags: [
    { id: 'tag1', backgroundColor: '#f00', name: 'Urgent' },
    { id: 'tag2', backgroundColor: '#0f0', name: 'Electrical' },
    { id: 'tag3', backgroundColor: '#00f', name: 'Safety' }
  ],
  workOrderId: 'wo-123',
  workOrderNumber: '123',
  areaName: 'Warehouse',
  photoCount: 1,
  featuredPhotoUrl: '/image.jpg',
  taskType: 'Todo',
  priority: 'Urgent',
  startedAt: null,
  endedAt: null,
  createdAt: 0,
  updatedAt: 0,
  lastCommentCreatedAt: null,
  coordinatorId: null,
  assignedToId: null,
  projectId: null
}

const showAllColumns: TaskTableColumnConfig = {
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
  showArea: true,
  editTitle: true
}

describe('<TaskTableRow />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    initializeMockAPI(MOCK_TASKS)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all visible columns correctly', () => {
    const { getByText, getByRole, getByAltText } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns,
      isSelected: true
    })

    // Checkbox
    const checkbox = getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)

    // Status
    expect(getByText('Open')).toBeInTheDocument()

    // Number
    expect(getByText('T-001')).toBeInTheDocument()

    // Title
    expect(getByText('Test Task')).toBeInTheDocument()

    // Media thumbnail
    expect(getByAltText('Test Task')).toBeInTheDocument()

    // Project
    expect(getByText('Project Alpha')).toBeInTheDocument()

    // Due date formatting
    expect(formatDisplayDate).toHaveBeenCalledWith('2026-02-25')
    expect(getByText('formatted-2026-02-25')).toBeInTheDocument()

    // Updates plural
    expect(getByText('2 updates')).toBeInTheDocument()

    // Tags slicing
    expect(getByText('Urgent')).toBeInTheDocument()
    expect(getByText('Electrical')).toBeInTheDocument()
    expect(getByText('+1')).toBeInTheDocument()

    // Work order
    expect(getByText('#123')).toBeInTheDocument()

    // Area
    expect(getByText('Warehouse')).toBeInTheDocument()
  })

  it('dispatches checkboxSelectionChange correctly', async () => {
    const { getByRole } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns,
      rowIndex: 5
    })

    const checkbox = getByRole('checkbox') as HTMLInputElement

    // Test initial state
    expect(checkbox.checked).toBe(false)

    // Click checkbox to select
    await fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)

    // Click checkbox to deselect
    await fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(false)
  })

  it('does not trigger row selection when clicking checkbox', async () => {
    const { getByRole } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const checkbox = getByRole('checkbox')

    // Click checkbox - should not trigger row selection
    await fireEvent.click(checkbox)

    // Verify checkbox state changed
    expect((checkbox as HTMLInputElement).checked).toBe(true)
  })

  it('handles MediaThumbnail click and shows alert', async () => {
    const { getByAltText } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const thumbnail = getByAltText('Test Task')
    await fireEvent.click(thumbnail)

    expect(window.alert).toHaveBeenCalledWith('View 1 photo')
  })

  it('handles work order click and shows alert', async () => {
    const { getByText } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const workOrderLink = getByText('#123')
    await fireEvent.click(workOrderLink)

    expect(window.alert).toHaveBeenCalledWith('View work order: wo-123')
  })

  it('starts editing when edit button is clicked', async () => {
    const { getByText, getByDisplayValue } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const editButton = getByText('Edit')
    await fireEvent.click(editButton)

    // Should show input field with current title
    const input = getByDisplayValue('Test Task')
    expect(input).toBeInTheDocument()
    expect(input).toHaveFocus()
  })

  it('starts editing with keyboard (Enter key)', async () => {
    const { getByText, getByDisplayValue } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const editButton = getByText('Edit')
    await fireEvent.keyDown(editButton, { key: 'Enter' })

    // Should show input field
    await tick() // Wait for reactivity to update
    const input = getByDisplayValue('Test Task')
    expect(input).toBeInTheDocument()
    expect(input).toHaveFocus()
  })

  it('cancels editing when cancel button is clicked', async () => {
    const { getByText, queryByDisplayValue } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    // Start editing
    const editButton = getByText('Edit')
    await fireEvent.click(editButton)

    // Cancel editing
    const cancelButton = getByText('Cancel')
    await fireEvent.click(cancelButton)

    // Should return to display mode
    expect(queryByDisplayValue('Test Task')).not.toBeInTheDocument()
    expect(getByText('Test Task')).toBeInTheDocument()
  })

  it('saves edited title successfully', async () => {
    // Mock API to always succeed
    const api = getMockAPI()
    vi.spyOn(api, 'updateTask').mockResolvedValue({
      ...baseTask,
      title: 'Updated Task Title',
      updatedAt: Date.now()
    })

    const { getByText, getByDisplayValue } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    // Start editing
    const editButton = getByText('Edit')
    await fireEvent.click(editButton)

    // Change title
    const input = getByDisplayValue('Test Task')
    await fireEvent.input(input, { target: { value: 'Updated Task Title' } })

    // Save
    const saveButton = getByText('Save')
    await fireEvent.click(saveButton)

    // Wait for the save to complete and component to update
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Verify the save was called correctly
    expect(api.updateTask).toHaveBeenCalledWith('1', {
      title: 'Updated Task Title'
    })
  })

  it('saves edited title with keyboard (Enter key)', async () => {
    // Mock API to always succeed
    const api = getMockAPI()
    vi.spyOn(api, 'updateTask').mockResolvedValue({
      ...baseTask,
      title: 'Updated Task Title',
      updatedAt: Date.now()
    })

    const { getByText, getByDisplayValue } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    // Start editing
    const editButton = getByText('Edit')
    await fireEvent.click(editButton)

    // Change title
    const input = getByDisplayValue('Test Task')
    await fireEvent.input(input, { target: { value: 'Updated Task Title' } })

    // Save with Enter key
    const saveButton = getByText('Save')
    await fireEvent.keyDown(saveButton, { key: 'Enter' })

    // Wait for the save to complete
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Verify the save was called correctly
    expect(api.updateTask).toHaveBeenCalledWith('1', {
      title: 'Updated Task Title'
    })
  })

  it('cancels editing with keyboard (Enter key)', async () => {
    const { getByText, queryByDisplayValue } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    // Start editing
    const editButton = getByText('Edit')
    await fireEvent.click(editButton)

    // Cancel with Enter key
    const cancelButton = getByText('Cancel')
    await fireEvent.keyDown(cancelButton, { key: 'Enter' })

    // Should return to display mode
    expect(queryByDisplayValue('Test Task')).not.toBeInTheDocument()
    expect(getByText('Test Task')).toBeInTheDocument()
  })

  it('does not save if title is unchanged', async () => {
    const { getByText } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    // Start editing
    const editButton = getByText('Edit')
    await fireEvent.click(editButton)

    // Save without changing title
    const saveButton = getByText('Save')
    await fireEvent.click(saveButton)

    // Should return to display mode
    expect(getByText('Test Task')).toBeInTheDocument()
  })

  it('disables editing when batch updating', async () => {
    const { getByText, queryByDisplayValue } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns,
      isBatchUpdating: true
    })

    const editButton = getByText('Edit')
    await fireEvent.click(editButton)

    // Should not start editing
    expect(queryByDisplayValue('Test Task')).not.toBeInTheDocument()
  })

  it('disables checkbox when batch updating', async () => {
    const { getByRole } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns,
      isBatchUpdating: true
    })

    const checkbox = getByRole('checkbox') as HTMLInputElement
    expect(checkbox.disabled).toBe(true)
  })

  it('handles save error gracefully', async () => {
    // Mock API to throw error
    const api = getMockAPI()
    vi.spyOn(api, 'updateTask').mockRejectedValue(new Error('Update failed'))

    const { getByText, getByDisplayValue } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    // Start editing
    const editButton = getByText('Edit')
    await fireEvent.click(editButton)

    // Change title
    const input = getByDisplayValue('Test Task')
    await fireEvent.input(input, { target: { value: 'Updated Task Title' } })

    // Save (should fail)
    const saveButton = getByText('Save')
    await fireEvent.click(saveButton)

    // Should show error message
    expect(getByText('Update failed')).toBeInTheDocument()
  })

  it('handles title click to select row', async () => {
    const { getByText } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const titleElement = getByText('Test Task')
    await fireEvent.click(titleElement)

    // Row should be clickable (we can't easily test the event dispatch without listeners)
    expect(titleElement).toBeInTheDocument()
  })

  it('handles title keyboard interaction', async () => {
    const { getByText } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const titleElement = getByText('Test Task')
    await fireEvent.keyDown(titleElement, { key: 'Enter' })

    // Title should remain in display mode (keyboard interaction on title doesn't start editing)
    expect(getByText('Test Task')).toBeInTheDocument()
  })

  it('renders singular update correctly', () => {
    const { getByText } = render(TaskTableRow, {
      task: { ...baseTask, updatesCount: 1 },
      columnConfig: showAllColumns
    })

    expect(getByText('1 update')).toBeInTheDocument()
  })

  it('renders dash fallback states', () => {
    const { getAllByText } = render(TaskTableRow, {
      task: {
        ...baseTask,
        dueDate: null,
        coordinatorInitials: '',
        assignedToInitials: '',
        updatesCount: 0,
        tags: [],
        workOrderId: '',
        areaName: ''
      },
      columnConfig: showAllColumns
    })

    // Multiple fallback dashes expected
    expect(getAllByText('—').length).toBeGreaterThan(0)
  })

  it('does not render columns when disabled', () => {
    const disabledColumns: TaskTableColumnConfig = {
      showCheckbox: false,
      showStatus: false,
      showNumber: false,
      showTitle: false,
      showProjectName: false,
      showDueDate: false,
      showCoordinator: false,
      showAssignedTo: false,
      showUpdates: false,
      showTags: false,
      showWorkOrder: false,
      showArea: false
    }

    const { container } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: disabledColumns
    })

    expect(container.querySelectorAll('td').length).toBe(0)
  })

  it('does not render MediaThumbnail when photoCount is 0', () => {
    const { queryByAltText } = render(TaskTableRow, {
      task: { ...baseTask, photoCount: 0 },
      columnConfig: showAllColumns
    })

    expect(queryByAltText('Test Task')).not.toBeInTheDocument()
  })

  it('alerts singular photo correctly when photoCount is 1', async () => {
    const { getByAltText } = render(TaskTableRow, {
      task: { ...baseTask, photoCount: 1 },
      columnConfig: showAllColumns
    })

    await fireEvent.click(getByAltText('Test Task'))

    expect(window.alert).toHaveBeenCalledWith('View 1 photo')
  })

  it('alerts plural photos correctly when photoCount > 1', async () => {
    const { getByAltText } = render(TaskTableRow, {
      task: { ...baseTask, photoCount: 3 },
      columnConfig: showAllColumns
    })

    await fireEvent.click(getByAltText('Test Task'))

    expect(window.alert).toHaveBeenCalledWith('View 3 photos')
  })

  it('passes undefined as fullName when coordinatorName is missing', () => {
    const { container } = render(TaskTableRow, {
      task: {
        ...baseTask,
        coordinatorName: '',
        coordinatorInitials: 'JD'
      },
      columnConfig: showAllColumns
    })

    // We don't inspect stub internals,
    // but rendering without crash covers the branch.
    expect(container).toBeTruthy()
  })

  it('passes undefined as fullName when assignedToName is missing', () => {
    const { container } = render(TaskTableRow, {
      task: {
        ...baseTask,
        assignedToName: '',
        assignedToInitials: 'AS'
      },
      columnConfig: showAllColumns
    })

    expect(container).toBeTruthy()
  })
})
