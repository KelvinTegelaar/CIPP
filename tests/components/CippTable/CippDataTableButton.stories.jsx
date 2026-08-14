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
