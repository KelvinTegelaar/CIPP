import { http, HttpResponse } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import Page from '../../src/pages/tenant/tools/graph-explorer/index.js'

const handlers = [
  http.get('/api/ListGraphExplorerPresets', () => HttpResponse.json({ Results: [] })),
  http.get('/api/ListEmptyResults', () => HttpResponse.json({ Results: [] })),
  http.get('/api/ListGraphRequest', () =>
    HttpResponse.json({
      Results: [
        { userPrincipalName: 'a@x.com', mail: 'a@x.com', proxyAddresses: 'SMTP:a@x.com' },
        { userPrincipalName: 'b@x.com', mail: 'b@x.com', proxyAddresses: 'SMTP:b@x.com' },
      ],
      Metadata: {},
    })
  ),
]

const meta = {
  component: Page,
  title: 'Pages/GraphExplorer',
  parameters: { msw: { handlers } },
}

export default meta

export const TableMode = {}

export const PresetRun = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const combo = canvas.getByRole('combobox', { name: 'Select a query' })
    await step('pick a built-in preset and run it', async () => {
      // combobox disabled while ListGraphExplorerPresets is in flight, same wait as CippGraphExplorerSimpleFilter.stories.jsx PresetPickedAndRun
      await waitFor(async () => {
        await expect(combo).toBeEnabled()
      })
      await userEvent.click(combo)
      const body = within(canvasElement.ownerDocument.body)
      await userEvent.click(await body.findByRole('option', { name: 'All users with email addresses' }))
      await userEvent.click(canvas.getByRole('button', { name: 'Run' }))
    })

    await step('table shows the mocked ListGraphRequest rows', async () => {
      // getByText('a@x.com') multi-matches (upn + mail cells, plus exact:false substring-matches row text) -> assert via textContent
      await waitFor(async () => {
        expect(canvasElement.textContent).toContain('a@x.com')
      })
    })
  },
}
