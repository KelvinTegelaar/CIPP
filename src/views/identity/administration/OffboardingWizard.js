import React from 'react'
import { CAlert, CCard, CCol, CRow } from '@coreui/react'
import { Field } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import Wizard from '../../../components/Wizard'
import WizardTableField from '../../../components/WizardTableField'
import PropTypes from 'prop-types'
import { RFFCFormSwitch } from '../../../components/RFFComponents'
import { useListTenantsQuery } from '../../../store/api/tenants'
import { TenantSelector } from 'src/components/cipp'

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

const OffboardingWizard = () => {
  const { data: tenants = [] } = useListTenantsQuery()
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
    <div className="bg-white rounded p-5">
      <CCard>
        <CRow className="row justify-content-center">
          <CCol xxl={12}>
            <Wizard initialValues={{ ...formValues }} onSubmit={handleSubmit}>
              <Wizard.Page
                title="Tenant Choice"
                description="Choose the tenants for offboarding the user"
              >
                <h3 className="text-primary">Step 1</h3>
                <h5 className="card-title mb-4">Choose a tenant</h5>
                <hr className="my-4" />
                <Field name="selectedTenants" validate={requiredArray}>
                  {(props) => <TenantSelector />}
                </Field>
                <Error name="selectedTenants" />
              </Wizard.Page>
              <Wizard.Page title="Select User" description="Select the user to offboard.">
                <h3>Step 2</h3>
                <h5>Select the standard you want to apply</h5>
                These standards will be applied every 3 hours on a repeated schedule.
                <hr className="my-4" />
                <div className="mb-2">USERSELECTOR</div>
              </Wizard.Page>
              <Wizard.Page
                title="Offboarding Settings"
                description="Select the offboarding options."
              >
                <h3>Step 2</h3>
                <h5>Select the standard you want to apply</h5>
                These standards will be applied every 3 hours on a repeated schedule.
                <hr className="my-4" />
                <div className="mb-2">USERSELECTOR</div>
              </Wizard.Page>
              <Wizard.Page title="Review and Confirm" description="Confirm the settings to apply">
                <h3>Step 3</h3>
                <h5 className="mb-4">Confirm and apply</h5>
                <hr className="my-4" />
              </Wizard.Page>
            </Wizard>
            {/* @todo remove this message */}
            Note: this does not submit at the moment
          </CCol>
        </CRow>
      </CCard>
    </div>
  )
}

export default OffboardingWizard
