import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippContainerManagement } from '../../../src/components/CippSettings/CippContainerManagement'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, paginatedResult, postResult } from '../../mocks/api-call'

// stable references, fresh literals per call spin CippAutoComplete's mapping effect
const statusGet = getResult()
// status payload only answers its own url, the page's other GETs stay idle
const idleGet = getResult({ isSuccess: false })
api.get = (opts) => (opts.url === '/api/ExecContainerManagement' ? statusGet : idleGet)
api.paginated = paginatedResult()
api.post = postResult()

// Status shape from Invoke-ExecContainerManagement.ps1 (Action=Status)
const BUILD_PATTERN = '^(preview|feat|fix|refactor|perf|chore|build|revert)-[a-z0-9][a-z0-9._-]{0,54}$'

const statusResults = (channel) => ({
  CurrentVersion: '8.0.0',
  CommitSha: 'abc1234def5678',
  ImageTag: channel,
  BuildDate: '2026-07-30T01:02:03Z',
  CurrentChannel: channel,
  ConfiguredChannel: channel,
  CurrentImage: `ghcr.io/cyberdrain/cipp:${channel}`,
  SiteName: 'cipp-example',
  ValidChannels: ['latest', 'dev', 'nightly'],
  BuildChannelPattern: BUILD_PATTERN,
  UpdateSettings: {
    AutoUpdate: true,
    CheckInterval: '1h',
    CheckTime: '23',
    LastCheck: null,
    UpdateAvailable: false,
    RunningVersion: null,
    RemoteVersion: null,
    RemoteDigest: null,
    RemoteBuildDate: null,
  },
})

// ListChannels shape, group per -[0-9a-f]{7} suffix (ps1 :266-271)
const channelListResults = [
  { label: 'latest', value: 'latest', group: 'Standard channels' },
  { label: 'dev', value: 'dev', group: 'Standard channels' },
  { label: 'nightly', value: 'nightly', group: 'Standard channels' },
  { label: 'feat-new-widget', value: 'feat-new-widget', group: 'Branch builds (latest)' },
  { label: 'fix-sso-thing-a1b2c3d', value: 'fix-sso-thing-a1b2c3d', group: 'Branch builds (pinned)' },
]

const PINNED_PRETTY = 'fix-sso-thing — pinned a1b2c3d'
const ALERT_RE = /unsupported build from an unmerged branch/

describe('CippContainerManagement branch-build flagging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    statusGet.data = undefined
    api.paginated.data = { pages: [{ Results: [] }] }
  })

  it('running pinned branch build chips the split tag, not Unknown', () => {
    statusGet.data = { Results: statusResults('fix-sso-thing-a1b2c3d') }
    renderWithProviders(<CippContainerManagement />)
    expect(screen.getByText(PINNED_PRETTY)).toBeInTheDocument()
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
  })

  it('running branch build shows the unsupported-build alert and seeds the picker with its tag', async () => {
    statusGet.data = { Results: statusResults('feat-new-widget') }
    renderWithProviders(<CippContainerManagement />)
    expect(await screen.findByText(ALERT_RE)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Release Channel' })).toHaveValue('feat-new-widget')
  })

  it('standard channel chips its friendly label and raises no branch alert', async () => {
    statusGet.data = { Results: statusResults('dev') }
    renderWithProviders(<CippContainerManagement />)
    expect(screen.getByText('Dev')).toBeInTheDocument()
    // wait for the seed effect so the alert-absence check runs against the settled form
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Release Channel' })).toHaveValue('Dev')
    })
    expect(screen.queryByText(ALERT_RE)).not.toBeInTheDocument()
  })

  it('unrecognized non-branch tag chips Unknown without raising the branch alert', async () => {
    // bare version tag: not a valid channel, does not match BuildChannelPattern
    statusGet.data = { Results: statusResults('8.0.1') }
    renderWithProviders(<CippContainerManagement />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Release Channel' })).toHaveValue('8.0.1')
    })
    expect(screen.queryByText(ALERT_RE)).not.toBeInTheDocument()
  })

  it('picking a branch build raises the alert, switching back to a standard channel clears it', async () => {
    statusGet.data = { Results: statusResults('latest') }
    api.paginated.data = { pages: [{ Results: channelListResults }] }
    const user = userEvent.setup()
    renderWithProviders(<CippContainerManagement />)

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Release Channel' })).toHaveValue('Latest (Stable)')
    })
    expect(screen.queryByText(ALERT_RE)).not.toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Release Channel' }))
    // producer group flows through rawData into groupBy
    expect(await screen.findByText('Branch builds (pinned)')).toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: PINNED_PRETTY }))

    const alert = await screen.findByText(ALERT_RE)
    expect(alert).toBeInTheDocument()
    // alert names the raw tag, not the pretty label
    expect(screen.getByText('fix-sso-thing-a1b2c3d')).toBeInTheDocument()

    // selection remounts the keyed autocomplete, re-query
    await user.click(screen.getByRole('combobox', { name: 'Release Channel' }))
    await user.click(await screen.findByRole('option', { name: 'Dev' }))
    await waitFor(() => {
      expect(screen.queryByText(ALERT_RE)).not.toBeInTheDocument()
    })
  })
})

