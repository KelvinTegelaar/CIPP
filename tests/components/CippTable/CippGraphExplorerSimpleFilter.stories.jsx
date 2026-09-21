import { http, HttpResponse } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import CippGraphExplorerSimpleFilter from '../../../src/components/CippTable/CippGraphExplorerSimpleFilter'

const handlers = [
  http.get('/api/ListGraphExplorerPresets', () => HttpResponse.json({ Results: [] })),
  http.get('/api/ListGraphRequest', () => HttpResponse.json({ Results: [] })),
]

const meta = {
  component: CippGraphExplorerSimpleFilter,
  title: 'Components/CippTable/CippGraphExplorerSimpleFilter',
  parameters: { msw: { handlers } },
  argTypes: {
    onSubmitFilter: { action: 'onSubmitFilter' },
    onPresetChange: { action: 'onPresetChange' },
    onViewModeChange: { action: 'onViewModeChange' },
  },
}

export default meta

export const Default = {
  args: { onSubmitFilter: () => {}, viewMode: 'table', onViewModeChange: () => {} },
}

export const EditDrawerOpen = {
  args: { onSubmitFilter: () => {}, viewMode: 'table', onViewModeChange: () => {} },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Edit Query opens the drawer with Apply Filter', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Edit Query' }))
      const body = within(canvasElement.ownerDocument.body)
      await waitFor(async () => {
        await expect(body.getByRole('button', { name: 'Apply Filter' })).toBeVisible()
      })
    })
  },
}

export const PresetPickedAndRun = {
  args: { onSubmitFilter: () => {}, viewMode: 'table', onViewModeChange: () => {} },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const combo = canvas.getByRole('combobox', { name: 'Select a query' })
    await step('pick a built-in preset once the list loads', async () => {
      // combobox disabled while ListGraphExplorerPresets is in flight (CippAutocomplete.jsx disabled={... || isFetching}), same wait as CippGraphExplorerFilter.stories.jsx PresetSelected
      await waitFor(async () => {
        await expect(combo).toBeEnabled()
      })
      await userEvent.click(combo)
      const body = within(canvasElement.ownerDocument.body)
      await userEvent.click(await body.findByRole('option', { name: 'All users with email addresses' }))
    })

    await step('Run enables and accepts the click', async () => {
      await waitFor(async () => {
        await expect(canvas.getByRole('button', { name: 'Run' })).toBeEnabled()
      })
      await userEvent.click(canvas.getByRole('button', { name: 'Run' }))
    })
  },
}
