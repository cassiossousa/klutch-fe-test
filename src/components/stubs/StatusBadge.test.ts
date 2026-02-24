import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import StatusBadge from './StatusBadge.svelte'

describe('<StatusBadge />', () => {
  it.each`
    status          | title            | icon
    ${'Open'}       | ${'Open'}        | ${'circle'}
    ${'InProgress'} | ${'In Progress'} | ${'clock_loader_40'}
    ${'InReview'}   | ${'In Review'}   | ${'pending'}
    ${'Completed'}  | ${'Completed'}   | ${'check_circle'}
    ${'Canceled'}   | ${'Canceled'}    | ${'cancel'}
  `(
    'renders status badge for $status status with title $title and icon $icon',
    ({ status, title, icon }) => {
      render(StatusBadge, { props: { status } })
      const div = screen.getByTitle(title)
      expect(div).toBeTruthy()
      const iconElement = screen.getByText(icon)
      expect(iconElement).toBeTruthy()
    }
  )
})
