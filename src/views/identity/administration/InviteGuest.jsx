import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CRow,
  CCallout,
} from '@coreui/react'
import { Form } from 'react-final-form'
import { RFFCFormCheck, RFFCFormInput } from 'src/components/forms'
import { CippPage } from 'src/components/layout'
import { useListAdConnectSettingsQuery } from 'src/store/api/adconnect'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { required } from 'src/validators'
import useQuery from 'src/hooks/useQuery'
import { useNavigate } from 'react-router-dom'

const InviteGuest = () => {
  let navigate = useNavigate()

  const tenant = useSelector((state) => state.app.currentTenant)
  const { defaultDomainName: tenantDomain } = tenant
  let query = useQuery()
  const allQueryObj = {}
  for (const [key, value] of query.entries()) {
    allQueryObj[key] = value
  }
  const {
    data: adconnectsettings = [],
    isFetching: adcIsFetching,
    error: adcError,
  } = useListAdConnectSettingsQuery({ tenantDomain })

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const shippedValues = {
      DisplayName: values.displayName,
      Domain: values.primDomain,
      Mail: values.mail,
      PostalCode: values.postalCode,
      RedirectURL: values.RedirectURL,
      SendInvite: values.SendInvite,
      tenantID: tenantDomain,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/AddGuest', values: shippedValues })
  }

  return (
    <CippPage title="Add Guest">
      {postResults.isSuccess && (
        <CCallout color="success" dismissible>
          {postResults.data?.Results.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </CCallout>
      )}
      <CRow>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Guest Details</CCardTitle>
            </CCardHeader>
            <CCardBody>
              {adcError && <span>Unable to determine Azure AD Connect Settings</span>}
              {!adcIsFetching && adconnectsettings.dirSyncEnabled && (
                <CCallout color="warning">
                  Warning! {adconnectsettings.dirSyncEnabled} This tenant currently has Active
                  Directory Sync Enabled. This usually means users should be created in Active
                  Directory
                </CCallout>
              )}
              <Form
                onSubmit={onSubmit}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <CRow>
                        <CCol md={12}>
                          <RFFCFormInput
                            type="text"
                            name="displayName"
                            label="Display Name"
                            validate={required}
                          />
                        </CCol>
                      </CRow>
                      <CCol md={12}>
                        <RFFCFormInput type="text" name="mail" label="Email" validate={required} />
                      </CCol>
                      <CRow>
                        <CCol md={12}>
                          <RFFCFormInput
                            type="text"
                            name="RedirectURL"
                            label="Redirect URL (optional)"
                            placeholder={
                              'Optional Redirect URL defaults to https://myapps.microsoft.com if blank '
                            }
                            //validate={required}
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <RFFCFormCheck
                          label="Send an Email invite to this guest"
                          name="SendInvite"
                        />
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CButton type="submit" disabled={submitting}>
                            Invite Guest
                            {postResults.isFetching && (
                              <FontAwesomeIcon
                                icon={faCircleNotch}
                                spin
                                className="me-2"
                                size="1x"
                              />
                            )}
                          </CButton>
                        </CCol>
                      </CRow>
                      {postResults.isSuccess && (
                        <CCallout color="success">
                          {postResults.data.Results.map((message, idx) => {
                            return <li key={idx}>{message}</li>
                          })}
                        </CCallout>
                      )}
                    </CForm>
                  )
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CippPage>
  )
}

export default InviteGuest
