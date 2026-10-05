import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../test-utils'
import Page from '../../src/pages/tenant/reports/list-licenses/pricing'
import { api, paginatedResult } from '../mocks/api-call'
import { ApiGetCallWithPagination, ApiPostCall } from '../../src/api/ApiCall'

const state = vi.hoisted(() => ({ tableProps: null, exportProps: null }))

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)

vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    state.tableProps = props
    return <div data-testid="pricing-table-page">{props.cardButton}</div>
  },
}))

vi.mock('../../src/components/CippComponents/CippCsvExportButton', () => ({
  CippCsvExportButton: (props) => {
    state.exportProps = props
    return (
      <button type="button" aria-label="Export Raw Data to CSV">
        Export CSV
      </button>
    )
  },
}))

vi.mock('../../src/components/CippComponents/CippAutocomplete', () => ({
  CippAutoComplete: ({ label, options, value, onChange }) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={value?.value ?? ''}
        onChange={(event) =>
          onChange({ label: event.target.value, value: event.target.value })
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}))

const license = {
  Product_Display_Name: 'Microsoft 365 Business Premium',
  skuPartNumber: 'SPB',
  skuId: 'sku-business-premium',
  MonthlyPrice: 18.1,
  Currency: 'GBP',
  Source: 'Shipped',
}

let postConfigs
let postPayloads
let validateResult
let applyResult

const configurePosts = () => {
  postConfigs = []
  postPayloads = []
  api.post = (options) => {
    postConfigs.push(options)
    return {
      isPending: false,
      mutateAsync: vi.fn((request) => {
        postPayloads.push(request)
        const result =
          request.data.Mode === 'Validate' ? validateResult : applyResult
        return typeof result === 'function'
          ? result(request)
          : Promise.resolve({ data: result })
      }),
    }
  }
}

const renderPage = () =>
  renderWithProviders(<Page />, {
    settings: settingsWith({ currentTenant: 'testdomain.com' }),
  })

const openImport = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Import CSV' }))
  return screen.findByRole('dialog', { name: 'Import License Pricing' })
}

const selectCsv = (csv) => {
  const file = new File([csv], 'license-pricing.csv', { type: 'text/csv' })
  if (typeof file.text !== 'function') {
    Object.defineProperty(file, 'text', { value: async () => csv })
  }
  fireEvent.change(screen.getByLabelText('License pricing CSV'), {
    target: { files: [file] },
  })
}

const csvFor = (
  rows,
  header = 'Product_Display_Name,skuPartNumber,skuId,MonthlyPrice,Currency'
) => [header, ...rows].join('\n')

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem('licenseReportCurrency', 'GBP')
  state.tableProps = null
  state.exportProps = null
  api.paginated = paginatedResult([license])
  api.paginated.data.pages[0].Currencies = ['USD', 'GBP']
  validateResult = {
    Valid: true,
    Changes: [{ ...license, CurrentPrice: 18.1, MonthlyPrice: 19.25 }],
    Unchanged: 0,
    Errors: [],
  }
  applyResult = { Valid: true, Updated: 1, Unchanged: 0, Failed: 0, Errors: [] }
  configurePosts()
})

