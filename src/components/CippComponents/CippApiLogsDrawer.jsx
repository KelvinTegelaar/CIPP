import { useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { Button, Box } from '@mui/material'
import { CippOffCanvas } from './CippOffCanvas'
import { CippDataTable } from '../CippTable/CippDataTable'

export const CippApiLogsDrawer = ({
  buttonText = 'View API Logs',
  apiFilter = null,
  tenantFilter = null,
  standardFilter = null,
  scheduledTaskFilter = null,
  baselineRunFilter = null,
  requiredPermissions = [],
  PermissionButton = Button,
  title = 'API Logs',
  ...props
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false)

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
  }

  const handleOpenDrawer = () => {
    setDrawerVisible(true)
  }

  // Build the API URL with the filter. Scoped drawers (a standard template, a scheduled task or a
  // baseline run) cover the last 7 days: their runs are scheduled, so "today only" is empty for
  // most of the day after a run that finished overnight.
  const isScoped = Boolean(standardFilter || scheduledTaskFilter || baselineRunFilter)
  const apiUrl = `/api/ListLogs?Filter=true${apiFilter ? `&API=${apiFilter}` : ''}${
    tenantFilter ? `&Tenant=${tenantFilter}` : ''
  }${standardFilter ? `&StandardTemplateId=${standardFilter}` : ''}${
    scheduledTaskFilter ? `&ScheduledTaskId=${scheduledTaskFilter}` : ''
  }${baselineRunFilter ? `&BaselineRunId=${baselineRunFilter}` : ''}${isScoped ? '&Days=7' : ''}`

  // Define the columns for the logs table
  const simpleColumns = [
    'DateTime',
    'Severity',
    'Message',
    'User',
    'Tenant',
    'API',
    'StandardInfo.Template',
    'StandardInfo.Standard',
    'StandardInfo.ConditionalAccessPolicy',
    'StandardInfo.IntunePolicy',
  ]

  const actions = [
    {
      label: 'View Log Entry',
      link: '/cipp/logs/logentry?logentry=[RowKey]',
      pinned: true,
      icon: <CippIcons.EyeIcon />,
      color: 'primary',
    },
  ]

  return (
    <>
      <PermissionButton
        {...(PermissionButton !== Button ? { requiredPermissions } : {})}
        onClick={handleOpenDrawer}
        startIcon={<CippIcons.ReceiptLongOutlined />}
        {...props}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title={title}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
      >
        <Box sx={{ mb: 2 }}>
          <CippDataTable
            title={title}
            hideTitle={true}
            noCard={true}
            simple={false}
            api={{
              url: apiUrl,
              dataKey: '',
            }}
            queryKey={`APILogs-${apiFilter || 'All'}-${tenantFilter || 'AllTenants'}-${
              standardFilter || 'NoStandard'
            }-${scheduledTaskFilter || 'NoTask'}-${baselineRunFilter || 'NoRun'}`}
            simpleColumns={simpleColumns}
            exportEnabled={true}
            offCanvas={{
              extendedInfoFields: [
                'DateTime',
                'Severity',
                'Message',
                'User',
                'Tenant',
                'API',
                'LogData',
                'TenantID',
                'AppId',
                'IP',
                'StandardInfo',
              ],
            }}
            maxHeightOffset="200px"
            defaultSorting={[
              {
                id: 'DateTime',
                desc: true,
              },
            ]}
            actions={actions}
          />
        </Box>
      </CippOffCanvas>
    </>
  )
}
