import React, { useState } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippAutoComplete } from '../../../src/components/CippComponents/CippAutocomplete'
import { ApiGetCallWithPagination } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(() => ({ isSuccess: false, isFetching: false, data: undefined, refetch: vi.fn() })),
  ApiPostCall: vi.fn(() => ({ mutate: vi.fn(), isPending: false, isSuccess: false, isError: false })),
  ApiGetCallWithPagination: vi.fn(() => ({
    isSuccess: false,
    isFetching: false,
    isError: false,
    data: undefined,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  })),
}))

const OPTIONS = [
  { label: 'Alpha', value: 'a' },
  { label: 'Bravo', value: 'b' },
]

// defaultValue change remounts the keyed Autocomplete; onMouseDown preventDefault (MUI's own option trick) keeps focus so the click isolates remount from the unrelated blur-close path
function KeyChangeHarness({ multiple }) {
  const [def, setDef] = useState(undefined)
  return (
    <>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setDef({ label: 'Bravo', value: 'b' })}
      >
        change-default
      </button>
      <CippAutoComplete multiple={multiple} options={OPTIONS} onChange={() => {}} defaultValue={def} />
    </>
  )
}

describe('CippAutoComplete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // clearAllMocks keeps mockReturnValue overrides, restore the idle default explicitly
    ApiGetCallWithPagination.mockImplementation(() => ({
      isSuccess: false,
      isFetching: false,
      isError: false,
      data: undefined,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    }))
  })

  describe('popup close on keyed remount (fix/graph-explorer-drawer-state)', () => {
    it('single mode: closes an open popup when stableKey changes', async () => {
      const user = userEvent.setup()
      renderWithProviders(<KeyChangeHarness multiple={false} />)
      await user.click(screen.getByRole('combobox'))
      expect(await screen.findByRole('listbox')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'change-default' }))
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('multi mode: popup stays open across stableKey change', async () => {
      const user = userEvent.setup()
      renderWithProviders(<KeyChangeHarness multiple={true} />)
      await user.click(screen.getByRole('combobox'))
      expect(await screen.findByRole('listbox')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'change-default' }))
      expect(await screen.findByRole('listbox')).toBeInTheDocument()
    })

    it('single mode: closes an open popup when api.url changes', async () => {
      ApiGetCallWithPagination.mockReturnValue({
        isSuccess: true,
        isFetching: false,
        isError: false,
        data: { pages: [{ Results: [{ displayName: 'Alice', id: '1' }] }] },
        fetchNextPage: vi.fn(),
        refetch: vi.fn(),
      })
      function ApiHarness() {
        const [url, setUrl] = useState('/api/ListUsers')
        return (
          <>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setUrl('/api/ListGroups')}
            >
              change-url
            </button>
            <CippAutoComplete
              multiple={false}
              onChange={() => {}}
              api={{ url, labelField: 'displayName', valueField: 'id', dataKey: 'Results', queryKey: 'k' }}
            />
          </>
        )
      }
      const user = userEvent.setup()
      renderWithProviders(<ApiHarness />)
      await user.click(screen.getByRole('combobox'))
      expect(await screen.findByRole('listbox')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'change-url' }))
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('core selection behavior', () => {
    it('single select fires onChange with the option object', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<CippAutoComplete multiple={false} options={OPTIONS} onChange={onChange} />)
      await user.click(screen.getByRole('combobox'))
      await user.click(await screen.findByRole('option', { name: 'Alpha' }))
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'Alpha', value: 'a' }), undefined)
    })

    it('multi select accumulates an array', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<CippAutoComplete multiple options={OPTIONS} onChange={onChange} />)
      await user.click(screen.getByRole('combobox'))
      await user.click(await screen.findByRole('option', { name: 'Alpha' }))
      await user.click(await screen.findByRole('option', { name: 'Bravo' }))
      const lastCall = onChange.mock.calls.at(-1)[0]
      expect(lastCall).toEqual([
        expect.objectContaining({ value: 'a' }),
        expect.objectContaining({ value: 'b' }),
      ])
    })

    it('multi mode filters error and empty values out of the array', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <CippAutoComplete
          multiple
          creatable={false}
          options={[
            { label: 'Alpha', value: 'a' },
            { label: 'Err', value: 'error' },
            { label: 'Empty', value: '' },
          ]}
          onChange={onChange}
        />
      )
      await user.click(screen.getByRole('combobox'))
      await user.click(await screen.findByRole('option', { name: 'Alpha' }))
      await user.click(await screen.findByRole('option', { name: 'Err' }))
      const lastCall = onChange.mock.calls.at(-1)[0]
      expect(lastCall).toEqual([expect.objectContaining({ value: 'a' })])
    })

    it('creatable offers and creates a manual option', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<CippAutoComplete multiple={false} options={OPTIONS} onChange={onChange} />)
      await user.type(screen.getByRole('combobox'), 'zzz')
      await user.click(await screen.findByRole('option', { name: 'Add option: "zzz"' }))
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'zzz', value: 'zzz' }), undefined)
    })

    it('creatable=false offers no manual option', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CippAutoComplete multiple={false} creatable={false} options={OPTIONS} onChange={() => {}} />
      )
      await user.type(screen.getByRole('combobox'), 'zzz')
      await waitFor(() => {
        expect(screen.queryByRole('option', { name: /Add option/ })).not.toBeInTheDocument()
      })
    })

    it('onCreateOption transforms manual entries', async () => {
      const onChange = vi.fn()
      const onCreateOption = vi.fn((item) => ({ ...item, label: `custom:${item.label}` }))
      const user = userEvent.setup()
      renderWithProviders(
        <CippAutoComplete multiple={false} options={OPTIONS} onChange={onChange} onCreateOption={onCreateOption} />
      )
      await user.type(screen.getByRole('combobox'), 'zzz')
      await user.click(await screen.findByRole('option', { name: 'Add option: "zzz"' }))
      expect(onCreateOption).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'custom:zzz', value: 'zzz' }), undefined)
    })
  })

  describe('api-driven options', () => {
    it('maps pages through labelField/valueField/addedField and passes addedFields to onChange', async () => {
      ApiGetCallWithPagination.mockReturnValue({
        isSuccess: true,
        isFetching: false,
        isError: false,
        data: { pages: [{ Results: [{ displayName: 'Alice', id: '1', userPrincipalName: 'a@x.com' }] }] },
        fetchNextPage: vi.fn(),
        refetch: vi.fn(),
      })
      const onChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <CippAutoComplete
          multiple={false}
          onChange={onChange}
          api={{
            url: '/api/ListUsers',
            labelField: 'displayName',
            valueField: 'id',
            addedField: { upn: 'userPrincipalName' },
            dataKey: 'Results',
            queryKey: 'users',
          }}
        />
      )
      await user.click(screen.getByRole('combobox'))
      await user.click(await screen.findByRole('option', { name: 'Alice' }))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Alice', value: '1', addedFields: { upn: 'a@x.com' } }),
        { upn: 'a@x.com' }
      )
    })

    it('api error renders a single error option and selecting it yields null', async () => {
      ApiGetCallWithPagination.mockReturnValue({
        isSuccess: false,
        isFetching: false,
        isError: true,
        error: new Error('boom'),
        data: undefined,
        fetchNextPage: vi.fn(),
        refetch: vi.fn(),
      })
      const onChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <CippAutoComplete multiple={false} creatable={false} onChange={onChange} api={{ url: '/api/X', queryKey: 'x' }} />
      )
      await user.click(screen.getByRole('combobox'))
      const options = await screen.findAllByRole('option')
      expect(options).toHaveLength(1)
      await user.click(options[0])
      expect(onChange).toHaveBeenCalledWith(null, undefined)
    })

    it('preselectedValue fires onChange exactly once', async () => {
      const onChange = vi.fn()
      renderWithProviders(
        <CippAutoComplete multiple={false} options={OPTIONS} onChange={onChange} preselectedValue="b" />
      )
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledTimes(1)
      })
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'b' }), undefined)
    })

    it('fetching state disables the input', () => {
      ApiGetCallWithPagination.mockReturnValue({
        isSuccess: false,
        isFetching: true,
        isError: false,
        data: undefined,
        fetchNextPage: vi.fn(),
        refetch: vi.fn(),
      })
      renderWithProviders(<CippAutoComplete multiple={false} onChange={() => {}} api={{ url: '/api/X', queryKey: 'x' }} />)
      expect(screen.getByRole('combobox')).toBeDisabled()
    })
  })

  describe('option shaping props', () => {
    it('sortOptions orders by label', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CippAutoComplete
          multiple={false}
          sortOptions
          options={[
            { label: 'Zulu', value: 'z' },
            { label: 'Alpha', value: 'a' },
          ]}
          onChange={() => {}}
        />
      )
      await user.click(screen.getByRole('combobox'))
      const options = await screen.findAllByRole('option')
      expect(options[0]).toHaveTextContent('Alpha')
      expect(options[1]).toHaveTextContent('Zulu')
    })

    it('removeOptions filters values out', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CippAutoComplete multiple={false} creatable={false} options={OPTIONS} removeOptions={['b']} onChange={() => {}} />
      )
      await user.click(screen.getByRole('combobox'))
      const options = await screen.findAllByRole('option')
      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent('Alpha')
    })
  })

  // Multi-select clears the native input after chips are selected; HTML5 required must
  // track selection state or submit falsely fails with "Please fill out this field".
  describe('required HTML5 vs selection', () => {
    it('marks the input required when empty, and keeps the label required', () => {
      renderWithProviders(
        <CippAutoComplete
          multiple
          creatable={false}
          required
          label="Permissions to remove"
          options={OPTIONS}
          onChange={() => {}}
        />
      )
      const input = screen.getByRole('combobox')
      expect(input).toBeRequired()
      expect(document.querySelector('.Mui-required')).toBeTruthy()
      expect(document.querySelector('.MuiFormLabel-asterisk')).toBeTruthy()
    })

    it('clears HTML5 required on the input after a multi selection, label stays required', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CippAutoComplete
          multiple
          creatable={false}
          required
          label="Permissions to remove"
          options={OPTIONS}
          onChange={() => {}}
        />
      )
      await user.click(screen.getByRole('combobox'))
      await user.click(await screen.findByRole('option', { name: 'Alpha' }))
      expect(screen.getByRole('combobox')).not.toBeRequired()
      expect(document.querySelector('.Mui-required')).toBeTruthy()
      expect(document.querySelector('.MuiFormLabel-asterisk')).toBeTruthy()
    })
  })

  // TextField forwards what it doesn't consume to the FormControl root, so a leak lands as a DOM attr
  describe('prop routing', () => {
    it('keeps autocomplete-only props off the DOM', () => {
      const { container } = renderWithProviders(
        <CippAutoComplete
          multiple={false}
          creatable={false}
          options={OPTIONS}
          onChange={() => {}}
          noOptionsText="nothing here"
        />
      )
      expect(container.querySelector('[nooptionstext]')).toBeNull()
    })

    it('routes variant to the text field, not to the autocomplete root', () => {
      const { container } = renderWithProviders(
        <CippAutoComplete
          multiple={false}
          creatable={false}
          options={OPTIONS}
          onChange={() => {}}
          variant="outlined"
        />
      )
      // outlined draws the notched fieldset/legend, the themed filled default does not
      expect(container.querySelector('fieldset legend')).toBeTruthy()
      expect(container.querySelector('[variant]')).toBeNull()
    })

    it('forwards filterSelectedOptions to the autocomplete, selected option stays listed', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CippAutoComplete
          multiple={false}
          creatable={false}
          options={OPTIONS}
          value={OPTIONS[0]}
          onChange={() => {}}
          filterSelectedOptions={false}
        />
      )
      await user.click(screen.getByRole('combobox'))
      expect(await screen.findByRole('option', { name: 'Alpha' })).toBeInTheDocument()
    })
  })
})
