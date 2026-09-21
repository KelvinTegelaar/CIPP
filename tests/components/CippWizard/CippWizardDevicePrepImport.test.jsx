import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippWizardDevicePrepImport } from '../../../src/components/CippWizard/CippWizardDevicePrepImport'

vi.mock('../../../src/hooks/use-breakpoint', async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => false,
  useIsTabletLayout: () => false,
  useTableViewMode: () => 'table',
}))

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(() => ({ data: undefined, isFetching: false, isSuccess: false })),
  ApiPostCall: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  ApiGetCallWithPagination: vi.fn(() => ({ data: undefined, isFetching: false })),
}))

// The three the device prep wizard passes — a corporate identifier is exactly this triplet.
const fields = [
  { friendlyName: 'Manufacturer', propertyName: 'manufacturer' },
  { friendlyName: 'Model', propertyName: 'model' },
  { friendlyName: 'Serial Number', propertyName: 'serialNumber' },
]

const Harness = () => {
  const formControl = useForm({ mode: 'onChange', defaultValues: { devicePrepData: [] } })
  return (
    <CippWizardDevicePrepImport
      formControl={formControl}
      name="devicePrepData"
      fields={fields}
      currentStep={1}
      lastStep={2}
      onNextStep={() => {}}
      onPreviousStep={() => {}}
    />
  )
}

const openManualImport = async () => {
  const user = userEvent.setup()
  renderWithProviders(<Harness />)
  await user.click(await screen.findByRole('button', { name: /manual import/i }))
  return { user, dialog: within(await screen.findByRole('dialog')) }
}

describe('CippWizardDevicePrepImport manual entry', () => {
  it('requires manufacturer, model and serial number before a row can be added', async () => {
    const { user, dialog } = await openManualImport()

    await user.type(dialog.getByLabelText('Manufacturer'), 'Dell')

    expect(await dialog.findByText(/Model, Serial Number are required/)).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: 'Add' })).toBeDisabled()
  }, 30000)

  it('rejects values containing a comma', async () => {
    const { user, dialog } = await openManualImport()

    await user.type(dialog.getByLabelText('Manufacturer'), 'Dell, Inc')
    await user.type(dialog.getByLabelText('Model'), 'XPS 13')
    await user.type(dialog.getByLabelText('Serial Number'), 'SN001')

    expect(await dialog.findByText(/Manufacturer may not contain a comma/)).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: 'Add' })).toBeDisabled()
  }, 30000)

  it('adds a complete device to the table', async () => {
    const { user, dialog } = await openManualImport()

    await user.type(dialog.getByLabelText('Manufacturer'), 'Dell')
    await user.type(dialog.getByLabelText('Model'), 'XPS 13')
    await user.type(dialog.getByLabelText('Serial Number'), 'SN001')
    await user.click(dialog.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    // MRT virtualizes rows and jsdom has no layout engine, so cells are not
    // rendered; the pagination summary is the observable proof the row landed.
    expect(await screen.findByText('1-1 of 1', {}, { timeout: 10000 })).toBeInTheDocument()
  }, 30000)
})

describe('CippWizardDevicePrepImport CSV import', () => {
  const uploadCsv = async (content) => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Harness />)
    const input = container.querySelector('input[type="file"]')
    const file = new File([content], 'identifiers.csv', { type: 'text/csv' })
    await user.upload(input, file)
  }

  it('imports a headerless CSV in the Intune portal order', async () => {
    await uploadCsv('Dell,XPS 13,SN001\nHP,EliteBook,SN002\n')

    expect(await screen.findByText('1-2 of 2', {}, { timeout: 10000 })).toBeInTheDocument()
  }, 30000)

  it('imports a CSV with headers', async () => {
    await uploadCsv('manufacturer,model,serialNumber\nDell,XPS 13,SN001\n')

    expect(await screen.findByText('1-1 of 1', {}, { timeout: 10000 })).toBeInTheDocument()
  }, 30000)

  it('rejects rows with missing values instead of importing them', async () => {
    await uploadCsv('Dell,,SN001\n')

    expect(await screen.findByText(/could not be imported/)).toBeInTheDocument()
    expect(screen.getByText(/Model is required/)).toBeInTheDocument()
    expect(screen.queryByText('1-1 of 1')).not.toBeInTheDocument()
  }, 30000)

  it('rejects duplicate devices', async () => {
    await uploadCsv('Dell,XPS 13,SN001\nDell,XPS 13,SN001\n')

    expect(await screen.findByText(/could not be imported/)).toBeInTheDocument()
    expect(screen.getByText(/Duplicate device/)).toBeInTheDocument()
  }, 30000)
})
