import { CButton, CSpinner } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { CippCallout, CippPageList } from 'src/components/layout'
import { cellBooleanFormatter, cellDateFormatter } from 'src/components/tables'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { useGenericGetRequestQuery } from 'src/store/api/app'

const MailTest = () => {
  const configQuery = useGenericGetRequestQuery({
    path: '/api/ExecMailTest',
    params: { Action: 'CheckConfig' },
  })

  function handleConfigRetry() {
    configQuery.refetch()
  }

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
      selector: (row) => row?.AuthResult?.find((x) => x?.Name === 'spf')?.Status == 'pass',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DKIM',
      selector: (row) => row?.AuthResult?.find((x) => x?.Name === 'dkim')?.Status == 'pass',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DMARC',
      selector: (row) => row?.AuthResult?.find((x) => x?.Name === 'dmarc')?.Status == 'pass',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Comp Auth',
      selector: (row) => row?.AuthResult?.find((x) => x?.Name === 'compauth')?.Status == 'pass',
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
      {configQuery.isSuccess && (
        <CippCallout color={configQuery.data?.HasMailRead ? 'info' : 'warning'} dismissible={true}>
          {configQuery.data?.HasMailRead && (
            <>
              <b>Mail test email: </b>
              <a
                href={
                  'mailto:' +
                  configQuery.data?.MailAddresses.filter((x) => x?.IsPrimary)[0]?.Address
                }
              >
                {configQuery.data?.MailAddresses.filter((x) => x?.IsPrimary)[0]?.Address}
              </a>
            </>
          )}
          {configQuery.data?.HasMailRead == false && (
            <>
              Permission Check: {configQuery.data?.Message}{' '}
              <CButton size="sm" className="ms-2" onClick={() => handleConfigRetry()}>
                {configQuery.isLoading ? <CSpinner /> : <FontAwesomeIcon icon="sync" />} Retry
              </CButton>
            </>
          )}
        </CippCallout>
      )}
      {configQuery.isLoading && <CSpinner />}
      {configQuery.isSuccess && configQuery.data?.HasMailRead === true && (
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
