import React from 'react'
import { Alert, Box, Typography } from '@mui/material'
import { within, expect, waitFor, userEvent } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import { PrivateRoute } from '../../src/components/PrivateRoute'

// Rendered through PrivateRoute so the stories exercise the real gate decision:
// /api/me reporting initialSetupComplete false replaces the entire app with the
// full-screen setup wizard (admins) or the hold page (everyone else).
//
// One story per wizard page: each play() walks the real First Setup flow up to
// its page and stops there, so the canvas shows that page in its true first-run
// state and stays interactive from that point on.
//
// CIPPM365OAuthButton is replaced by tests/mocks/cipp-m365-oauth-button.jsx (see
// .storybook/main.mjs) - clicking any auth button reports instant success - and
// the backend endpoints are stateful mocks: connecting the partner tenant flips
// ExecListAppId from the fresh shape to the connected shape, exactly like the
// real backend after ExecUpdateRefreshToken.
export default {
  title: 'Pages/SetupGate',
  component: PrivateRoute,
  tags: ['autodocs'],
}

const TENANT_ID = '99999999-8888-7777-6666-555555555555'

const principal = (userRoles) => ({
  clientPrincipal: { userDetails: 'john@contoso.com', userRoles },
})

const meResponse = (userRoles, { complete = false, samAppPresent = false } = {}) => ({
  ...principal(userRoles),
  permissions: ['CIPP.AppSettings.ReadWrite'],
  initialSetupComplete: complete,
  samAppPresent,
})

// Fresh installs have no org info until the partner tenant is connected - that
// difference is what flips the Tenants step between "Connect to Partner Tenant"
// and "Change Partner Tenant", and what marks the step complete (GDAPAuth).
const freshAppId = {
  applicationId: '11111111-2222-3333-4444-555555555555',
  tenantId: null,
  orgName: null,
  authenticatedUserDisplayName: null,
  authenticatedUserPrincipalName: null,
  isPartnerTenant: false,
  partnerTenantType: null,
  refreshUrl: 'about:blank',
}

const connectedAppId = {
  ...freshAppId,
  tenantId: TENANT_ID,
  orgName: 'Contoso Partner',
  authenticatedUserDisplayName: 'CIPP Service Account',
  authenticatedUserPrincipalName: 'cipp-service@contoso.onmicrosoft.com',
  isPartnerTenant: true,
  partnerTenantType: 'partner',
}

const combinedSetupSuccess = [
  'Setup is now complete. You may navigate away from this page and start using CIPP.',
]

// Each story gets its own sandbox instance (reset in a loader) so stories can't
// contaminate each other - the autodocs page renders all of them at once.
const makeSandbox = () => ({ partnerConnected: false, setupDone: false })

const sandboxHandlers = (sandbox, { liveMe = false } = {}) => [
  http.get('*/.auth/me', () =>
    HttpResponse.json(principal(['anonymous', 'authenticated', 'admin'])),
  ),
  http.get('*/api/me', () =>
    HttpResponse.json(
      meResponse(['anonymous', 'authenticated', 'admin'], {
        complete: liveMe ? sandbox.setupDone : false,
        samAppPresent: liveMe ? sandbox.setupDone : false,
      }),
    ),
  ),
  http.get('*/api/ExecListAppId', () =>
    HttpResponse.json(sandbox.partnerConnected ? connectedAppId : freshAppId),
  ),
  http.post('*/api/ExecCreateSamApp', () =>
    HttpResponse.json({ severity: 'success', message: 'SAM application created (mocked)' }),
  ),
  http.post('*/api/ExecUpdateRefreshToken', () => {
    sandbox.partnerConnected = true
    return HttpResponse.json({ Results: 'Refresh token updated (mocked)' })
  }),
  http.post('*/api/ExecAddTenant', () =>
    HttpResponse.json({ Results: 'Tenant added (mocked)' }),
  ),
  http.get('*/api/ListCommunityRepos', () => HttpResponse.json({ Results: [] })),
  http.post('*/api/ExecCombinedSetup', () => {
    sandbox.setupDone = true
    return HttpResponse.json(combinedSetupSuccess)
  }),
]

// The child stands in for the whole app: it only renders once the setup gate
// lifts (in production this is the dashboard). Assertions match the exact text
// 'app content' on the subtitle node.
const renderGate = () => (
  <PrivateRoute>
    <Box sx={{ p: 3 }}>
      <Alert severity="success">
        <Typography variant="subtitle2">app content</Typography>
        <Typography variant="body2">
          The setup gate has lifted - this placeholder stands in for the real CIPP app, which is
          now accessible.
        </Typography>
      </Alert>
    </Box>
  </PrivateRoute>
)

