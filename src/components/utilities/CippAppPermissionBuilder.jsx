import React, { useEffect, useRef, useState } from 'react'
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
import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TenantSelectorMultiple, ModalService, CippOffcanvas } from 'src/components/utilities'
import PropTypes from 'prop-types'
import { OnChange } from 'react-final-form-listeners'
import { useListTenantsQuery } from 'src/store/api/tenants'
import { OffcanvasListSection } from 'src/components/utilities/CippListOffcanvas'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import { CippTable } from '../tables'
import { Row } from 'react-bootstrap'
import { cellGenericFormatter } from '../tables/CellGenericFormat'
import Skeleton from 'react-loading-skeleton'
import { uniqueId } from 'lodash-es'

const CippAppPermissionBuilder = ({ onSubmit, currentPermissions = {}, isSubmitting }) => {
  const [selectedApp, setSelectedApp] = useState([])
  const [permissionsImported, setPermissionsImported] = useState(false)
  const [newPermissions, setNewPermissions] = useState({})

  const {
    data: servicePrincipals = [],
    isFetching: spFetching,
    isSuccess: spSuccess,
    isUninitialized: spUninitialized,
    refetch: refetchSpList,
  } = useGenericGetRequestQuery({
    path: 'api/ExecServicePrincipals',
  })

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
        if (perm.id.lower() !== permission.value.lower()) {
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

      selectedApp.map((sp) => {
        var appRoles = newPermissions?.Permissions[sp.appId]?.applicationPermissions
        var delegatedPermissions = newPermissions?.Permissions[sp.appId]?.delegatedPermissions
        var requiredResourceAccess = {
          resourceAppId: sp.appId,
          resourceAccess: [],
        }
        appRoles.map((role) => {
          requiredResourceAccess.resourceAccess.push({
            id: role.id,
            type: 'Role',
          })
        })
        delegatedPermissions.map((perm) => {
          // permission not a guid skip
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(perm.id)) {
            requiredResourceAccess.resourceAccess.push({
              id: perm.id,
              type: 'Scope',
            })
          }
        })
        if (requiredResourceAccess.resourceAccess.length > 0) {
          manifest.requiredResourceAccess.push(requiredResourceAccess)
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
      a.download = `${fileName}.json`
      a.click()
    }
  }

  const importManifest = () => {}

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
      setPermissionsImported(true)
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
    const [offcanvasVisible, setOffcanvasVisible] = useState(false)
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
                              console.log(newSp)
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
                              importManifest()
                            }}
                            className={`circular-button`}
                            title={'+'}
                          >
                            <FontAwesomeIcon icon="upload" />
                          </CButton>
                        </CTooltip>
                      </CCol>
                    </CRow>

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
                                  <ApiPermissionRow servicePrincipal={sp} />
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
