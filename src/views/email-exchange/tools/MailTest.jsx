import React from 'react'
import { CippCallout, CippPageList } from 'src/components/layout'
import { cellBooleanFormatter, cellDateFormatter } from 'src/components/tables'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { useGenericGetRequestQuery } from 'src/store/api/app'

const MailTest = () => {
  const { data: config, isSuccess } = useGenericGetRequestQuery({
    path: '/api/ExecMailTest',
    params: { Action: 'CheckConfig' },
  })

  const columns = [
    {
      name: 'Received',
      selector: (row) => row['Received'],
      sortable: true,
      exportSelector: 'Received',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'From',
      selector: (row) => row['From'],
      sortable: true,
      exportSelector: 'From',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Subject',
      selector: (row) => row['Subject'],
      sortable: true,
      exportSelector: 'Subject',
      cell: cellGenericFormatter(),
    },
    {
      name: 'SPF',
      selector: (row) => row?.AuthResult.filter((x) => x?.Name === 'spf')[0].Status == 'pass',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DKIM',
      selector: (row) => row?.AuthResult.filter((x) => x?.Name === 'dkim')[0].Status == 'pass',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DMARC',
      selector: (row) => row?.AuthResult.filter((x) => x?.Name === 'dmarc')[0].Status == 'pass',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Comp Auth',
      selector: (row) => row?.AuthResult.filter((x) => x?.Name === 'compauth')[0].Status == 'pass',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Auth Details',
      selector: (row) => row['AuthResult'],
      exportSelector: 'AuthResult',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Headers',
      selector: (row) => row['Headers'],
      exportSelector: 'Headers',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Open Message',
      selector: (row) => row['Link'],
      exportSelector: 'Link',
      cell: cellGenericFormatter(),
    },
  ]
  return (
    <div>
      {isSuccess && (
        <CippCallout color={config?.HasMailRead ? 'info' : 'warning'} dismissible={true}>
          {config?.HasMailRead &&
            'Mail Test Email: ' + config?.MailAddresses.filter((x) => x?.IsPrimary)[0]?.Address}
          {config?.HasMailRead == false && 'Permission Check: ' + config?.Message}
        </CippCallout>
      )}
      {isSuccess && config?.HasMailRead === true && (
        <CippPageList
          capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
          title="Mail Test"
          tenantSelector={false}
          datatable={{
            tableProps: {},
            keyField: 'id',
            columns,
            reportName: `MailTest`,
            path: '/api/ExecMailTest',
          }}
        />
      )}
    </div>
  )
}

export default MailTest
