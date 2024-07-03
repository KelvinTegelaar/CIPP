import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import { CButton, CCallout, CCardText, CCol, CForm, CRow, CSpinner, CTooltip } from '@coreui/react'
import { Form } from 'react-final-form'
import { RFFSelectSearch } from 'src/components/forms/index.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect } from 'react'
import { CippCallout } from 'src/components/layout/index.js'
import { CippTable } from 'src/components/tables'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'

/**
 * Retrieves and sets the extension mappings for HaloPSA and NinjaOne.
 *
 * @returns {JSX.Element} - JSX component representing the settings extension mappings.
 */
export default function ExtensionMappings({ type, fieldMappings = false, autoMapSyncApi = false }) {
  const [mappingArray, setMappingArray] = React.useState('defaultMapping')
  const [mappingValue, setMappingValue] = React.useState({})
  const [tenantMappingArray, setTenantMappingsArray] = React.useState([])
  const [autoMap, setAutoMap] = React.useState(false)
  const [listMappingBackend, listMappingBackendResult = []] = useLazyGenericGetRequestQuery()
  const [listFieldsBackend, listFieldsBackendResult] = useLazyGenericGetRequestQuery()
  const [setExtensionConfig, extensionConfigResult = []] = useLazyGenericPostRequestQuery()
  const [setExtensionAutomap, extensionAutomapResult] = useLazyGenericPostRequestQuery()
  const [setFieldsExtensionConfig, extensionFieldsConfigResult] = useLazyGenericPostRequestQuery()

  const onOrgSubmit = () => {
    console.log(mappingArray)
    const originalFormat = mappingArray.reduce((acc, item) => {
      acc[item.Tenant?.customerId] = { label: item.companyName, value: item.companyId }
      return acc
    }, {})
    setExtensionConfig({
      path: `api/ExecExtensionMapping?AddMapping=${type}`,
      values: { mappings: originalFormat },
    }).then(() => {
      listMappingBackend({ path: `api/ExecExtensionMapping?List=${type}` })
      setMappingValue({})
    })
  }
  /*const onNinjaOrgsSubmit = () => {
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
  }*/

  const onOrgsAutomap = async (values) => {
    if (autoMapSyncApi) {
      await setExtensionAutomap({
        path: `api/ExecExtensionMapping?AutoMapping=${type}`,
        values: { mappings: values },
      })
      await listMappingBackend({
        path: `api/ExecExtensionMapping?List=${type}`,
      })
    }

    const newMappings = listMappingBackendResult.data?.Tenants.map((tenant) => {
      const company = listMappingBackendResult.data?.Companies.find(
        (client) => client.name === tenant.displayName,
      )
      if (company) {
        return {
          Tenant: tenant,
          companyName: company.name,
          companyId: company.value,
        }
      }
    })
    setMappingArray((currentMappings) => [...currentMappings, ...newMappings])
    setAutoMap(true)
  }

  const onFieldsSubmit = (values) => {
    setFieldsExtensionConfig({
      path: `api/ExecExtensionMapping?AddMapping=${type}Fields`,
      values: { mappings: values },
    })
  }

  /*const onHaloAutomap = () => {
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
  }*/

  useEffect(() => {
    if (listMappingBackendResult.isSuccess) {
      setMappingArray(
        Object.keys(listMappingBackendResult.data?.Mappings).map((key) => ({
          Tenant: listMappingBackendResult.data?.Tenants.find(
            (tenant) => tenant.customerId === key,
          ),
          companyName: listMappingBackendResult.data?.Mappings[key].label,
          companyId: listMappingBackendResult.data?.Mappings[key].value,
        })),
      )
    }
  }, [listMappingBackendResult])

  const Actions = (row, rowIndex, formatExtraData) => {
    return (
      <>
        <CTooltip content="Remove Mapping">
          <CButton
            size="sm"
            variant="ghost"
            color="danger"
            onClick={() =>
              setMappingArray((currentMappings) => currentMappings.filter((item) => item !== row))
            }
          >
            <FontAwesomeIcon icon={'trash'} href="" />
          </CButton>
        </CTooltip>
      </>
    )
  }
  const columns = [
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
      name: `${type} Company Name`,
      selector: (row) => row['companyName'],
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'companyName',
    },
    {
      name: `${type} Company ID`,
      selector: (row) => row['companyId'],
      sortable: true,
      cell: (row) => CellTip(row['companyId']),
      exportSelector: 'companyId',
    },
    {
      name: 'Actions',
      cell: Actions,
      maxWidth: '80px',
    },
  ]

  return (
    <CRow>
      <>
        {listMappingBackendResult.isUninitialized &&
          listMappingBackend({ path: `api/ExecExtensionMapping?List=${type}` })}
        {listFieldsBackendResult.isUninitialized &&
          fieldMappings &&
          listFieldsBackend({ path: `api/ExecExtensionMapping?List=${type}Fields` })}
        <CippButtonCard
          title={`${type} Organization Mapping`}
          titleType="big"
          isFetching={listMappingBackendResult.isFetching}
          CardButton={
            <>
              <CButton form={`${type}Org`} className="me-2" type="submit">
                {extensionConfigResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Set Mappings
              </CButton>
              <CButton onClick={() => onOrgsAutomap()} className="me-2">
                {extensionAutomapResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Automap {type} Organizations
              </CButton>
            </>
          }
        >
          {listMappingBackendResult.isFetching && listMappingBackendResult.isUninitialized ? (
            <CSpinner color="primary" />
          ) : (
            <Form
              onSubmit={onOrgSubmit}
              initialValues={listMappingBackendResult.data?.Mappings}
              render={({ handleSubmit, submitting, values }) => {
                return (
                  <CForm id={`${type}Org`} onSubmit={handleSubmit}>
                    <CCardText>
                      Use the table below to map your client to the correct {type} Organization.
                      {
                        //load all the existing mappings and show them first in a table.
                        listMappingBackendResult.isSuccess && (
                          <CippTable
                            showFilter={true}
                            reportName="none"
                            columns={columns}
                            data={mappingArray}
                            isModal={true}
                          />
                        )
                      }
                      <CRow>
                        <CCol xs={5}>
                          <RFFSelectSearch
                            placeholder="Select a Tenant"
                            name={`tenant_selector`}
                            values={listMappingBackendResult.data?.Tenants.filter((tenant) => {
                              return !Object.keys(listMappingBackendResult.data?.Mappings).includes(
                                tenant.customerId,
                              )
                            }).map((tenant) => ({
                              name: tenant.displayName,
                              value: tenant.customerId,
                            }))}
                            onChange={(e) => {
                              setMappingArray(e.value)
                            }}
                            isLoading={listMappingBackendResult.isFetching}
                          />
                        </CCol>
                        <CCol xs="1" className="d-flex justify-content-center align-items-center">
                          <FontAwesomeIcon icon={'link'} size="xl" className="my-4" />
                        </CCol>
                        <CCol xs="5">
                          <RFFSelectSearch
                            name="companyId"
                            values={listMappingBackendResult.data?.Companies.filter((client) => {
                              return !Object.values(listMappingBackendResult.data?.Mappings)
                                .map((value) => {
                                  return value.value
                                })
                                .includes(client.value.toString())
                            }).map((client) => ({
                              name: client.name,
                              value: client.value,
                            }))}
                            onChange={(e) => setMappingValue(e)}
                            placeholder={`Select a ${type} Organization`}
                            isLoading={listMappingBackendResult.isFetching}
                          />
                        </CCol>
                        <CButton
                          onClick={() => {
                            //set the new mapping in the array
                            if (
                              mappingValue.value !== undefined &&
                              mappingValue.value !== '-1' &&
                              Object.values(mappingArray)
                                .map((item) => item.companyId)
                                .includes(mappingValue.value) === false
                            ) {
                              setMappingArray([
                                ...mappingArray,
                                {
                                  Tenant: listMappingBackendResult.data?.Tenants.find(
                                    (tenant) => tenant.customerId === mappingArray,
                                  ),
                                  companyName: mappingValue.label,
                                  companyId: mappingValue.value,
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
                      {(extensionAutomapResult.isSuccess || extensionAutomapResult.isError) &&
                        !extensionAutomapResult.isFetching && (
                          <CippCallout
                            color={extensionAutomapResult.isSuccess ? 'success' : 'danger'}
                            dismissible
                            style={{ marginTop: '16px' }}
                          >
                            {extensionAutomapResult.isSuccess
                              ? extensionAutomapResult.data.Results
                              : 'Error'}
                          </CippCallout>
                        )}
                      {(extensionConfigResult.isSuccess || extensionConfigResult.isError) &&
                        !extensionConfigResult.isFetching && (
                          <CippCallout
                            color={extensionConfigResult.isSuccess ? 'success' : 'danger'}
                            dismissible
                            style={{ marginTop: '16px' }}
                          >
                            {extensionConfigResult.isSuccess
                              ? extensionConfigResult.data.Results
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
        </CippButtonCard>
      </>
      {fieldMappings && (
        <CippButtonCard
          title={`${type} Field Mapping`}
          titleType="big"
          isFetching={listFieldsBackendResult.isFetching}
          CardButton={
            <CButton form={`${type}Fields`} className="me-2" type="submit">
              {extensionFieldsConfigResult.isFetching && (
                <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
              )}
              Set Mappings
            </CButton>
          }
        >
          {listFieldsBackendResult.isFetching && listFieldsBackendResult.isUninitialized && (
            <CSpinner color="primary" />
          )}
          {listFieldsBackendResult.isSuccess && listFieldsBackendResult.data?.Mappings && (
            <Form
              onSubmit={onFieldsSubmit}
              initialValues={listFieldsBackendResult.data?.Mappings}
              render={({ handleSubmit, submitting, values }) => {
                return (
                  <CForm id={`${type}Fields`} onSubmit={handleSubmit}>
                    {listFieldsBackendResult?.data?.CIPPFieldHeaders?.map((header, key) => (
                      <CCardText key={key}>
                        <h5>{header.Title}</h5>
                        <p>{header.Description}</p>
                        {listFieldsBackendResult?.data?.CIPPFields?.filter(
                          (f) => f.FieldType == header.FieldType,
                        ).map((field, fieldkey) => (
                          <RFFSelectSearch
                            key={fieldkey}
                            name={field.FieldName}
                            label={field.FieldLabel}
                            values={listFieldsBackendResult.data.IntegrationFields.filter(
                              (item) => item.FieldType === field.FieldType || item.type === 'unset',
                            )}
                            placeholder="Select a Field"
                          />
                        ))}
                      </CCardText>
                    ))}
                    <CCol className="me-2">
                      {(extensionFieldsConfigResult.isSuccess ||
                        extensionFieldsConfigResult.isError) &&
                        !extensionFieldsConfigResult.isFetching && (
                          <CippCallout
                            color={extensionFieldsConfigResult.isSuccess ? 'success' : 'danger'}
                            dismissible
                            style={{ marginTop: '16px' }}
                          >
                            {extensionFieldsConfigResult.isSuccess
                              ? extensionFieldsConfigResult.data.Results
                              : 'Error'}
                          </CippCallout>
                        )}
                    </CCol>
                  </CForm>
                )
              }}
            />
          )}
        </CippButtonCard>
      )}
    </CRow>
  )
}
