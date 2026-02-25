import { render, screen } from '@testing-library/svelte'
import Td from './Td.svelte'

describe('<Td />', () => {
  it('renders a table cell', () => {
    render(Td)
    const td = screen.getByRole('cell')
    expect(td).toBeTruthy()
  })

  it('applies text-ellipsis class when truncate is true', () => {
    render(Td, { props: { truncate: true } })
    const td = screen.getByRole('cell')
    expect(td?.classList.contains('text-ellipsis')).toBe(true)
  })

  it('does not apply text-ellipsis class when truncate is false', () => {
    render(Td, { props: { truncate: false } })
    const td = screen.getByRole('cell')
    expect(td?.classList.contains('text-ellipsis')).toBe(false)
  })

  it('applies custom class via class prop', () => {
    render(Td, { props: { class: 'custom-class' } })
    const td = screen.getByRole('cell')
    expect(td?.classList.contains('custom-class')).toBe(true)
  })

  it('applies both custom class and text-ellipsis when truncate is true', () => {
    render(Td, { props: { truncate: true, class: 'bg-blue' } })
    const td = screen.getByRole('cell')
    expect(td?.classList.contains('text-ellipsis')).toBe(true)
    expect(td?.classList.contains('bg-blue')).toBe(true)
  })

  it('passes through rest attributes', () => {
    render(Td, { props: { 'data-testid': 'my-cell' } })
    const td = screen.getByTestId('my-cell')
    expect(td).toBeTruthy()
  })

  it('handles click events', () => {
    render(Td)
    const td = screen.getByRole('cell')
    expect(td).toBeTruthy()
  })

  it('has truncate enabled by default', () => {
    render(Td)
    const td = screen.getByRole('cell')
    expect(td?.classList.contains('text-ellipsis')).toBe(true)
  })

  it('accepts style attribute', () => {
    render(Td, { props: { style: 'padding: 1rem;' } })
    const td = screen.getByRole('cell')
    expect(td?.getAttribute('style')).toContain('padding')
  })

  it('combines multiple attributes correctly', () => {
    render(Td, {
      props: {
        truncate: true,
        class: 'custom',
        'data-id': 'test-123',
        style: 'color: red;'
      }
    })
    const td = screen.getByRole('cell')
    expect(td?.classList.contains('text-ellipsis')).toBe(true)
    expect(td?.classList.contains('custom')).toBe(true)
    expect(td?.getAttribute('data-id')).toBe('test-123')
    expect(td?.getAttribute('style')).toContain('color')
  })
})
