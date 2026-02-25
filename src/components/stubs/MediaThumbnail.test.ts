import { render, screen } from '@testing-library/svelte'
import MediaThumbnail from './MediaThumbnail.svelte'

describe('<MediaThumbnail />', () => {
  it('renders container when src is provided', () => {
    render(MediaThumbnail, { props: { src: 'image.jpg', alt: 'Test Image' } })
    const img = screen.getByAltText('Test Image')
    expect(img).toBeTruthy()
  })

  it('renders image with correct src and alt', () => {
    render(MediaThumbnail, { props: { src: 'test.jpg', alt: 'Test' } })
    const img = screen.getByAltText('Test') as HTMLImageElement
    expect(img.src).toContain('test.jpg')
  })

  it('does not render image when src is null', () => {
    render(MediaThumbnail, { props: { src: null, alt: 'Test' } })
    const img = screen.queryByAltText('Test')
    expect(img).toBeFalsy()
  })

  it('renders image with correct dimensions', () => {
    render(MediaThumbnail, { props: { src: 'image.jpg', alt: 'Test' } })
    const img = screen.getByAltText('Test') as HTMLImageElement
    expect(img.style.width).toBe('100%')
    expect(img.style.height).toBe('100%')
  })

  it('applies object-fit cover styling to image', () => {
    render(MediaThumbnail, { props: { src: 'image.jpg', alt: 'Test' } })
    const img = screen.getByAltText('Test') as HTMLImageElement
    expect(img.style.objectFit).toBe('cover')
  })

  it('shows photo count badge when photoCount > 1', () => {
    render(MediaThumbnail, {
      props: { src: 'image.jpg', alt: 'Test', photoCount: 3 }
    })
    const badge = screen.getByText('+2')
    expect(badge).toBeTruthy()
  })

  it('shows correct badge count', () => {
    render(MediaThumbnail, {
      props: { src: 'image.jpg', alt: 'Test', photoCount: 5 }
    })
    const badge = screen.getByText('+4')
    expect(badge).toBeTruthy()
  })

  it('does not show badge when photoCount is 1', () => {
    render(MediaThumbnail, {
      props: { src: 'image.jpg', alt: 'Test', photoCount: 1 }
    })
    const badge = screen.queryByText(/\+/)
    expect(badge).toBeFalsy()
  })

  it('defaults photoCount to 1', () => {
    render(MediaThumbnail, { props: { src: 'image.jpg', alt: 'Test' } })
    const badge = screen.queryByText(/\+/)
    expect(badge).toBeFalsy()
  })

  it('renders with correct border radius', () => {
    render(MediaThumbnail, { props: { src: 'image.jpg', alt: 'Test' } })
    const img = screen.getByAltText('Test') as HTMLImageElement
    expect(img.style.borderRadius).toBe('0.25rem')
  })
})
