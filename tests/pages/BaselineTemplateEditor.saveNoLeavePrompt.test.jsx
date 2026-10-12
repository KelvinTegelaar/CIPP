import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'
import fixture from '../mocks/baseline-tenant-fixture.json'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
import { api, getResult, postResult } from '../mocks/api-call'

import Page from '../../src/pages/tenant/baselines/template.jsx'

const SAVED_ID = 'aaaaaaaa-0000-0000-0000-000000000002'
const savedClone = {
  ...fixture.baseline,
  GUID: SAVED_ID,
  templateName: 'Clone',
}
const baselinesResult = getResult({ data: [fixture.baseline, savedClone] })
const definitionsResult = getResult({ data: fixture.definitions })
const customVariablesResult = getResult({ data: { Results: [] } })
const emptyResult = getResult({ isSuccess: false })
api.get = (opts) => {
  if (opts?.url === '/api/ListBaselines') return baselinesResult
  if (opts?.url === '/api/ListBaselineStandards') return definitionsResult
  if (opts?.url === '/api/ListCustomVariables') return customVariablesResult
  return emptyResult
}
const postResults = []
const sharedPost = postResult()
api.post = (opts) => {
  if (opts?.onResult) postResults.push(opts.onResult)
  return sharedPost
}

// Next's router emits routeChangeStart(url, { shallow }) to the listeners the page
// registered, including for the shallow replace that adopts a saved baseline's id.
const listeners = {}
router.events = {
  on: (event, handler) =>
    (listeners[event] = [...(listeners[event] ?? []), handler]),
  off: (event, handler) =>
    (listeners[event] = (listeners[event] ?? []).filter((h) => h !== handler)),
  emit: () => {},
}
router.query = { id: fixture.baseline.GUID, clone: '1' }
router.pathname = '/tenant/baselines/template'
router.replace = vi.fn((url, as, options) => {
  ;(listeners.routeChangeStart ?? []).forEach((handler) =>
    handler(url, { shallow: options?.shallow })
  )
  router.query = url.query
  return Promise.resolve()
})

describe('Baseline template editor - saving does not ask to leave the page', () => {
  it('adopts the saved id without the unsaved-changes prompt', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    await waitFor(() => {
      expect(
        screen.getByText('Enable Activity based Timeout')
      ).toBeInTheDocument()
    })
    const name = screen
      .getAllByRole('textbox')
      .find((input) =>
        input
          .closest('.MuiFormControl-root')
          ?.querySelector('label')
          ?.textContent?.startsWith('Baseline Name')
      )
    await user.type(name, ' renamed')
    await user.tab()

    // Precondition: the edit is unsaved, so leaving now does prompt.
    listeners.routeChangeStart.forEach((handler) =>
      handler('/tenant/baselines', { shallow: false })
    )
    expect(confirm).toHaveBeenCalledTimes(1)
    confirm.mockClear()

    await act(async () => {
      postResults.forEach((onResult) =>
        onResult({ Results: 'saved', Metadata: { id: SAVED_ID } })
      )
    })

    expect(router.replace).toHaveBeenCalled()
    expect(confirm).not.toHaveBeenCalled()

    // Leaving after the save is not guarded either: nothing is unsaved anymore.
    listeners.routeChangeStart.forEach((handler) =>
      handler('/tenant/baselines', { shallow: false })
    )
    expect(confirm).not.toHaveBeenCalled()
  }, 30000)
})
