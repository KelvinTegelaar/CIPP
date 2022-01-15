import React from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CRow,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import { Form } from 'react-final-form'
import TenantSelector from '../../../components/utilities/TenantSelector'
import { RFFCFormInput, RFFSelectSearch } from '../../../components/forms/RFFComponents'
import { useListUsersQuery } from 'src/store/api/users'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

const TeamsAddTeam = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const handleSubmit = async (values) => {
    // @todo hook this up
    const shippedValues = {
      tenantID: tenantDomain,
      displayName: values.displayName,
      description: values.description,
      owner: values.owner,
    }
    //alert(JSON.stringify(shippedValues, null, 2))
    genericPostRequest({ path: '/api/AddTeam', values: shippedValues })
  }
  return (
    <>
      <TenantSelector />
      <hr className="my-4" />
      {postResults.isSuccess && <CAlert color="success">{postResults.data.Results}</CAlert>}

      <CRow>
        <CCol md={6}>
          <CCard className="page-card">
            <CCardHeader>
              <CCardTitle className="text-primary">Add Team</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <Form onSubmit={handleSubmit}>
                {({ handleSubmit, submitting, values }) => {
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
                            label="Select owner.  This user must have a teams license."
                            values={users?.map((user) => ({
                              //temporary using formselect over formsearch as formsearch got bugged somehow
                              value: `${user.mail}`,
                              name: `${user.displayName} - (${user.mail})`,
                            }))}
                            placeholder={!usersIsFetching ? 'Select owner' : 'Loading...'}
                            name="owner"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <hr></hr>
                          <CButton type="submit" disabled={submitting}>
                            Add Team
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  )
                }}
              </Form>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default TeamsAddTeam
