import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  CButton,
  CCallout,
  CCol,
  CForm,
  CRow,
  CAccordion,
  CAccordionHeader,
  CAccordionBody,
  CAccordionItem,
  CTooltip,
} from '@coreui/react'
import { Field, Form, FormSpy } from 'react-final-form'
import { RFFCFormRadioList, RFFSelectSearch } from 'src/components/forms'
import { useGenericGetRequestQuery, useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  TenantSelectorMultiple,
  ModalService,
  CippOffcanvas,
  CippCodeBlock,
} from 'src/components/utilities'
import PropTypes from 'prop-types'
import { OnChange } from 'react-final-form-listeners'
import { useListTenantsQuery } from 'src/store/api/tenants'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import { CippTable } from '../tables'
import { Row } from 'react-bootstrap'
import { cellGenericFormatter } from '../tables/CellGenericFormat'
import Skeleton from 'react-loading-skeleton'
import CippDropzone from './CippDropzone'
import { Editor } from '@monaco-editor/react'
import { useSelector } from 'react-redux'
import { CippCallout } from '../layout'

const CippAppPermissionBuilder = ({ onSubmit, currentPermissions = {}, isSubmitting }) => {
  const [selectedApp, setSelectedApp] = useState([])
  const [permissionsImported, setPermissionsImported] = useState(false)
  const [newPermissions, setNewPermissions] = useState({})
  const [importedManifest, setImportedManifest] = useState(null)
  const [manifestVisible, setManifestVisible] = useState(false)
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const [calloutMessage, setCalloutMessage] = useState(null)

  const {
    data: servicePrincipals = [],
    isFetching: spFetching,
    isSuccess: spSuccess,
    isUninitialized: spUninitialized,
    refetch: refetchSpList,
  } = useGenericGetRequestQuery({
    path: 'api/ExecServicePrincipals',
  })

  const [createServicePrincipal, createResult] = useLazyGenericGetRequestQuery()

  const removeServicePrincipal = (appId) => {
    var servicePrincipal = selectedApp.find((sp) => sp?.appId === appId)
    var newServicePrincipals = selectedApp.filter((sp) => sp?.appId !== appId)

    ModalService.confirm({
      title: 'Remove Service Principal',
      body: `Are you sure you want to remove ${servicePrincipal.displayName}?`,
      onConfirm: () => {
        setSelectedApp(newServicePrincipals)
        var updatedPermissions = JSON.parse(JSON.stringify(newPermissions))
        delete updatedPermissions.Permissions[appId]
        setNewPermissions(updatedPermissions)
      },
    })
  }

  const confirmReset = () => {
    ModalService.confirm({
      title: 'Reset to Default',
      body: 'Are you sure you want to reset all permissions to default?',
      onConfirm: () => {
        setSelectedApp([])
        setPermissionsImported(false)
        setManifestVisible(false)
        setCalloutMessage('Permissions reset to default.')
      },
    })
  }

  const handleSubmit = (values) => {
    if (onSubmit) {
      var postBody = {
        Permissions: newPermissions,
      }
      onSubmit(postBody)
    }
  }

  const onCreateServicePrincipal = (appId) => {
    createServicePrincipal({
      path: 'api/ExecServicePrincipals?Action=Create&AppId=' + appId,
    }).then(() => {
      refetchSpList()
      setCalloutMessage(createResult?.data?.Results)
    })
  }

  const addPermissionRow = (servicePrincipal, permissionType, permission) => {
    var updatedPermissions = JSON.parse(JSON.stringify(newPermissions))

    if (!updatedPermissions?.Permissions[servicePrincipal]) {
      updatedPermissions.Permissions[servicePrincipal] = {
        applicationPermissions: [],
        delegatedPermissions: [],
      }
    }
    var currentPermission = updatedPermissions?.Permissions[servicePrincipal][permissionType]
    var newPermission = []
    if (currentPermission) {
      currentPermission.map((perm) => {
        if (perm.id !== permission.value) {
          newPermission.push(perm)
        }
      })
    }
    newPermission.push({ id: permission.value, value: permission.label })

    updatedPermissions.Permissions[servicePrincipal][permissionType] = newPermission
    setNewPermissions(updatedPermissions)
  }

  const removePermissionRow = (servicePrincipal, permissionType, permissionId, permissionValue) => {
    // modal confirm
    ModalService.confirm({
      title: 'Remove Permission',
      body: `Are you sure you want to remove the permission: ${permissionValue}?`,
      onConfirm: () => {
        var updatedPermissions = JSON.parse(JSON.stringify(newPermissions))
        var currentPermission = updatedPermissions?.Permissions[servicePrincipal][permissionType]
        var newPermission = []
        if (currentPermission) {
          currentPermission.map((perm) => {
            if (perm.id !== permissionId) {
              newPermission.push(perm)
            }
          })
        }
        updatedPermissions.Permissions[servicePrincipal][permissionType] = newPermission
        setNewPermissions(updatedPermissions)
      },
    })
  }

  const generateManifest = (appDisplayName = 'CIPP-SAM', prompt = false) => {
    if (prompt) {
      // modal input form for appDisplayName
      ModalService.prompt({
        title: 'Generate Manifest',
        body: 'Please enter the display name for the application.',
        onConfirm: (value) => {
          generateManifest({ appDisplayName: value })
        },
      })
    } else {
      var manifest = {
        isFallbackPublicClient: true,
        signInAudience: 'AzureADMultipleOrgs',
        displayName: appDisplayName,
        web: {
          redirectUris: [
            'https://login.microsoftonline.com/common/oauth2/nativeclient',
            'https://localhost',
            'http://localhost',
            'http://localhost:8400',
          ],
        },
        requiredResourceAccess: [],
      }

      var additionalPermissions = []

      selectedApp.map((sp) => {
        var appRoles = newPermissions?.Permissions[sp.appId]?.applicationPermissions
        var delegatedPermissions = newPermissions?.Permissions[sp.appId]?.delegatedPermissions
        var requiredResourceAccess = {
          resourceAppId: sp.appId,
          resourceAccess: [],
        }
        var additionalRequiredResourceAccess = {
          resourceAppId: sp.appId,
          resourceAccess: [],
        }
        if (appRoles) {
          appRoles.map((role) => {
            requiredResourceAccess.resourceAccess.push({
              id: role.id,
              type: 'Role',
            })
          })
        }
        if (delegatedPermissions) {
          delegatedPermissions.map((perm) => {
            // permission not a guid skip
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(perm.id)) {
              requiredResourceAccess.resourceAccess.push({
                id: perm.id,
                type: 'Scope',
              })
            } else {
              additionalRequiredResourceAccess.resourceAccess.push({
                id: perm.id,
                type: 'Scope',
              })
            }
          })
        }
        if (requiredResourceAccess.resourceAccess.length > 0) {
          manifest.requiredResourceAccess.push(requiredResourceAccess)
        }
        if (additionalRequiredResourceAccess.resourceAccess.length > 0) {
          additionalPermissions.push(additionalRequiredResourceAccess)
        }
      })

      var fileName = `${appDisplayName.replace(' ', '-')}.json`
      if (appDisplayName === 'CIPP-SAM') {
        fileName = 'SAMManifest.json'
      }

      var blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
      var url = URL.createObjectURL(blob)
      var a = document.createElement('a')
      a.href = url
      a.download = `${fileName}`
      a.click()
      URL.revokeObjectURL(url)

      if (additionalPermissions.length > 0) {
        ModalService.confirm({
          title: 'Additional Permissions',
          body: 'Some permissions are not supported in the manifest. Would you like to download them?',
          confirmLabel: 'Download',
          onConfirm: () => {
            var additionalBlob = new Blob([JSON.stringify(additionalPermissions, null, 2)], {
              type: 'application/json',
            })
            var additionalUrl = URL.createObjectURL(additionalBlob)
            var additionalA = document.createElement('a')
            additionalA.href = additionalUrl
            additionalA.download = 'AdditionalPermissions.json'
            additionalA.click()
            URL.revokeObjectURL(additionalUrl)
          },
        })
      }
    }
  }

  const importManifest = () => {
    var updatedPermissions = { Permissions: {} }
    var manifest = importedManifest
    var requiredResourceAccess = manifest.requiredResourceAccess
    var selectedServicePrincipals = []

    requiredResourceAccess.map((resourceAccess) => {
      var sp = servicePrincipals?.Results?.find((sp) => sp.appId === resourceAccess.resourceAppId)
      if (sp) {
        var appRoles = []
        var delegatedPermissions = []
        selectedServicePrincipals.push(sp)
        resourceAccess.resourceAccess.map((access) => {
          if (access.type === 'Role') {
            var role = sp.appRoles.find((role) => role.id === access.id)
            if (role) {
              appRoles.push({
                id: role.id,
                value: role.value,
              })
            }
          } else if (access.type === 'Scope') {
            var scope = sp.publishedPermissionScopes.find((scope) => scope.id === access.id)
            if (scope) {
              delegatedPermissions.push({
                id: scope.id,
                value: scope.value,
              })
            }
          }
        })
        updatedPermissions.Permissions[sp.appId] = {
          applicationPermissions: appRoles,
          delegatedPermissions: delegatedPermissions,
        }
      }
    })
    setNewPermissions(updatedPermissions)
    setSelectedApp(selectedServicePrincipals)
    setImportedManifest(null)
    setPermissionsImported(true)
    setManifestVisible(false)
    setCalloutMessage('Manifest imported successfully.')
  }

  const onManifestImport = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        console.log(reader.result)
        try {
          var manifest = JSON.parse(reader.result)
          setImportedManifest(manifest)
          console.log(importedManifest)
        } catch {
          console.log('invalid manifest')
        }
      }
      reader.readAsText(file)
    })
  }, [])

  useEffect(() => {
    try {
      var initialAppIds = Object.keys(currentPermissions?.Permissions)
    } catch {
      initialAppIds = []
    }

    if (spSuccess && selectedApp.length == 0 && initialAppIds.length == 0) {
      var microsoftGraph = servicePrincipals?.Results?.find(
        (sp) => sp?.appId === '00000003-0000-0000-c000-000000000000',
      )
      setSelectedApp([microsoftGraph])
      setNewPermissions({
        Permissions: {
          '00000003-0000-0000-c000-000000000000': {
            applicationPermissions: [],
            delegatedPermissions: [],
          },
        },
      })
    } else if (spSuccess && initialAppIds.length > 0 && permissionsImported == false) {
      var newApps = []
      initialAppIds?.map((appId) => {
        var newSp = servicePrincipals?.Results?.find((sp) => sp.appId === appId)
        if (newSp) {
          newApps.push(newSp)
        }
      })
      newApps = newApps.sort((a, b) => {
        return a.displayName.localeCompare(b.displayName)
      })
      setSelectedApp(newApps)
      setNewPermissions(currentPermissions)
      setPermissionsImported(true)
    }
  }, [
    currentPermissions,
    permissionsImported,
    spSuccess,
    selectedApp,
    servicePrincipals,
    setSelectedApp,
    setPermissionsImported,
    setNewPermissions,
  ])

  const ApiPermissionRow = ({ servicePrincipal = null }) => {
    return (
      <>
        {spSuccess && servicePrincipal !== null && (
          <CRow>
            <CCol xl={12}>
              <CRow>
                <CCol xl={11}>
                  <p className="me-1">
                    Manage the permissions for the {servicePrincipal.displayName}.
                  </p>
                </CCol>
                <CCol xl={1} className="mx-auto">
                  <CTooltip
                    content={
                      servicePrincipal.appId === '00000003-0000-0000-c000-000000000000'
                        ? "You can't remove Microsoft Graph"
                        : 'Remove Service Principal'
                    }
                  >
                    <div>
                      <CButton
                        onClick={() => {
                          removeServicePrincipal(servicePrincipal.appId)
                        }}
                        disabled={servicePrincipal.appId === '00000003-0000-0000-c000-000000000000'}
                        className={`circular-button`}
                      >
                        <FontAwesomeIcon icon="times" />
                      </CButton>
                    </div>
                  </CTooltip>
                </CCol>
              </CRow>
              <CRow>
                <CCol xl={12}>
                  {servicePrincipal?.appRoles?.length > 0 ? (
                    <>
                      <CRow>
                        <FormSpy subscription={{ values: true }}>
                          {({ values }) => {
                            return (
                              <CRow>
                                <CCol xl={6} sm={12}>
                                  <RFFSelectSearch
                                    name={
                                      'Permissions.' +
                                      servicePrincipal.appId +
                                      '.applicationPermissions'
                                    }
                                    label="Application Permissions"
                                    values={servicePrincipal?.appRoles
                                      ?.filter((role) => {
                                        return newPermissions?.Permissions[
                                          servicePrincipal.appId
                                        ]?.applicationPermissions?.find(
                                          (perm) => perm.id === role.id,
                                        )
                                          ? false
                                          : true
                                      })
                                      .map((role) => ({
                                        name: role.value,
                                        value: role.id,
                                      }))
                                      .sort((a, b) => a.name.localeCompare(b.name))}
                                  />
                                </CCol>
                                <CCol xl={6} sm={12} className="mt-auto">
                                  <CTooltip content="Add Permission">
                                    <CButton
                                      onClick={() => {
                                        addPermissionRow(
                                          servicePrincipal.appId,
                                          'applicationPermissions',
                                          values.Permissions[servicePrincipal?.appId]
                                            .applicationPermissions,
                                        )
                                        values.Permissions[
                                          servicePrincipal.appId
                                        ].applicationPermissions = ''
                                      }}
                                      className={`circular-button`}
                                    >
                                      <FontAwesomeIcon icon="plus" />
                                    </CButton>
                                  </CTooltip>
                                </CCol>
                              </CRow>
                            )
                          }}
                        </FormSpy>
                      </CRow>
                      <div className="px-4">
                        <CippTable
                          reportName={`${servicePrincipal.displayName} Application Permissions`}
                          data={
                            newPermissions?.Permissions[servicePrincipal?.appId]
                              ?.applicationPermissions ?? []
                          }
                          title="Application Permissions"
                          columns={[
                            {
                              selector: (row) => row.value,
                              name: 'Permission',
                              sortable: true,
                              exportSelector: 'value',
                              maxWidth: '30%',
                              cell: cellGenericFormatter(),
                            },
                            {
                              selector: (row) => row.id,
                              name: 'Id',
                              omit: true,
                              exportSelector: 'id',
                            },
                            {
                              selector: (row) =>
                                servicePrincipal.appRoles.find((role) => role.id === row.id)
                                  .description,
                              name: 'Description',
                              cell: cellGenericFormatter({ wrap: true }),
                              maxWidth: '60%',
                            },
                            {
                              name: 'Actions',
                              cell: (row) => {
                                return (
                                  <CTooltip content="Remove Permission">
                                    <CButton
                                      onClick={() => {
                                        removePermissionRow(
                                          servicePrincipal.appId,
                                          'applicationPermissions',
                                          row.id,
                                          row.value,
                                        )
                                      }}
                                      color="danger"
                                      variant="ghost"
                                      size="sm"
                                    >
                                      <FontAwesomeIcon icon="trash" />
                                    </CButton>
                                  </CTooltip>
                                )
                              },
                              maxWidth: '10%',
                            },
                          ]}
                          dynamicColumns={false}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <CCallout color="warning">
                        <FontAwesomeIcon icon="exclamation-triangle" className="me-2" />
                        No Application Permissions found.
                      </CCallout>
                    </>
                  )}
                </CCol>
              </CRow>
              <CRow>
                <CCol xl={12}>
                  <hr />
                </CCol>
              </CRow>
              <CRow>
                <CCol xl={12}>
                  {servicePrincipal?.publishedPermissionScopes?.length == 0 && (
                    <CCallout color="warning">
                      <FontAwesomeIcon icon="exclamation-triangle" className="me-2" />
                      No Published Delegated Permissions found.
                    </CCallout>
                  )}
                  <FormSpy subscription={{ values: true }}>
                    {({ values }) => {
                      return (
                        <CRow>
                          <CCol xl={6} sm={12}>
                            <RFFSelectSearch
                              name={
                                'Permissions.' + servicePrincipal.appId + '.delegatedPermissions'
                              }
                              label="Delegated Permissions"
                              values={
                                servicePrincipal?.publishedPermissionScopes?.length > 0
                                  ? servicePrincipal?.publishedPermissionScopes
                                      .filter((scopes) => {
                                        return newPermissions?.Permissions[
                                          servicePrincipal.appId
                                        ]?.delegatedPermissions?.find(
                                          (perm) => perm.id === scopes.id,
                                        )
                                          ? false
                                          : true
                                      })
                                      .map((scope) => ({
                                        name: scope.value,
                                        value: scope.id,
                                      }))
                                      .sort((a, b) => a.name.localeCompare(b.name))
                                  : []
                              }
                              allowCreate={true}
                            />
                          </CCol>
                          <CCol xl={6} sm={12} className="mt-auto">
                            <CTooltip content="Add Permission">
                              <CButton
                                onClick={() => {
                                  addPermissionRow(
                                    servicePrincipal.appId,
                                    'delegatedPermissions',
                                    values?.Permissions[servicePrincipal.appId]
                                      .delegatedPermissions,
                                  )
                                  values.Permissions[servicePrincipal.appId].delegatedPermissions =
                                    ''
                                }}
                                className={`circular-button`}
                              >
                                <FontAwesomeIcon icon="plus" />
                              </CButton>
                            </CTooltip>
                          </CCol>
                        </CRow>
                      )
                    }}
                  </FormSpy>

                  <div className="px-4 mb-3">
                    <CippTable
                      reportName={`${servicePrincipal.displayName} Delegated Permissions`}
                      data={
                        newPermissions?.Permissions[servicePrincipal?.appId]
                          ?.delegatedPermissions ?? []
                      }
                      title="Delegated Permissions"
                      columns={[
                        {
                          selector: (row) => row?.value,
                          name: 'Permission',
                          sortable: true,
                          exportSelector: 'value',
                          maxWidth: '30%',
                          cell: cellGenericFormatter(),
                        },
                        {
                          selector: (row) => row?.id,
                          name: 'Id',
                          omit: true,
                          exportSelector: 'id',
                        },
                        {
                          selector: (row) =>
                            servicePrincipal.publishedPermissionScopes.find(
                              (scope) => scope?.id === row?.id,
                            )?.userConsentDescription ?? 'No Description',
                          name: 'Description',
                          cell: cellGenericFormatter({ wrap: true }),
                          maxWidth: '60%',
                        },
                        {
                          name: 'Actions',
                          cell: (row) => {
                            return (
                              <CTooltip content="Remove Permission">
                                <CButton
                                  onClick={() => {
                                    removePermissionRow(
                                      servicePrincipal.appId,
                                      'delegatedPermissions',
                                      row.id,
                                      row.value,
                                    )
                                  }}
                                  color="danger"
                                  variant="ghost"
                                  size="sm"
                                >
                                  <FontAwesomeIcon icon="trash" />
                                </CButton>
                              </CTooltip>
                            )
                          },
                          maxWidth: '10%',
                        },
                      ]}
                      dynamicColumns={false}
                    />
                  </div>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        )}
      </>
    )
  }
  ApiPermissionRow.propTypes = {
    servicePrincipal: PropTypes.object,
  }

  return (
    <>
      {spFetching && <Skeleton />}
      {spSuccess && (
        <Form
          onSubmit={handleSubmit}
          render={({ handleSubmit, submitting, values }) => {
            return (
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol xl={8} md={12} className="mb-3">
                    <CRow className="mb-3">
                      <CCol xl={8}>
                        {servicePrincipals?.Metadata?.Success && (
                          <RFFSelectSearch
                            name="servicePrincipal"
                            label="Service Principal"
                            values={servicePrincipals?.Results.map((sp) => ({
                              name: `${sp.displayName} (${sp.appId})`,
                              value: sp.appId,
                            }))}
                            isLoading={spFetching}
                            refreshFunction={() => refetchSpList()}
                            allowCreate={true}
                            onCreateOption={(newSp) => {
                              onCreateServicePrincipal(newSp)
                            }}
                            placeholder="(Advanced) Select a Service Principal"
                          />
                        )}
                      </CCol>
                      <CCol xl={4} className="mt-auto">
                        <FormSpy subscription={{ values: true }}>
                          {({ values }) => {
                            return (
                              <CTooltip content="Add Service Principal">
                                <CButton
                                  onClick={(e) =>
                                    setSelectedApp([
                                      ...selectedApp,
                                      servicePrincipals?.Results?.find(
                                        (sp) => sp.appId === values.servicePrincipal.value,
                                      ),
                                    ])
                                  }
                                  disabled={!values.servicePrincipal}
                                  className={`circular-button`}
                                  title={'+'}
                                >
                                  <FontAwesomeIcon icon="plus" />
                                </CButton>
                              </CTooltip>
                            )
                          }}
                        </FormSpy>
                        <CTooltip content="Reset to Default">
                          <CButton
                            onClick={() => {
                              confirmReset()
                            }}
                            className={`circular-button`}
                            title={'+'}
                          >
                            <FontAwesomeIcon icon="rotate-left" />
                          </CButton>
                        </CTooltip>
                        <CTooltip content="Download Manifest">
                          <CButton
                            onClick={() => {
                              generateManifest()
                            }}
                            className={`circular-button`}
                            title={'+'}
                          >
                            <FontAwesomeIcon icon="download" />
                          </CButton>
                        </CTooltip>

                        <CTooltip content="Import Manifest">
                          <CButton
                            onClick={() => {
                              setManifestVisible(true)
                            }}
                            className={`circular-button`}
                            title={'+'}
                          >
                            <FontAwesomeIcon icon="upload" />
                          </CButton>
                        </CTooltip>
                      </CCol>
                    </CRow>
                    <CippOffcanvas
                      title="Import Manifest"
                      id="importManifest"
                      visible={manifestVisible}
                      onHide={() => {
                        setManifestVisible(false)
                      }}
                      addedClass="offcanvas-large"
                      placement="end"
                    >
                      <CRow>
                        <CCol xl={12}>
                          <p>
                            Import a JSON application manifest to set permissions. This will
                            overwrite any existing permissions.
                          </p>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol xl={12}>
                          <CippDropzone
                            onDrop={onManifestImport}
                            accept={{ 'application/json': ['.json'] }}
                            dropMessage="Drag a JSON app manifest here, or click to select one."
                            maxFiles={1}
                            returnCard={false}
                          />
                        </CCol>
                      </CRow>
                      {importedManifest && (
                        <>
                          <CRow className="mt-4">
                            <CCol xl={12}>
                              <CButton onClick={() => importManifest()}>
                                <FontAwesomeIcon icon="save" className="me-2" /> Import
                              </CButton>
                            </CCol>
                          </CRow>
                          <CRow className="mt-3">
                            <CCol xl={12}>
                              <h4>Preview</h4>
                              <CippCodeBlock
                                code={JSON.stringify(importedManifest, null, 2)}
                                language="json"
                                showLineNumbers={false}
                              />
                            </CCol>
                          </CRow>
                        </>
                      )}
                    </CippOffcanvas>
                    {calloutMessage && (
                      <CRow>
                        <CCol>
                          <CippCallout dismissible={true} color="info">
                            <FontAwesomeIcon icon="info-circle" className="me-2" />
                            {calloutMessage}
                          </CippCallout>
                        </CCol>
                      </CRow>
                    )}

                    {newPermissions?.MissingPermissions &&
                      newPermissions?.Type === 'Table' &&
                      Object.keys(newPermissions?.MissingPermissions).length > 0 && (
                        <CRow>
                          <CCol>
                            <CCallout color="warning">
                              <CRow>
                                <CCol xl={10} sm={12}>
                                  <FontAwesomeIcon icon="exclamation-triangle" className="me-2" />
                                  <b>New Permissions Available</b>
                                  {Object.keys(newPermissions?.MissingPermissions).map((perm) => {
                                    // translate appid to display name
                                    var sp = servicePrincipals?.Results?.find(
                                      (sp) => sp.appId === perm,
                                    )
                                    return (
                                      <div key={`missing-${perm}`}>
                                        {sp?.displayName}:{' '}
                                        {Object.keys(newPermissions?.MissingPermissions[perm]).map(
                                          (type) => {
                                            return (
                                              <>
                                                {newPermissions?.MissingPermissions[perm][type]
                                                  .length > 0 && (
                                                  <span key={`missing-${perm}-${type}`}>
                                                    {type == 'applicationPermissions'
                                                      ? 'Application'
                                                      : 'Delegated'}{' '}
                                                    -{' '}
                                                    {newPermissions?.MissingPermissions[perm][type]
                                                      .map((p) => {
                                                        return p.value
                                                      })
                                                      .join(', ')}
                                                  </span>
                                                )}
                                              </>
                                            )
                                          },
                                        )}
                                      </div>
                                    )
                                  })}
                                </CCol>
                                <CCol xl={2} sm={12} className="my-auto">
                                  <CTooltip content="Add Missing Permissions">
                                    <CButton
                                      onClick={() => {
                                        var updatedPermissions = JSON.parse(
                                          JSON.stringify(newPermissions),
                                        )
                                        Object.keys(newPermissions?.MissingPermissions).map(
                                          (perm) => {
                                            Object.keys(
                                              newPermissions?.MissingPermissions[perm],
                                            ).map((type) => {
                                              newPermissions?.MissingPermissions[perm][type].map(
                                                (p) => {
                                                  updatedPermissions.Permissions[perm][type].push(p)
                                                },
                                              )
                                            })
                                          },
                                        )
                                        updatedPermissions.MissingPermissions = {}
                                        setNewPermissions(updatedPermissions)
                                      }}
                                      className={`circular-button float-end`}
                                    >
                                      <FontAwesomeIcon icon="wrench" />
                                    </CButton>
                                  </CTooltip>
                                </CCol>
                              </CRow>
                            </CCallout>
                          </CCol>
                        </CRow>
                      )}
                    <CAccordion>
                      <>
                        {selectedApp?.length > 0 &&
                          selectedApp?.map((sp, spIndex) => (
                            <CAccordionItem
                              itemKey={`sp-${spIndex}-${sp.appId}`}
                              key={`accordion-item-${spIndex}-${sp.appId}`}
                            >
                              <CAccordionHeader>{sp.displayName}</CAccordionHeader>
                              <CAccordionBody>
                                <CRow>
                                  <ApiPermissionRow
                                    servicePrincipal={sp}
                                    key={`apirow-${spIndex}`}
                                  />
                                </CRow>
                              </CAccordionBody>
                            </CAccordionItem>
                          ))}
                      </>
                    </CAccordion>
                  </CCol>

                  <CCol xl={4} md={12}>
                    <FormSpy subscription={{ values: true }}>
                      {({ values }) => {
                        return <></>
                      }}
                    </FormSpy>
                  </CCol>
                </CRow>
                <CRow className="me-3">
                  <CRow className="mb-3">
                    <CCol xl={4} md={12}>
                      <CButton className="me-2" type="submit" disabled={submitting}>
                        <FontAwesomeIcon
                          icon={isSubmitting ? 'circle-notch' : 'save'}
                          spin={isSubmitting}
                          className="me-2"
                        />
                        Save
                      </CButton>
                    </CCol>
                  </CRow>
                </CRow>
              </CForm>
            )
          }}
        />
      )}
    </>
  )
}
CippAppPermissionBuilder.propTypes = {
  onSubmit: PropTypes.func,
  currentPermissions: PropTypes.object,
  isSubmitting: PropTypes.bool,
}

export default CippAppPermissionBuilder
