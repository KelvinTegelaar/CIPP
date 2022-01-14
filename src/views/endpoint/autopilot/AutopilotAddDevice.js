import React, { useState } from 'react'
import { CAlert, CButton, CCol, CRow } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
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
  const [autopilotData, setAutopilotdata] = useState(false)

  const tableColumns = [
    {
      name: 'serialNumber',
      selector: (row) => row['serialNumber'],
      sortable: true,
    },
    {
      name: 'Device Manufacturer',
      selector: (row) => row['deviceManufacturer'],
      sortable: true,
    },
    {
      name: 'Device Model',
      selector: (row) => row['deviceModel'],
      sortable: true,
    },
    {
      name: 'Windows Product ID',
      selector: (row) => row['pkid'],
      sortable: true,
    },
    {
      name: 'Hardware Hash',
      selector: (row) => row['HardwareHash'],
      sortable: true,
    },
    {
      name: 'Remove',
      selector: (row) => row['index'],
      button: true,
      cell: (row, index) => {
        return (
          <CButton onClick={() => handleRemove(index)} size="sm" variant="ghost" color="danger">
            <FontAwesomeIcon icon={faTrash} />
          </CButton>
        )
      },
    },
  ]

  const handleSubmit = async (values) => {
    alert(JSON.stringify(values, null, 2))
    // @todo hook this up
    // dispatch(applyStandards({ tenants: values.selectedTenants, standards: values.standards }))
  }
  const addRowtoData = (values) => {
    setAutopilotdata((prevState) => {
      if (prevState) {
        return [values, ...prevState]
      } else {
        return [values]
      }
    })
  }
  const handleRemove = async (itemindex) => {
    //alert(JSON.stringify(values, null, 2))
    //find arr index, delete from state.
    console.log(itemindex)
    var RemovedItems = autopilotData // make a separate copy of the array
    RemovedItems.splice(itemindex, 1)
    setAutopilotdata((prevState) => {
      return RemovedItems
    })
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
          <CCol xs={'auto'}>
            <RFFCFormInput name="serialNumber" label="Serial Number" type="text" />
          </CCol>
          <CCol xs={'auto'}>
            <RFFCFormInput name="deviceManufacturer" label="Device Manufacturer" type="text" />
          </CCol>
          <CCol xs={'auto'}>
            <RFFCFormInput name="deviceModel" label="Device Model" type="text" />
          </CCol>
          <CCol xs={'auto'}>
            <RFFCFormInput name="pkid" label="Windows Product ID" type="text" />
          </CCol>
          <CCol xs={'auto'}>
            <RFFCFormInput name="HardwareHash" label="Hardware Hash" type="text" />
          </CCol>
          <CCol xs={'auto'} className="align-self-end">
            <FormSpy>
              {(props) => {
                /* eslint-disable react/prop-types */
                return (
                  <>
                    <CButton
                      onClick={() => addRowtoData(props.values)}
                      name="addButton"
                      className="mb-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Add
                    </CButton>
                  </>
                )
              }}
            </FormSpy>
            <CRow>
              <CCol md={{ span: 12, offset: 3 }}>
                {autopilotData && (
                  <CippTable
                    reportName="none"
                    tableProps={{ subheader: false }}
                    data={autopilotData}
                    columns={tableColumns}
                  />
                )}
              </CCol>
            </CRow>
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
