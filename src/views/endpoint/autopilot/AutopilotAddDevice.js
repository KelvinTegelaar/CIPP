import React from 'react'
import { CAlert, CButton, CCol, CFormLabel, CRow } from '@coreui/react'
import { Field } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import Wizard from '../../../components/Wizard'
import PropTypes from 'prop-types'
import { RFFCFormInput } from '../../../components/RFFComponents'
import { CippTable, TenantSelector } from 'src/components/cipp'

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

const AddAPDevice = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const handleSubmit = async (values) => {
    alert(JSON.stringify(values, null, 2))
    // @todo hook this up
    // dispatch(applyStandards({ tenants: values.selectedTenants, standards: values.standards }))
  }

  return (
    <Wizard onSubmit={handleSubmit} wizardTitle="Add Autopilot Device Wizard">
      <Wizard.Page
        title="Tenant Choice"
        description="Choose the tenant to add an Autopilot device to"
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
        title="Enter Device Information"
        description="Enter the Autopilot device information"
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5>Enter autopilot information</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <p>
            As a partner, you can register devices to Windows Autopilot using any one of these
            methods: Hardware Hash (available from OEM or on-device script) Combination of
            Manufacturer, Device Model, Device Serial Number Windows Product Key ID.
          </p>
          <p>You can also upload a CSV file if your vendor has supplied you with one.</p>
        </div>
        <CCol md={6}>
          <CButton>Upload CSV</CButton>
        </CCol>
        <br></br>
        <CRow>
          <CCol md={1}>
            <RFFCFormInput name="serialNumber" label="Serial Number" type="text" />
          </CCol>
          <CCol md={1}>
            <RFFCFormInput name="deviceManufacturer" label="Device Manufacturer" type="text" />
          </CCol>
          <CCol md={1}>
            <RFFCFormInput name="device Model" label="Device Model" type="text" />
          </CCol>
          <CCol md={1}>
            <RFFCFormInput name="pkid" label="Windows Product ID" type="text" />
          </CCol>
          <CCol md={1}>
            <RFFCFormInput name="HardwareHash" label="Hardware Hash" type="text" />
          </CCol>
          <CCol md={1}>
            <CButton name="addButton">Add</CButton>
          </CCol>
        </CRow>
        <hr className="my-4" />
      </Wizard.Page>
      <Wizard.Page
        title="Offboarding Settings"
        description="Add a tag, group, or other info to this request"
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5>Choose options</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CCol md={6}>
            <RFFCFormInput
              name="GroupName"
              label="Group Name"
              type="text"
              placeholder="Leave blank"
            />
          </CCol>
        </div>
        <hr className="my-4" />
      </Wizard.Page>
      <Wizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 4</h3>
          <h5 className="mb-4">Confirm and apply</h5>
          <hr className="my-4" />
        </center>
        <hr className="my-4" />
      </Wizard.Page>
    </Wizard>
  )
}

export default AddAPDevice
