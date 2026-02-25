import {
  formatDate,
  formatDateTime,
  relativeTime,
  formatDisplayDate
} from './utils'
import { DateTime } from 'luxon'

describe('utils', () => {
  describe('formatDate()', () => {
    it.each`
      timestampStr             | expected
      ${'2025-03-15T12:30:00'} | ${'03/15/2025'}
      ${'2024-01-01T00:00:00'} | ${'01/01/2024'}
      ${'2000-12-31T23:59:59'} | ${'12/31/2000'}
      ${'2023-05-07T14:20:00'} | ${'05/07/2023'}
    `('formats $timestamp to $expected', ({ timestampStr, expected }) => {
      const timestamp = DateTime.fromISO(timestampStr).toMillis()
      expect(formatDate(timestamp)).toBe(expected)
    })
  })

  describe('formatDateTime()', () => {
    it.each`
      timestampStr             | expected
      ${'2025-03-15T00:00:00'} | ${'03/15/2025 12:00 AM'}
      ${'2025-03-15T09:15:00'} | ${'03/15/2025 9:15 AM'}
      ${'2025-03-15T12:00:00'} | ${'03/15/2025 12:00 PM'}
      ${'2025-03-15T14:30:00'} | ${'03/15/2025 2:30 PM'}
    `('formats $timestamp to $expected', ({ timestampStr, expected }) => {
      const timestamp = DateTime.fromISO(timestampStr).toMillis()
      expect(formatDateTime(timestamp)).toBe(expected)
    })
  })

  describe('relativeTime()', () => {
    let now: DateTime

    beforeEach(() => {
      now = DateTime.now()
      vi.useFakeTimers()
      vi.setSystemTime(now.toJSDate())
    })

    it.each`
      description                   | daysAgo | hoursAgo | minutesAgo | secondsAgo | expected
      ${'within the last minute'}   | ${0}    | ${0}     | ${0}       | ${30}      | ${'Just now'}
      ${'exactly 1 minute ago'}     | ${0}    | ${0}     | ${1}       | ${0}       | ${'1 minute ago'}
      ${'between 1-2 minutes ago'}  | ${0}    | ${0}     | ${0}       | ${70}      | ${'1 minute ago'}
      ${'between 2-60 minutes ago'} | ${0}    | ${0}     | ${30}      | ${0}       | ${'30 minutes ago'}
      ${'exactly 1 hour ago'}       | ${0}    | ${1}     | ${0}       | ${0}       | ${'1 hour ago'}
      ${'between 1-2 hours ago'}    | ${0}    | ${0}     | ${70}      | ${0}       | ${'1 hour ago'}
      ${'between 2-24 hours ago'}   | ${0}    | ${12}    | ${0}       | ${0}       | ${'12 hours ago'}
      ${'exactly 1 day ago'}        | ${1}    | ${0}     | ${0}       | ${0}       | ${'1 day ago'}
      ${'between 1-2 days ago'}     | ${0}    | ${31}    | ${0}       | ${0}       | ${'1 day ago'}
      ${'5 days ago'}               | ${5}    | ${0}     | ${0}       | ${0}       | ${'5 days ago'}
    `(
      'returns $expected for timestamps $description',
      ({ daysAgo, hoursAgo, minutesAgo, secondsAgo, expected }) => {
        const timestamp = now
          .minus({
            days: daysAgo,
            hours: hoursAgo,
            minutes: minutesAgo,
            seconds: secondsAgo
          })
          .toMillis()
        expect(relativeTime(timestamp)).toBe(expected)
      }
    )
  })

  describe('formatDisplayDate()', () => {
    it.each`
      inputDescription                 | input                    | expectedDescription     | expected
      ${'null'}                        | ${null}                  | ${'—'}                  | ${'—'}
      ${'empty'}                       | ${''}                    | ${'—'}                  | ${'—'}
      ${'an invalid date string'}      | ${'invalid date'}        | ${'—'}                  | ${'—'}
      ${'a malformed date string'}     | ${'2025-13-45'}          | ${'—'}                  | ${'—'}
      ${'a valid ISO date string'}     | ${'2025-03-15'}          | ${'a DD/MM/YYY string'} | ${'03/15/2025'}
      ${'a valid ISO datetime string'} | ${'2025-03-15T14:30:00'} | ${'a DD/MM/YYY string'} | ${'03/15/2025'}
    `(
      'returns $expected when input is $inputDescription',
      ({ input, expected }) => {
        expect(formatDisplayDate(input)).toBe(expected)
      }
    )
  })
})
