import { within, expect, userEvent } from 'storybook/test'
import { CippInfoBar } from '../../../src/components/CippCards/CippInfoBar'

const infoBarData = [
  { name: 'Total Users', data: '1,234' },
  { name: 'Licensed', data: '1,100' },
  { name: 'Guests', data: '134' },
  { name: 'Blocked', data: '12' },
]

export default {
  title: 'Components/CippCards/CippInfoBar',
  component: CippInfoBar,
  tags: ['autodocs'],
  argTypes: {
    isFetching: { control: 'boolean' },
  },
}

export const Default = {
  args: {
    data: infoBarData,
  },
}

export const WithTooltips = {
  args: {
    data: infoBarData.map((item) => ({
      ...item,
      toolTip: `Click to view details for ${item.name}`,
    })),
  },
}

export const WithOffcanvas = {
  args: {
    data: [
      ...infoBarData.slice(0, 3),
      {
        name: 'Blocked',
        data: '12',
        offcanvas: {
          title: 'Blocked Users',
          propertyItems: [
            { label: 'Most Recent', value: 'bob@contoso.com' },
            { label: 'Blocked Since', value: '2026-04-05' },
          ],
        },
      },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('click the Blocked stat', async () => {
      await userEvent.click(canvas.getByText('Blocked'))
    })

    await step('drawer opens with the property items', async () => {
      // drawer renders in a portal outside canvasElement
      const body = within(canvasElement.ownerDocument.body)
      await expect(await body.findByText('bob@contoso.com')).toBeVisible()
      await expect(body.getByText('Most Recent')).toBeVisible()
    })
  },
}

export const Loading = {
  args: {
    data: infoBarData,
    isFetching: true,
  },
}
