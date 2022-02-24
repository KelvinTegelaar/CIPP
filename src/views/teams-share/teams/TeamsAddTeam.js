import React from 'react'
import { CCallout, CButton, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import { useSelector } from 'react-redux'
import { Form } from 'react-final-form'
import { RFFCFormInput, RFFCFormRadio, RFFSelectSearch } from 'src/components/forms'
import { useListUsersQuery } from 'src/store/api/users'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { CippContentCard, CippPage } from 'src/components/layout'

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
      visibility: values.visibility,
    }
    //alert(JSON.stringify(shippedValues, null, 2))
    genericPostRequest({ path: '/api/AddTeam', values: shippedValues })
  }

  const initialValues = {
    visibility: 'public',
  }
  return (
    <CippPage title="Add Team">
      <CippContentCard title="Team Details">
        {postResults.isFetching && (
          <CCallout color="success">
            <CSpinner />
          </CCallout>
        )}
        {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
        <Form initialValues={initialValues} onSubmit={handleSubmit}>
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
                <CRow>
                  <CCol>
                    <RFFCFormRadio
                      value="public"
                      name="visibility"
                      label="Public Team"
                    ></RFFCFormRadio>
                    <RFFCFormRadio
                      value="private"
                      name="visibility"
                      label="Private Team"
                    ></RFFCFormRadio>
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
      </CippContentCard>
    </CippPage>
  )
}

export default TeamsAddTeam
