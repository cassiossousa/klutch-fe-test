import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MockAPI, initializeMockAPI, getMockAPI } from './mockApi'
import { ValidationError } from './types'
import type { ListableTask, TaskStatus, UpdateTaskPayload } from './types'
import { MOCK_TASKS } from './mockData'

describe('MockAPI', () => {
  let api: MockAPI

  beforeEach(() => {
    api = new MockAPI(MOCK_TASKS)
  })

  describe('getTask()', () => {
    it('returns existing task by its id', () => {
      const task = api.getTask(MOCK_TASKS[0].id)
      expect(task).toEqual(MOCK_TASKS[0])
    })

    it('returns undefined if there is no task with the given id', () => {
      const task = api.getTask('non existent ID')
      expect(task).toBeUndefined()
    })
  })

  describe('getAllTasks()', () => {
    it('returns all tasks as an array', () => {
      const tasks = api.getAllTasks()

      // getAllTasks() does not keep the original order of the input array,
      // so this is to confirm both are equal.
      expect(tasks).toHaveLength(MOCK_TASKS.length)
      expect(tasks.sort((a, b) => a.id.localeCompare(b.id))).toEqual(
        MOCK_TASKS.sort((a, b) => a.id.localeCompare(b.id))
      )
    })
  })

  describe('updateTask()', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.useFakeTimers()
      vi.spyOn(Math, 'random')
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    describe('when it should fail (second Math.random() call < 0.1)', () => {
      let firstRandom: number, secondRandom: number

      beforeEach(() => {
        firstRandom = 0.9
        secondRandom = 0.05

        vi.mocked(Math.random)
          .mockReturnValueOnce(firstRandom)
          .mockReturnValueOnce(secondRandom)
      })

      it('throws ValidationError accusing Network error', async () => {
        const promise = api.updateTask('task-1', { title: 'Updated' })
        vi.advanceTimersByTime(200 + 400 * firstRandom)
        await promise.catch((err) => {
          expect(err).toBeInstanceOf(ValidationError)
          expect(err.message).toBe('Network error: Unable to save changes')
        })
      })
    })

    describe('when it should NOT fail (second Math.random() call >= 0.1', () => {
      let firstRandom: number, secondRandom: number

      beforeEach(() => {
        firstRandom = 0.7
        secondRandom = 0.5

        vi.mocked(Math.random)
          .mockReturnValueOnce(firstRandom)
          .mockReturnValueOnce(secondRandom)
      })

      it('throws ValidationError when there is no task with the given id', async () => {
        const promise = api.updateTask('nonexisting-id', { title: 'Updated' })
        vi.advanceTimersByTime(200 + 400 * firstRandom)

        try {
          await promise
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(ValidationError)
          expect((err as ValidationError).message).toBe('Task not found')
        }
      })

      it.each`
        description                    | payload
        ${'title is empty'}            | ${{ title: '' }}
        ${'title is just whitespaces'} | ${{ title: '   ' }}
      `('throws ValidationError when $description', async ({ payload }) => {
        const promise = api.updateTask(MOCK_TASKS[0].id, payload)
        vi.advanceTimersByTime(200 + 400 * firstRandom)

        try {
          await promise
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(ValidationError)
          expect((err as ValidationError).message).toBe('Title cannot be empty')
        }
      })

      it('updates task properties from payload only, and persists on task map', async () => {
        const payload = {
          title: 'Updated Title',
          status: 'Completed' as TaskStatus
        }

        const promise = api.updateTask(MOCK_TASKS[0].id, payload)
        vi.advanceTimersByTime(200 + 400 * firstRandom)
        const result = await promise

        // Updates are returned by the promise
        expect(result.id).toBe(MOCK_TASKS[0].id)
        expect(result.title).toBe(payload.title)
        expect(result.status).toBe(payload.status)

        // Properties not on payload are not updated
        expect(result.taskType).toBe(MOCK_TASKS[0].taskType)
        expect(result.priority).toBe(MOCK_TASKS[0].priority)

        // Updates are persisted
        const persistedTask = api.getTask(MOCK_TASKS[0].id)
        expect(persistedTask).toBeDefined()
        expect(persistedTask!.title).toBe(payload.title)
        expect(persistedTask!.status).toBe(payload.status)
        expect(persistedTask!.taskType).toBe(MOCK_TASKS[0].taskType)
        expect(persistedTask!.priority).toBe(MOCK_TASKS[0].priority)
      })

      it('updates updatedAt timestamp', async () => {
        const initialTime = 5000
        vi.setSystemTime(initialTime)

        const promise = api.updateTask(MOCK_TASKS[0].id, { title: 'Updated' })
        vi.advanceTimersByTime(200 + 400 * firstRandom)
        const result = await promise

        // Timestamp updates will be between initialTime and
        // how much we await for the promise to resolve.
        expect(result.updatedAt).toBeGreaterThanOrEqual(initialTime)
        expect(result.updatedAt).toBeLessThanOrEqual(
          initialTime + 200 + 400 * firstRandom
        )
      })

      it('logs success message after update', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const payload = { title: 'Updated' }
        const promise = api.updateTask(MOCK_TASKS[0].id, payload)

        vi.advanceTimersByTime(200 + 400 * firstRandom)
        await promise

        expect(consoleSpy).toHaveBeenCalledWith(
          '✅ Mock API: Updated task',
          MOCK_TASKS[0].id,
          payload
        )
      })

      it('allows updating with empty payload object', async () => {
        const promise = api.updateTask(MOCK_TASKS[0].id, {})
        vi.advanceTimersByTime(200 + 400 * firstRandom)
        const result = await promise
        expect(result.id).toBe(MOCK_TASKS[0].id)
        expect(result.title).toBe(MOCK_TASKS[0].title)
      })
    })
  })
})

