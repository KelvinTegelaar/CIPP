import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithTheme } from '../../test-utils'
import { CippFormCondition } from '../../../src/components/CippComponents/CippFormCondition'
import { CippFormComponent } from '../../../src/components/CippComponents/CippFormComponent'

const FormWrapper = ({ defaultValues, children }) => {
  const formControl = useForm({ defaultValues })
  return <>{typeof children === 'function' ? children(formControl) : children}</>
}

describe('CippFormCondition', () => {
  it('shows children when "is" condition is met', () => {
    renderWithTheme(
      <FormWrapper defaultValues={{ status: 'active' }}>
        {(formControl) => (
          <CippFormCondition
            field="status"
            compareType="is"
            compareValue="active"
            formControl={formControl}
          >
            <div data-testid="child-content">Visible Content</div>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('hides children when "is" condition is NOT met', () => {
    renderWithTheme(
      <FormWrapper defaultValues={{ status: 'inactive' }}>
        {(formControl) => (
          <CippFormCondition
            field="status"
            compareType="is"
            compareValue="active"
            formControl={formControl}
          >
            <div data-testid="child-content">Hidden Content</div>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()
  })

  it('shows children when "isNot" condition is met', () => {
    renderWithTheme(
      <FormWrapper defaultValues={{ status: 'inactive' }}>
        {(formControl) => (
          <CippFormCondition
            field="status"
            compareType="isNot"
            compareValue="active"
            formControl={formControl}
          >
            <div data-testid="child-content">IsNot Content</div>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('shows children when "contains" condition is met (string contains)', () => {
    renderWithTheme(
      <FormWrapper defaultValues={{ description: 'hello world' }}>
        {(formControl) => (
          <CippFormCondition
            field="description"
            compareType="contains"
            compareValue="world"
            formControl={formControl}
          >
            <div data-testid="child-content">Contains Content</div>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('shows children when "hasValue" condition is met', () => {
    renderWithTheme(
      <FormWrapper defaultValues={{ name: 'John' }}>
        {(formControl) => (
          <CippFormCondition
            field="name"
            compareType="hasValue"
            formControl={formControl}
          >
            <div data-testid="child-content">HasValue Content</div>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('hides children when "hasValue" condition is NOT met (empty string)', () => {
    renderWithTheme(
      <FormWrapper defaultValues={{ name: '' }}>
        {(formControl) => (
          <CippFormCondition
            field="name"
            compareType="hasValue"
            formControl={formControl}
          >
            <div data-testid="child-content">HasValue Content</div>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()
  })

  it('disables children when condition not met and action="disable"', () => {
    renderWithTheme(
      <FormWrapper defaultValues={{ status: 'inactive' }}>
        {(formControl) => (
          <CippFormCondition
            field="status"
            compareType="is"
            compareValue="active"
            action="disable"
            formControl={formControl}
          >
            <button data-testid="child-button">Click Me</button>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    const button = screen.getByTestId('child-button')
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('returns null when required props are missing (no field/compareValue)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithTheme(
      <FormWrapper defaultValues={{}}>
        {(formControl) => (
          <CippFormCondition formControl={formControl}>
            <div data-testid="child-content">Should Not Render</div>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()
    expect(warnSpy).toHaveBeenCalledWith(
      'CippFormCondition: Missing required props',
      expect.any(Object)
    )
    warnSpy.mockRestore()
  })

  it('disables children when disabled prop is true regardless of condition being met', () => {
    renderWithTheme(
      <FormWrapper defaultValues={{ status: 'active' }}>
        {(formControl) => (
          <CippFormCondition
            field="status"
            compareType="is"
            compareValue="active"
            disabled={true}
            formControl={formControl}
          >
            <button data-testid="child-button">Click Me</button>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    const button = screen.getByTestId('child-button')
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('reveals children when typing flips the condition from unmet to met', async () => {
    // pins useWatch reactivity: real CippFormComponent bound to the watched field
    renderWithTheme(
      <FormWrapper defaultValues={{ status: '' }}>
        {(formControl) => (
          <>
            <CippFormComponent
              type="textField"
              name="status"
              label="Status"
              disableVariables={true}
              formControl={formControl}
            />
            <CippFormCondition
              field="status"
              compareType="is"
              compareValue="active"
              formControl={formControl}
            >
              <div data-testid="child-content">Now Visible</div>
            </CippFormCondition>
          </>
        )}
      </FormWrapper>
    )
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox', { name: 'Status' }), 'active')
    expect(await screen.findByTestId('child-content')).toBeInTheDocument()

    // and back: appending breaks the "is" match again
    await userEvent.type(screen.getByRole('textbox', { name: 'Status' }), 'x')
    await waitFor(() => {
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()
    })
  })

  it('clears wrapped CippFormComponent values when the condition stops being met', async () => {
    let capturedFormControl
    renderWithTheme(
      <FormWrapper defaultValues={{ status: 'active', extra: 'keep-me' }}>
        {(formControl) => {
          capturedFormControl = formControl
          return (
            <>
              <CippFormComponent
                type="textField"
                name="status"
                label="Status"
                disableVariables={true}
                formControl={formControl}
              />
              <CippFormCondition
                field="status"
                compareType="is"
                compareValue="active"
                formControl={formControl}
              >
                <CippFormComponent
                  type="textField"
                  name="extra"
                  label="Extra"
                  disableVariables={true}
                  formControl={formControl}
                />
              </CippFormCondition>
            </>
          )
        }}
      </FormWrapper>
    )
    expect(screen.getByRole('textbox', { name: 'Extra' })).toBeInTheDocument()
    expect(capturedFormControl.getValues('extra')).toBe('keep-me')

    // break the condition, clearOnHide defaults to true -> field reset to null
    await userEvent.type(screen.getByRole('textbox', { name: 'Status' }), 'x')
    await waitFor(() => {
      expect(screen.queryByRole('textbox', { name: 'Extra' })).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(capturedFormControl.getValues('extra')).toBeNull()
    })
  })

  it('shows children when "greaterThan" condition is met', () => {
    renderWithTheme(
      <FormWrapper defaultValues={{ count: 10 }}>
        {(formControl) => (
          <CippFormCondition
            field="count"
            compareType="greaterThan"
            compareValue={5}
            formControl={formControl}
          >
            <div data-testid="child-content">GreaterThan Content</div>
          </CippFormCondition>
        )}
      </FormWrapper>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})
