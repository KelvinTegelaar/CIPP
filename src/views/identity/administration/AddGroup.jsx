import React from 'react'
import {
  CCallout,
  CButton,
  CCol,
  CForm,
  CRow,
  CSpinner,
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
} from '@coreui/react'
import { Form } from 'react-final-form'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormSelect,
  RFFCFormTextarea,
  RFFSelectSearch,
} from 'src/components/forms'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useListDomainsQuery } from 'src/store/api/domains'
import { useListUsersQuery } from 'src/store/api/users'
import { useSelector } from 'react-redux'

const AddGroup = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: domains = [],
    isFetching: domainsIsFetching,
    error: domainsError,
  } = useListDomainsQuery({ tenantDomain })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const shippedValues = {
      tenantID: tenantDomain,
      domain: values.domain,
      displayName: values.displayName,
      username: values.username,
      isAssignableToRole: values.isAssignableToRole,
      groupType: values.groupType,
      allowExternal: values.allowExternal,
      membershipRules: values.membershipRules,
      AddMember: values.AddMembers,
      AddOwner: values.AddOwners,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/AddGroup', values: shippedValues })
  }

  return (
    <CippPage title="Add Group">
      <CCard>
        <CCardHeader>
          <CCardTitle>Group Details</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <Form
            onSubmit={onSubmit}
            render={({ handleSubmit, submitting, values }) => {
              return (
                <CForm onSubmit={handleSubmit}>
                  <CRow>
                    <CCol md={8}>
                      <RFFCFormInput type="text" name="displayName" label="Display Name" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={8}>
                      <RFFCFormInput type="text" name="description" label="Description" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={4}>
                      <RFFCFormInput type="text" name="username" label="Username" />
                    </CCol>
                    <CCol md={4}>
                      {domainsIsFetching && <CSpinner />}
                      {!domainsIsFetching && (
                        <RFFCFormSelect
                          // label="Domain"
                          name="domain"
                          label="Primary Domain name"
                          placeholder={!domainsIsFetching ? 'Select domain' : 'Loading...'}
                          values={domains?.map((domain) => ({
                            value: domain.id,
                            label: domain.id,
                          }))}
                        />
                      )}
                      {domainsError && <span>Failed to load list of domains</span>}
                    </CCol>
                  </CRow>
                  <CRow>
                    <Condition when="groupType" regex={/azurerole|generic/}>
                      <CCol md={12}>
                        <RFFSelectSearch
                          multi={true}
                          label="Add Owner"
                          values={users?.map((user) => ({
                            value: user.userPrincipalName,
                            name: `${user.displayName} - ${user.userPrincipalName}`,
                          }))}
                          placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                          name="AddOwners"
                        />
                        {usersError && <span>Failed to load list of users</span>}
                      </CCol>
                    </Condition>
                    <Condition when="groupType" regex={/azurerole|generic/}>
                      <CCol md={12}>
                        <RFFSelectSearch
                          multi={true}
                          label="Add member"
                          values={users?.map((user) => ({
                            value: user.userPrincipalName,
                            name: `${user.displayName} - ${user.userPrincipalName}`,
                          }))}
                          placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                          name="AddMembers"
                        />
                        {usersError && <span>Failed to load list of users</span>}
                      </CCol>
                    </Condition>
                  </CRow>
                  <br />
                  <CRow>
                    <RFFCFormRadio name="groupType" label="Azure Role Group" value="azurerole" />
                    <RFFCFormRadio name="groupType" label="Security Group" value="generic" />
                    <RFFCFormRadio name="groupType" label="Dynamic Group" value="dynamic" />
                    <RFFCFormRadio
                      name="groupType"
                      label="Dynamic Distribution Group "
                      value="dynamicdistribution"
                    />

                    <RFFCFormRadio
                      name="groupType"
                      label="Distribution List"
                      value="distribution"
                    />
                    <RFFCFormRadio
                      name="groupType"
                      label="Mail Enabled Security Group"
                      value="security"
                    />
                    <Condition when="groupType" is={'distribution'}>
                      <RFFCFormCheck
                        name="allowExternal"
                        label="Let people outside the organization email the group"
                      />
                    </Condition>
                    <Condition when="groupType" is="dynamic">
                      <RFFCFormTextarea
                        name="membershipRules"
                        label="Dynamic Group Parameters"
                        placeholder={
                          'Enter the dynamic group parameters syntax. e.g: (user.userPrincipalName -notContains `"#EXT#@`") -and (user.userType -ne `"Guest`")'
                        }
                      />
                    </Condition>
                    <Condition when="groupType" is="dynamicdistribution">
                      <RFFCFormTextarea
                        name="membershipRules"
                        label="Dynamic Group Parameters"
                        placeholder={
                          'Enter the dynamic group parameters syntax. e.g: (user.userPrincipalName -notContains `"#EXT#@`") -and (user.userType -ne `"Guest`")'
                        }
                      />
                    </Condition>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CButton type="submit" disabled={submitting}>
                        Add Group
                      </CButton>
                    </CCol>
                  </CRow>
                  {postResults.isFetching && <CSpinner />}
                  {postResults.isSuccess && (
                    <CCallout color="success">{postResults.data.Results[0]}</CCallout>
                  )}
                </CForm>
              )
            }}
          />
        </CCardBody>
      </CCard>
    </CippPage>
  )
}

export default AddGroup