describe('initializeMockAPI()', () => {
  it('creates MockAPI instance with the provided tasks', () => {
    initializeMockAPI(MOCK_TASKS)
    const api = getMockAPI()
    expect(api).toBeInstanceOf(MockAPI)
    expect(api.getAllTasks()).toHaveLength(MOCK_TASKS.length)
  })

  it('replaces previous MockAPI instance when called multiple times', () => {
    initializeMockAPI([MOCK_TASKS[0]])
    const firstApi = getMockAPI()

    initializeMockAPI(MOCK_TASKS)
    const secondApi = getMockAPI()

    expect(firstApi).not.toBe(secondApi)
    expect(firstApi.getAllTasks()).toHaveLength(1)
    expect(secondApi.getAllTasks()).toHaveLength(MOCK_TASKS.length)
  })
})

describe('getMockAPI()', () => {
  let getMockAPIFunc: () => MockAPI,
    initializeMockAPIFunc: (tasks: ListableTask[]) => void,
    MockAPIClass: typeof MockAPI

  beforeEach(async () => {
    // If we refer to getMockAPI and initializeMockAPI from the top import,
    // their singleton instance might have already been initialized by the time
    // we get to these tests, so we must re-import everything in a fresh module state
    // where we're certain the instance hasn't been initialized.
    vi.resetModules()

    // As it's important for us to validate functions and object types,
    // we must re-import everything we need in our tests here.
    const {
      getMockAPI: freshGetMockAPI,
      initializeMockAPI: freshInitializeMockAPI,
      MockAPI: FreshMockAPIClass
    } = await import('./mockApi')

    getMockAPIFunc = freshGetMockAPI
    initializeMockAPIFunc = freshInitializeMockAPI
    MockAPIClass = FreshMockAPIClass
  })

  it('throws error when getMockAPI is called before initialization', async () => {
    expect(() => {
      getMockAPIFunc()
    }).toThrow('Mock API not initialized. Call initializeMockAPI() first.')
  })

  it('returns MockAPI instance after initialization', () => {
    initializeMockAPIFunc(MOCK_TASKS)
    const api = getMockAPIFunc()
    expect(api).toBeInstanceOf(MockAPIClass)
    expect(api.getAllTasks()).toEqual(MOCK_TASKS)
  })

  it('returns the same MockAPI instance across multiple calls', () => {
    initializeMockAPIFunc(MOCK_TASKS)
    const firstCall = getMockAPIFunc()
    const secondCall = getMockAPIFunc()
    expect(firstCall).toBe(secondCall)
  })
})
