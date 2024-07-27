import React from 'react'
import { CippPageList } from 'src/components/layout/index.js'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { cellBadgeFormatter, cellDateFormatter } from 'src/components/tables'

/**
 * SettingsWebhookSubscriptions component is used to manage webhook subscriptions in a settings page.
 *
 * @returns {JSX.Element} The generated settings page component.
 */
export function SettingsWebhookSubscriptions() {
  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['PartitionKey'],
      exportSelector: 'PartitionKey',
      sortable: true,
      cell: cellGenericFormatter(),
    },
    {
      name: 'Resource',
      selector: (row) => row['Resource'],
      exportSelector: 'Resource',
      sortable: true,
      cell: cellGenericFormatter(),
    },
    {
      name: 'Status',
      selector: (row) => row['Status'],
      exportSelector: 'Status',
      sortable: true,
      cell: cellBadgeFormatter({ color: 'info' }),
    },
    {
      name: 'Last Update',
      selector: (row) => row['Timestamp'],
      sortable: true,
      cell: cellDateFormatter({ format: 'short' }),
      exportSelector: 'Timestamp',
    },
  ]
  return (
    <>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Log Subscriptions"
        datatable={{
          columns,
          path: 'api/ExecWebhookSubscriptions',
          reportName: `Log Subscriptions`,
          tableProps: {
            selectableRows: true,
            actionsList: [
              {
                label: 'Resubscribe',
                modal: true,
                modalUrl: `/api/ExecWebhookSubscriptions?Action=Resubscribe&WebhookID=!RowKey`,
                modalMessage: 'Are you sure you want to attempt to resubscribe to these webhooks?',
              },
              {
                label: 'Unsubscribe',
                modal: true,
                modalUrl: `/api/ExecWebhookSubscriptions?Action=Unsubscribe&WebhookID=!RowKey`,
                modalMessage: 'Are you sure you want to unsubscribe from these webhooks?',
              },
              {
                label: 'Delete Subscription',
                modal: true,
                modalUrl: `/api/ExecWebhookSubscriptions?Action=Delete&WebhookID=!RowKey`,
                modalMessage: 'Are you sure you want to delete these webhook entries?',
              },
            ],
          },
        }}
      />
    </>
  )
}
