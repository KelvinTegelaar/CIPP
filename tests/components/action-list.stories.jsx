import { fn, within, expect, userEvent } from 'storybook/test'
import { ActionList } from '../../src/components/action-list'
import { ActionListItem } from '../../src/components/action-list-item'
import { SvgIcon } from '@mui/material'
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon'
import DocumentDuplicateIcon from '@heroicons/react/24/outline/DocumentDuplicateIcon'
import ReceiptRefundIcon from '@heroicons/react/24/outline/ReceiptRefundIcon'

export default {
  title: 'Components/ActionList',
  component: ActionList,
  tags: ['autodocs'],
}

export const WithActions = {
  args: {
    children: [
      <ActionListItem
        key="mark-as-paid"
        icon={<SvgIcon fontSize="small"><CheckCircleIcon /></SvgIcon>}
        label="Mark as Paid"
        onClick={fn()}
      />,
      <ActionListItem
        key="duplicate-order"
        disabled
        icon={<SvgIcon fontSize="small"><DocumentDuplicateIcon /></SvgIcon>}
        label="Duplicate Order"
        onClick={fn()}
      />,
      <ActionListItem
        key="request-refund"
        icon={<SvgIcon fontSize="small"><ReceiptRefundIcon /></SvgIcon>}
        label="Request a Refund"
        onClick={fn()}
      />,
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('all three actions render as buttons', async () => {
      await expect(canvas.getByText('Mark as Paid')).toBeVisible()
      await expect(canvas.getByText('Duplicate Order')).toBeVisible()
      await expect(canvas.getByText('Request a Refund')).toBeVisible()
      await expect(canvas.getAllByRole('button')).toHaveLength(3)
    })

    await step('disabled item exposes aria-disabled, enabled item does not', async () => {
      const disabledButton = canvas.getByText('Duplicate Order').closest('[role="button"]')
      await expect(disabledButton).toHaveAttribute('aria-disabled', 'true')
      const enabledButton = canvas.getByText('Mark as Paid').closest('[role="button"]')
      await expect(enabledButton).not.toHaveAttribute('aria-disabled', 'true')
    })

    await step('enabled action accepts a click', async () => {
      await userEvent.click(canvas.getByText('Mark as Paid').closest('[role="button"]'))
    })
  },
}

export const Empty = {
  args: {
    children: [],
  },
}
