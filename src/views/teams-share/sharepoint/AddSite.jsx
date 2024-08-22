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
import { RFFCFormCheck, RFFCFormInput, RFFSelectSearch } from 'src/components/forms'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useSelector } from 'react-redux'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import { useListUsersQuery } from 'src/store/api/users'

const AddSite = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const shippedValues = {
      tenantFilter: tenantDomain,
      ...values,
    }
    genericPostRequest({ path: '/api/AddSite', values: shippedValues })
  }
  return (
    <CippButtonCard
      title="Add Contact"
      CardButton={
        <CButton form="siteForm" type="submit">
          Add Site
        </CButton>
      }
    >
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit, submitting, values }) => {
          return (
            <CForm id="siteForm" onSubmit={handleSubmit} autoComplete="off">
              <CRow className="mb-1">
                <CCol>
                  <RFFCFormInput type="text" name="siteName" label="Site Name" />
                </CCol>
              </CRow>
              <CRow className="mb-1">
                <CCol>
                  <RFFCFormInput type="text" name="siteDescription" label="Site Description" />
                </CCol>
                <CCol>
                  <RFFSelectSearch
                    label="Add Owner"
                    values={users?.map((user) => ({
                      value: user.userPrincipalName,
                      name: `${user.displayName} - ${user.userPrincipalName}`,
                    }))}
                    placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                    name="SiteOwner"
                  />
                </CCol>
              </CRow>
              <CRow className="mb-1">
                <RFFSelectSearch
                  name="TemplateName"
                  label="Template Name"
                  values={[
                    { value: 'team', name: 'Team (No Microsoft365 Group)' },
                    { value: 'communication', name: 'Communication' },
                  ]}
                />
              </CRow>
              <CRow className="mb-1">
                <RFFSelectSearch
                  name="siteDesign"
                  label="Site Design Template"
                  values={[
                    { value: 'blank', name: 'Blank' },
                    { value: 'Showcase ', name: 'ShowCase' },
                    { value: 'Topic ', name: 'Topic' },
                  ]}
                />
              </CRow>
              {postResults.isFetching && (
                <CCallout color="success">
                  <CSpinner />
                </CCallout>
              )}
              {postResults.isSuccess && (
                <CCallout color="success">{postResults.data.Results}</CCallout>
              )}
            </CForm>
          )
        }}
      />
    </CippButtonCard>
  )
}

export default AddSite
