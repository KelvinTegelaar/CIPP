import React from 'react'
import {
  CAlert,
  CCard,
  CCol,
  CFormLabel,
  CRow,
  CCardHeader,
  CCardBody,
  CCardTitle,
} from '@coreui/react'
import { Field } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import Wizard from '../../../components/Wizard'
import WizardTableField from '../../../components/WizardTableField'
import PropTypes from 'prop-types'
import {
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormSwitch,
  RFFSelectSearch,
} from '../../../components/RFFComponents'
import { useListTenantsQuery } from '../../../store/api/tenants'
import { TenantSelector } from 'src/components/cipp'
import { useListUsersQuery } from 'src/store/api/users'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CAlert color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CAlert>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')
const AddChocoApp = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const dispatch = useDispatch()

  const handleSubmit = async (values) => {
    alert(JSON.stringify(values, null, 2))
    // @todo hook this up
    // dispatch(applyStandards({ tenants: values.selectedTenants, standards: values.standards }))
  }

  const formValues = {
    selectedTenants: [],
    standards: {},
  }

  return (
    <CCard>
      <CCardHeader>
        <CCardTitle className="text-primary">Mobile Devices</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CRow className="row justify-content-center">
          <CCol xxl={8}>
            <Wizard onSubmit={handleSubmit}>
              <Wizard.Page
                title="Tenant Choice"
                description="Choose the tenants for offboarding the user"
              >
                <center>
                  <h3 className="text-primary">Step 1</h3>
                  <h5 className="card-title mb-4">Choose a tenant</h5>
                </center>
                <hr className="my-4" />
                <Field name="selectedTenants">{(props) => <TenantSelector />}</Field>
                <Error name="selectedTenants" />
                <hr className="my-4" />
              </Wizard.Page>
              <Wizard.Page
                title="Select User"
                description="Select the user to offboard from the tenant."
              >
                <center>
                  <h3 className="text-primary">Step 2</h3>
                  <h5>Select the user that will be offboarded</h5>
                </center>
                <hr className="my-4" />
                <div className="mb-2">
                  <RFFSelectSearch
                    label={'Users in ' + tenantDomain}
                    values={users?.map((user) => ({
                      value: user.id,
                      name: user.displayName,
                    }))}
                    placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                    name="SelectedUser"
                  />
                  {usersError && <span>Failed to load list of users</span>}
                </div>
                <hr className="my-4" />
              </Wizard.Page>
              <Wizard.Page
                title="Offboarding Settings"
                description="Select the offboarding options."
              >
                <center>
                  <h3 className="text-primary">Step 3</h3>
                  <h5>Choose offboarding options</h5>
                </center>
                <hr className="my-4" />
                <div className="mb-2">
                  <RFFCFormSwitch name="RemoveLicenses" label="Remove Licenses" />
                  <RFFCFormSwitch name="ConvertoSharedMailbox" label="Convert to Shared Mailbox" />
                  <RFFCFormSwitch name="DisableUser" label="Disable Sign in" />
                  <RFFCFormSwitch name="ResetPassword" label="Reset Password" />
                  <RFFCFormSwitch name="RemoveGroups" label="Remove from all groups" />
                  <RFFCFormSwitch name="HideGAL" label="Hide from Global Address List" />
                  <CCol md={6}>
                    <RFFCFormInput
                      name="OOO"
                      label="Out of Office"
                      type="text"
                      placeholder="leave blank to not set"
                    />
                  </CCol>
                  <CCol md={6}>
                    <RFFSelectSearch
                      label="Give other user full access on mailbox without automapping"
                      values={users?.map((user) => ({
                        value: user.id,
                        name: user.displayName,
                      }))}
                      placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                      name="UserNoAutomap"
                    />
                  </CCol>
                  <CCol md={6}>
                    <RFFSelectSearch
                      label="Give other user full access on mailbox with automapping"
                      values={users?.map((user) => ({
                        value: user.id,
                        name: user.displayName,
                      }))}
                      placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                      name="UserAutomap"
                    />
                  </CCol>
                  <CCol md={6}>
                    <RFFSelectSearch
                      label="Give other user full access on Onedrive"
                      values={users?.map((user) => ({
                        value: user.id,
                        name: user.displayName,
                      }))}
                      placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                      name="UserAutomapOneDrive"
                    />
                  </CCol>
                  <RFFCFormSwitch name="Delete User" label="Delete user" />
                </div>
                <hr className="my-4" />
              </Wizard.Page>
              <Wizard.Page title="Review and Confirm" description="Confirm the settings to apply">
                <center>
                  <h3 className="text-primary">Step 4</h3>
                  <h5 className="mb-4">Confirm and apply</h5>
                  <hr className="my-4" />
                </center>
                <div className="mb-2">Show JSON here</div>
                <hr className="my-4" />
              </Wizard.Page>
            </Wizard>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default AddChocoApp
