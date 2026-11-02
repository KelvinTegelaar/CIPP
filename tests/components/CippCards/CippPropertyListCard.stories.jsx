import { within, expect, userEvent, waitFor } from 'storybook/test'
import { CippPropertyListCard } from '../../../src/components/CippCards/CippPropertyListCard'

const userPropertyItems = [
  { label: 'Display Name', value: 'Alice Smith' },
  { label: 'UPN', value: 'alice@contoso.com' },
  { label: 'Department', value: 'Engineering' },
  { label: 'Job Title', value: 'Senior Developer' },
  { label: 'Location', value: 'Seattle, WA' },
  { label: 'Account Enabled', value: 'Yes' },
  { label: 'MFA Status', value: 'Enabled' },
  { label: 'Last Sign-In', value: '2026-04-05T14:30:00Z' },
]

export default {
  title: 'Components/CippCards/CippPropertyListCard',
  component: CippPropertyListCard,
  tags: ['autodocs'],
  argTypes: {
    isFetching: { control: 'boolean' },
    layout: { control: 'radio', options: ['single', 'dual'] },
    align: { control: 'radio', options: ['vertical', 'horizontal'] },
  },
}

export const SingleLayout = {
  args: {
    title: 'User Details',
    propertyItems: userPropertyItems,
    layout: 'single',
  },
}

export const DualLayout = {
  args: {
    title: 'User Details',
    propertyItems: userPropertyItems,
    layout: 'dual',
  },
}

export const WithActionButton = {
  args: {
    title: 'User Details',
    propertyItems: userPropertyItems,
    layout: 'single',
    actionButton: <button type="button">Edit</button>,
  },
}

export const WithActions = {
  args: {
    title: 'User Details',
    propertyItems: userPropertyItems,
    layout: 'single',
    data: { id: '123', userPrincipalName: 'alice@contoso.com' },
    actionItems: [
      {
        label: 'Delete User',
        type: 'POST',
        url: '/api/RemoveUser',
        data: { ID: 'id' },
        confirmText: 'Are you sure you want to delete [userPrincipalName]?',
      },
      {
        label: 'Disabled Action',
        type: 'POST',
        url: '/api/Noop',
        condition: () => false,
      },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('click the Delete User action', async () => {
      await userEvent.click(canvas.getByText('Delete User'))
    })

    await step('confirm dialog substitutes [userPrincipalName] into confirmText', async () => {
      // dialog renders in a portal outside canvasElement, fades in
      const body = within(canvasElement.ownerDocument.body)
      await waitFor(() => {
        expect(body.getByText('Confirmation')).toBeVisible()
      })
      await expect(
        body.getByText('Are you sure you want to delete alice@contoso.com?')
      ).toBeVisible()
    })
  },
}

export const Loading = {
  args: {
    title: 'User Details',
    propertyItems: userPropertyItems,
    isFetching: true,
  },
}
