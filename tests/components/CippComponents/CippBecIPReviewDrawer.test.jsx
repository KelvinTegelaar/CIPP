import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippBecIPReviewDrawer } from '../../../src/components/CippComponents/CippBecIPReviewDrawer'
import { ApiPostCall } from '../../../src/api/ApiCall'
import { usePermissions } from '../../../src/hooks/use-permissions'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(() => ({ data: undefined })),
  ApiPostCall: vi.fn(),
  ApiGetCallWithPagination: vi.fn(() => ({
    data: undefined,
    isSuccess: false,
  })),
}))
vi.mock('../../../src/hooks/use-permissions', () => ({
  usePermissions: vi.fn(),
}))
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
vi.mock('../../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ visible, children, footer }) =>
    visible ? (
      <div data-testid="CippOffCanvas">
        {children}
        {footer}
      </div>
    ) : null,
}))

const becData = {
  IPVerdicts: [
    {
      IP: '198.51.100.7',
      Verdict: 'LikelyAttacker',
      Score: 9,
      Source: 'Heuristics',
      City: 'Lagos',
      Country: 'NG',
      Reasons: [
        {
          Code: 'HostingOrProxy',
          Weight: 3,
          Text: 'Hosting network (DIGITALOCEAN-ASN)',
        },
        {
          Code: 'NewToUser',
          Weight: 2,
          Text: 'Never used by the user before the window',
        },
      ],
    },
    {
      IP: '203.0.113.10',
      Verdict: 'LikelyUser',
      Score: -6,
      Source: 'Heuristics',
      Reasons: [
        {
          Code: 'BaselineRegular',
          Weight: -4,
          Text: "The user's regular address",
        },
      ],
    },
  ],
  IPOverrides: [
    { Range: '203.0.113.10', Verdict: 'Safe', Note: 'office' },
    // a range the list does not show: carried through unchanged
    { Range: '192.0.2.0/24', Verdict: 'Compromised', Note: 'kit' },
  ],
}

let calls
beforeEach(() => {
  calls = []
  ApiPostCall.mockImplementation(() => ({
    mutate: (args) => calls.push(args),
    isPending: false,
  }))
  usePermissions.mockReturnValue({ checkPermissions: () => false })
})

const open = async (user) => {
  renderWithProviders(
    <CippBecIPReviewDrawer
      tenantFilter="contoso.com"
      caseId="BEC-1"
      becData={becData}
    />
  )
  await user.click(screen.getByRole('button', { name: /review ips/i }))
  return screen.findByTestId('CippOffCanvas')
}

describe('CippBecIPReviewDrawer', () => {
  it('shows each address with its verdict, score and signed reasons', async () => {
    const user = userEvent.setup()
    await open(user)
    expect(screen.getByText('198.51.100.7')).toBeInTheDocument()
    expect(screen.getByText('Likely attacker')).toBeInTheDocument()
    expect(screen.getByText('Score 9')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument()
    expect(screen.getByText('-4')).toBeInTheDocument()
    expect(
      screen.getByText('Hosting network (DIGITALOCEAN-ASN)')
    ).toBeInTheDocument()
  }, 30000)

  it('keeps the re-run disabled until a verdict differs from the case', async () => {
    const user = userEvent.setup()
    await open(user)
    const run = screen.getByRole('button', {
      name: /re-run with these verdicts/i,
    })
    expect(run).toBeDisabled()
    await user.click(screen.getAllByRole('combobox', { name: /verdict/i })[0])
    await user.click(await screen.findByRole('option', { name: 'Compromised' }))
    await waitFor(() => expect(run).toBeEnabled())
    await user.click(run)
    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].url).toBe('/api/ExecBECIPReview')
    expect(calls[0].data).toEqual({
      tenantFilter: 'contoso.com',
      CaseId: 'BEC-1',
      Overrides: [
        { IP: '198.51.100.7', Verdict: 'Compromised', Note: '' },
        { IP: '203.0.113.10', Verdict: 'Safe', Note: 'office' },
        { IP: '192.0.2.0/24', Verdict: 'Compromised', Note: 'kit' },
      ],
    })
  }, 30000)

  it('remembers the choices in the CIPP IP list only with the settings permission', async () => {
    usePermissions.mockReturnValue({ checkPermissions: () => true })
    const user = userEvent.setup()
    await open(user)
    await user.click(screen.getAllByRole('combobox', { name: /verdict/i })[0])
    await user.click(await screen.findByRole('option', { name: 'Compromised' }))
    await user.click(screen.getByLabelText(/remember for this tenant/i))
    await user.click(
      screen.getByRole('button', { name: /re-run with these verdicts/i })
    )
    await waitFor(() => expect(calls).toHaveLength(3))
    const saved = calls.filter((c) => c.url.startsWith('/api/ExecAddTrustedIP'))
    expect(saved[0].url).toContain('tenantFilter=contoso.com')
    expect(saved.find((c) => c.data.State === 'Trusted').data.IP).toEqual([
      '203.0.113.10',
    ])
    expect(saved.find((c) => c.data.State === 'Blocked').data.IP).toEqual([
      '198.51.100.7',
      '192.0.2.0/24',
    ])
  }, 30000)

  it('needs at least one address away from Auto before it re-runs', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippBecIPReviewDrawer
        tenantFilter="contoso.com"
        caseId="BEC-1"
        becData={{ IPVerdicts: becData.IPVerdicts, IPOverrides: [] }}
      />
    )
    await user.click(screen.getByRole('button', { name: /review ips/i }))
    const run = await screen.findByRole('button', {
      name: /re-run with these verdicts/i,
    })
    expect(run).toBeDisabled()
    expect(
      screen.getByText(/set at least one address to safe or compromised/i)
    ).toBeInTheDocument()
    await user.click(screen.getAllByRole('combobox', { name: /verdict/i })[1])
    await user.click(await screen.findByRole('option', { name: 'Safe' }))
    await waitFor(() => expect(run).toBeEnabled())
    expect(
      screen.queryByText(/set at least one address to safe or compromised/i)
    ).not.toBeInTheDocument()
  }, 30000)

  it('explains that verdicts already applied to the case need no re-run', async () => {
    const user = userEvent.setup()
    await open(user)
    expect(
      screen.getByRole('button', { name: /re-run with these verdicts/i })
    ).toBeDisabled()
    expect(
      screen.getByText(/already applied to this case/i)
    ).toBeInTheDocument()
  }, 30000)

  it('hides the remember switch without the settings permission', async () => {
    const user = userEvent.setup()
    await open(user)
    expect(
      screen.queryByLabelText(/remember for this tenant/i)
    ).not.toBeInTheDocument()
  }, 30000)
})
