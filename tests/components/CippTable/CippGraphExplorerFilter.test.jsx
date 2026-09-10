import React, { useState } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import CippGraphExplorerFilter from '../../../src/components/CippTable/CippGraphExplorerFilter'
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

const BUILTIN = defaultPresets[0] // All users with email addresses, $select as comma string

const savedObjectSelect = {
  id: 'saved-1',
  name: 'Saved Object Select',
  IsMyPreset: true,
  params: {
    endpoint: '/devices',
    $select: [
      { label: 'id', value: 'id' },
      { label: 'displayName', value: 'displayName' },
    ],
    version: 'v1.0',
  },
}

const savedStringArraySelect = {
  id: 'saved-2',
  name: 'Saved String Array',
  IsMyPreset: false,
  params: {
    endpoint: '/contacts',
    $select: ['mail', 'id'],
  },
}

function mockPresetList() {
  // stable refs across renders, presetOptions effect depends on presetList.data by identity (react-query memoizes via structural sharing), a fresh literal spins an infinite render loop
  const presetListResult = {
    isSuccess: true,
    isFetching: false,
    data: { Results: [savedObjectSelect, savedStringArraySelect] },
    refetch: vi.fn(),
  }
  const idleResult = { isSuccess: false, isFetching: false, data: undefined, refetch: vi.fn() }
  ApiGetCall.mockImplementation(({ queryKey }) => {
    if (queryKey === 'ListGraphExplorerPresets') {
      return currentPresetListResult ?? presetListResult
    }
    // propertyList and anything else stays idle
    return idleResult
  })
}

// tests swap this to simulate the post-save invalidation refetch delivering new data
let currentPresetListResult = null

async function pickPreset(user, label) {
  await user.click(screen.getByRole('combobox', { name: 'Select a preset' }))
  await user.click(await screen.findByRole('option', { name: label }))
}

