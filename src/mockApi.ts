import type { ListableTask, UpdateTaskPayload } from './types'
import { ValidationError } from './types'

// Simulates network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Simulates occasional network errors (10% failure rate)
const shouldFail = () => Math.random() < 0.1

export class MockAPI {
  private tasks: Map<string, ListableTask> = new Map()

  constructor(initialTasks: ListableTask[]) {
    initialTasks.forEach((task) => this.tasks.set(task.id, task))
  }

  // ─────────────────────────────
  // Shared Helpers
  // ─────────────────────────────

  private async simulateNetwork(): Promise<void> {
    await delay(200 + Math.random() * 400)

    if (shouldFail()) {
      throw new ValidationError(['Network error: Unable to save changes'])
    }
  }

  private validatePayload(payload: UpdateTaskPayload): void {
    if (payload.title !== undefined && payload.title.trim().length === 0) {
      throw new ValidationError(['Title cannot be empty'])
    }
  }

  private applyUpdate(
    task: ListableTask,
    payload: UpdateTaskPayload
  ): ListableTask {
    return {
      ...task,
      ...payload,
      updatedAt: Date.now()
    }
  }

  // ─────────────────────────────
  // Single Update
  // ─────────────────────────────

  async updateTask(
    taskId: string,
    payload: UpdateTaskPayload
  ): Promise<ListableTask> {
    await this.simulateNetwork()

    const task = this.tasks.get(taskId)
    if (!task) {
      throw new ValidationError(['Task not found'])
    }

    this.validatePayload(payload)

    const updatedTask = this.applyUpdate(task, payload)

    this.tasks.set(taskId, updatedTask)

    console.log('✅ Mock API: Updated task', taskId, payload)

    return updatedTask
  }

  // ─────────────────────────────
  // Batch Update (Atomic)
  // ─────────────────────────────

  async updateTasksBatch(
    taskIds: string[],
    updates: UpdateTaskPayload
  ): Promise<ListableTask[]> {
    await this.simulateNetwork()

    if (taskIds.length === 0) {
      return []
    }

    // Validate all task IDs first (atomic behavior)
    const tasksToUpdate: ListableTask[] = []

    for (const id of taskIds) {
      const task = this.tasks.get(id)
      if (!task) {
        throw new ValidationError([`Task not found: ${id}`])
      }
      tasksToUpdate.push(task)
    }

    // Validate payload once
    this.validatePayload(updates)

    // Apply updates
    const updatedTasks = tasksToUpdate.map((task) => {
      const updated = this.applyUpdate(task, updates)
      this.tasks.set(task.id, updated)
      return updated
    })

    console.log('✅ Mock API: Batch updated tasks', taskIds, updates)

    return updatedTasks
  }

  // ─────────────────────────────
  // Read APIs
  // ─────────────────────────────

  getTask(taskId: string): ListableTask | undefined {
    return this.tasks.get(taskId)
  }

  getAllTasks(): ListableTask[] {
    return Array.from(this.tasks.values())
  }
}

// Singleton instance
let apiInstance: MockAPI | null = null

export function initializeMockAPI(tasks: ListableTask[]): void {
  apiInstance = new MockAPI(tasks)
}

export function getMockAPI(): MockAPI {
  if (!apiInstance) {
    throw new Error('Mock API not initialized. Call initializeMockAPI() first.')
  }
  return apiInstance
}
