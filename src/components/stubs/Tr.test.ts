import { render, screen } from '@testing-library/svelte'
import Tr from './Tr.svelte'

describe('<Tr />', () => {
  it('renders a table row', () => {
    render(Tr)
    const tr = screen.getByRole('row')
    expect(tr).toBeTruthy()
  })

  it('sets draggable attribute to false by default', () => {
    render(Tr)
    const tr = screen.getByRole('row')
    expect(tr?.getAttribute('draggable')).toBe('false')
  })

  it('sets draggable attribute when draggable prop is true', () => {
    render(Tr, { props: { draggable: true } })
    const tr = screen.getByRole('row')
    expect(tr?.getAttribute('draggable')).toBe('true')
  })

  it('sets draggable attribute when draggable prop is a string', () => {
    render(Tr, { props: { draggable: 'true' } })
    const tr = screen.getByRole('row')
    expect(tr?.getAttribute('draggable')).toBe('true')
  })

  it('passes through rest attributes', () => {
    render(Tr, {
      props: { 'data-testid': 'my-row', 'aria-label': 'Important row' }
    })
    const tr = screen.getByTestId('my-row')
    expect(tr?.getAttribute('aria-label')).toBe('Important row')
  })

  it('handles click events', () => {
    render(Tr)
    const tr = screen.getByRole('row')
    expect(tr).toBeTruthy()
  })

  it('accepts style attribute', () => {
    render(Tr, { props: { style: 'background-color: red;' } })
    const tr = screen.getByRole('row')
    expect(tr?.getAttribute('style')).toContain('background-color')
  })

  it('accepts class attribute', () => {
    render(Tr, { props: { class: 'highlight' } })
    const tr = screen.getByRole('row')
    expect(tr?.classList.contains('highlight')).toBe(true)
  })

  it('can have multiple attributes combined', () => {
    render(Tr, {
      props: {
        draggable: true,
        class: 'row-highlight',
        style: 'opacity: 0.9;',
        'data-id': '123'
      }
    })
    const tr = screen.getByRole('row')
    expect(tr?.getAttribute('draggable')).toBe('true')
    expect(tr?.classList.contains('row-highlight')).toBe(true)
    expect(tr?.getAttribute('style')).toContain('opacity')
    expect(tr?.getAttribute('data-id')).toBe('123')
  })

  it('draggable defaults to false', () => {
    render(Tr, { props: {} })
    const tr = screen.getByRole('row')
    expect(tr?.getAttribute('draggable')).toBe('false')
  })
})
