import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import StatusBadge from './StatusBadge.svelte'

describe('<StatusBadge />', () => {
  it('renders a status badge for Open status', () => {
    render(StatusBadge, { props: { status: 'Open' } })
    const div = screen.getByTitle('Open')
    expect(div).toBeTruthy()
  })

  it('renders a status badge for InProgress status', () => {
    render(StatusBadge, { props: { status: 'InProgress' } })
    const div = screen.getByTitle('In Progress')
    expect(div).toBeTruthy()
  })

  it('renders a status badge for InReview status', () => {
    render(StatusBadge, { props: { status: 'InReview' } })
    const div = screen.getByTitle('In Review')
    expect(div).toBeTruthy()
  })

  it('renders a status badge for Completed status', () => {
    render(StatusBadge, { props: { status: 'Completed' } })
    const div = screen.getByTitle('Completed')
    expect(div).toBeTruthy()
  })

  it('renders a status badge for Canceled status', () => {
    render(StatusBadge, { props: { status: 'Canceled' } })
    const div = screen.getByTitle('Canceled')
    expect(div).toBeTruthy()
  })

  it('displays the correct icon for Open status', () => {
    render(StatusBadge, { props: { status: 'Open' } })
    const icon = screen.getByText('circle')
    expect(icon).toBeTruthy()
  })

  it('displays the correct icon for InProgress status', () => {
    render(StatusBadge, { props: { status: 'InProgress' } })
    const icon = screen.getByText('clock_loader_40')
    expect(icon).toBeTruthy()
  })

  it('displays the correct icon for Completed status', () => {
    render(StatusBadge, { props: { status: 'Completed' } })
    const icon = screen.getByText('check_circle')
    expect(icon).toBeTruthy()
  })

  it('displays the correct icon for Canceled status', () => {
    render(StatusBadge, { props: { status: 'Canceled' } })
    const icon = screen.getByText('cancel')
    expect(icon).toBeTruthy()
  })

  it('displays the correct icon for InReview status', () => {
    render(StatusBadge, { props: { status: 'InReview' } })
    const icon = screen.getByText('pending')
    expect(icon).toBeTruthy()
  })
})
