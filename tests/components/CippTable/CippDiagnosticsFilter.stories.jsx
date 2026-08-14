import { fn, within, expect, userEvent, waitFor } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import CippDiagnosticsFilter from '../../../src/components/CippTable/CippDiagnosticsFilter'

const mswHandlers = [
  http.get('/api/ListDiagnosticsPresets', () => {
    return HttpResponse.json([
      { GUID: 'a1b2c3d4-1234-5678-9012-abcdef123456', name: 'Exchange Health Check', query: 'traces | where message contains "Exchange"' },
      { GUID: 'b2c3d4e5-2345-6789-0123-bcdef1234567', name: 'License Report', query: 'traces | where message contains "License"' },
    ])
  }),
  http.post('/api/ExecDiagnosticsPresets', () => {
    return HttpResponse.json({ Results: 'Preset saved' })
  }),
]

export default {
  title: 'Components/CippTable/CippDiagnosticsFilter',
  component: CippDiagnosticsFilter,
  tags: ['autodocs'],
  parameters: {
    msw: {
      handlers: mswHandlers,
    },
  },
}

export const Default = {
  args: {
    onSubmitFilter: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Query and Requirements sections render', async () => {
      await expect(canvas.getByText('Query')).toBeVisible()
      await expect(canvas.getByText('Requirements')).toBeVisible()
    })

    await step('Execute Query stays disabled while the query is empty', async () => {
      await expect(canvas.getByRole('button', { name: /execute query/i })).toBeDisabled()
    })
  },
}

export const ExecuteQuery = {
  args: {
    onSubmitFilter: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)

    await step('typing a kql query enables Execute Query', async () => {
      const queryInput = canvas.getByPlaceholderText(/enter your kql query/i)
      await userEvent.click(queryInput)
      await userEvent.type(queryInput, 'traces | where timestamp > ago(1h)')
      await waitFor(() => {
        expect(canvas.getByRole('button', { name: /execute query/i })).toBeEnabled()
      })
    })

    await step('submit passes the query to onSubmitFilter', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /execute query/i }))
      await waitFor(() => {
        expect(args.onSubmitFilter).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'traces | where timestamp > ago(1h)',
          })
        )
      })
    })
  },
}

export const ClearQuery = {
  args: {
    onSubmitFilter: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)

    await step('type a query then hit Clear', async () => {
      const queryInput = canvas.getByPlaceholderText(/enter your kql query/i)
      await userEvent.click(queryInput)
      await userEvent.type(queryInput, 'some query')
      await userEvent.click(canvas.getByRole('button', { name: /clear/i }))
    })

    await step('clear submits an empty query', async () => {
      await waitFor(() => {
        expect(args.onSubmitFilter).toHaveBeenCalledWith(
          expect.objectContaining({
            query: '',
          })
        )
      })
    })
  },
}
