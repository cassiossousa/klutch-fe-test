import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import App from './App.svelte'

describe('App.svelte', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all tasks from MOCK_TASKS', async () => {
    render(App)
    await tick()

    expect(
      screen.getByText('Install HVAC system in unit 2B')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Fix drywall damage in hallway')
    ).toBeInTheDocument()
  })

  it('Select All / Clear Selection selects/clears all tasks', async () => {
    render(App)
    await tick()

    await fireEvent.click(screen.getByText('Select All'))
    expect(screen.queryByText(/tasks selected/)).toBeInTheDocument()

    await fireEvent.click(screen.getByText('Clear Selection'))
    expect(screen.queryByText(/tasks selected/)).not.toBeInTheDocument()
  })

  it('header checkbox becomes checked when all selected', async () => {
    const { container } = render(App)
    await tick()

    await fireEvent.click(screen.getByText('Select All'))

    const headerCheckbox = container.querySelector(
      'thead input[type="checkbox"]'
    ) as HTMLInputElement

    expect(headerCheckbox.checked).toBe(true)
    expect(headerCheckbox.indeterminate).toBe(false)
  })
})
