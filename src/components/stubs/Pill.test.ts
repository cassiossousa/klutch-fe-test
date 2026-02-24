import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Pill from './Pill.svelte'

describe('<Pill />', () => {
  it('renders as span with default styling when not specified', () => {
    const { container } = render(Pill)
    const pill = container.querySelector('span')
    expect(pill).toBeTruthy()
    expect(pill?.className).toContain('pill')
    expect(pill?.textContent).toBe('')
    expect(pill?.style.backgroundColor).toBe('rgb(228, 228, 231)')
  })

  it('displays label name when provided', () => {
    render(Pill, { props: { label: 'Test Label' } })
    expect(screen.getByText('Test Label')).toBeTruthy()
  })

  it.each`
    variant      | expectedColor
    ${'primary'} | ${'rgb(59, 130, 246)'}
    ${'success'} | ${'rgb(16, 185, 129)'}
    ${'warning'} | ${'rgb(245, 158, 11)'}
    ${'danger'}  | ${'rgb(239, 68, 68)'}
  `('renders with $variant variant styling', ({ variant, expectedColor }) => {
    render(Pill, { props: { label: `${variant} pill`, variant } })
    const pill = screen.getByText(`${variant} pill`)
    expect(pill).toBeTruthy()
    expect(pill?.style.backgroundColor).toBe(expectedColor)
  })

  it('displays tag name and backgroundColor when tag is provided', () => {
    const tag = { id: '1', name: 'Custom Tag', backgroundColor: '#c0ffee' }
    render(Pill, { props: { tag } })
    const pill = screen.getByText('Custom Tag')
    expect(pill).toBeTruthy()
    expect(pill?.style.backgroundColor).toBe('rgb(192, 255, 238)')
  })

  it('prefers tag name over label when both are provided', () => {
    const tag = { id: '1', name: 'TagName', backgroundColor: '#00ff00' }
    render(Pill, { props: { tag, label: 'LabelText' } })
    expect(screen.getByText('TagName')).toBeTruthy()
    expect(screen.queryByText('LabelText')).toBeFalsy()
  })
})
