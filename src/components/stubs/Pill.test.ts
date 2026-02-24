import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Pill from './Pill.svelte'

describe('<Pill />', () => {
  it('renders with label text', () => {
    render(Pill, { props: { label: 'Test Label' } })
    const pill = screen.getByText('Test Label')
    expect(pill).toBeTruthy()
  })

  it('renders with default variant styling', () => {
    render(Pill, { props: { label: 'Default Pill' } })
    const span = screen.getByText('Default Pill')
    expect(span).toBeTruthy()
    expect(span?.className).toContain('pill')
  })

  it('renders with primary variant styling', () => {
    render(Pill, { props: { label: 'Primary Pill', variant: 'primary' } })
    const span = screen.getByText('Primary Pill')
    expect(span?.style.backgroundColor).toBe('rgb(59, 130, 246)')
  })

  it('renders with success variant styling', () => {
    render(Pill, { props: { label: 'Success Pill', variant: 'success' } })
    const span = screen.getByText('Success Pill')
    expect(span?.style.backgroundColor).toBe('rgb(16, 185, 129)')
  })

  it('renders with warning variant styling', () => {
    render(Pill, { props: { label: 'Warning Pill', variant: 'warning' } })
    const span = screen.getByText('Warning Pill')
    expect(span?.style.backgroundColor).toBe('rgb(245, 158, 11)')
  })

  it('renders with danger variant styling', () => {
    render(Pill, { props: { label: 'Danger Pill', variant: 'danger' } })
    const span = screen.getByText('Danger Pill')
    expect(span?.style.backgroundColor).toBe('rgb(239, 68, 68)')
  })

  it('renders with custom tag background color', () => {
    const tag = { id: '1', name: 'Custom Tag', backgroundColor: '#ff0000' }
    render(Pill, { props: { tag } })
    const pill = screen.getByText('Custom Tag')
    expect(pill).toBeTruthy()
    expect(pill?.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('displays tag name when tag is provided', () => {
    const tag = { id: '1', name: 'TagName', backgroundColor: '#00ff00' }
    render(Pill, { props: { tag } })
    const pill = screen.getByText('TagName')
    expect(pill).toBeTruthy()
  })

  it('prefers tag name over label when both are provided', () => {
    const tag = { id: '1', name: 'TagName', backgroundColor: '#00ff00' }
    render(Pill, { props: { tag, label: 'LabelText' } })
    expect(screen.getByText('TagName')).toBeTruthy()
    expect(screen.queryByText('LabelText')).toBeFalsy()
  })

  it('renders with default variant color when not specified', () => {
    render(Pill, { props: { label: 'Default Color' } })
    const span = screen.getByText('Default Color')
    expect(span?.style.backgroundColor).toBe('rgb(228, 228, 231)')
  })
})
