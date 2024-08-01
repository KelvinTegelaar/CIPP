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
import GDAPRoles from 'src/data/GDAPRoles'

const SettingsSAMRoles = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [selectedTenant, setSelectedTenant] = useState([])
  const tenantSelectorRef = useRef()
  const {
    data: tenants = [],
    isFetching: tenantsFetching,
    isSuccess: tenantSuccess,
  } = useListTenantsQuery({
    showAllTenantSelector: true,
  })

  const {
    data: cippSAMRoles = [],
    isFetching: roleListFetching,
    isSuccess: roleListSuccess,
    refetch: refetchRoleList,
  } = useGenericGetRequestQuery({
    path: 'api/ExecSAMRoles',
  })

  const handleTenantChange = (e) => {
    setSelectedTenant(e)
  }

  const handleSubmit = async (values) => {
    //filter on only objects that are 'true'
    genericPostRequest({
      path: '/api/ExecSAMRoles?Action=Update',
      values: {
        Roles: values.Roles,
        Tenants: selectedTenant.map((tenant) => tenant.value),
      },
    }).then(() => {
      refetchRoleList()
    })
  }

  useEffect(() => {
    if (roleListSuccess && cippSAMRoles.Tenants.length > 0) {
      var selectedTenants = []
      tenants.map((tenant) => {
        if (cippSAMRoles.Tenants.includes(tenant.customerId)) {
          selectedTenants.push({ label: tenant.displayName, value: tenant.customerId })
        }
      })
      tenantSelectorRef.current.setValue(selectedTenants)
    }
  }, [cippSAMRoles, roleListSuccess, tenantSuccess, tenantSelectorRef, tenants])

  return (
    <CippButtonCard title="CIPP-SAM Roles" titleType="big" isFetching={roleListFetching}>
      <>
        <p className="me-1">
          Add your CIPP-SAM application Service Principal directly to Admin Roles in the tenant.
          This is an advanced use case where you need access to additional Graph endpoints or
          Exchange Cmdlets otherwise unavailable via Delegated permissions.
        </p>
        <p className="small">
          <FontAwesomeIcon icon="triangle-exclamation" className="me-2" /> This functionality is in
          beta and should be treated as such. Roles are added during the Update Permissions process
          or a CPV refresh.
        </p>

        {roleListSuccess && (
          <Form
            onSubmit={handleSubmit}
            initialValues={cippSAMRoles}
            render={({ handleSubmit, submitting, values }) => {
              return (
                <CForm onSubmit={handleSubmit}>
                  <CRow className="mb-3">
                    <CCol xl={8} md={12} className="mb-3">
                      <div className="mb-3">
                        <RFFSelectSearch
                          name="Roles"
                          label="Admin Roles"
                          values={GDAPRoles.map((role) => ({
                            name: role.Name,
                            value: role.ObjectId,
                          }))}
                          multi={true}
                          refreshFunction={() => refetchRoleList()}
                          placeholder="Select admin roles"
                        />
                      </div>
                      <div className="mb-3">
                        <h5>Selected Tenants</h5>
                        <TenantSelectorMultiple
                          ref={tenantSelectorRef}
                          values={selectedTenant}
                          AllTenants={true}
                          valueIsDomain={true}
                          onChange={(e) => handleTenantChange(e)}
                        />
                      </div>
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

export default SettingsSAMRoles
