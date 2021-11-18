import React from 'react'
import { CAlert, CCard } from '@coreui/react'
import { Form, Field } from 'react-final-form'
import CIcon from '@coreui/icons-react'
import { cilWarning } from '@coreui/icons'
import { useSelector } from 'react-redux'
import paginationFactory from 'react-bootstrap-table2-paginator'
import Wizard from '../../../components/Wizard'
import WizardTableField from '../../../components/WizardTableField'
import BootstrapTable from 'react-bootstrap-table-next'

const ApplyStandard = () => {
  const { tenants } = useSelector((state) => state.tenants)

  // @todo load tenants

  const handleSubmit = async (values) => {
    alert(JSON.stringify(values, null, 2))
  }

  let formValues = {
    tenants: [],
    standards: [],
  }

  return (
    <div className="bg-white rounded p-5">
      <h3>Apply Standard Wizard</h3>
      <CCard>
        <Wizard initialValues={{ ...formValues }} onSubmit={handleSubmit}>
          <Wizard.Page
            title="Tenant Choice"
            description="Choose the tenants to create the standard for."
            validate={(values) => {
              const errors = {}
              if (values.tenants.length === 0) {
                errors.tenants = 'Required'
              }
              return errors
            }}
          >
            <div className="justify-content-center">
              <CAlert color="danger" className="d-flex align-items-center">
                <CIcon color="danger" icon={cilWarning} size="xxl" />
                WARNING! Setting a standard will make changes to your tenants and set these
                standards on every 365 tenant you select. If you want to review only, please use the
                Best Practice Analyser.
              </CAlert>
              <h3 className="text-primary">Step 1</h3>
              <h5 className="card-title mb-4">Choose a tenant</h5>
              <Field name="tenants">
                {(props) => (
                  <WizardTableField
                    keyField="customerId"
                    data={tenants}
                    columns={[
                      {
                        dataField: 'displayName',
                        text: 'Tenant Name',
                      },
                      {
                        dataField: 'defaultDomainName',
                        text: 'Domain Name',
                      },
                    ]}
                    fieldProps={props}
                  />
                )}
              </Field>
            </div>
          </Wizard.Page>
          <Wizard.Page
            title="Select Standards"
            description="Select which standards you want to apply."
          >
            <div className="justify-content-center">asdfasdfasdf asdf as dfas dfafsd</div>
          </Wizard.Page>
          <Wizard.Page title="Review and Confirm" description="Confirm the settings to apply">
            Etsy mixtape wayfarers, eth lorem ipsum
          </Wizard.Page>
        </Wizard>
      </CCard>
    </div>
  )
}

export default ApplyStandard
