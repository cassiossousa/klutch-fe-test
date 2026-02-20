import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MockAPI, initializeMockAPI, getMockAPI } from './mockApi'
import { ValidationError } from './types'
import type { ListableTask, UpdateTaskPayload } from './types'
import { MOCK_TASKS } from './mockData'

describe('MockAPI', () => {
  let api: MockAPI

  beforeEach(() => {
    api = new MockAPI(MOCK_TASKS)
    vi.useFakeTimers()
    vi.spyOn(Math, 'random')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('initializes with empty task map when no tasks provided', () => {
      const emptyApi = new MockAPI([])
      expect(emptyApi.getAllTasks()).toEqual([])
    })

    it('populates task map with initial tasks', () => {
      const tasks = api.getAllTasks()
      expect(tasks).toHaveLength(5)
      expect(tasks[0].id).toBe('task-1')
      expect(tasks[1].id).toBe('task-2')
    })
  })

  describe('getTask()', () => {
    it.each`
      taskId        | description                                 | expected
      ${'task-1'}   | ${'returns existing task'}                  | ${MOCK_TASKS[0]}
      ${'task-2'}   | ${'returns another existing task'}          | ${MOCK_TASKS[1]}
      ${'nonexist'} | ${'returns undefined for nonexistent task'} | ${undefined}
      ${''}         | ${'returns undefined for empty id'}         | ${undefined}
    `('$description when taskId is $taskId', ({ taskId, expected }) => {
      expect(api.getTask(taskId)).toEqual(expected)
    })
  })

  describe('getAllTasks()', () => {
    it('returns all tasks as array', () => {
      const tasks = api.getAllTasks()
      expect(Array.isArray(tasks)).toBe(true)
      expect(tasks).toHaveLength(5)
    })

    it('returns empty array when no tasks', () => {
      const emptyApi = new MockAPI([])
      expect(emptyApi.getAllTasks()).toEqual([])
    })
  })

  describe('updateTask()', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('throws ValidationError on network failure when random < 0.1', async () => {
      vi.mocked(Math.random).mockReturnValue(0.05)

      const promise = api.updateTask('task-1', { title: 'Updated' })
      vi.advanceTimersByTime(600)

      await expect(promise).rejects.toThrow(ValidationError)
    })

    it.each`
      description                            | taskId      | payload               | shouldError
      ${'throws error for nonexistent task'} | ${'99'}     | ${{ title: 'New' }}   | ${true}
      ${'throws error for empty title'}      | ${'task-1'} | ${{ title: '' }}      | ${true}
      ${'throws error for whitespace title'} | ${'task-1'} | ${{ title: '   ' }}   | ${true}
      ${'allows undefined title'}            | ${'task-1'} | ${{ status: 'Open' }} | ${false}
    `('$description', async ({ taskId, payload, shouldError }) => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise = api.updateTask(taskId, payload as UpdateTaskPayload)

      vi.advanceTimersByTime(600)

      if (shouldError) {
        await expect(promise).rejects.toThrow(ValidationError)
      } else {
        await expect(promise).resolves.toBeDefined()
      }
    })

    it('updates task properties from payload', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise = api.updateTask('task-1', {
        title: 'Updated Title',
        status: 'Completed'
      })

      vi.advanceTimersByTime(600)
      const result = await promise

      expect(result.title).toBe('Updated Title')
      expect(result.status).toBe('Completed')
      expect(result.id).toBe('task-1')
    })

    it('updates updatedAt timestamp', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)
      vi.setSystemTime(5000)

      const promise = api.updateTask('task-1', { title: 'Updated' })
      vi.advanceTimersByTime(600)
      const result = await promise

      expect(result.updatedAt).toBeGreaterThanOrEqual(5000)
      expect(result.updatedAt).toBeLessThanOrEqual(5600)
    })

    it('preserves unchanged properties during update', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise = api.updateTask('task-1', { title: 'Updated' })
      vi.advanceTimersByTime(600)
      const result = await promise

      expect(result.status).toBe('InProgress')
      expect(result.taskType).toBe('Todo')
      expect(result.priority).toBe('Normal')
    })

    it('persists updated task in map', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise = api.updateTask('task-1', { title: 'Updated' })
      vi.advanceTimersByTime(600)
      await promise

      const retrieved = api.getTask('task-1')
      expect(retrieved?.title).toBe('Updated')
    })

    it('logs success message after update', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise = api.updateTask('task-1', { title: 'Updated' })
      vi.advanceTimersByTime(600)
      await promise

      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ Mock API: Updated task',
        'task-1',
        { title: 'Updated' }
      )
    })

    it('handles multiple sequential updates', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise1 = api.updateTask('task-1', { title: 'First' })
      vi.advanceTimersByTime(600)
      const result1 = await promise1

      const promise2 = api.updateTask('task-1', { title: 'Second' })
      vi.advanceTimersByTime(600)
      const result2 = await promise2

      expect(result1.title).toBe('First')
      expect(result2.title).toBe('Second')
      expect(api.getTask('task-1')?.title).toBe('Second')
    })

    it('updates different tasks independently', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise1 = api.updateTask('task-1', { title: 'Updated 1' })
      vi.advanceTimersByTime(600)
      await promise1

      const promise2 = api.updateTask('task-2', { status: 'Completed' })
      vi.advanceTimersByTime(600)
      await promise2

      expect(api.getTask('task-1')?.title).toBe('Updated 1')
      expect(api.getTask('task-2')?.status).toBe('Completed')
    })

    it('allows updating with empty payload object', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise = api.updateTask('task-1', {})
      vi.advanceTimersByTime(600)
      const result = await promise

      expect(result.id).toBe('task-1')
      expect(result.title).toBe('Install HVAC system in unit 2B')
    })

    it('handles title update with non-empty whitespace', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise = api.updateTask('task-1', { title: '  Valid Title  ' })
      vi.advanceTimersByTime(600)
      const result = await promise

      expect(result.title).toBe('  Valid Title  ')
    })

    it('validates title string contains non-whitespace', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise = api.updateTask('task-1', { title: '   ' })
      vi.advanceTimersByTime(600)

      await expect(promise).rejects.toThrow(ValidationError)
    })

    it('throws error when updating nonexistent task', async () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const promise = api.updateTask('nonexistent-id', { title: 'Updated' })
      vi.advanceTimersByTime(600)

      await expect(promise).rejects.toThrow('Task not found')
    })
  })
})

