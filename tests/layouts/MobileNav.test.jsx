import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { act } from '@testing-library/react'
import { renderWithProviders, settingsWith } from '../test-utils'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}))

const idle = vi.hoisted(() => ({
  isSuccess: false,
  isFetching: false,
  isPending: false,
  isError: false,
  data: undefined,
  mutate: () => {},
  reset: () => {},
  refetch: () => {},
}))
vi.mock('../../src/api/ApiCall', () => ({
  ApiGetCall: () => idle,
  ApiPostCall: () => idle,
  ApiGetCallWithPagination: () => ({ ...idle, fetchNextPage: () => {} }),
}))

import { MobileNav } from '../../src/layouts/mobile-nav'

const items = [{ title: 'Dashboard', path: '/' }]

// MUI binds touchstart/touchmove/touchend on the document, so the swipe lifecycle is driven
// with native events; userEvent emits pointer/mouse, which SwipeableDrawer ignores.
const touch = (el, type, x = 5, y = 200) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  const point = { pageX: x, pageY: y, clientX: x, clientY: y }
  Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : [point] })
  Object.defineProperty(event, 'changedTouches', { value: [point] })
  act(() => {
    el.dispatchEvent(event)
  })
}

const renderNav = (props = {}) => {
  const onOpen = vi.fn()
  const onClose = vi.fn()
  renderWithProviders(
    <MobileNav items={items} open={false} onOpen={onOpen} onClose={onClose} {...props} />,
    { settings: settingsWith({ bookmarkSidebar: false }) }
  )
  return { onOpen, onClose }
}

describe('MobileNav', () => {
  it('renders no edge swipe area', () => {
    renderNav()
    expect(document.querySelector('.PrivateSwipeArea-root')).toBeNull()
  })

  // MUI forces the modal open while a swipe is in progress (maybeSwiping), and a touch with no
  // movement never sets isSwiping, so handleBodyTouchEnd bails before onOpen/onClose. The drawer
  // animates in and straight back out with the app's open state untouched.
  it('leaves the drawer closed on a left-edge tap', () => {
    const { onOpen, onClose } = renderNav()
    const target = document.querySelector('.PrivateSwipeArea-root') ?? document.body
    const drawer = document.querySelector('.MuiDrawer-root')
    expect(drawer.getAttribute('aria-hidden')).toBe('true')

    touch(target, 'touchstart')
    expect(drawer.getAttribute('aria-hidden')).toBe('true')

    touch(target, 'touchend')
    expect(drawer.getAttribute('aria-hidden')).toBe('true')
    expect(onOpen).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
