import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippFormPage from '../../../src/components/CippFormPages/CippFormPage'
import CippFormComponent from '../../../src/components/CippComponents/CippFormComponent'

// capture the submit payload, network layer is not under test here
const apiState = vi.hoisted(() => ({ mutate: null }))

vi.mock('../../../src/api/ApiCall', () => ({
  ApiPostCall: () => ({
    mutate: apiState.mutate,
    isPending: false,
    isSuccess: false,
    isIdle: true,
    isError: false,
    isFetching: false,
    data: undefined,
    reset: () => {},
  }),
  // CippApiResults polls job status through ApiGetCall, keep it inert
  ApiGetCall: () => ({
    isSuccess: false,
    isPending: true,
    isFetching: false,
    isError: false,
    data: undefined,
  }),
}))

const Harness = ({ defaultValues = { displayName: '', notes: '' }, ...pageProps }) => {
  const formControl = useForm({ mode: 'onChange', defaultValues })
  return (
    <CippFormPage title="User" postUrl="/api/AddUser" formControl={formControl} {...pageProps}>
      <CippFormComponent
        type="textField"
        name="displayName"
        label="Display Name"
        formControl={formControl}
      />
      <CippFormComponent type="textField" name="notes" label="Notes" formControl={formControl} />
    </CippFormPage>
  )
}

describe('CippFormPage', () => {
  beforeEach(() => {
    apiState.mutate = vi.fn()
  })

  it('renders the page type, title, and form children', () => {
    renderWithProviders(<Harness />)

    expect(screen.getByRole('heading', { name: 'Add - User' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Display Name' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
  })

  it('renders a custom page type and hides it on request', () => {
    const { unmount } = renderWithProviders(<Harness formPageType="Edit" />)
    expect(screen.getByRole('heading', { name: 'Edit - User' })).toBeInTheDocument()
    unmount()

    renderWithProviders(<Harness hidePageType />)
    expect(screen.getByRole('heading', { name: 'User' })).toBeInTheDocument()
  })

  it('submits form values to postUrl and strips empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    await user.type(screen.getByRole('textbox', { name: 'Display Name' }), 'John Doe')
    const submit = screen.getByRole('button', { name: 'Submit' })
    await waitFor(() => {
      expect(submit).toBeEnabled()
    })
    await user.click(submit)

    await waitFor(() => {
      expect(apiState.mutate).toHaveBeenCalledTimes(1)
    })
    // notes stayed '', removeEmpty drops it from the payload
    expect(apiState.mutate).toHaveBeenCalledWith({
      url: '/api/AddUser',
      data: { displayName: 'John Doe' },
    })
  })
})
