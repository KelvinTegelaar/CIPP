import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippFormComponent from '../../../src/components/CippComponents/CippFormComponent'

// The number branch of CippFormComponent used to register the field with no value coercion,
// so react-hook-form kept whatever the native number input reported: a string. Typing 12 left
// {"value":"12","type":"string"} in form state, breaking anything expecting a real number.
// These render it for real and inspect the live formControl's values.

const Harness = ({ defaultValue, capture, ...props }) => {
  const formControl = useForm({ defaultValues: { quantity: defaultValue } })
  capture?.(formControl)
  return (
    <CippFormComponent
      type="number"
      name="quantity"
      label="Quantity"
      formControl={formControl}
      {...props}
    />
  )
}

describe('CippFormComponent — number', () => {
  it('typing digits leaves a Number in form state', async () => {
    let capturedFormControl
    renderWithProviders(<Harness capture={(fc) => (capturedFormControl = fc)} />)
    const field = screen.getByRole('spinbutton', { name: 'Quantity' })

    await userEvent.type(field, '12')

    expect(typeof capturedFormControl.getValues('quantity')).toBe('number')
    expect(capturedFormControl.getValues('quantity')).toBe(12)
  })

  it('clearing the field yields null', async () => {
    let capturedFormControl
    renderWithProviders(
      <Harness defaultValue={5} capture={(fc) => (capturedFormControl = fc)} />
    )
    const field = screen.getByRole('spinbutton', { name: 'Quantity' })

    await userEvent.type(field, '3')
    await userEvent.clear(field)

    expect(capturedFormControl.getValues('quantity')).toBeNull()
  })

  it('a decimal entry stays numeric', async () => {
    let capturedFormControl
    renderWithProviders(<Harness capture={(fc) => (capturedFormControl = fc)} />)
    const field = screen.getByRole('spinbutton', { name: 'Quantity' })

    await userEvent.type(field, '1.5')

    expect(typeof capturedFormControl.getValues('quantity')).toBe('number')
    expect(capturedFormControl.getValues('quantity')).toBe(1.5)
  })
})
