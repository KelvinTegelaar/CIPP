import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { api, getResult } from '../../mocks/api-call'
import CippFormComponent from '../../../src/components/CippComponents/CippFormComponent'
import { REPORT_VARIABLES } from '../../../src/components/CippPdf/reportTheme'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())

// Issue 1241: the branding footer advertised %reportdate%, the % popup did not offer it, and typing
// it by hand let the closing % reopen the popup so Tab replaced it with another variable.
const cippVariables = getResult({
  data: {
    Results: [
      { Name: 'cippurl', Variable: '%cippurl%', Description: 'The CIPP instance URL', Type: 'reserved', Category: 'cipp' },
      { Name: 'tenantname', Variable: '%tenantname%', Description: 'The tenant display name', Type: 'reserved', Category: 'tenant' },
    ],
  },
})
api.get = (opts) => (opts?.url?.startsWith('/api/ListCustomVariables') ? cippVariables : getResult({ isSuccess: false }))

// jsdom has no scrollIntoView, which the popup calls on its highlighted row.
Element.prototype.scrollIntoView = vi.fn()

const Harness = (props) => {
  const formControl = useForm({ defaultValues: { footerText: '' } })
  return (
    <CippFormComponent
      type="textFieldWithVariables"
      name="footerText"
      label="Footer Text"
      formControl={formControl}
      includeSystemVariables={true}
      {...props}
    />
  )
}

describe('CippTextFieldWithVariables', () => {
  it('keeps a hand-typed variable intact when the field is left with Tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    const field = screen.getByRole('textbox', { name: 'Footer Text' })

    await user.type(field, '%reportdate%')
    await user.keyboard('{Tab}')

    expect(field).toHaveValue('%reportdate%')
  })

  it('still opens the popup for a second variable typed straight after the first', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    const field = screen.getByRole('textbox', { name: 'Footer Text' })

    await user.type(field, '%reportdate%%ten')
    await user.keyboard('{Enter}')

    expect(field).toHaveValue('%reportdate%%tenantname%')
  })

  it('offers the extra variables alongside the ones CIPP lists', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness extraAutocompleteOptions={REPORT_VARIABLES} />)
    const field = screen.getByRole('textbox', { name: 'Footer Text' })

    await user.type(field, '%')
    expect(await screen.findByText('%tenantname%')).toBeInTheDocument()
    expect(screen.getByText('%reportname%')).toBeInTheDocument()
    expect(screen.getByText('%reportdate%')).toBeInTheDocument()

    await user.type(field, 'reportd')
    await user.keyboard('{Enter}')

    expect(field).toHaveValue('%reportdate%')
  })
})