describe('CippGraphExplorerFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentPresetListResult = null
    mockPresetList()
  })

  it('selector shows the new name once the renamed preset list arrives', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippGraphExplorerFilter onSubmitFilter={vi.fn()} component="card" />)
    await pickPreset(user, 'Saved Object Select')
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/devices')
    })

    const nameBox = screen.getByRole('textbox', { name: 'Preset Name' })
    await user.clear(nameBox)
    await user.type(nameBox, 'Renamed Preset')
    // unsaved param edits must survive, display sync may not touch form state
    const endpointBox = screen.getByRole('textbox', { name: 'Endpoint' })
    await user.type(endpointBox, '/registeredOwners')
    await user.click(screen.getByRole('button', { name: 'Save Preset' }))

    // invalidation refetch lands the rename, same id; next keystroke re-renders the drawer
    currentPresetListResult = {
      isSuccess: true,
      isFetching: false,
      data: { Results: [{ ...savedObjectSelect, name: 'Renamed Preset' }, savedStringArraySelect] },
      refetch: vi.fn(),
    }
    await user.type(nameBox, '!')

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Select a preset' })).toHaveValue('Renamed Preset')
    })
    expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/devices/registeredOwners')
  }, 30000)

  describe('preset normalization into the form', () => {
    it('built-in preset with comma-string $select populates chips, endpoint, default version', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CippGraphExplorerFilter onSubmitFilter={vi.fn()} component="card" />)
      await pickPreset(user, BUILTIN.name)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/users')
      })
      expect(screen.getByText('userPrincipalName')).toBeInTheDocument()
      expect(screen.getByText('mail')).toBeInTheDocument()
      expect(screen.getByText('proxyAddresses')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: 'API Version' })).toHaveValue('beta')
    })

    it('saved preset with object-array $select populates and keeps its version', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CippGraphExplorerFilter onSubmitFilter={vi.fn()} component="card" />)
      await pickPreset(user, 'Saved Object Select')
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/devices')
      })
      expect(screen.getByText('id')).toBeInTheDocument()
      expect(screen.getByText('displayName')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: 'API Version' })).toHaveValue('v1.0')
    })

    it('saved preset with string-array $select normalizes to chips', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CippGraphExplorerFilter onSubmitFilter={vi.fn()} component="card" />)
      await pickPreset(user, 'Saved String Array')
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/contacts')
      })
      expect(screen.getByText('mail')).toBeInTheDocument()
      expect(screen.getByText('id')).toBeInTheDocument()
    })

    it('does not mutate the source preset params (defaultPresets module / query cache regression)', async () => {
      const user = userEvent.setup()
      const before = JSON.stringify(BUILTIN.params)
      const beforeSavedObjectSelect = JSON.stringify(savedObjectSelect.params)
      renderWithProviders(<CippGraphExplorerFilter onSubmitFilter={vi.fn()} component="card" />)
      await pickPreset(user, BUILTIN.name)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/users')
      })
      // old code rewrote $select into [{label,value}] and injected id/name in place
      expect(typeof BUILTIN.params.$select).toBe('string')
      expect(JSON.stringify(BUILTIN.params)).toBe(before)

      // self-contained: picks the object-array preset here rather than relying on residue from the other preset-normalization test
      await pickPreset(user, 'Saved Object Select')
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/devices')
      })
      expect(savedObjectSelect.params).not.toHaveProperty('id')
      expect(JSON.stringify(savedObjectSelect.params)).toBe(beforeSavedObjectSelect)
    })
  })

  describe('external selectedPreset prop shapes', () => {
    it('toolbar shape with a known id resolves via the preset list', async () => {
      renderWithProviders(
        <CippGraphExplorerFilter
          onSubmitFilter={vi.fn()}
          component="card"
          selectedPreset={{ id: 'saved-1', filterName: 'Saved Object Select', value: savedObjectSelect.params, type: 'graph' }}
        />
      )
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/devices')
      })
    })

    it('toolbar shape with an unknown id synthesizes an option from filterName/value', async () => {
      renderWithProviders(
        <CippGraphExplorerFilter
          onSubmitFilter={vi.fn()}
          component="card"
          selectedPreset={{ id: 'nope', filterName: 'Ad hoc', value: { endpoint: '/servicePrincipals', $select: '' }, type: 'graph' }}
        />
      )
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/servicePrincipals')
      })
    })

    it('switching between two option-shape presets applies the second (dep-array regression)', async () => {
      const optionA = { label: BUILTIN.name, value: BUILTIN.id, addedFields: BUILTIN }
      const optionB = { label: 'Saved Object Select', value: 'saved-1', addedFields: savedObjectSelect }
      function Harness() {
        const [preset, setPreset] = useState(optionA)
        return (
          <>
            <button onClick={() => setPreset(optionB)}>swap-preset</button>
            <CippGraphExplorerFilter onSubmitFilter={vi.fn()} component="card" selectedPreset={preset} />
          </>
        )
      }
      const user = userEvent.setup()
      renderWithProviders(<Harness />)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/users')
      })
      await user.click(screen.getByRole('button', { name: 'swap-preset' }))
      // both shapes have undefined id/filterName, only the value dep distinguishes them
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/devices')
      })
    })
  })

  describe('submit shaping', () => {
    it('joins $select, unwraps version, strips form-only fields', async () => {
      const onSubmitFilter = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<CippGraphExplorerFilter onSubmitFilter={onSubmitFilter} component="card" />)
      await pickPreset(user, BUILTIN.name)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/users')
      })
      await user.click(screen.getByRole('button', { name: 'Apply Filter' }))
      await waitFor(() => {
        expect(onSubmitFilter).toHaveBeenCalledTimes(1)
      })
      const payload = onSubmitFilter.mock.calls[0][0]
      expect(payload).toMatchObject({
        endpoint: '/users',
        $select: 'userPrincipalName,mail,proxyAddresses',
        version: 'beta',
      })
      for (const key of ['manualPagination', 'id', 'name', 'IsShared', 'reportTemplate', 'ReverseTenantLookupProperty', '$filter']) {
        expect(payload).not.toHaveProperty(key)
      }
    })

    it('keeps ReverseTenantLookupProperty when the lookup switch is on', async () => {
      const onSubmitFilter = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<CippGraphExplorerFilter onSubmitFilter={onSubmitFilter} component="card" />)
      await pickPreset(user, BUILTIN.name)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/users')
      })
      await user.click(screen.getByRole('switch', { name: 'Reverse Tenant Lookup' }))
      await user.click(screen.getByRole('button', { name: 'Apply Filter' }))
      await waitFor(() => {
        expect(onSubmitFilter).toHaveBeenCalledTimes(1)
      })
      expect(onSubmitFilter.mock.calls[0][0]).toMatchObject({
        ReverseTenantLookup: true,
        ReverseTenantLookupProperty: 'tenantId',
      })
    })

    it('empty form submits only the version default (empty $select key absent)', async () => {
      const onSubmitFilter = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<CippGraphExplorerFilter onSubmitFilter={onSubmitFilter} component="card" />)
      await user.click(screen.getByRole('button', { name: 'Apply Filter' }))
      await waitFor(() => {
        expect(onSubmitFilter).toHaveBeenCalledTimes(1)
      })
      expect(onSubmitFilter.mock.calls[0][0]).toEqual({ version: 'beta' })
    })
  })

  // Seeding from endpointFilter moved out of the render body (it updated the subscribed
  // Controller mid-render, which the browser reports as "Cannot update a component while
  // rendering a different component"). These cover the behaviour that move had to preserve —
  // the warning itself doesn't reproduce under jsdom, so it can't be asserted here.
  describe('endpointFilter prop', () => {
    it('seeds the endpoint field from the prop', async () => {
      renderWithProviders(
        <CippGraphExplorerFilter onSubmitFilter={vi.fn()} component="card" endpointFilter="users" />
      )

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('users')
      })
    })

    it('submits the seeded endpoint', async () => {
      const onSubmitFilter = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <CippGraphExplorerFilter
          onSubmitFilter={onSubmitFilter}
          component="card"
          endpointFilter="users"
        />
      )
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('users')
      })

      await user.click(screen.getByRole('button', { name: 'Apply Filter' }))
      await waitFor(() => {
        expect(onSubmitFilter).toHaveBeenCalledTimes(1)
      })
      expect(onSubmitFilter.mock.calls[0][0]).toMatchObject({ endpoint: 'users' })
    })

    it('leaves the endpoint field empty when no endpointFilter is given', async () => {
      renderWithProviders(<CippGraphExplorerFilter onSubmitFilter={vi.fn()} component="card" />)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('')
      })
    })
  })
})
