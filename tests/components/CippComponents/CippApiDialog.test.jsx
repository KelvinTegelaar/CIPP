import React from 'react'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippApiDialog } from '../../../src/components/CippComponents/CippApiDialog'

// capture the action payload, network layer is not under test here
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
  ApiGetCall: () => ({
    isSuccess: false,
    isPending: true,
    isFetching: false,
    isError: false,
    data: undefined,
  }),
}))

const row = {
  id: 'user-1',
  userPrincipalName: 'john@contoso.com',
}

const baseApi = {
  type: 'POST',
  url: '/api/ExecDisableUser',
  data: { ID: 'userPrincipalName', Action: '!Disable' },
  confirmText: 'Are you sure you want to disable [userPrincipalName]?',
}

const renderDialog = (overrides = {}) => {
  const createDialog = { open: true, handleClose: vi.fn() }
  renderWithProviders(
    <CippApiDialog
      createDialog={createDialog}
      title="Disable User"
      fields={[]}
      api={baseApi}
      row={row}
      {...overrides}
    />
  )
  return createDialog
}

describe('CippApiDialog', () => {
  beforeEach(() => {
    apiState.mutate = vi.fn()
  })

  it('substitutes row values into the confirm text', () => {
    renderDialog()

    expect(screen.getByText('Disable User')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to disable john@contoso.com?')
    ).toBeInTheDocument()
  })

  it('shows row values containing HTML characters verbatim', () => {
    renderDialog({
      api: { ...baseApi, confirmText: 'Delete [displayName]?', confirmPhrase: '[displayName]' },
      row: { displayName: 'Sales & Marketing <EU>' },
    })
    expect(screen.getByText('Delete Sales & Marketing <EU>?')).toBeInTheDocument()
    expect(screen.queryByText(/&amp;|&lt;/)).not.toBeInTheDocument()
  })

  it('summarizes multi-row selections in the confirm text', () => {
    renderDialog({ row: [row, { ...row, id: 'user-2' }] })

    expect(
      screen.getByText('Are you sure you want to disable the 2 selected rows?')
    ).toBeInTheDocument()
  })

  it('posts the processed action payload on confirm', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(apiState.mutate).toHaveBeenCalledTimes(1)
    })
    // ID resolves through the row, !Disable is a literal, tenantFilter from settings
    expect(apiState.mutate).toHaveBeenCalledWith({
      url: '/api/ExecDisableUser',
      bulkRequest: false,
      data: {
        tenantFilter: 'testdomain.com',
        ID: 'john@contoso.com',
        Action: 'Disable',
      },
    })
  })

  it('disables confirm after submitting without allowResubmit', async () => {
    const user = userEvent.setup()
    renderDialog()

    const confirm = screen.getByRole('button', { name: 'Confirm' })
    await user.click(confirm)

    await waitFor(() => {
      expect(confirm).toBeDisabled()
    })
  })

  it('closes via the close button', async () => {
    const user = userEvent.setup()
    const createDialog = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(createDialog.handleClose).toHaveBeenCalledTimes(1)
  })

  it('resolves dotted parent maps on confirm', async () => {
    const user = userEvent.setup()
    renderDialog({
      row: {
        id: 'member-1',
        displayName: 'Jane',
        parent: { id: 'group-1', displayName: 'Finance' },
      },
      api: {
        type: 'POST',
        url: '/api/ExecWhatever',
        data: { childId: 'id', parentId: 'parent.id' },
        confirmText: 'Remove [displayName] from [parent.displayName]?',
      },
    })

    expect(screen.getByText('Remove Jane from Finance?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(apiState.mutate).toHaveBeenCalledTimes(1)
    })
    expect(apiState.mutate).toHaveBeenCalledWith({
      url: '/api/ExecWhatever',
      bulkRequest: false,
      data: {
        tenantFilter: 'testdomain.com',
        childId: 'member-1',
        parentId: 'group-1',
      },
    })
  })

  it('keeps placeholders shared by every selected row in bulk confirm text', () => {
    renderDialog({
      row: [
        { id: 'm1', displayName: 'Jane', parent: { displayName: 'Finance' } },
        { id: 'm2', displayName: 'Bob', parent: { displayName: 'Finance' } },
      ],
      api: { ...baseApi, confirmText: 'Remove [displayName] from [parent.displayName]?' },
    })

    expect(screen.getByText('Remove the 2 selected rows from Finance?')).toBeInTheDocument()
  })

  it('interpolates a confirmText function result', () => {
    const confirmText = vi.fn((r) => (Array.isArray(r) ? 'bulk' : 'Disable [userPrincipalName]?'))
    renderDialog({ api: { ...baseApi, confirmText } })

    expect(confirmText).toHaveBeenCalledWith(row)
    expect(screen.getByText('Disable john@contoso.com?')).toBeInTheDocument()
  })

  describe('bulk selection list', () => {
    const users = ['adele', 'alex', 'megan'].map((name) => ({
      id: `id-${name}`,
      userPrincipalName: `${name}@contoso.com`,
    }))
    // the list is collapsed unless a selected row is hidden, so open it first
    const listItems = () => {
      const toggle = screen.getByRole('button', { name: /selected/ })
      if (toggle.getAttribute('aria-expanded') === 'false') fireEvent.click(toggle)
      return within(screen.getByRole('list')).getAllByRole('listitem').map((li) => li.textContent)
    }

    it('names every selected row, even when the confirm text has no placeholder', () => {
      renderDialog({ api: { ...baseApi, confirmText: 'Delete this user?' }, row: users })

      expect(screen.getByText('3 selected')).toBeInTheDocument()
      expect(listItems()).toEqual(['adele@contoso.com', 'alex@contoso.com', 'megan@contoso.com'])
    })

    it('starts collapsed when no selected row is hidden', () => {
      renderDialog({ row: users })

      expect(screen.getByRole('button', { name: /3 selected/ })).toHaveAttribute('aria-expanded', 'false')
    })

    it('opens and lists hidden rows first, marked, when some are hidden', () => {
      renderDialog({ row: users, hiddenRows: new Set([users[2]]) })

      expect(screen.getByRole('button', { name: /1 hidden/ })).toHaveAttribute('aria-expanded', 'true')

      expect(screen.getByText(/1 hidden by the current search or filter/)).toBeInTheDocument()
      expect(listItems()).toEqual([
        'megan@contoso.com (hidden)',
        'adele@contoso.com',
        'alex@contoso.com',
      ])
    })

    it('lists every row, however many are selected', () => {
      const many = Array.from({ length: 13 }, (_, i) => ({ userPrincipalName: `u${i}@contoso.com` }))
      renderDialog({ row: many })

      expect(listItems()).toHaveLength(13)
      expect(listItems().at(-1)).toBe('u12@contoso.com')
    })

    it('names rows by the field the action posts when no common name field exists', () => {
      renderDialog({
        api: { ...baseApi, confirmText: 'Remove these?', data: { ID: 'ruleKey' } },
        row: [{ ruleKey: 'rule-a' }, { ruleKey: 'rule-b' }],
      })

      expect(listItems()).toEqual(['rule-a', 'rule-b'])
    })

    it('joins every placeholder value so rows read like the confirm text', () => {
      renderDialog({
        api: { ...baseApi, confirmText: 'Block [device] for [user]?' },
        row: [
          { device: 'Unknown', user: 'Adele' },
          { device: 'Unknown', user: 'Alex' },
        ],
      })

      expect(listItems()).toEqual(['Unknown · Adele', 'Unknown · Alex'])
    })

    it('falls back to the name fields when placeholder values repeat across rows', () => {
      renderDialog({
        api: { ...baseApi, confirmText: 'Restore the [type]?' },
        row: [
          { type: 'Enterprise app', displayName: 'App A' },
          { type: 'Enterprise app', displayName: 'App B' },
        ],
      })

      expect(listItems()).toEqual(['App A', 'App B'])
    })

    it('prefers a template name over the GUID the action posts', () => {
      renderDialog({
        api: { ...baseApi, confirmText: 'Run these now?', data: { GUID: 'GUID' } },
        row: [
          { GUID: 'g-1', templateName: 'Tier 1' },
          { GUID: 'g-2', templateName: 'Tier 2' },
        ],
      })

      expect(listItems()).toEqual(['Tier 1', 'Tier 2'])
    })

    it('shows only the counts when a row has no usable name', () => {
      renderDialog({
        api: { ...baseApi, confirmText: 'Remove these?', data: { Action: '!Remove' } },
        row: [{ score: 1 }, { score: 2 }],
        hiddenRows: undefined,
      })

      expect(screen.getByText('2 selected')).toBeInTheDocument()
      expect(screen.queryByRole('list')).toBeNull()
    })

    it('shows no list for a single row', () => {
      renderDialog()
      expect(screen.queryByRole('list')).toBeNull()
    })
  })
})
