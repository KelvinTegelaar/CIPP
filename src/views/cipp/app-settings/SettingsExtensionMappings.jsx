import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import {
  CAccordion,
  CButton,
  CCallout,
  CCardText,
  CCol,
  CForm,
  CRow,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import { Form } from 'react-final-form'
import { RFFSelectSearch } from 'src/components/forms/index.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect } from 'react'
import { CippCallout } from 'src/components/layout/index.js'
import CippAccordionItem from 'src/components/contentcards/CippAccordionItem'
import { CippTable } from 'src/components/tables'
import { CellTip } from 'src/components/tables/CellGenericFormat'

/**
 * Retrieves and sets the extension mappings for HaloPSA and NinjaOne.
 *
 * @returns {JSX.Element} - JSX component representing the settings extension mappings.
 */
export function SettingsExtensionMappings() {
  const [addedAttributes, setAddedAttribute] = React.useState(1)
  const [mappingArray, setMappingArray] = React.useState('defaultMapping')
  const [mappingValue, setMappingValue] = React.useState({})
  const [haloMappingsArray, setHaloMappingsArray] = React.useState([])
  const [ninjaMappingsArray, setNinjaMappingsArray] = React.useState([])
  const [HaloAutoMap, setHaloAutoMap] = React.useState(false)
  const [listHaloBackend, listBackendHaloResult = []] = useLazyGenericGetRequestQuery()
  const [listNinjaOrgsBackend, listBackendNinjaOrgsResult] = useLazyGenericGetRequestQuery()
  const [listNinjaFieldsBackend, listBackendNinjaFieldsResult] = useLazyGenericGetRequestQuery()
  const [setHaloExtensionconfig, extensionHaloConfigResult = []] = useLazyGenericPostRequestQuery()
  const [setNinjaOrgsExtensionconfig, extensionNinjaOrgsConfigResult] =
    useLazyGenericPostRequestQuery()
  const [setNinjaOrgsExtensionAutomap, extensionNinjaOrgsAutomapResult] =
    useLazyGenericPostRequestQuery()
  const [setNinjaFieldsExtensionconfig, extensionNinjaFieldsConfigResult] =
    useLazyGenericPostRequestQuery()

  const onHaloSubmit = () => {
    const originalFormat = haloMappingsArray.reduce((acc, item) => {
      acc[item.Tenant?.customerId] = { label: item.haloName, value: item.haloId }
      return acc
    }, {})
    setHaloExtensionconfig({
      path: 'api/ExecExtensionMapping?AddMapping=Halo',
      values: { mappings: originalFormat },
    }).then(() => {
      listHaloBackend({ path: 'api/ExecExtensionMapping?List=Halo' })
      setMappingValue({})
    })
  }
  const onNinjaOrgsSubmit = () => {
    const originalFormat = ninjaMappingsArray.reduce((acc, item) => {
      acc[item.Tenant?.customerId] = { label: item.ninjaName, value: item.ninjaId }
      return acc
    }, {})

    setNinjaOrgsExtensionconfig({
      path: 'api/ExecExtensionMapping?AddMapping=NinjaOrgs',
      values: { mappings: originalFormat },
    }).then(() => {
      listNinjaOrgsBackend({ path: 'api/ExecExtensionMapping?List=NinjaOrgs' })
      setMappingValue({})
    })
  }

  const onNinjaOrgsAutomap = async (values) => {
    await setNinjaOrgsExtensionAutomap({
      path: 'api/ExecExtensionMapping?AutoMapping=NinjaOrgs',
      values: { mappings: values },
    })
    await listNinjaOrgsBackend({
      path: 'api/ExecExtensionMapping?List=NinjaOrgs',
    })
  }

  const onNinjaFieldsSubmit = (values) => {
    setNinjaFieldsExtensionconfig({
      path: 'api/ExecExtensionMapping?AddMapping=NinjaFields',
      values: { mappings: values },
    })
  }

  const onHaloAutomap = () => {
    const newMappings = listBackendHaloResult.data?.Tenants.map(
      (tenant) => {
        const haloClient = listBackendHaloResult.data?.HaloClients.find(
          (client) => client.name === tenant.displayName,
        )
        if (haloClient) {
          console.log(haloClient)
          console.log(tenant)
          return {
            Tenant: tenant,
            haloName: haloClient.name,
            haloId: haloClient.value,
          }
        }
      },
      //filter out any undefined values
    ).filter((item) => item !== undefined)
    setHaloMappingsArray((currentHaloMappings) => [...currentHaloMappings, ...newMappings]).then(
      () => {
        listHaloBackend({ path: 'api/ExecExtensionMapping?List=Halo' })
      },
    )
    setHaloAutoMap(true)
  }

  useEffect(() => {
    if (listBackendHaloResult.isSuccess) {
      setHaloMappingsArray(
        Object.keys(listBackendHaloResult.data?.Mappings).map((key) => ({
          Tenant: listBackendHaloResult.data?.Tenants.find((tenant) => tenant.customerId === key),
          haloName: listBackendHaloResult.data?.Mappings[key].label,
          haloId: listBackendHaloResult.data?.Mappings[key].value,
        })),
      )
    }
  }, [listBackendHaloResult.isSuccess])

  useEffect(() => {
    if (listBackendNinjaOrgsResult.isSuccess) {
      setNinjaMappingsArray(
        Object.keys(listBackendNinjaOrgsResult.data?.Mappings).map((key) => ({
          Tenant: listBackendNinjaOrgsResult.data?.Tenants.find(
            (tenant) => tenant.customerId === key,
          ),
          ninjaName: listBackendNinjaOrgsResult.data?.Mappings[key].label,
          ninjaId: listBackendNinjaOrgsResult.data?.Mappings[key].value,
        })),
      )
    }
  }, [
    listBackendNinjaOrgsResult.data?.Mappings,
    listBackendNinjaOrgsResult.data?.Tenants,
    listBackendNinjaOrgsResult.isSuccess,
  ])

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    return (
      <>
        <CTooltip content="Remove Mapping">
          <CButton
            size="sm"
            variant="ghost"
            color="danger"
            onClick={() =>
              row.haloId
                ? setHaloMappingsArray((currentHaloMappings) =>
                    currentHaloMappings.filter((item) => item !== row),
                  )
                : setNinjaMappingsArray((currentNinjaMappings) =>
                    currentNinjaMappings.filter((item) => item !== row),
                  )
            }
          >
            <FontAwesomeIcon icon={'trash'} href="" />
          </CButton>
        </CTooltip>
      </>
    )
  }
  const halocolumns = [
    {
      name: 'Tenant',
      selector: (row) => row.Tenant?.displayName,
      sortable: true,
      cell: (row) => CellTip(row.Tenant?.displayName),
      exportSelector: 'Tenant',
    },
    {
      name: 'TenantId',
      selector: (row) => row.Tenant?.customerId,
      sortable: true,
      exportSelector: 'Tenant/customerId',
      omit: true,
    },
    {
      name: 'Halo Client Name',
      selector: (row) => row['haloName'],
      sortable: true,
      cell: (row) => CellTip(row['haloName']),
      exportSelector: 'haloName',
    },
    {
      name: 'Halo ID',
      selector: (row) => row['haloId'],
      sortable: true,
      cell: (row) => CellTip(row['haloId']),
      exportSelector: 'haloId',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]

  const ninjacolumns = [
    {
      name: 'Tenant',
      selector: (row) => row.Tenant?.displayName,
      sortable: true,
      cell: (row) => CellTip(row.Tenant?.displayName),
      exportSelector: 'Tenant',
    },
    {
      name: 'TenantId',
      selector: (row) => row.Tenant?.customerId,
      sortable: true,
      exportSelector: 'Tenant/customerId',
      omit: true,
    },
    {
      name: 'NinjaOne Organization Name',
      selector: (row) => row['ninjaName'],
      sortable: true,
      cell: (row) => CellTip(row['ninjaName']),
      exportSelector: 'ninjaName',
    },
    {
      name: 'NinjaOne Organization ID',
      selector: (row) => row['ninjaId'],
      sortable: true,
      cell: (row) => CellTip(row['ninjaId']),
      exportSelector: 'ninjaId',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]

  return (
    <CRow>
      {listBackendHaloResult.isUninitialized &&
        listHaloBackend({ path: 'api/ExecExtensionMapping?List=Halo' })}
      {listBackendNinjaOrgsResult.isUninitialized &&
        listNinjaOrgsBackend({ path: 'api/ExecExtensionMapping?List=NinjaOrgs' })}
      {listBackendNinjaFieldsResult.isUninitialized &&
        listNinjaFieldsBackend({ path: 'api/ExecExtensionMapping?List=NinjaFields' })}
      <CAccordion>
        <CippAccordionItem
          title={'HaloPSA Mapping'}
          titleType="big"
          isFetching={listBackendHaloResult.isFetching}
          CardButton={
            <>
              <CButton form="haloform" className="me-2" type="submit">
                {extensionHaloConfigResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Save Mappings
              </CButton>
              <CButton onClick={() => onHaloAutomap()} className="me-2">
                {extensionNinjaOrgsAutomapResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Automap HaloPSA Clients
              </CButton>
            </>
          }
        >
          {listBackendHaloResult.isFetching && listBackendHaloResult.isUninitialized ? (
            <CSpinner color="primary" />
          ) : (
            <Form
              onSubmit={onHaloSubmit}
              initialValues={listBackendHaloResult.data?.Mappings}
              render={({ handleSubmit, submitting, values }) => {
                return (
                  <CForm id="haloform" onSubmit={handleSubmit}>
                    <CCardText>
                      Use the table below to map your client to the correct PSA client.
                      {
                        //load all the existing mappings and show them first in a table.
                        listBackendHaloResult.isSuccess && (
                          <CippTable
                            showFilter={true}
                            reportName="none"
                            columns={halocolumns}
                            data={haloMappingsArray}
                            isModal={true}
                          />
                        )
                      }
                      <CRow>
                        <CCol xs={5}>
                          <RFFSelectSearch
                            placeholder="Select a Tenant"
                            name={`tenant_selector`}
                            values={listBackendHaloResult.data?.Tenants.filter((tenant) => {
                              return !Object.keys(listBackendHaloResult.data?.Mappings).includes(
                                tenant.customerId,
                              )
                            }).map((tenant) => ({
                              name: tenant.displayName,
                              value: tenant.customerId,
                            }))}
                            onChange={(e) => {
                              setMappingArray(e.value)
                            }}
                            isLoading={listBackendHaloResult.isFetching}
                          />
                        </CCol>
                        <CCol xs="1" className="d-flex justify-content-center align-items-center">
                          <FontAwesomeIcon icon={'link'} size="xl" className="my-4" />
                        </CCol>
                        <CCol xs="5">
                          <RFFSelectSearch
                            name="halo_client"
                            values={listBackendHaloResult.data?.HaloClients.filter((client) => {
                              return !Object.values(listBackendHaloResult.data?.Mappings)
                                .map((value) => {
                                  return value.value
                                })
                                .includes(client.value)
                            }).map((client) => ({
                              name: client.name,
                              value: client.value,
                            }))}
                            onChange={(e) => setMappingValue(e)}
                            placeholder="Select a HaloPSA Client"
                            isLoading={listBackendHaloResult.isFetching}
                          />
                        </CCol>
                        <CButton
                          onClick={() => {
                            if (
                              mappingValue.value !== undefined &&
                              Object.values(haloMappingsArray)
                                .map((item) => item.haloId)
                                .includes(mappingValue.value) === false
                            ) {
                              //set the new mapping in the array
                              setHaloMappingsArray([
                                ...haloMappingsArray,
                                {
                                  Tenant: listBackendHaloResult.data?.Tenants.find(
                                    (tenant) => tenant.customerId === mappingArray,
                                  ),
                                  haloName: mappingValue.label,
                                  haloId: mappingValue.value,
                                },
                              ])
                            }
                          }}
                          className={`my-4 circular-button`}
                          title={'+'}
                        >
                          <FontAwesomeIcon icon={'plus'} />
                        </CButton>
                      </CRow>
                    </CCardText>
                    <CCol className="me-2">
                      {HaloAutoMap && (
                        <CCallout dismissible color="success">
                          Automapping has been executed. Remember to check the changes and save
                          them.
                        </CCallout>
                      )}
                      {(extensionHaloConfigResult.isSuccess || extensionHaloConfigResult.isError) &&
                        !extensionHaloConfigResult.isFetching && (
                          <CippCallout
                            color={extensionHaloConfigResult.isSuccess ? 'success' : 'danger'}
                            dismissible
                            style={{ marginTop: '16px' }}
                          >
                            {extensionHaloConfigResult.isSuccess
                              ? extensionHaloConfigResult.data.Results
                              : 'Error'}
                          </CippCallout>
                        )}
                    </CCol>
                    <small>
                      <FontAwesomeIcon icon={'triangle-exclamation'} className="me-2" />
                      After editing the mappings you must click Save Mappings for the changes to
                      take effect. The table will be saved exactly as presented.
                    </small>
                  </CForm>
                )
              }}
            />
          )}
        </CippAccordionItem>
        <CippAccordionItem
          title={'NinjaOne Organization Mapping'}
          titleType="big"
          isFetching={listBackendNinjaOrgsResult.isFetching}
          CardButton={
            <>
              <CButton form="NinjaOrgs" className="me-2" type="submit">
                {extensionNinjaOrgsConfigResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Set Mappings
              </CButton>
              <CButton onClick={() => onNinjaOrgsAutomap()} className="me-2">
                {extensionNinjaOrgsAutomapResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Automap NinjaOne Organizations
              </CButton>
            </>
          }
        >
          {listBackendNinjaOrgsResult.isFetching && listBackendNinjaOrgsResult.isUninitialized ? (
            <CSpinner color="primary" />
          ) : (
            <Form
              onSubmit={onNinjaOrgsSubmit}
              initialValues={listBackendHaloResult.data?.Mappings}
              render={({ handleSubmit, submitting, values }) => {
                return (
                  <CForm id="NinjaOrgs" onSubmit={handleSubmit}>
                    <CCardText>
                      Use the table below to map your client to the correct NinjaOne Organization.
                      {
                        //load all the existing mappings and show them first in a table.
                        listBackendNinjaOrgsResult.isSuccess && (
                          <CippTable
                            showFilter={true}
                            reportName="none"
                            columns={ninjacolumns}
                            data={ninjaMappingsArray}
                            isModal={true}
                          />
                        )
                      }
                      <CRow>
                        <CCol xs={5}>
                          <RFFSelectSearch
                            placeholder="Select a Tenant"
                            name={`tenant_selector`}
                            values={listBackendNinjaOrgsResult.data?.Tenants.filter((tenant) => {
                              return !Object.keys(
                                listBackendNinjaOrgsResult.data?.Mappings,
                              ).includes(tenant.customerId)
                            }).map((tenant) => ({
                              name: tenant.displayName,
                              value: tenant.customerId,
                            }))}
                            onChange={(e) => {
                              setMappingArray(e.value)
                            }}
                            isLoading={listBackendNinjaOrgsResult.isFetching}
                          />
                        </CCol>
                        <CCol xs="1" className="d-flex justify-content-center align-items-center">
                          <FontAwesomeIcon icon={'link'} size="xl" className="my-4" />
                        </CCol>
                        <CCol xs="5">
                          <RFFSelectSearch
                            name="ninja_org"
                            values={listBackendNinjaOrgsResult.data?.NinjaOrgs.filter((client) => {
                              return !Object.values(listBackendNinjaOrgsResult.data?.Mappings)
                                .map((value) => {
                                  return value.value
                                })
                                .includes(client.value.toString())
                            }).map((client) => ({
                              name: client.name,
                              value: client.value,
                            }))}
                            onChange={(e) => setMappingValue(e)}
                            placeholder="Select a NinjaOne Organization"
                            isLoading={listBackendNinjaOrgsResult.isFetching}
                          />
                        </CCol>
                        <CButton
                          onClick={() => {
                            //set the new mapping in the array
                            if (
                              mappingValue.value !== undefined &&
                              Object.values(ninjaMappingsArray)
                                .map((item) => item.ninjaId)
                                .includes(mappingValue.value) === false
                            ) {
                              setNinjaMappingsArray([
                                ...ninjaMappingsArray,
                                {
                                  Tenant: listBackendNinjaOrgsResult.data?.Tenants.find(
                                    (tenant) => tenant.customerId === mappingArray,
                                  ),
                                  ninjaName: mappingValue.label,
                                  ninjaId: mappingValue.value,
                                },
                              ])
                            }
                          }}
                          className={`my-4 circular-button`}
                          title={'+'}
                        >
                          <FontAwesomeIcon icon={'plus'} />
                        </CButton>
                      </CRow>
                    </CCardText>
                    <CCol className="me-2">
                      {(extensionNinjaOrgsAutomapResult.isSuccess ||
                        extensionNinjaOrgsAutomapResult.isError) &&
                        !extensionNinjaOrgsAutomapResult.isFetching && (
                          <CippCallout
                            color={extensionNinjaOrgsAutomapResult.isSuccess ? 'success' : 'danger'}
                            dismissible
                            style={{ marginTop: '16px' }}
                          >
                            {extensionNinjaOrgsAutomapResult.isSuccess
                              ? extensionNinjaOrgsAutomapResult.data.Results
                              : 'Error'}
                          </CippCallout>
                        )}
                      {(extensionNinjaOrgsConfigResult.isSuccess ||
                        extensionNinjaOrgsConfigResult.isError) &&
                        !extensionNinjaOrgsConfigResult.isFetching && (
                          <CippCallout
                            color={extensionNinjaOrgsConfigResult.isSuccess ? 'success' : 'danger'}
                            dismissible
                            style={{ marginTop: '16px' }}
                          >
                            {extensionNinjaOrgsConfigResult.isSuccess
                              ? extensionNinjaOrgsConfigResult.data.Results
                              : 'Error'}
                          </CippCallout>
                        )}
                    </CCol>
                    <small>
                      <FontAwesomeIcon icon={'triangle-exclamation'} className="me-2" />
                      After editing the mappings you must click Save Mappings for the changes to
                      take effect. The table will be saved exactly as presented.
                    </small>
                  </CForm>
                )
              }}
            />
          )}
        </CippAccordionItem>
        <CippAccordionItem
          title={'Ninjaone Field Mapping'}
          titleType="big"
          isFetching={listBackendNinjaFieldsResult.isFetching}
          CardButton={
            <CButton form="ninjaFields" className="me-2" type="submit">
              {extensionNinjaFieldsConfigResult.isFetching && (
                <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
              )}
              Set Mappings
            </CButton>
          }
        >
          {listBackendNinjaFieldsResult.isFetching ? (
            <CSpinner color="primary" />
          ) : (
            <Form
              onSubmit={onNinjaFieldsSubmit}
              initialValues={listBackendNinjaFieldsResult.data?.Mappings}
              render={({ handleSubmit, submitting, values }) => {
                return (
                  <CForm id="ninjaFields" onSubmit={handleSubmit}>
                    <CCardText>
                      <h5>Organization Global Custom Field Mapping</h5>
                      <p>
                        Use the table below to map your Organization Field to the correct NinjaOne
                        Field
                      </p>
                      {listBackendNinjaFieldsResult.isSuccess &&
                        listBackendNinjaFieldsResult.data.CIPPOrgFields.map((CIPPOrgFields) => (
                          <RFFSelectSearch
                            key={CIPPOrgFields.InternalName}
                            name={CIPPOrgFields.InternalName}
                            label={CIPPOrgFields.Type + ' - ' + CIPPOrgFields.Description}
                            values={listBackendNinjaFieldsResult.data.NinjaOrgFields.filter(
                              (item) => item.type === CIPPOrgFields.Type || item.type === 'unset',
                            )}
                            placeholder="Select a Field"
                          />
                        ))}
                    </CCardText>
                    <CCardText>
                      <h5>Device Custom Field Mapping</h5>
                      <p>
                        Use the table below to map your Device field to the correct NinjaOne WYSIWYG
                        Field
                      </p>
                      {listBackendNinjaFieldsResult.isSuccess &&
                        listBackendNinjaFieldsResult.data.CIPPNodeFields.map((CIPPNodeFields) => (
                          <RFFSelectSearch
                            key={CIPPNodeFields.InternalName}
                            name={CIPPNodeFields.InternalName}
                            label={CIPPNodeFields.Type + ' - ' + CIPPNodeFields.Description}
                            values={listBackendNinjaFieldsResult.data.NinjaNodeFields.filter(
                              (item) => item.type === CIPPNodeFields.Type || item.type === 'unset',
                            )}
                            placeholder="Select a Field"
                          />
                        ))}
                    </CCardText>
                    <CCol className="me-2">
                      {(extensionNinjaFieldsConfigResult.isSuccess ||
                        extensionNinjaFieldsConfigResult.isError) &&
                        !extensionNinjaFieldsConfigResult.isFetching && (
                          <CippCallout
                            color={
                              extensionNinjaFieldsConfigResult.isSuccess ? 'success' : 'danger'
                            }
                            dismissible
                            style={{ marginTop: '16px' }}
                          >
                            {extensionNinjaFieldsConfigResult.isSuccess
                              ? extensionNinjaFieldsConfigResult.data.Results
                              : 'Error'}
                          </CippCallout>
                        )}
                    </CCol>
                  </CForm>
                )
              }}
            />
          )}
        </CippAccordionItem>
      </CAccordion>
    </CRow>
  )
}
