import React from 'react'
import { http, HttpResponse } from 'msw'
import { within, userEvent, waitFor, expect } from 'storybook/test'
import { CippQueueTracker } from '../../../src/components/CippTable/CippQueueTracker'
import { shrinkToPhoneViewport } from '../../viewport'

// The task names are tenant default domains — one unbreakable token each, and the test
// tenants are the longest of them.
const queue = {
  QueueId: 'q-1',
  Name: 'Users (All Tenants)',
  Status: 'Running',
  PercentComplete: 20.3,
  TotalTasks: 133,
  CompletedTasks: 27,
  RunningTasks: 4,
  FailedTasks: 0,
  Tasks: [
    {
      Name: 'cyberdraintesttenant024.onmicrosoft.com',
      Status: 'Completed',
      Timestamp: '2026-08-12T23:15:33Z',
    },
    {
      Name: 'cyberdraintesttenant023.onmicrosoft.com',
      Status: 'Running',
      Timestamp: '2026-08-12T23:15:31Z',
    },
    {
      Name: 'cyberdraintesttenant022.onmicrosoft.com',
      Status: 'Completed',
      Timestamp: '2026-08-12T23:15:34Z',
    },
  ],
}

const handlers = [http.get('*/api/ListCippQueue', () => HttpResponse.json([queue]))]

export default {
  title: 'Components/CippTable/CippQueueTracker',
  component: CippQueueTracker,
  tags: ['autodocs'],
  parameters: { msw: { handlers } },
}

export const PhoneWidth = {
  render: () => <CippQueueTracker queueId="q-1" title="Users (All Tenants)" />,
  play: async ({ canvasElement, step }) => {
    const onAPhone = await shrinkToPhoneViewport()
    const canvas = within(canvasElement)
    const body = within(document.body)

    await step('the tracker opens the queue offcanvas', async () => {
      const trigger = await canvas.findByRole('button')
      await userEvent.click(trigger)
      await waitFor(() => expect(body.getByText('Task Details')).toBeInTheDocument())
    })

    if (!onAPhone) return

    // scope to one task card — statuses repeat across cards and in the stats row
    const card = (name) => within(body.getByText(name).closest('.MuiBox-root'))

    await step('a full tenant domain does not push its status pill off the card', async () => {
      const paper = body.getByText('Task Details').closest('.MuiDrawer-paper')
      const pill = card('cyberdraintesttenant024.onmicrosoft.com').getByText(/^completed$/i)
      await waitFor(() => {
        // the pill is intact inside the drawer, not clipped at its right edge
        expect(pill.getBoundingClientRect().right).toBeLessThanOrEqual(
          paper.getBoundingClientRect().right
        )
        expect(paper.scrollWidth).toBeLessThanOrEqual(paper.clientWidth)
      })
    })

    await step('and there is real space between the name and the pill', async () => {
      const name = body.getByText('cyberdraintesttenant023.onmicrosoft.com')
      const running = card('cyberdraintesttenant023.onmicrosoft.com').getByText(/^running$/i)
      const nameBox = name.getBoundingClientRect()
      const pillBox = running.getBoundingClientRect()
      // either beside it with a gap, or wrapped below it — never overlapping
      const besideWithGap = pillBox.left - nameBox.right >= 4
      const below = pillBox.top >= nameBox.bottom - 1
      await expect(besideWithGap || below).toBe(true)
    })
  },
}
