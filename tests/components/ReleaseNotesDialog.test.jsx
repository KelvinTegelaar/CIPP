import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'

// public/version.json is rewritten with the image's APP_VERSION at build time, so the running
// build's version is whatever this holds. Mutate between mounts to simulate a different build.
const versionState = vi.hoisted(() => ({ version: '10.8.2' }))
vi.mock('../../public/version.json', () => ({ default: versionState }))

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }))
vi.mock('../../src/hooks/use-breakpoint', async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
}))

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())

import { api, getResult } from '../mocks/api-call'
import { ReleaseNotesDialog } from '../../src/components/ReleaseNotesDialog'

// newest first, the order GitHub returns releases in. v10.9.0 sits ahead of the running build so
// "newest release" and "running release" can never be confused for one another.
const RELEASES = [
  {
    name: 'v10.9.0 - Something Newer',
    releaseTag: 'v10.9.0',
    body: 'Notes for a release this instance has not been updated to yet',
    htmlUrl: 'https://github.com/CyberDrain/CIPP/releases/tag/v10.9.0',
    publishedAt: '2026-08-20T00:00:00Z',
  },
  {
    name: 'v10.8.2 - Hotfix',
    releaseTag: 'v10.8.2',
    body: 'Notes for the hotfix that is actually running',
    htmlUrl: 'https://github.com/CyberDrain/CIPP/releases/tag/v10.8.2',
    publishedAt: '2026-08-08T00:36:06Z',
  },
  {
    name: 'v10.8.0 - Ramos Melon Fizz',
    releaseTag: 'v10.8.0',
    body: 'Notes for the base release of the 10.8 series',
    htmlUrl: 'https://github.com/CyberDrain/CIPP/releases/tag/v10.8.0',
    publishedAt: '2026-08-07T17:01:49Z',
  },
]

// stable identity, a fresh literal per mock call loops CippAutoComplete's mapping effect
const catalogResult = getResult({ data: RELEASES })

const COOKIE_KEY = 'cipp_release_notice'
const PERMANENT_HIDE_KEY = 'cipp_release_notice_permanently_hidden'

const flushEffects = () => new Promise((resolve) => setTimeout(resolve, 0))

beforeEach(() => {
  layoutState.isMobile = false
  versionState.version = '10.8.2'
  api.get = catalogResult
  window.localStorage.clear()
  document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
})

describe('ReleaseNotesDialog', () => {
  // A hotfix release body is only the delta since the feature release, so opening on it tells
  // the user almost nothing. Display the newest vX.Y.0 instead — dismissal still tracks the
  // running tag, which is what the reopen-forever bug hinged on (see the next test).
  it('opens on the newest .0 release, not on a hotfix', async () => {
    renderWithProviders(<ReleaseNotesDialog />)

    expect(
      await screen.findByDisplayValue('v10.9.0 - Something Newer')
    ).toBeInTheDocument()
    expect(screen.queryByText('Notes for the hotfix that is actually running')).toBeNull()
  })

  it('still lets you pick a hotfix release from the picker', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ReleaseNotesDialog />)
    await screen.findByDisplayValue('v10.9.0 - Something Newer')

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('v10.8.2 - Hotfix'))

    expect(
      await screen.findByText('Notes for the hotfix that is actually running')
    ).toBeInTheDocument()
  })

  it('stays dismissed on reload after "Don\'t show until next release"', async () => {
    const user = userEvent.setup()

    const { unmount } = renderWithProviders(<ReleaseNotesDialog />)
    await screen.findByDisplayValue('v10.9.0 - Something Newer')
    await user.click(screen.getByRole('button', { name: "Don't show until next release" }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    // the tag of the build being run, not the newest tag on GitHub - storing v10.9.0 here left a
    // cookie the eligibility check could never match, so the dialog reopened on every page load
    expect(document.cookie).toContain(`${COOKIE_KEY}=v10.8.2`)

    unmount()
    renderWithProviders(<ReleaseNotesDialog />)
    await flushEffects()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens again once the instance is updated to a newer release', async () => {
    document.cookie = `${COOKIE_KEY}=v10.8.2; path=/`
    versionState.version = '10.9.0'

    renderWithProviders(<ReleaseNotesDialog />)

    expect(await screen.findByDisplayValue('v10.9.0 - Something Newer')).toBeInTheDocument()
  })

  // On phones the two low-emphasis actions live behind the kebab as bottom-sheet rows —
  // the same actions treatment as the rest of the mobile surface.
  it('puts GitHub and permanent dismiss behind the kebab sheet on mobile', async () => {
    layoutState.isMobile = true
    const user = userEvent.setup()
    renderWithProviders(<ReleaseNotesDialog />)
    // the house pick-one pattern: a trigger, not a text input — no keyboard to summon
    const trigger = await screen.findByRole('button', { name: /switch release/i })
    expect(trigger).toHaveTextContent('v10.9.0 - Something Newer')
    expect(screen.queryByDisplayValue('v10.9.0 - Something Newer')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'More options' }))
    // the desktop footer's copy is only display:none'd by a media query jsdom can't
    // evaluate — scope to the sheet's drawer paper
    const github = await screen.findByRole('link', { name: /view release notes on github/i })
    expect(github).toHaveAttribute('href', 'https://github.com/CyberDrain/CIPP/releases/tag/v10.9.0')
    const sheet = within(github.closest('.MuiDrawer-paper'))

    await user.click(sheet.getByText("Don't show again"))
    await flushEffects()
    expect(window.localStorage.getItem(PERMANENT_HIDE_KEY)).toBe('true')
  })

  it('switches release from the mobile sheet', async () => {
    layoutState.isMobile = true
    const user = userEvent.setup()
    renderWithProviders(<ReleaseNotesDialog />)

    await user.click(await screen.findByRole('button', { name: /switch release/i }))
    const sheet = within((await screen.findByText('Release')).closest('.MuiDrawer-paper'))
    await user.click(sheet.getByText('v10.8.2 - Hotfix'))

    expect(await screen.findByText('Notes for the hotfix that is actually running')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /switch release/i })).toHaveTextContent(
      'v10.8.2 - Hotfix'
    )
  })

  it('falls back to the .0 notes when the running version has no release of its own', async () => {
    versionState.version = '10.9.1'

    renderWithProviders(<ReleaseNotesDialog />)

    expect(await screen.findByDisplayValue('v10.9.0 - Something Newer')).toBeInTheDocument()
  })

  it('honours a permanent dismissal', async () => {
    window.localStorage.setItem(PERMANENT_HIDE_KEY, 'true')

    renderWithProviders(<ReleaseNotesDialog />)
    await flushEffects()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
