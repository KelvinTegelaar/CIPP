import { screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippApiDialog } from '../../../src/components/CippComponents/CippApiDialog'
import {
  CippVariableValueField,
  VALUE_FIELD,
  VARIABLE_TYPE_FIELD,
} from '../../../src/components/CippComponents/CippCustomVariables'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)

// The add dialog's type picker holds {label, value}; the edit dialog seeds the row as
// ExecCippReplacemap lists it, a plain VariableType string and the stored JSON Value.
const Harness = ({ VariableType, Value = '' }) => {
  const formControl = useForm({ defaultValues: { VariableType, Value } })
  return <CippVariableValueField formControl={formControl} label="Value" />
}

// The Edit action with the fields CippCustomVariables declares, seeded by CippApiDialog itself.
const EditDialog = ({ row }) => (
  <CippApiDialog
    createDialog={{ open: true, handleClose: vi.fn() }}
    title="Edit"
    row={row}
    api={{
      type: 'POST',
      url: '/api/ExecCippReplacemap',
      data: { Action: '!AddEdit' },
      setDefaultValues: true,
    }}
    fields={[VALUE_FIELD, VARIABLE_TYPE_FIELD]}
  />
)

const valueBox = () => screen.getByRole('textbox', { name: 'Value' })

describe('CippVariableValueField', () => {
  it('gives a list the multi-line box and keeps the single-line box for every other type', () => {
    const { unmount } = renderWithProviders(
      <Harness VariableType={{ label: 'String', value: 'string' }} />
    )
    expect(valueBox().tagName).toBe('INPUT')
    unmount()

    renderWithProviders(
      <Harness VariableType={{ label: 'List', value: 'list' }} />
    )
    expect(valueBox().tagName).toBe('TEXTAREA')
  })

  it('opens a saved list one value per line instead of as raw JSON', async () => {
    renderWithProviders(
      <Harness VariableType="list" Value='["Head Office","Branch Office"]' />
    )

    await waitFor(() =>
      expect(valueBox()).toHaveValue('Head Office\nBranch Office')
    )
  })

  it('edits a saved list as lines when the dialog seeds the row', async () => {
    renderWithProviders(
      <EditDialog
        row={{
          RowKey: 'officeips',
          Value: '["203.0.113.0/24","198.51.100.10/32"]',
          VariableType: 'list',
        }}
      />
    )

    await waitFor(() =>
      expect(valueBox()).toHaveValue('203.0.113.0/24\n198.51.100.10/32')
    )
    expect(valueBox().tagName).toBe('TEXTAREA')
  })

  it('still pre-fills a string variable when the dialog seeds the row', async () => {
    renderWithProviders(
      <EditDialog
        row={{
          RowKey: 'localadminacct',
          Value: 'LocalAdmin',
          VariableType: 'string',
        }}
      />
    )

    await waitFor(() => expect(valueBox()).toHaveValue('LocalAdmin'))
    expect(valueBox().tagName).toBe('INPUT')
  })
})
