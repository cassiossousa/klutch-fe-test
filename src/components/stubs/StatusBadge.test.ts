import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import StatusBadge from './StatusBadge.svelte'

describe('<StatusBadge />', () => {
  it.each`
    status          | title            | icon                 | color
    ${'Open'}       | ${'Open'}        | ${'circle'}          | ${'rgb(161, 161, 170)'}
    ${'InProgress'} | ${'In Progress'} | ${'clock_loader_40'} | ${'rgb(34, 197, 94)'}
    ${'InReview'}   | ${'In Review'}   | ${'pending'}         | ${'rgb(245, 158, 11)'}
    ${'Completed'}  | ${'Completed'}   | ${'check_circle'}    | ${'rgb(34, 197, 94)'}
    ${'Canceled'}   | ${'Canceled'}    | ${'cancel'}          | ${'rgb(113, 113, 122)'}
  `(
    'renders status badge for $status status with $icon icon, $color color, and $title title and text',
    ({ status, title, icon, color }) => {
      render(StatusBadge, { props: { status } })
      const badge = screen.getByTitle(title)
      expect(badge).toBeTruthy()
      expect(badge.tagName.toLowerCase()).toBe('div')

      const badgeIcon = badge.querySelector('span')
      expect(badgeIcon).toBeTruthy()
      expect(badgeIcon?.style.color).toBe(color)
      expect(badgeIcon?.textContent).toBe(icon)

      const badgeText = badge.querySelector('div')
      expect(badgeText).toBeTruthy()
      expect(badgeText?.textContent).toBe(title)
    }
  )
})
