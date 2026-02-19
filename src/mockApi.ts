import type {ListableTask, UpdateTaskPayload} from './types'
import {ValidationError} from './types'

// Simulates network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Simulates occasional network errors (10% failure rate)
const shouldFail = () => Math.random() < 0.1

export class MockAPI {
  private tasks: Map<string, ListableTask> = new Map()

  constructor(initialTasks: ListableTask[]) {
    initialTasks.forEach(task => this.tasks.set(task.id, task))
  }

  async updateTask(taskId: string, payload: UpdateTaskPayload): Promise<ListableTask> {
    // Simulate network delay (200-600ms)
    await delay(200 + Math.random() * 400)

    // Simulate occasional failures
    if (shouldFail()) {
      throw new ValidationError(['Network error: Unable to save changes'])
    }

    const task = this.tasks.get(taskId)
    if (!task) {
      throw new ValidationError(['Task not found'])
    }

    // Validate payload
    if (payload.title !== undefined && payload.title.trim().length === 0) {
      throw new ValidationError(['Title cannot be empty'])
    }

    // Apply updates
    const updatedTask: ListableTask = {
      ...task,
      ...payload,
      updatedAt: Date.now(),
    }

    this.tasks.set(taskId, updatedTask)

    console.log('✅ Mock API: Updated task', taskId, payload)

    return updatedTask
  }

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