describe('License Pricing page bulk CSV workflow', () => {
  it('exports the selected currency rows with the fields needed to map each licence', async () => {
    renderPage()

    expect(
      await screen.findByRole('button', { name: 'Export Raw Data to CSV' })
    ).toBeInTheDocument()
    expect(ApiGetCallWithPagination).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/ListLicensePricing?currency=GBP',
        queryKey: 'LicensePricing-GBP',
      })
    )
    expect(state.exportProps).toMatchObject({
      reportName: 'LicensePricing-GBP',
      includeFields: [
        'Product_Display_Name',
        'skuPartNumber',
        'MonthlyPrice',
        'Currency',
        'Source',
        'skuId',
      ],
      rawData: [license],
    })
    expect(state.exportProps.includeFields).toEqual(
      expect.arrayContaining([
        'Product_Display_Name',
        'skuPartNumber',
        'skuId',
        'MonthlyPrice',
        'Currency',
      ])
    )
    expect(state.tableProps.columns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'MonthlyPrice',
          accessorKey: 'MonthlyPrice',
        }),
      ])
    )
  })

  it('parses Excel CSV quoting and BOM, previews only changed prices, then applies just those changes', async () => {
    const changed = {
      ...license,
      Product_Display_Name: 'Microsoft 365, Business "Premium"',
      MonthlyPrice: '19.25',
    }
    const secondChange = {
      Product_Display_Name: 'Microsoft Copilot Pro',
      skuPartNumber: 'COPILOT_PRO',
      skuId: 'sku-copilot-pro',
      MonthlyPrice: '20.00',
      Currency: 'GBP',
    }
    validateResult = {
      Valid: true,
      Changes: [
        { ...changed, CurrentPrice: 18.1 },
        { ...secondChange, CurrentPrice: 19 },
      ],
      Unchanged: 1,
      Errors: [],
    }
    renderPage()
    await openImport()
    selectCsv(
      `\uFEFFProduct_Display_Name,skuPartNumber,skuId,MonthlyPrice,Currency\n"Microsoft 365, Business ""Premium""",SPB,sku-business-premium,19.25,GBP\nMicrosoft Copilot Pro,COPILOT_PRO,sku-copilot-pro,20.00,GBP\nAnother product,OTHER,sku-unchanged,7.50,GBP`
    )

    await waitFor(() => expect(postPayloads).toHaveLength(1))
    expect(postPayloads[0]).toEqual({
      url: '/api/ExecLicensePricing',
      data: {
        Action: 'BulkImport',
        Mode: 'Validate',
        Currency: 'GBP',
        Rows: [
          expect.objectContaining({
            Product_Display_Name: 'Microsoft 365, Business "Premium"',
            skuPartNumber: 'SPB',
            skuId: 'sku-business-premium',
            MonthlyPrice: '19.25',
            Currency: 'GBP',
          }),
          expect.objectContaining({
            Product_Display_Name: 'Microsoft Copilot Pro',
            skuPartNumber: 'COPILOT_PRO',
            skuId: 'sku-copilot-pro',
            MonthlyPrice: '20.00',
            Currency: 'GBP',
          }),
          expect.objectContaining({
            Product_Display_Name: 'Another product',
            skuPartNumber: 'OTHER',
            skuId: 'sku-unchanged',
            MonthlyPrice: '7.50',
            Currency: 'GBP',
          }),
        ],
      },
    })
    expect(
      await screen.findByText('Prices to update: 2. Unchanged rows ignored: 1.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Microsoft 365, Business "Premium"')
    ).toBeInTheDocument()
    expect(screen.getByText('GBP 18.1')).toBeInTheDocument()
    expect(screen.getByText('GBP 19.25')).toBeInTheDocument()
    expect(screen.getByText('Microsoft Copilot Pro')).toBeInTheDocument()
    expect(screen.getByText('GBP 20.00')).toBeInTheDocument()
    expect(screen.queryByText('Another product')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(postPayloads).toHaveLength(2))
    expect(postPayloads[1]).toEqual({
      url: '/api/ExecLicensePricing',
      data: {
        Action: 'BulkImport',
        Mode: 'Apply',
        Currency: 'GBP',
        Rows: [
          { ...changed, CurrentPrice: 18.1 },
          { ...secondChange, CurrentPrice: 19 },
        ],
      },
    })
    expect(
      await screen.findByText('1 updated; 1 unchanged/skipped; 0 failed.')
    ).toBeInTheDocument()
    expect(ApiPostCall).toHaveBeenCalledWith({
      relatedQueryKeys: ['LicensePricing*'],
    })
    expect(postConfigs).toContainEqual({
      relatedQueryKeys: ['LicensePricing*'],
    })
  })

  it('rejects missing and duplicate columns before asking the API to validate', async () => {
    renderPage()
    await openImport()
    selectCsv(
      csvFor(
        ['Premium,SPB,sku-business-premium,19.25'],
        'Product_Display_Name,skuPartNumber,skuId,MonthlyPrice'
      )
    )
    expect(
      await screen.findByText(/Missing required columns: Currency/)
    ).toBeInTheDocument()
    expect(postPayloads).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()

    selectCsv(
      csvFor(
        ['Premium,SPB,sku-business-premium,19.25'],
        'Product_Display_Name,skuPartNumber,skuId,MonthlyPrice,Currency'
      )
    )
    expect(await screen.findByText(/Invalid CSV:/)).toBeInTheDocument()
    expect(postPayloads).toHaveLength(0)

    selectCsv(
      csvFor(
        ['Premium,SPB,sku-business-premium,19.25,GBP,sku-other'],
        'Product_Display_Name,skuPartNumber,skuId,MonthlyPrice,Currency,skuId'
      )
    )
    expect(
      await screen.findByText('Duplicate CSV headers are not allowed.')
    ).toBeInTheDocument()
    expect(postPayloads).toHaveLength(0)
  })

  it('shows server validation errors for an invalid SKU, price and unsupported currency', async () => {
    validateResult = () =>
      Promise.reject({
        response: {
          data: {
            Valid: false,
            Changes: [],
            Unchanged: 0,
            Errors: [
              { Row: 2, skuId: 'unknown-sku', Error: 'Unknown skuId.' },
              {
                Row: 3,
                skuId: 'sku-business-premium',
                Error: 'MonthlyPrice must be a non-negative number.',
              },
              {
                Row: 4,
                skuId: 'sku-other',
                Error: 'Unsupported currency EUR.',
              },
            ],
          },
        },
      })
    renderPage()
    await openImport()
    selectCsv(
      csvFor([
        'Unknown,OTHER,unknown-sku,19.25,GBP',
        'Premium,SPB,sku-business-premium,-1,GBP',
        'Other,OTHER,sku-other,4.50,EUR',
      ])
    )

    expect(
      await screen.findByText('Validation failed. No prices were changed.')
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Row 2: unknown-sku: Unknown skuId.')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Row 3: sku-business-premium: MonthlyPrice must be a non-negative number.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('Row 4: sku-other: Unsupported currency EUR.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
    expect(postPayloads).toHaveLength(1)
  })

  it('keeps confirm disabled when every imported row is unchanged', async () => {
    validateResult = { Valid: true, Changes: [], Unchanged: 2, Errors: [] }
    renderPage()
    await openImport()
    selectCsv(
      csvFor(
        [],
        'Product_Display_Name,skuPartNumber,skuId,MonthlyPrice,Currency'
      )
    )
    expect(
      await screen.findByText('The CSV contains no pricing rows.')
    ).toBeInTheDocument()
    expect(postPayloads).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()

    selectCsv(csvFor(['Premium,SPB,sku-business-premium,18.10,GBP']))

    expect(
      await screen.findByText('Prices to update: 0. Unchanged rows ignored: 2.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })

  it('reports partial apply failures and preserves the single-row override actions', async () => {
    applyResult = {
      Valid: false,
      Updated: 1,
      Unchanged: 0,
      Failed: 1,
      Errors: [{ skuId: 'sku-failed', Error: 'Storage write failed.' }],
    }
    renderPage()
    await openImport()
    selectCsv(csvFor(['Premium,SPB,sku-business-premium,19.25,GBP']))
    await screen.findByText('Prices to update: 1. Unchanged rows ignored: 0.')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(
      await screen.findByText('1 updated; 0 unchanged/skipped; 1 failed.')
    ).toBeInTheDocument()
    expect(
      await screen.findByText('sku-failed: Storage write failed.')
    ).toBeInTheDocument()

    const actions = state.tableProps.actions
    const setPrice = actions.find(
      (action) => action.label === 'Set / override price'
    )
    expect(
      setPrice.customDataformatter(license, null, { MonthlyPrice: 22.5 })
    ).toEqual({
      Action: 'SetPrice',
      skuId: license.skuId,
      skuPartNumber: license.skuPartNumber,
      Product_Display_Name: license.Product_Display_Name,
      MonthlyPrice: 22.5,
      Currency: 'GBP',
    })
    expect(setPrice.relatedQueryKeys).toEqual(['LicensePricing*'])

    const removePrice = actions.find(
      (action) => action.label === 'Remove override'
    )
    expect(removePrice.data).toEqual({
      Action: '!RemovePrice',
      skuId: 'skuId',
      Currency: 'Currency',
    })
    expect(removePrice.condition({ ...license, Source: 'Override' })).toBe(true)
    expect(removePrice.condition({ ...license, Source: 'Shipped' })).toBe(false)
    expect(removePrice.relatedQueryKeys).toEqual(['LicensePricing*'])
  })
})