// Builds a story that walks to one wizard page and stops. `sandbox` is owned by
// the story so its loader can reset it between viewings. `mockAuth` steers the
// mocked CIPPM365OAuthButton (see tests/mocks/cipp-m365-oauth-button.jsx);
// `extraHandlers` are prepended so they win over the sandbox defaults.
const gateStory = (walk, { mockAuth = null, extraHandlers = [] } = {}) => {
  const sandbox = makeSandbox()
  return {
    render: renderGate,
    loaders: [
      async () => {
        sandbox.partnerConnected = false
        sandbox.setupDone = false
        window.__cippMockM365Auth = mockAuth || undefined
        return {}
      },
    ],
    parameters: { msw: { handlers: [...extraHandlers, ...sandboxHandlers(sandbox)] } },
    play: async ({ canvasElement, step }) => {
      await walk(within(canvasElement), step)
    },
  }
}

// ---- navigation helpers (cumulative, mirroring the real click path) ----

const clickNext = async (canvas) => {
  const next = canvas.getByRole('button', { name: 'Next Step' })
  await waitFor(() => expect(next).toBeEnabled())
  await userEvent.click(next)
}

const atOptionsPage = async (canvas) => {
  await waitFor(() => {
    expect(canvas.getByText('Welcome to CIPP')).toBeInTheDocument()
    expect(canvas.getByText('First Setup')).toBeInTheDocument()
  })
}

const toApplicationPage = async (canvas) => {
  await atOptionsPage(canvas)
  await userEvent.click(canvas.getByText('First Setup'))
  await clickNext(canvas)
  // auto-started device code retrieval shows the fake code card and switches
  // the button label, exactly like the real first-run
  await waitFor(() => {
    expect(canvas.getByText('STORYBOOK1')).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: 'Authenticate with Code' })).toBeEnabled()
  })
}

const authenticateOnApplicationPage = async (canvas) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Authenticate with Code' }))
}

const toTenantsPage = async (canvas) => {
  await toApplicationPage(canvas)
  await authenticateOnApplicationPage(canvas)
  await clickNext(canvas)
  await waitFor(() => {
    expect(canvas.getByText('Partner Tenant')).toBeInTheDocument()
  })
}

const connectPartnerTenant = async (canvas) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Connect to Partner Tenant' }))
  // ApiPostCall invalidates listAppId ~1s after success; the refetch flips the
  // stateful mock to the connected shape
  await waitFor(
    () => {
      expect(canvas.getByText('Contoso Partner')).toBeInTheDocument()
    },
    { timeout: 5000 },
  )
}

const toBaselinesPage = async (canvas) => {
  await toTenantsPage(canvas)
  await connectPartnerTenant(canvas)
  await clickNext(canvas)
  await waitFor(() => {
    expect(canvas.getByText('Baseline Configuration')).toBeInTheDocument()
  })
}

const toNotificationsPage = async (canvas) => {
  await toBaselinesPage(canvas)
  await userEvent.click(canvas.getByText('No Baselines - I want to create my own templates'))
  await clickNext(canvas)
  await waitFor(() => {
    expect(canvas.getByText('Notification Settings')).toBeInTheDocument()
  })
}

const toFinalStepsPage = async (canvas) => {
  await toNotificationsPage(canvas)
  await clickNext(canvas)
  await waitFor(() => {
    expect(canvas.getByText('Almost done')).toBeInTheDocument()
  })
}

// ---- one story per page ----

export const FreshInstall = gateStory(async (canvas, step) => {
  await step('admin lands on the full-screen wizard, app content blocked', async () => {
    await atOptionsPage(canvas)
    expect(canvas.queryByText('app content')).not.toBeInTheDocument()
  })
  await step('fresh install offers First Setup and Manual only', async () => {
    expect(canvas.getByText('Manually enter credentials')).toBeInTheDocument()
    expect(
      canvas.queryByText('Refresh Tokens for existing application registration'),
    ).not.toBeInTheDocument()
    expect(canvas.queryByText('Add a tenant')).not.toBeInTheDocument()
  })
})

export const StepApplication = gateStory(async (canvas, step) => {
  await step('First Setup advances to the SAM application step', async () => {
    await toApplicationPage(canvas)
  })
})

