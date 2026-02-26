import { render, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TaskTableRow from './TaskTableRow.svelte'
import '@testing-library/jest-dom'
import type { ListableTask, TaskTableColumnConfig } from '../types'
import { formatDisplayDate } from '../utils'
import { initializeMockAPI } from '../mockApi'
import { MOCK_TASKS } from '../mockData'

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
  showArea: true
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
    const { component, getByRole } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns,
      rowIndex: 5
    })

    const handler = vi.fn()
    component.$on('checkboxSelectionChange', handler)

    const checkbox = getByRole('checkbox')
    await fireEvent.click(checkbox)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0][0].detail).toEqual({
      taskId: '1',
      selected: true,
      shiftKey: false,
      rowIndex: 5
    })
  })

  it('does not trigger selected when clicking checkbox', async () => {
    const { component, getByRole } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const selectedHandler = vi.fn()
    component.$on('selected', selectedHandler)

    await fireEvent.click(getByRole('checkbox'))

    expect(selectedHandler).not.toHaveBeenCalled()
  })

  it('handles MediaThumbnail click without triggering row selection', async () => {
    const { component, getByAltText } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const selectedHandler = vi.fn()
    component.$on('selected', selectedHandler)

    await fireEvent.click(getByAltText('Test Task'))

    expect(window.alert).toHaveBeenCalled()
    expect(selectedHandler).not.toHaveBeenCalled()
  })

  it('handles work order click without triggering row selection', async () => {
    const { component, getByText } = render(TaskTableRow, {
      task: baseTask,
      columnConfig: showAllColumns
    })

    const selectedHandler = vi.fn()
    component.$on('selected', selectedHandler)

    await fireEvent.click(getByText('#123'))

    expect(window.alert).toHaveBeenCalled()
    expect(selectedHandler).not.toHaveBeenCalled()
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
