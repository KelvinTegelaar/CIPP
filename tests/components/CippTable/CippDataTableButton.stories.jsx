import { http, HttpResponse } from 'msw'
import { within, expect, userEvent, waitFor } from 'storybook/test'
import CippDataTableButton from '../../../src/components/CippTable/CippDataTableButton'

export default {
  title: 'Components/CippTable/CippDataTableButton',
  component: CippDataTableButton,
  tags: ['autodocs'],
}

export const ArrayData = {
  args: {
    title: 'View List',
    data: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
    tableTitle: 'Items List',
  },
}

export const ObjectData = {
  args: {
    title: 'View Details',
    data: {
      userPrincipalName: 'john@example.com',
      displayName: 'John Doe',
    },
    tableTitle: 'User Details',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('button opens the details dialog', async () => {
      await userEvent.click(canvas.getByRole('button'))
      const root = within(document.body)
      await waitFor(() => {
        expect(root.getByRole('dialog')).toBeVisible()
      })
    })

    await step('object keys render translated', async () => {
      // object keys run through getCippTranslation -> 'userPrincipalName' becomes 'User Principal Name'
      const dialog = within(within(document.body).getByRole('dialog'))
      await waitFor(() => {
        expect(dialog.getByText('User Principal Name')).toBeVisible()
      })
      await expect(dialog.getByText('john@example.com')).toBeVisible()
    })
  },
}

export const EmptyData = {
  args: {
    title: 'No Data',
    data: null,
  },
}

export const LiveNestedTable = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/TestRelated', () =>
          HttpResponse.json({
            Results: [
              { id: 'rel-1', displayName: 'Related one' },
              { id: 'rel-2', displayName: 'Related two' },
            ],
          })
        ),
        http.post('/api/ExecTestRelated', () => HttpResponse.json({ Results: 'ok' })),
      ],
    },
  },
  args: {
    row: { id: 'parent-1', displayName: 'Finance' },
    label: 'View',
    title: 'Related for [displayName]',
    queryKey: 'related-[id]',
    api: {
      url: '/api/TestRelated',
      data: { someId: '[id]' },
      dataKey: 'Results',
    },
    simpleColumns: ['displayName'],
    actions: [
      {
        label: 'Remove',
        type: 'POST',
        url: '/api/ExecTestRelated',
        data: { childId: 'id', parentId: 'parent.id' },
        confirmText: 'Remove [displayName] from [parent.displayName]?',
      },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('opens a live nested table on click', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'View' }))
      const root = within(document.body)
      await waitFor(() => {
        expect(root.getByRole('dialog')).toBeVisible()
      })
    })
  },
}
