import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippFormComponent from '../../../src/components/CippComponents/CippFormComponent'

// The textFieldWithVariables branch of CippFormComponent used to reference a `tenantFilter`
// identifier that was never destructured from props, so the field threw a ReferenceError the moment
// it rendered and the whole type was unusable. Nothing in the app used it, so nothing caught it.
// These render it for real.

const Harness = ({ defaultValue = '', ...props }) => {
  const formControl = useForm({ defaultValues: { footerText: defaultValue } })
  return (
    <CippFormComponent
      type="textFieldWithVariables"
      name="footerText"
      label="Footer Text"
      formControl={formControl}
      {...props}
    />
  )
}

describe('CippFormComponent — textFieldWithVariables', () => {
  it('renders without throwing', () => {
    renderWithProviders(<Harness />)
    expect(screen.getByRole('textbox', { name: 'Footer Text' })).toBeInTheDocument()
  })

  it('renders with system variables enabled, the way branding settings uses it', () => {
    renderWithProviders(<Harness includeSystemVariables={true} />)
    expect(screen.getByRole('textbox', { name: 'Footer Text' })).toBeInTheDocument()
  })

  it('shows the value the form holds', () => {
    renderWithProviders(<Harness defaultValue="%tenantname% — %reportdate%" />)
    expect(screen.getByRole('textbox', { name: 'Footer Text' })).toHaveValue('%tenantname% — %reportdate%')
  })

  it('accepts typed text, including percent signs', async () => {
    renderWithProviders(<Harness />)
    const field = screen.getByRole('textbox', { name: 'Footer Text' })

    await userEvent.type(field, 'Prepared by Contoso')

    expect(field).toHaveValue('Prepared by Contoso')
  })

  it('renders helper text and placeholder', () => {
    renderWithProviders(
      <Harness helperText="Type % for variables" placeholder="%tenantname%" />
    )
    expect(screen.getByText('Type % for variables')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Footer Text' })).toHaveAttribute('placeholder', '%tenantname%')
  })
})