describe('CippContainerManagement provenance state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.paginated.data = { pages: [{ Results: [] }] }
    const results = statusResults('dev')
    statusGet.data = {
      Results: {
        ...results,
        UpdateSettings: {
          ...results.UpdateSettings,
          LastCheck: 1793600000,
          UpdateAvailable: true,
          RemoteVersion: '8.0.1',
          AttestationState: 'Failed',
          AttestationReason: 'No Sigstore attestation is published for this image',
        },
      },
    }
  })

  it('labels a failed-provenance update as unverified on the status tile', () => {
    renderWithProviders(<CippContainerManagement />)
    expect(screen.getByText('Update unverified')).toBeInTheDocument()
    expect(screen.queryByText('Update available')).not.toBeInTheDocument()
  })

  it('raises the provenance warning instead of the plain update notice', () => {
    renderWithProviders(<CippContainerManagement />)
    expect(screen.getByText(/did not pass provenance verification/)).toBeInTheDocument()
    expect(screen.queryByText(/Restart the container to pull the latest image/)).not.toBeInTheDocument()
  })

  it('flags an up-to-date instance whose channel image failed provenance', () => {
    statusGet.data.Results.UpdateSettings.UpdateAvailable = false
    renderWithProviders(<CippContainerManagement />)
    expect(screen.getByText('Up to date, unverified')).toBeInTheDocument()
    expect(screen.getByText(/did not pass provenance verification/)).toBeInTheDocument()
    expect(screen.queryByText(/will not be applied automatically/)).not.toBeInTheDocument()
  })
})

describe('CippContainerManagement running image provenance', () => {
  const PINNED = 'sha256:b463b2a33198ba15d07246002cf59860da3a5ecddb2c73c47fb24a881b25b1e2'
  const withRunning = (running) => {
    const results = statusResults('dev')
    statusGet.data = {
      Results: {
        ...results,
        UpdateSettings: { ...results.UpdateSettings, LastCheck: 1793600000, ...running },
      },
    }
  }
  const openBuildDetails = async (user) => {
    await user.click(screen.getByText('8.0.0 @abc1234'))
    return screen.findAllByText('Build Details')
  }

  beforeEach(() => {
    vi.clearAllMocks()
    api.paginated.data = { pages: [{ Results: [] }] }
  })

  it('shows Unpinned with its reason and leaves the update tile alone', async () => {
    withRunning({
      PinnedDigest: '',
      RunningAttestationState: 'Unpinned',
      RunningAttestationReason: 'The site configuration names a tag, not a digest',
    })
    const user = userEvent.setup()
    renderWithProviders(<CippContainerManagement />)
    expect(screen.getByText('Up to date')).toBeInTheDocument()
    await openBuildDetails(user)
    expect(await screen.findByText('Unpinned')).toBeInTheDocument()
    expect(screen.getByText(/names a tag, not a digest/)).toBeInTheDocument()
    expect(screen.queryByText('Pinned Digest')).not.toBeInTheDocument()
  })

  it('shows the truncated pinned digest and Verified for a verified pin', async () => {
    withRunning({ PinnedDigest: PINNED, RunningAttestationState: 'Verified', RunningDigest: PINNED })
    statusGet.data.Results.CurrentImage = `ghcr.io/cyberdrain/cipp:dev@${PINNED}`
    const user = userEvent.setup()
    renderWithProviders(<CippContainerManagement />)
    expect(screen.getByText('Up to date')).toBeInTheDocument()
    // the channel picker shows the tag, never digest text
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Release Channel' })).toHaveValue('Dev')
    })
    await openBuildDetails(user)
    expect(await screen.findByText('sha256:b463b2a33198…')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('raises the update tile to an error when the pinned running image fails', () => {
    withRunning({
      PinnedDigest: PINNED,
      RunningAttestationState: 'Failed',
      RunningAttestationReason: 'attested commit does not match the running build',
      RunningDigest: PINNED,
    })
    renderWithProviders(<CippContainerManagement />)
    expect(screen.getByText('Running image unverified')).toBeInTheDocument()
    expect(screen.queryByText('Up to date')).not.toBeInTheDocument()
  })
})