export const StepTenants = gateStory(async (canvas, step) => {
  await step('mock auth creates the SAM app and advances to Tenants', async () => {
    await toTenantsPage(canvas)
  })
  await step('first run prompts to CONNECT the partner tenant, not change it', async () => {
    // the warning renders once the ExecListAppId fetch settles with no org info
    await waitFor(() => {
      expect(canvas.getByText(/No partner tenant connected/)).toBeInTheDocument()
    })
    expect(canvas.getByRole('button', { name: 'Connect to Partner Tenant' })).toBeInTheDocument()
    expect(canvas.queryByText('Change Partner Tenant')).not.toBeInTheDocument()
  })
})

export const StepTenantsConnected = gateStory(async (canvas, step) => {
  await toTenantsPage(canvas)
  await step('connecting fills the partner card and unblocks Next', async () => {
    await connectPartnerTenant(canvas)
    expect(canvas.getByRole('button', { name: 'Change Partner Tenant' })).toBeInTheDocument()
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Next Step' })).toBeEnabled())
  })
})

export const StepBaselines = gateStory(async (canvas, step) => {
  await step('baseline selection page', async () => {
    await toBaselinesPage(canvas)
  })
})

export const StepNotifications = gateStory(async (canvas, step) => {
  await step('notification settings page', async () => {
    await toNotificationsPage(canvas)
  })
})

export const StepFinalSteps = gateStory(async (canvas, step) => {
  await step('almost-done page ahead of the confirmation step', async () => {
    await toFinalStepsPage(canvas)
  })
})

// ---- auth failure scenarios ----

export const StepApplicationAuthError = gateStory(
  async (canvas, step) => {
    await toApplicationPage(canvas)
    await step('failed auth surfaces the error and keeps the step blocked', async () => {
      await authenticateOnApplicationPage(canvas)
      await waitFor(() => {
        expect(canvas.getByText(/Authentication Error: expired_token/)).toBeInTheDocument()
      })
      // shown twice by design parity with the real flow: the button's own error
      // alert plus the step's authStatus alert
      expect(canvas.getAllByText(/device code has expired/).length).toBeGreaterThan(0)
      expect(canvas.getByRole('button', { name: 'Next Step' })).toBeDisabled()
    })
    await step('the admin is not dead-ended: dismiss + retry and Back both exist', async () => {
      // device code card stays up (like the real poll-failure path) so retry is
      // one click away, and Back reaches the options page to pick Manual instead
      expect(canvas.getByText('STORYBOOK1')).toBeInTheDocument()
      expect(canvas.getByRole('button', { name: 'Dismiss' })).toBeEnabled()
      expect(canvas.getByRole('button', { name: 'Back' })).toBeEnabled()
    })
  },
  {
    mockAuth: {
      outcome: 'error',
      errorCode: 'expired_token',
      errorMessage:
        'AADSTS70020: The provided device code has expired. Please restart the sign-in flow.',
    },
  },
)

export const StepApplicationWrongAccount = gateStory(
  async (canvas, step) => {
    await toApplicationPage(canvas)
    await step('non service account shows the advisory warning', async () => {
      await authenticateOnApplicationPage(canvas)
      await waitFor(() => {
        expect(canvas.getByText('Service Account Required')).toBeInTheDocument()
      })
      expect(canvas.getByText('john.admin@contoso.com')).toBeInTheDocument()
    })
    await step('current product behavior: auth still counts and Next unblocks', async () => {
      // the real button fires onAuthSuccess even for a non service account - the
      // warning is advisory only, SAM creation proceeds and the step completes
      await waitFor(() => {
        expect(canvas.getByRole('button', { name: 'Next Step' })).toBeEnabled()
      })
    })
  },
  { mockAuth: { outcome: 'nonServiceAccount' } },
)

export const StepApplicationSamCreateError = gateStory(
  async (canvas, step) => {
    await toApplicationPage(canvas)
    await step('valid token but SAM app creation fails backend-side', async () => {
      await authenticateOnApplicationPage(canvas)
      await waitFor(() => {
        expect(canvas.getAllByText(/app management policy/).length).toBeGreaterThan(0)
      })
      expect(canvas.getByRole('button', { name: 'Next Step' })).toBeDisabled()
      expect(canvas.getByRole('button', { name: 'Back' })).toBeEnabled()
    })
  },
  {
    extraHandlers: [
      http.post('*/api/ExecCreateSamApp', () =>
        HttpResponse.json({
          severity: 'error',
          message:
            'Failed to add a password to the CIPP-SAM application: an app management policy in your tenant blocks password addition (AADSTS7000112). Exempt CIPP from the policy or switch to certificate authentication.',
        }),
      ),
    ],
  },
)

