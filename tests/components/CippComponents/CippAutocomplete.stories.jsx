import { http, HttpResponse } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { CippAutoComplete } from '../../../src/components/CippComponents/CippAutocomplete'

const meta = {
  component: CippAutoComplete,
  title: 'Components/CippComponents/CippAutoComplete',
  argTypes: {
    onChange: { action: 'onChange' },
  },
}

export default meta

const OPTIONS = [
  { label: 'Alpha', value: 'a' },
  { label: 'Bravo', value: 'b' },
  { label: 'Charlie', value: 'c' },
]

export const SingleMode = {
  args: { multiple: false, label: 'Pick one', options: OPTIONS, onChange: () => {} },
}

export const MultiMode = {
  args: { multiple: true, label: 'Pick many', options: OPTIONS, onChange: () => {} },
}

export const Creatable = {
  args: { multiple: false, label: 'Type to add', options: OPTIONS, onChange: () => {} },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('typing an unknown value offers an Add option', async () => {
      await userEvent.type(canvas.getByRole('combobox'), 'zzz')
      // popup renders in a portal outside canvasElement
      const body = within(canvasElement.ownerDocument.body)
      await waitFor(async () => {
        await expect(body.getByRole('option', { name: 'Add option: "zzz"' })).toBeVisible()
      })
    })
  },
}

export const Grouped = {
  args: {
    multiple: false,
    label: 'Grouped',
    options: [
      { label: 'Alpha', value: 'a', type: 'Built-In' },
      { label: 'Bravo', value: 'b', type: 'Custom' },
    ],
    groupBy: (option) => option.type,
    onChange: () => {},
  },
}

export const ApiDriven = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/ListUsers', () =>
          HttpResponse.json({
            Results: [
              { displayName: 'Alice Example', id: '1' },
              { displayName: 'Bob Example', id: '2' },
            ],
            Metadata: {},
          })
        ),
      ],
    },
  },
  args: {
    multiple: false,
    label: 'Users',
    onChange: () => {},
    api: { url: '/api/ListUsers', labelField: 'displayName', valueField: 'id', dataKey: 'Results', queryKey: 'story-users' },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('combobox enables once the api load lands', async () => {
      await waitFor(async () => {
        await expect(canvas.getByRole('combobox')).toBeEnabled()
      })
    })

    await step('options come from the mocked ListUsers response', async () => {
      await userEvent.click(canvas.getByRole('combobox'))
      const body = within(canvasElement.ownerDocument.body)
      await waitFor(async () => {
        await expect(body.getByRole('option', { name: 'Alice Example' })).toBeVisible()
      })
    })
  },
}

export const Fetching = {
  args: { multiple: false, label: 'Loading', isFetching: true, options: [], onChange: () => {} },
}
