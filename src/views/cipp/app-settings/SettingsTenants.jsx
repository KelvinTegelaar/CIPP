import { useDispatch, useSelector } from 'react-redux'
import {
  useExecAddExcludeTenantMutation,
  useExecRemoveExcludeTenantMutation,
} from 'src/store/api/tenants.js'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app.js'
import React, { useEffect, useRef } from 'react'
import { ModalService, TenantSelectorMultiple } from 'src/components/utilities/index.js'
import { setCurrentTenant } from 'src/store/features/app.js'
import { CAlert, CButton, CCallout, CSpinner, CTooltip } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faRecycle,
} from '@fortawesome/free-solid-svg-icons'
import { cellBooleanFormatter, CellTip } from 'src/components/tables/index.js'
import { CippCallout, CippPageList } from 'src/components/layout/index.js'

/**
 * The SettingsTenants method is used to manage the tenants in the application. It allows the user to add or
 * remove exclusions, refresh permissions for a tenant, and view the list of excluded tenants.
 *
 * @return {JSXElement} The rendered component for managing the excluded tenants.
 */
export function SettingsTenants() {
  const dispatch = useDispatch()
  const currentTenant = useSelector((state) => state.app.currentTenant)
  const [removeExcludeTenant, removeExcludeTenantResult] = useExecRemoveExcludeTenantMutation()
  const [addExcludeTenant, addExcludeTenantResult] = useExecAddExcludeTenantMutation()
  const [refreshPermissions, refreshPermissionsResults] = useLazyGenericGetRequestQuery()

  // const [selectedTenant, setSelectedTenant] = useState()
  const selectedTenant = useRef()

  useEffect(() => {
    // if a tenant is already selected and that's the tenant the
    // user wants to exclude, we need to set that to the current state
    selectedTenant.current = currentTenant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemoveExclusion = (domain) =>
    ModalService.confirm({
      title: 'Remove Exclusion',
      body: <div>Are you sure you want to remove the exclusion for {domain}?</div>,
      onConfirm: () => removeExcludeTenant(domain),
    })

  const handleCPVPermissions = (domain, resetsp = false) =>
    ModalService.confirm({
      title: 'Refresh Permissions',
      body: <div>Are you sure you want to refresh permissions for {domain.defaultDomainName}?</div>,
      onConfirm: () =>
        refreshPermissions({
          path: `/api/ExecCPVPermissions?TenantFilter=${domain.customerId}&ResetSP=${resetsp}`,
        }),
    })
  const handleConfirmExcludeTenant = (tenant) => {
    ModalService.confirm({
      title: 'Exclude Tenant',
      body: <div>Are you sure you want to exclude this tenant?</div>,
      onConfirm: () => addExcludeTenant(tenant),
    })
      .unwrap()
      .then(() => {
        dispatch(setCurrentTenant({}))
      })
  }

  const handleExcludeTenant = (selected) => {
    ModalService.confirm({
      body: (
        <div style={{ overflow: 'visible' }}>
          <div>Select a tenant to exclude</div>
          <TenantSelectorMultiple onChange={(tenant) => (selected = tenant)} />
        </div>
      ),
      title: 'Add Exclusion',
      onConfirm: () => handleConfirmExcludeTenant(selected),
    })
  }
  const titleButton = (
    <CButton
      style={{ position: 'absolute', right: '5px' }}
      size="sm"
      href="#"
      onClick={() => handleExcludeTenant(selectedTenant)}
    >
      Add Excluded Tenant
    </CButton>
  )

  function StatusIcon(graphErrorCount) {
    if (graphErrorCount > 0) {
      return <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />
    } else {
      return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
    }
  }

  function StatusText(graphErrorCount, lastGraphError) {
    if (graphErrorCount > 0) {
      return 'Error Count: ' + graphErrorCount + ' - Last Error: ' + lastGraphError
    } else {
      return 'No errors detected with this tenant'
    }
  }

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    return (
      <>
        {row.Excluded && (
          <CTooltip content="Remove Exclusion">
            <CButton
              size="sm"
              variant="ghost"
              color="info"
              onClick={() => handleRemoveExclusion(row.defaultDomainName)}
            >
              <FontAwesomeIcon icon={faEye} href="" />
            </CButton>
          </CTooltip>
        )}
        {!row.Excluded && (
          <CTooltip content="Exclude Tenant">
            <CButton
              size="sm"
              variant="ghost"
              color="danger"
              onClick={() => handleConfirmExcludeTenant({ value: row.customerId })}
            >
              <FontAwesomeIcon icon={faEyeSlash} href="" />
            </CButton>
          </CTooltip>
        )}
        <CTooltip content="CPV Refresh">
          <CButton
            size="sm"
            variant="ghost"
            color="info"
            onClick={() => handleCPVPermissions(row, false)}
          >
            <FontAwesomeIcon icon={faRecycle} href="" />
          </CButton>
        </CTooltip>
      </>
    )
  }
  const columns = [
    {
      name: 'Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
    },
    {
      name: 'Default Domain',
      selector: (row) => row['defaultDomainName'],
      sortable: true,
      cell: (row) => CellTip(row['defaultDomainName']),
      exportSelector: 'defaultDomainName',
    },
    {
      name: 'Excluded',
      selector: (row) => row['Excluded'],
      sortable: true,
      cell: cellBooleanFormatter({ colourless: true }),
      exportSelector: 'Excluded',
      maxWidth: '100px',
      minWidth: '100px',
    },
    {
      name: 'Exclude Date',
      selector: (row) => row['ExcludeDate'],
      sortable: true,
      exportSelector: 'ExcludeDate',
      maxWidth: '150px',
      minWidth: '150px',
    },
    {
      name: 'Exclude User',
      selector: (row) => row['ExcludeUser'],
      sortable: true,
      exportSelector: 'ExcludeUser',
      maxWidth: '130px',
      minWidth: '130px',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]
  return (
    <>
      {(refreshPermissionsResults.isFetching || removeExcludeTenantResult.isFetching) && (
        <CippCallout color="success">
          <CSpinner />
        </CippCallout>
      )}
      {removeExcludeTenantResult.isSuccess && !removeExcludeTenantResult.isFetching && (
        <CippCallout color="success" dismissible>
          {removeExcludeTenantResult.data?.Results}
        </CippCallout>
      )}
      {refreshPermissionsResults.isSuccess &&
      refreshPermissionsResults.data?.Results &&
      !refreshPermissionsResults.isFetching &&
      Array.isArray(refreshPermissionsResults.data.Results) ? (
        <CippCallout color="success" dismissible>
          {refreshPermissionsResults.data.Results.map((result, idx) => (
            <li key={idx}>{result}</li>
          ))}
        </CippCallout>
      ) : null}
      {addExcludeTenantResult.isSuccess && !addExcludeTenantResult.isFetching && (
        <CippCallout color="success" dismissible>
          {addExcludeTenantResult.data?.Results}
        </CippCallout>
      )}
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Tenants - Backend"
        tenantSelector={false}
        titleButton={titleButton}
        datatable={{
          tableProps: {
            selectableRows: true,
            actionsList: [
              {
                label: 'Exclude Tenants',
                modal: true,
                modalType: 'POST',
                modalBody: {
                  value: '!customerId',
                },
                modalUrl: `/api/ExecExcludeTenant?AddExclusion=true`,
                modalMessage: 'Are you sure you want to exclude these tenants?',
              },
              {
                label: 'Include Tenants',
                modal: true,
                modalUrl: `/api/ExecExcludeTenant?RemoveExclusion=true&TenantFilter=!defaultDomainName`,
                modalMessage: 'Are you sure you want to include these tenants?',
              },
              {
                label: 'Refresh CPV Permissions',
                modal: true,
                modalUrl: `/api/ExecCPVPermissions?TenantFilter=!customerId`,
                modalMessage:
                  'Are you sure you want to refresh the CPV permissions for these tenants?',
              },
              {
                label: 'Reset CPV Permissions',
                modal: true,
                modalUrl: `/api/ExecCPVPermissions?TenantFilter=!customerId&ResetSP=true`,
                modalMessage:
                  'Are you sure you want to reset the CPV permissions for these tenants? (This will delete the Service Principal and re-add it.)',
              },
            ],
          },
          isModal: true,
          filterlist: [
            {
              filterName: 'Excluded Tenants',
              filter: 'Complex: Excluded eq true',
            },
            {
              filterName: 'Included Tenants',
              filter: 'Complex: Excluded eq false',
            },
          ],
          keyField: 'id',
          columns,
          reportName: `Tenants-List`,
          path: '/api/ExecExcludeTenant?ListAll=True',
        }}
      />
    </>
  )
}
