import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippFormComponent from '../../../src/components/CippComponents/CippFormComponent'

// LocaleSelect is a single-choice picker over the locale tags in languageList.json.

const Harness = ({ capture }) => {
  const formControl = useForm({ defaultValues: { locale: null } })
  capture?.(formControl)
  return (
    <CippFormComponent
      type="LocaleSelect"
      name="locale"
      label="Date and number format"
      formControl={formControl}
    />
  )
}

describe('CippFormComponent — LocaleSelect', () => {
  it('offers each locale tag once, labelled with language and area', async () => {
    renderWithProviders(<Harness />)
    await userEvent.click(screen.getByRole('combobox', { name: 'Date and number format' }))

    const listbox = await screen.findByRole('listbox')
    const labels = within(listbox).getAllByRole('option').map((o) => o.textContent)
    expect(labels).toContain('English (United Kingdom) – en-GB')
    expect(labels).toContain('English (United States) – en-US')
    expect(labels.filter((l) => l.endsWith('– en-GB'))).toHaveLength(1)
  })

  it('stores the chosen tag as the value', async () => {
    let capturedFormControl
    renderWithProviders(<Harness capture={(fc) => (capturedFormControl = fc)} />)
    const field = screen.getByRole('combobox', { name: 'Date and number format' })

    await userEvent.type(field, 'German (Germany)')
    await userEvent.click(await screen.findByRole('option', { name: 'German (Germany) – de-DE' }))

    const value = capturedFormControl.getValues('locale')
    expect(value.value).toBe('de-DE')
  })
})
