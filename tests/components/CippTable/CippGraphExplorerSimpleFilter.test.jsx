import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import CippGraphExplorerSimpleFilter from '../../../src/components/CippTable/CippGraphExplorerSimpleFilter'
import defaultPresets from '../../../src/data/GraphExplorerPresets'
import { ApiGetCall } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(() => ({ mutate: vi.fn(), isPending: false, isSuccess: false, isError: false, data: undefined, error: null })),
  ApiGetCallWithPagination: vi.fn(() => ({
    isSuccess: false,
    isFetching: false,
    isError: false,
    data: undefined,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  })),
}))

const BUILTIN = defaultPresets[0] // All users with email addresses

const BUILTIN_RUN_PAYLOAD = {
  endpoint: '/users',
  $select: 'userPrincipalName,mail,proxyAddresses',
  version: 'beta',
}

async function pickBarPreset(user, label) {
  await user.click(screen.getByRole('combobox', { name: 'Select a query' }))
  await user.click(await screen.findByRole('option', { name: label }))
}

// drawer is keepMounted so buttons sit behind aria-hidden while closed; accname zeroes text under aria-hidden even with getByRole hidden:true (that only bypasses the query-time filter), so match rendered text instead
function drawerApplyButton() {
  return screen.getByText('Apply Filter', { selector: 'button' })
}

// 15s suite timeout, heavy MRT + drawer mounts starve the 5s default under
// full-suite worker contention (same class as GraphExplorerPage's heaviest test)
describe('CippGraphExplorerSimpleFilter', { timeout: 15000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ApiGetCall.mockReturnValue({ isSuccess: false, isFetching: false, data: undefined, refetch: vi.fn() })
  })

  it('Run is disabled until a preset is picked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippGraphExplorerSimpleFilter onSubmitFilter={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Run' })).toBeDisabled()
    await pickBarPreset(user, BUILTIN.name)
    expect(screen.getByRole('button', { name: 'Run' })).toBeEnabled()
  })

  it('Run converts built-in preset params for the API', async () => {
    const onSubmitFilter = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CippGraphExplorerSimpleFilter onSubmitFilter={onSubmitFilter} />)
    await pickBarPreset(user, BUILTIN.name)
    await user.click(screen.getByRole('button', { name: 'Run' }))
    expect(onSubmitFilter).toHaveBeenCalledTimes(1)
    expect(onSubmitFilter.mock.calls[0][0]).toEqual(BUILTIN_RUN_PAYLOAD)
  })

  it('Run reports the preset title via onPresetChange', async () => {
    const onPresetChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CippGraphExplorerSimpleFilter onSubmitFilter={vi.fn()} onPresetChange={onPresetChange} />)
    await pickBarPreset(user, BUILTIN.name)
    await user.click(screen.getByRole('button', { name: 'Run' }))
    expect(onPresetChange).toHaveBeenCalledWith(`Graph Explorer - ${BUILTIN.name}`)
  })

  it('keepMounted drawer content exists before first open', () => {
    renderWithProviders(<CippGraphExplorerSimpleFilter onSubmitFilter={vi.fn()} />)
    expect(drawerApplyButton()).toBeInTheDocument()
    expect(drawerApplyButton()).not.toBeVisible()
  })

  it('drawer submit fires onSubmitFilter and closes the drawer', async () => {
    const onSubmitFilter = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CippGraphExplorerSimpleFilter onSubmitFilter={onSubmitFilter} />)
    await user.click(screen.getByRole('button', { name: 'Edit Query' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apply Filter' })).toBeVisible()
    })
    await user.type(screen.getByRole('textbox', { name: 'Endpoint' }), '/groups')
    await user.click(screen.getByRole('button', { name: 'Apply Filter' }))
    await waitFor(() => {
      expect(onSubmitFilter).toHaveBeenCalledTimes(1)
    })
    expect(onSubmitFilter.mock.calls[0][0]).toMatchObject({ endpoint: '/groups' })
    await waitFor(() => {
      expect(drawerApplyButton()).not.toBeVisible()
    })
  })

  it('Run re-fires the last drawer edits instead of preset params', async () => {
    const onSubmitFilter = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CippGraphExplorerSimpleFilter onSubmitFilter={onSubmitFilter} />)
    await user.click(screen.getByRole('button', { name: 'Edit Query' }))
    await user.type(screen.getByRole('textbox', { name: 'Endpoint' }), '/groups')
    await user.click(screen.getByRole('button', { name: 'Apply Filter' }))
    await waitFor(() => {
      expect(onSubmitFilter).toHaveBeenCalledTimes(1)
    })
    await user.click(screen.getByRole('button', { name: 'Run' }))
    expect(onSubmitFilter).toHaveBeenCalledTimes(2)
    expect(onSubmitFilter.mock.calls[1][0]).toEqual(onSubmitFilter.mock.calls[0][0])
  })

  it('picking a preset in the bar discards drawer edits', async () => {
    const onSubmitFilter = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CippGraphExplorerSimpleFilter onSubmitFilter={onSubmitFilter} />)
    // drawer edit first
    await user.click(screen.getByRole('button', { name: 'Edit Query' }))
    await user.type(screen.getByRole('textbox', { name: 'Endpoint' }), '/groups')
    await user.click(screen.getByRole('button', { name: 'Apply Filter' }))
    await waitFor(() => {
      expect(onSubmitFilter).toHaveBeenCalledTimes(1)
    })
    // then a pristine preset from the bar
    await pickBarPreset(user, BUILTIN.name)
    await user.click(screen.getByRole('button', { name: 'Run' }))
    expect(onSubmitFilter).toHaveBeenCalledTimes(2)
    expect(onSubmitFilter.mock.calls[1][0]).toEqual(BUILTIN_RUN_PAYLOAD)
  })

  it('view toggle flips label and reports the new mode', async () => {
    const onViewModeChange = vi.fn()
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(
      <CippGraphExplorerSimpleFilter onSubmitFilter={vi.fn()} viewMode="table" onViewModeChange={onViewModeChange} />
    )
    await user.click(screen.getByRole('button', { name: 'View JSON' }))
    expect(onViewModeChange).toHaveBeenCalledWith('json')
    unmount()
    renderWithProviders(
      <CippGraphExplorerSimpleFilter onSubmitFilter={vi.fn()} viewMode="json" onViewModeChange={onViewModeChange} />
    )
    expect(screen.getByRole('button', { name: 'View Table' })).toBeInTheDocument()
  })
})
