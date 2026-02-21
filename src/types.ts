// Simplified type definitions from the real Punch codebase

export type TaskStatus =
  | 'Open'
  | 'InProgress'
  | 'InReview'
  | 'Completed'
  | 'Canceled'
export type TaskType = 'Todo' | 'ScheduledTask' | 'PunchItem' | 'WarrantyItem'
export type TaskPriority = 'Normal' | 'Urgent'

export interface Media {
  id: string
  mediaUrl: string
  mediaType: 'Image' | 'Video'
  createdAt: number
}

export interface Tag {
  id: string
  name: string
  backgroundColor: string
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface ListableTask {
  id: string
  title: string
  status: TaskStatus
  taskType: TaskType
  priority: TaskPriority
  dueDate: string | null // ISO date string
  startedAt: number | null
  endedAt: number | null
  createdAt: number
  updatedAt: number

  // Photo/media display
  photoCount: number
  featuredPhotoUrl: string | null

  // Tags
  tags: Tag[]

  // Comments/updates
  updatesCount: number
  lastCommentCreatedAt: number | null

  // Assignees (flattened for list view)
  coordinatorId: string | null
  coordinatorName: string | null
  coordinatorInitials: string | null
  assignedToId: string | null
  assignedToName: string | null
  assignedToInitials: string | null

  // Project (flattened)
  projectId: string | null
  projectName: string | null

  // Work order (flattened)
  workOrderId: string | null
  workOrderNumber: string | null

  // Area (flattened)
  areaName: string | null

  // Task number
  number: string | null
}

export interface TaskTableColumnConfig {
  showReorder?: boolean
  showCheckbox?: boolean
  showStatus?: boolean
  showTitle?: boolean
  showStartedAt?: boolean
  showEndedAt?: boolean
  showDueDate?: boolean
  showTags?: boolean
  showCoordinator?: boolean
  showAssignedTo?: boolean
  showUpdates?: boolean
  showPunchList?: boolean
  showProjectName?: boolean
  showWorkOrder?: boolean
  showArea?: boolean
  showNumber?: boolean
  showCreatedAt?: boolean
  showUpdatedAt?: boolean
}

export type UpdateTaskPayload = Partial<ListableTask>

export class ValidationError extends Error {
  messages: string[]

  constructor(messages: string[]) {
    super(messages.join(', '))
    this.messages = messages
    this.name = 'ValidationError'
  }

  static async handle(response: Response): Promise<void> {
    if (!response.ok) {
      const json = await response
        .json()
        .catch(() => ({ errors: ['Unknown error'] }))
      throw new ValidationError(json.errors || ['Unknown error'])
    }
  }
}
