import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CRow,
  CSpinner,
} from '@coreui/react'
import useQuery from '../../../hooks/useQuery'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'react-final-form'
import TenantSelector from '../../../components/cipp/TenantSelector'
import {
  RFFCFormInput,
  RFFCFormSelect,
  RFFCFormTextarea,
  RFFSelectSearch,
} from '../../../components/RFFComponents'
import { useListUsersQuery } from 'src/store/api/users'

const TeamsAddTeam = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })
  const onSubmit = (values) => {
    // @todo bind this
    window.alert(JSON.stringify(values))
  }

  return (
    <>
      <TenantSelector />
      <hr className="my-4" />

      <CRow>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle className="text-primary">Account Details</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <Form
                onSubmit={onSubmit}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <CRow>
                        <CCol>
                          <RFFCFormInput
                            type="text"
                            name="displayName"
                            label="Display Name"
                            placeholder="Enter the Display Name"
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <RFFCFormInput
                            type="text"
                            name="description"
                            label="Description"
                            placeholder="Enter the description"
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <RFFSelectSearch
                            label="Select owner(s)"
                            values={users?.map((user) => ({
                              value: user.id,
                              name: user.displayName,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="Owner"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <CButton className="text-white" type="submit" disabled={submitting}>
                            Add Template
                          </CButton>
                        </CCol>
                      </CRow>
                      {/*<CRow>*/}
                      {/* <CCol>*/}
                      {/*   <pre>{JSON.stringify(values, null, 2)}</pre>*/}
                      {/* </CCol>*/}
                      {/*</CRow>*/}
                    </CForm>
                  )
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default TeamsAddTeam