describe('Singleton pattern', () => {
  describe('initializeMockAPI()', () => {
    it('creates MockAPI instance with provided tasks', () => {
      initializeMockAPI(MOCK_TASKS)
      const api = getMockAPI()

      expect(api).toBeInstanceOf(MockAPI)
      expect(api.getAllTasks()).toHaveLength(5)
    })

    it('replaces previous instance when called multiple times', () => {
      initializeMockAPI([MOCK_TASKS[0]])
      const firstApi = getMockAPI()

      initializeMockAPI(MOCK_TASKS)
      const secondApi = getMockAPI()

      expect(firstApi).not.toBe(secondApi)
      expect(secondApi.getAllTasks()).toHaveLength(5)
    })

    it('initializes with empty array', () => {
      initializeMockAPI([])
      const api = getMockAPI()

      expect(api.getAllTasks()).toEqual([])
    })
  })

  describe('getMockAPI()', () => {
    let getMockAPIFunc: () => MockAPI,
        initializeMockAPIFunc: (tasks: ListableTask[]) => void;
  
    beforeEach(async () => {
      // Reset modules to clear the singleton state
      vi.resetModules()

      // If we refer to getMockAPI and initializeMockAPI from the top import,
      // their singleton instance might have already been initialized by the time
      // we get to these tests, so we must re-import them in a fresh module state
      // where we're certain the instance hasn't been initialized.
      const {
        getMockAPI: freshGetMockAPI,
        initializeMockAPI: freshInitializeMockAPI
      } = await import('./mockApi')

      getMockAPIFunc = freshGetMockAPI;
      initializeMockAPIFunc = freshInitializeMockAPI;
    });

    it('throws error when getMockAPI is called before initialization', async () => {
      expect(() => {
        getMockAPIFunc()
      }).toThrow('Mock API not initialized. Call initializeMockAPI() first.')
    })

    it('returns API instance after initialization', () => {
      initializeMockAPIFunc(MOCK_TASKS)
      const api = getMockAPIFunc()
      expect(api).toBeDefined()
      expect(api.getAllTasks()).toEqual(MOCK_TASKS)
    })

    it('returns the same API instance across multiple calls', () => {
      initializeMockAPIFunc(MOCK_TASKS)
      const firstCall = getMockAPIFunc()
      const secondCall = getMockAPIFunc()
      expect(firstCall).toBe(secondCall)
    })
  })
})
