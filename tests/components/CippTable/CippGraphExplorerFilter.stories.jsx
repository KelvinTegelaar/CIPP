import { http, HttpResponse } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import CippGraphExplorerFilter from '../../../src/components/CippTable/CippGraphExplorerFilter'

const savedPreset = {
  id: 'saved-1',
  name: 'Devices by name',
  IsMyPreset: true,
  params: {
    endpoint: '/devices',
    $select: [
      { label: 'id', value: 'id' },
      { label: 'displayName', value: 'displayName' },
    ],
    version: 'v1.0',
  },
}

const handlers = [
  http.get('/api/ListGraphExplorerPresets', () => HttpResponse.json({ Results: [savedPreset] })),
  http.get('/api/ListGraphRequest', () =>
    HttpResponse.json({ Results: ['id', 'displayName', 'userPrincipalName', 'mail'] })
  ),
]

const meta = {
  component: CippGraphExplorerFilter,
  title: 'Components/CippTable/CippGraphExplorerFilter',
  parameters: { msw: { handlers } },
  argTypes: {
    onSubmitFilter: { action: 'onSubmitFilter' },
    onPresetSelect: { action: 'onPresetSelect' },
  },
}

export default meta

export const CardComponent = {
  args: { component: 'card', onSubmitFilter: () => {} },
}

export const AccordionComponent = {
  args: { component: 'accordion', onSubmitFilter: () => {} },
}

export const PresetSelected = {
  args: { component: 'card', onSubmitFilter: () => {} },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const combo = canvas.getByRole('combobox', { name: 'Select a preset' })
    await step('pick the saved preset once the list loads', async () => {
      // combobox disabled while ListGraphExplorerPresets is in flight (CippAutocomplete.jsx disabled={... || isFetching}), same wait as CippAutocomplete.stories.jsx ApiDriven
      await waitFor(async () => {
        await expect(combo).toBeEnabled()
      })
      await userEvent.click(combo)
      const body = within(canvasElement.ownerDocument.body)
      await userEvent.click(await body.findByRole('option', { name: 'Devices by name' }))
    })

    await step('preset params hydrate the Endpoint field', async () => {
      await waitFor(async () => {
        await expect(canvas.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/devices')
      })
    })
  },
}

export const ToolbarPresetShape = {
  args: {
    component: 'card',
    onSubmitFilter: () => {},
    selectedPreset: { id: 'saved-1', filterName: 'Devices by name', value: savedPreset.params, type: 'graph' },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('toolbar-shaped selectedPreset hydrates the Endpoint field', async () => {
      await waitFor(async () => {
        await expect(canvas.getByRole('textbox', { name: 'Endpoint' })).toHaveValue('/devices')
      })
    })
  },
}
