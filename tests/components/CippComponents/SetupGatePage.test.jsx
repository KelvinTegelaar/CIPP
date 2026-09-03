import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'

// vi.mock factories are hoisted, so router state has to live in a hoisted holder too.
const routerState = vi.hoisted(() => ({ pathname: '/onboardingv2', replace: vi.fn() }))

vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: routerState.pathname,
    asPath: routerState.pathname,
    query: {},
    isReady: true,
    push: () => Promise.resolve(),
    replace: routerState.replace,
  }),
}))

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())

// The wizard itself is out of scope here; render only the completion button it would show.
vi.mock('../../../src/components/CippWizard/OnboardingWizardPage.jsx', () => ({
  default: ({ completionButton }) => (
    <button type="button" onClick={completionButton.onClick}>
      {completionButton.label}
    </button>
  ),
}))

import SetupGatePage from '../../../src/components/CippComponents/SetupGatePage.jsx'

describe('SetupGatePage - Enter CIPP', () => {
  beforeEach(() => {
    routerState.replace.mockClear()
  })

  it('navigates to the site root when the gate was reached on the wizard route', async () => {
    routerState.pathname = '/onboardingv2'
    const user = userEvent.setup()
    renderWithProviders(<SetupGatePage />)

    await user.click(await screen.findByRole('button', { name: 'Enter CIPP' }))

    expect(routerState.replace).toHaveBeenCalledWith('/')
  })

  it('leaves the route alone when already at the root', async () => {
    routerState.pathname = '/'
    const user = userEvent.setup()
    renderWithProviders(<SetupGatePage />)

    await user.click(await screen.findByRole('button', { name: 'Enter CIPP' }))

    expect(routerState.replace).not.toHaveBeenCalled()
  })
})
