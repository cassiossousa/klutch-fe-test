import type { Mock } from 'vitest'
import { ValidationError } from './types'

describe('ValidationError', () => {
  it('sets name to ValidationError', () => {
    const error = new ValidationError(['Test'])
    expect(error.name).toBe('ValidationError')
  })

  it(
    'creates instance with messages array and ' +
      'joins messages with comma separator for error message',
    () => {
      const error = new ValidationError(['Error 1', 'Error 2', 'Error 3'])
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.messages).toEqual(['Error 1', 'Error 2', 'Error 3'])
      expect(error.message).toBe('Error 1, Error 2, Error 3')
    }
  )

  it('is throwable', () => {
    expect(() => {
      throw new ValidationError(['Caught error'])
    }).toThrow('Caught error')
  })

  describe('handle()', () => {
    let mockResponse: Response

    beforeEach(() => {
      mockResponse = {
        ok: false,
        json: vi.fn()
      } as unknown as Response
    })

    it('does not throw when response is ok', async () => {
      const okResponse = {
        ok: true,
        json: vi.fn()
      } as unknown as Response
      await expect(ValidationError.handle(okResponse)).resolves.toBeUndefined()
    })

    it('throws ValidationError with errors from response when not ok', async () => {
      ;(mockResponse.json as Mock).mockResolvedValue({
        errors: ['API Error 1', 'API Error 2']
      })

      await expect(ValidationError.handle(mockResponse)).rejects.toHaveProperty(
        'messages',
        ['API Error 1', 'API Error 2']
      )
    })

    it('throws ValidationError with default message when json parsing fails', async () => {
      ;(mockResponse.json as Mock).mockRejectedValue(new Error('Parse error'))

      await expect(ValidationError.handle(mockResponse)).rejects.toHaveProperty(
        'message',
        'Unknown error'
      )
    })

    it('throws ValidationError with default message when errors property is missing', async () => {
      ;(mockResponse.json as Mock).mockResolvedValue({
        message: 'Some message'
      })

      await expect(ValidationError.handle(mockResponse)).rejects.toHaveProperty(
        'message',
        'Unknown error'
      )
    })
  })
})
