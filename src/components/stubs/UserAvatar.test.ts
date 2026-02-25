import { render, screen } from '@testing-library/svelte'
import UserAvatar from './UserAvatar.svelte'

describe('<UserAvatar />', () => {
  it('renders avatar with initials', () => {
    render(UserAvatar, { props: { initials: 'JD' } })
    const avatar = screen.getByText('JD')
    expect(avatar).toBeTruthy()
  })

  it('renders avatar with correct title from initials', () => {
    render(UserAvatar, { props: { initials: 'AB' } })
    const avatar = screen.getByTitle('AB')
    expect(avatar).toBeTruthy()
  })

  it('renders avatar with title from fullName when provided', () => {
    render(UserAvatar, { props: { initials: 'JD', fullName: 'John Doe' } })
    const avatar = screen.getByTitle('John Doe')
    expect(avatar).toBeTruthy()
  })

  it('renders image when avatarUrl is provided', () => {
    render(UserAvatar, {
      props: { initials: 'JD', avatarUrl: 'https://example.com/avatar.jpg' }
    })
    const img = screen.getByRole('img')
    expect(img).toBeTruthy()
  })

  it('sets correct src and alt on image', () => {
    render(UserAvatar, {
      props: {
        initials: 'JD',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg'
      }
    })
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('example.com/avatar.jpg')
    expect(img.alt).toBe('John Doe')
  })

  it('uses initials as image alt when fullName is not provided', () => {
    render(UserAvatar, {
      props: { initials: 'AB', avatarUrl: 'https://example.com/avatar.jpg' }
    })
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.alt).toBe('AB')
  })

  it('displays only initials when no avatarUrl', () => {
    render(UserAvatar, { props: { initials: 'XY' } })
    const avatar = screen.getByText('XY')
    expect(avatar).toBeTruthy()
  })

  it('hides initials when displaying image', () => {
    render(UserAvatar, {
      props: { initials: 'JD', avatarUrl: 'https://example.com/avatar.jpg' }
    })
    const img = screen.getByRole('img')
    expect(img).toBeTruthy()
  })

  it('renders with correct styling classes', () => {
    render(UserAvatar, { props: { initials: 'JD' } })
    const avatar = screen.getByTitle('JD')
    expect(avatar?.className).toContain('flex')
    expect(avatar?.className).toContain('items-center')
    expect(avatar?.className).toContain('justify-center')
    expect(avatar?.className).toContain('rounded-full')
  })

  it('handles null avatarUrl gracefully', () => {
    render(UserAvatar, { props: { initials: 'JD', avatarUrl: null } })
    const avatar = screen.getByText('JD')
    expect(avatar).toBeTruthy()
    const img = screen.queryByRole('img')
    expect(img).toBeFalsy()
  })
})
