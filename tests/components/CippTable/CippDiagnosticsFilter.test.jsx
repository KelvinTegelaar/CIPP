import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderWithProviders } from '../../test-utils'
import CippDiagnosticsFilter from '../../../src/components/CippTable/CippDiagnosticsFilter'

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }))
vi.mock('../../../src/hooks/use-breakpoint', () => ({
  useIsMobileLayout: () => layoutState.isMobile,
  useIsTabletLayout: () => false,
  useTableViewMode: () => 'table',
}))

// Stable identities: a fresh object per call changes on every render and spins a loop.
const idleGet = vi.hoisted(() => ({ data: [], isFetching: false, isSuccess: true }))
const idlePost = vi.hoisted(() => ({ mutate: () => {}, isPending: false }))
const idlePaginated = vi.hoisted(() => ({ data: undefined, isFetching: false }))
vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: () => idleGet,
  ApiPostCall: () => idlePost,
  ApiGetCallWithPagination: () => idlePaginated,
}))

beforeEach(() => {
  layoutState.isMobile = false
})

describe('CippDiagnosticsFilter', () => {
  // `rows` is a DOM attribute, so this cannot come from a responsive sx value.
  // MUI renders a hidden shadow textarea beside the real one; only the real one carries
  // the rows attribute this test is about.
  const queryBox = (container) =>
    Array.from(container.querySelectorAll('textarea')).find((el) => el.hasAttribute('rows'))

  it('shortens the KQL box on a phone', () => {
    layoutState.isMobile = true
    const { container } = renderWithProviders(<CippDiagnosticsFilter onSubmitFilter={() => {}} />)

    expect(queryBox(container)).toHaveAttribute('rows', '6')
  })

  it('keeps twelve rows on desktop', () => {
    const { container } = renderWithProviders(<CippDiagnosticsFilter onSubmitFilter={() => {}} />)

    expect(queryBox(container)).toHaveAttribute('rows', '12')
  })
})