export const StepTenantsConnectError = gateStory(
  async (canvas, step) => {
    await toTenantsPage(canvas)
    await step('partner tenant connect fails and the step stays blocked', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Connect to Partner Tenant' }))
      await waitFor(
        () => {
          expect(canvas.getByText(/AADSTS70008/)).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
      expect(canvas.getByRole('button', { name: 'Next Step' })).toBeDisabled()
      // still on the unconnected state, retry available
      expect(canvas.getByRole('button', { name: 'Connect to Partner Tenant' })).toBeEnabled()
    })
  },
  {
    extraHandlers: [
      http.post('*/api/ExecUpdateRefreshToken', () =>
        HttpResponse.json(
          {
            Results:
              'Failed to update refresh token: AADSTS70008: The provided authorization code or refresh token has expired.',
          },
          { status: 500 },
        ),
      ),
    ],
  },
)

export const AppExistsTokensMissing = {
  render: renderGate,
  parameters: {
    msw: {
      handlers: [
        http.get('*/.auth/me', () =>
          HttpResponse.json(principal(['anonymous', 'authenticated', 'admin'])),
        ),
        http.get('*/api/me', () =>
          HttpResponse.json(
            meResponse(['anonymous', 'authenticated', 'admin'], { samAppPresent: true }),
          ),
        ),
        http.get('*/api/ExecListAppId', () => HttpResponse.json(connectedAppId)),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('existing app registration adds the token-reset option', async () => {
      await waitFor(() => {
        expect(
          canvas.getByText('Refresh Tokens for existing application registration'),
        ).toBeInTheDocument()
      })
      expect(canvas.getByText('First Setup')).toBeInTheDocument()
      expect(canvas.getByText('Manually enter credentials')).toBeInTheDocument()
    })
  },
}

export const NonAdminHold = {
  render: renderGate,
  parameters: {
    msw: {
      handlers: [
        http.get('*/.auth/me', () =>
          HttpResponse.json(principal(['anonymous', 'authenticated', 'editor'])),
        ),
        http.get('*/api/me', () =>
          HttpResponse.json(meResponse(['anonymous', 'authenticated', 'editor'])),
        ),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('non-admins are held out with sign-out as the only action', async () => {
      await waitFor(() => {
        expect(canvas.getByText('CIPP is being set up')).toBeInTheDocument()
      })
      expect(canvas.getByText('Sign out')).toBeInTheDocument()
      expect(canvas.queryByText('Welcome to CIPP')).not.toBeInTheDocument()
      expect(canvas.queryByText('app content')).not.toBeInTheDocument()
    })
  },
}

// /api/me tracks completion here: submitting the wizard flips it to complete, so
// clicking "Enter CIPP" after the final step genuinely lifts the gate and
// "app content" appears. The play drives the ENTIRE First Setup path end to end
// - auth, partner tenant, baselines, notifications, submit, Enter CIPP -
// finishing on the unblocked app.
const completionSandbox = makeSandbox()

export const WizardCompletionFlow = {
  render: renderGate,
  loaders: [
    async () => {
      completionSandbox.partnerConnected = false
      completionSandbox.setupDone = false
      window.__cippMockM365Auth = undefined
      return {}
    },
  ],
  parameters: {
    msw: { handlers: sandboxHandlers(completionSandbox, { liveMe: true }) },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('walks the entire First Setup path to the confirmation step', async () => {
      await toFinalStepsPage(canvas)
      await clickNext(canvas)
      await waitFor(() => {
        expect(canvas.getByRole('button', { name: 'Submit' })).toBeEnabled()
      })
    })
    await step('submitting completes setup and offers Enter CIPP', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
      await waitFor(
        () => {
          expect(canvas.getByRole('button', { name: 'Enter CIPP' })).toBeEnabled()
        },
        { timeout: 5000 },
      )
    })
    await step('Enter CIPP lifts the gate into the app', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Enter CIPP' }))
      await waitFor(
        () => {
          expect(canvas.getByText('app content')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
      expect(canvas.queryByText('Welcome to CIPP')).not.toBeInTheDocument()
    })
  },
}
