import React, { useRef, useState } from 'react'
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
} from '@coreui/react'
import { Field, Form, FormSpy } from 'react-final-form'
import { RFFCFormRadioList, RFFSelectSearch } from 'src/components/forms'
import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { CippPage } from 'src/components/layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Skeleton from 'react-loading-skeleton'
import { TenantSelectorMultiple, ModalService, CippOffcanvas } from 'src/components/utilities'
import PropTypes from 'prop-types'
import { OnChange } from 'react-final-form-listeners'
import { useListTenantsQuery } from 'src/store/api/tenants'
import CippListOffcanvas, { OffcanvasListSection } from 'src/components/utilities/CippListOffcanvas'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'

const SettingsCustomRoles = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [selectedTenant, setSelectedTenant] = useState([])
  const tenantSelectorRef = useRef()
  const { data: tenants = [], tenantsFetching } = useListTenantsQuery({
    showAllTenantSelector: true,
  })

  const {
    data: apiPermissions = [],
    isFetching,
    isSuccess,
  } = useGenericGetRequestQuery({
    path: 'api/ExecAPIPermissionList',
  })

  const {
    data: customRoleList = [],
    isFetching: customRoleListFetching,
    isSuccess: customRoleListSuccess,
    refetch: refetchCustomRoleList,
  } = useGenericGetRequestQuery({
    path: 'api/ExecCustomRole',
  })

  const handleSubmit = async (values) => {
    //filter on only objects that are 'true'
    genericPostRequest({
      path: '/api/ExecCustomRole?Action=AddUpdate',
      values: {
        RoleName: values.RoleName.value,
        Permissions: values.Permissions,
        AllowedTenants: selectedTenant.map((tenant) => tenant.value),
      },
    }).then(() => {
      refetchCustomRoleList()
    })
  }
  const handleDelete = async (values) => {
    ModalService.confirm({
      title: 'Delete Custom Role',
      body: 'Are you sure you want to delete this custom role? Any users with this role will have their permissions reset to the default for their base role.',
      onConfirm: () => {
        genericPostRequest({
          path: '/api/ExecCustomRole?Action=Delete',
          values: {
            RoleName: values.RoleName.value,
          },
        }).then(() => {
          refetchCustomRoleList()
        })
      },
    })
  }

  const WhenFieldChanges = ({ field, set }) => (
    <Field name={set} subscription={{}}>
      {(
        // No subscription. We only use Field to get to the change function
        { input: { onChange } },
      ) => (
        <FormSpy subscription={{}}>
          {({ form }) => (
            <OnChange name={field}>
              {(value) => {
                if (field === 'RoleName' && value?.value) {
                  let customRole = customRoleList.filter(function (obj) {
                    return obj.RowKey === value.value
                  })
                  if (customRole === undefined || customRole === null || customRole.length === 0) {
                    return false
                  } else {
                    if (set === 'AllowedTenants') {
                      setSelectedTenant(customRole[0][set])
                      var selectedTenants = []
                      tenants.map((tenant) => {
                        if (customRole[0][set].includes(tenant.customerId)) {
                          selectedTenants.push({
                            label: tenant.displayName,
                            value: tenant.customerId,
                          })
                        }
                      })

                      tenantSelectorRef.current.setValue(selectedTenants)
                    } else {
                      onChange(customRole[0][set])
                    }
                  }
                }
                if (field === 'Defaults') {
                  let newPermissions = {}
                  Object.keys(apiPermissions).forEach((cat) => {
                    Object.keys(apiPermissions[cat]).forEach((obj) => {
                      var newval = ''
                      if (cat == 'CIPP' && obj == 'Core' && value == 'None') {
                        newval = 'Read'
                      } else {
                        newval = value
                      }
                      newPermissions[`${cat}${obj}`] = `${cat}.${obj}.${newval}`
                    })
                  })
                  onChange(newPermissions)
                }
              }}
            </OnChange>
          )}
        </FormSpy>
      )}
    </Field>
  )
  WhenFieldChanges.propTypes = {
    field: PropTypes.node,
    set: PropTypes.string,
  }

  const ApiPermissionRow = ({ obj, cat }) => {
    const [offcanvasVisible, setOffcanvasVisible] = useState(false)

    var items = []
    for (var key in apiPermissions[cat][obj])
      for (var key2 in apiPermissions[cat][obj][key]) {
        items.push({ heading: '', content: apiPermissions[cat][obj][key][key2] })
      }
    var group = [{ items: items }]

    return (
      <>
        <CCol md={4}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <h5>{obj}</h5>
          </div>
        </CCol>
        <CCol xl={2}>
          <CButton onClick={() => setOffcanvasVisible(true)} variant="ghost" size="sm" color="info">
            <FontAwesomeIcon icon="info-circle" />
          </CButton>
        </CCol>
        <CCol>
          <RFFCFormRadioList
            name={`Permissions.${cat}${obj}`}
            options={[
              {
                label: 'None',
                value: `${cat}.${obj}.None`,
                disabled: cat === 'CIPP' && obj === 'Core',
              },
              { label: 'Read', value: `${cat}.${obj}.Read` },
              {
                label: 'Read / Write',
                value: `${cat}.${obj}.ReadWrite`,
              },
            ]}
            inline={true}
          />
        </CCol>
        <CippOffcanvas
          visible={offcanvasVisible}
          hideFunction={() => setOffcanvasVisible(false)}
          title="Permission Info"
          placement="end"
          size="lg"
        >
          <h4 className="mt-2">{`${cat}.${obj}`}</h4>
          <p>
            Listed below are the available API endpoints based on permission level, ReadWrite level
            includes endpoints under Read.
          </p>
          {[apiPermissions[cat][obj]].map((permissions, key) => {
            var sections = Object.keys(permissions).map((type) => {
              var items = []
              for (var api in permissions[type]) {
                items.push({ heading: '', content: permissions[type][api] })
              }
              return (
                <OffcanvasListSection items={items} key={key} title={type} showCardTitle={false} />
              )
            })
            return sections
          })}
        </CippOffcanvas>
      </>
    )
  }
  ApiPermissionRow.propTypes = {
    obj: PropTypes.node,
    cat: PropTypes.node,
  }

  return (
    <CippButtonCard title="Custom Roles" titleType="big" isFetching={isFetching || tenantsFetching}>
      <>
        <p className="me-1">
          Custom roles can be used to restrict permissions for users with the 'editor' or 'readonly'
          roles in CIPP. They can be limited to a subset of tenants and API permissions. To restrict
          direct API access, create a role with the name 'CIPP-API'.
        </p>
        <p className="small">
          <FontAwesomeIcon icon="triangle-exclamation" className="me-2" /> This functionality is in
          beta and should be treated as such. The custom role must be added to the user in SWA in
          conjunction with the base role. (e.g. editor,mycustomrole)
        </p>
        {isSuccess && !isFetching && !tenantsFetching && (
          <Form
            onSubmit={handleSubmit}
            render={({ handleSubmit, submitting, values }) => {
              return (
                <CForm onSubmit={handleSubmit}>
                  <CRow className="mb-3">
                    <CCol xl={8} md={12} className="mb-3">
                      <div className="mb-3">
                        <RFFSelectSearch
                          name="RoleName"
                          label="Custom Role"
                          values={customRoleList.map((role) => ({
                            name: role.RowKey,
                            value: role.RowKey,
                          }))}
                          isLoading={customRoleListFetching}
                          refreshFunction={() => refetchCustomRoleList()}
                          allowCreate={true}
                          placeholder="Select an existing role or enter a custom role name"
                        />
                        <WhenFieldChanges field="RoleName" set="Permissions" />
                        <WhenFieldChanges field="RoleName" set="AllowedTenants" />
                      </div>
                      <div className="mb-3">
                        <h5>Allowed Tenants</h5>
                        <TenantSelectorMultiple
                          ref={tenantSelectorRef}
                          values={selectedTenant}
                          AllTenants={true}
                          valueIsDomain={true}
                          onChange={(e) => setSelectedTenant(e)}
                        />
                      </div>
                      <h5>API Permissions</h5>
                      <CRow className="mt-4 px-2">
                        <CCol md={4}>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}
                          >
                            <h5>Set All Permissions</h5>
                          </div>
                        </CCol>
                        <CCol xl={2}></CCol>
                        <CCol>
                          <RFFCFormRadioList
                            name="Defaults"
                            options={[
                              {
                                label: 'None',
                                value: 'None',
                              },
                              { label: 'Read', value: 'Read' },
                              {
                                label: 'Read / Write',
                                value: 'ReadWrite',
                              },
                            ]}
                            inline={true}
                          />
                          <WhenFieldChanges field="Defaults" set="Permissions" />
                        </CCol>
                      </CRow>
                      <CAccordion alwaysOpen>
                        <>
                          {Object.keys(apiPermissions)
                            .sort()
                            .map((cat, catIndex) => (
                              <CAccordionItem
                                itemKey={'role-' + catIndex}
                                key={`accordion-item-${catIndex}`}
                              >
                                <CAccordionHeader>{cat}</CAccordionHeader>
                                <CAccordionBody>
                                  {Object.keys(apiPermissions[cat])
                                    .sort()
                                    .map((obj, index) => {
                                      return (
                                        <CRow key={`row-${catIndex}-${index}`} className="mb-3">
                                          <ApiPermissionRow obj={obj} cat={cat} />
                                        </CRow>
                                      )
                                    })}
                                </CAccordionBody>
                              </CAccordionItem>
                            ))}
                        </>
                      </CAccordion>
                    </CCol>

                    <CCol xl={4} md={12}>
                      <FormSpy subscription={{ values: true }}>
                        {({ values }) => {
                          return (
                            <>
                              {values['RoleName'] && selectedTenant.length > 0 && (
                                <>
                                  <h5>Selected Tenants</h5>
                                  <ul>
                                    {selectedTenant.map((tenant, idx) => (
                                      <li key={idx}>{tenant.label}</li>
                                    ))}
                                  </ul>
                                </>
                              )}
                              {values['RoleName'] && values['Permissions'] && (
                                <>
                                  <h5>Selected Permissions</h5>
                                  <ul>
                                    {values['Permissions'] &&
                                      Object.keys(values['Permissions'])?.map((cat, idx) => (
                                        <>
                                          {!values['Permissions'][cat].includes('None') && (
                                            <li key={idx}>{values['Permissions'][cat]}</li>
                                          )}
                                        </>
                                      ))}
                                  </ul>
                                </>
                              )}
                            </>
                          )
                        }}
                      </FormSpy>
                    </CCol>
                  </CRow>
                  <CRow className="me-3">
                    {postResults.isSuccess && (
                      <CCallout color="success">{postResults.data.Results}</CCallout>
                    )}
                    <CRow className="mb-3">
                      <CCol xl={4} md={12}>
                        <CButton className="me-2" type="submit" disabled={submitting}>
                          <FontAwesomeIcon
                            icon={postResults.isFetching ? 'circle-notch' : 'save'}
                            spin={postResults.isFetching}
                            className="me-2"
                          />
                          Save
                        </CButton>
                        <FormSpy subscription={{ values: true }}>
                          {({ values }) => {
                            return (
                              <CButton
                                className="me-1"
                                onClick={() => handleDelete(values)}
                                disabled={!values['RoleName']}
                              >
                                <FontAwesomeIcon
                                  icon={postResults.isFetching ? 'circle-notch' : 'trash'}
                                  spin={postResults.isFetching}
                                  className="me-2"
                                />
                                Delete
                              </CButton>
                            )
                          }}
                        </FormSpy>
                      </CCol>
                    </CRow>
                  </CRow>
                </CForm>
              )
            }}
          />
        )}
      </>
    </CippButtonCard>
  )
}

export default SettingsCustomRoles
