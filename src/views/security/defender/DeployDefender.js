import React from 'react'
import { CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import { RFFCFormRadio, RFFCFormSwitch } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CCallout color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CCallout>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const DeployDefender = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    genericPostRequest({ path: '/api/AddDefenderDeployment', values: values })
  }

  const formValues = {
    selectedTenants: [],
    Compliance: {
      AllowMEMEnforceCompliance: true,
      AppSync: true,
      BlockunsupportedOS: false,
      ConnectAndroid: true,
      ConnectIos: true,
      ConnectIosCompliance: true,
      ConnectWindows: true,
    },
    ASR: {
      AssignTo: 'none',
      BlockAdobeChild: true,
      BlockCredentialStealing: true,
      BlockExesMail: true,
      BlockOfficeApps: true,
      BlockOfficeExes: true,
      BlockPSExec: true,
      BlockUnsignedDrivers: true,
      BlockUntrustedUSB: true,
      BlockWin32Macro: true,
      BlockYoungExe: true,
      EnableRansomwareVac: true,
      WMIPersistence: true,
      blockJSVB: true,
      blockOfficeChild: true,
      blockOfficeComChild: true,
    },
    Policy: {
      AssignTo: 'none',
      AllowBehavior: true,
      AllowCloudProtection: true,
      AllowDownloadable: true,
      AllowEmailScanning: true,
      AllowFullScanNetwork: false,
      AllowFullScanRemovable: true,
      AllowIPS: true,
      AllowNetwork: false,
      AllowRealTime: true,
      AllowUI: true,
      CPULoad50: true,
      CheckSigs: true,
      DisableCatchupFullScan: false,
      DisableCatchupQuickScan: false,
      LowCPU: true,
      NetworkProtectionAudit: false,
      NetworkProtectionBlock: true,
      ScanArchives: true,
    },
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Defender Setup Wizard"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the deployment for."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants">
          {(props) => (
            <WizardTableField
              reportName="Apply-Standard-Tenant-Selector"
              keyField="defaultDomainName"
              path="/api/ListTenants?AllTenantSelector=true"
              columns={[
                {
                  name: 'Display Name',
                  selector: (row) => row['displayName'],
                  sortable: true,
                  exportselector: 'displayName',
                },
                {
                  name: 'Default Domain Name',
                  selector: (row) => row['defaultDomainName'],
                  sortable: true,
                  exportselector: 'mail',
                },
              ]}
              fieldProps={props}
            />
          )}
        </Field>
        <Error name="selectedTenants" />
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Defender Setup" description="Defender Compliance and MEM Reporting">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Defender Setup</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow className="mb-3">
            <CCol md={6}>
              <RFFCFormSwitch
                name="Compliance.AllowMEMEnforceCompliance"
                label="Allow Microsoft Defender for Endpoint to enforce Endpoint Security Configurations (Compliance)"
              />
              <RFFCFormSwitch
                name="Compliance.ConnectIosCompliance"
                label="Connect iOS/iPadOS devices version 13.0 and above to Microsoft Defender for Endpoint (Compliance)"
              />
              <RFFCFormSwitch
                name="Compliance.ConnectAndroidCompliance"
                label="Connect Android devices version 6.0.0 and above to Microsoft Defender for Endpoint (Compliance)"
              />
              <RFFCFormSwitch
                name="Compliance.ConnectWindows"
                label="Connect Windows devices version 10.0.15063 and above to Microsoft Defender for Endpoint (Compliance)"
              />
            </CCol>
            <CCol md={6}>
              <RFFCFormSwitch
                name="Compliance.AppSync"
                label="Enable App Sync (sending application inventory) for iOS/iPadOS devices"
              />
              <RFFCFormSwitch
                name="Compliance.BlockunsupportedOS"
                label="Block unsupported OS versions"
              />

              <RFFCFormSwitch
                name="Compliance.ConnectAndroid"
                label="Connect Android devices to Microsoft Defender for Endpoint"
              />
              <RFFCFormSwitch
                name="Compliance.ConnectIos"
                label="Connect iOS/iPadOS devices to Microsoft Defender for Endpoint"
              />
            </CCol>
          </CRow>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Defender Defaults Policy"
        description="Select Defender policies to deploy"
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">AV policy</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow className="mb-3">
            <CCol md={6}>
              <RFFCFormSwitch name="Policy.ScanArchives" label="Allow Archive Scanning" />
              <RFFCFormSwitch name="Policy.AllowBehavior" label="Allow behavior monitoring" />
              <RFFCFormSwitch name="Policy.AllowCloudProtection" label="Allow Cloud Protection" />
              <RFFCFormSwitch name="Policy.AllowEmailScanning" label="Allow e-mail scanning" />
              <RFFCFormSwitch
                name="Policy.AllowFullScanNetwork"
                label="Allow Full Scan on Network Drives"
              />
              <RFFCFormSwitch
                name="Policy.AllowFullScanRemovable"
                label="Allow Full Scan on Removable Drives"
              />
              <RFFCFormSwitch name="Policy.AllowScriptScan" label="Allow Script Scanning" />
              <RFFCFormSwitch name="Policy.AllowIPS" label="Allow Intrusion Prevention System" />
              <RFFCFormSwitch name="Policy.LowCPU" label="Enable Low CPU priority" />
            </CCol>
            <CCol md={6}>
              <RFFCFormSwitch
                name="Policy.AllowDownloadable"
                label="Allow scanning of downloaded files"
              />
              <RFFCFormSwitch name="Policy.AllowRealTime" label="Allow Realtime monitoring" />
              <RFFCFormSwitch name="Policy.AllowNetwork" label="Allow scanning of mapped drives" />
              <RFFCFormSwitch name="Policy.AllowUI" label="Allow users to access UI" />
              <RFFCFormSwitch
                name="Policy.NetworkProtectionBlock"
                label="Enable Network Protection in Block Mode"
              />
              <RFFCFormSwitch
                name="Policy.NetworkProtectionAudit"
                label="Enable Network Protection in Audit Mode"
              />

              <RFFCFormSwitch name="Policy.CheckSigs" label="Check Signatures before scan" />
              <RFFCFormSwitch
                name="Policy.DisableCatchupFullScan"
                label="Disable Catchup Full Scan"
              />
              <RFFCFormSwitch
                name="Policy.DisableCatchupQuickScan"
                label="Disable Catchup Quick Scan"
              />
            </CCol>
            <center>
              <h5 className="card-title mb-4">Assign to group</h5>
            </center>
            <RFFCFormRadio
              value="none"
              name="Policy.AssignTo"
              label="Do not assign"
              validate={false}
            ></RFFCFormRadio>
            <RFFCFormRadio
              value="allLicensedUsers"
              name="Policy.AssignTo"
              label="Assign to all users"
              validate={false}
            ></RFFCFormRadio>
            <RFFCFormRadio
              value="AllDevices"
              name="Policy.AssignTo"
              label="Assign to all devices"
              validate={false}
            ></RFFCFormRadio>
            <RFFCFormRadio
              value="AllDevicesAndUsers"
              name="Policy.AssignTo"
              label="Assign to all users and devices"
            ></RFFCFormRadio>
          </CRow>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="ASR" description="Set Attack Surface Reduction Rules.">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">ASR Rules</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow className="mb-3">
            <CCol md={6}>
              <RFFCFormSwitch
                name="ASR.BlockAdobeChild"
                label="Block Adobe Reader from creating child processes"
              />
              <RFFCFormSwitch
                name="ASR.BlockWin32Macro"
                label="Block Win32 API calls from Office macros"
              />
              <RFFCFormSwitch
                name="ASR.BlockCredentialStealing"
                label="Block credential stealing from the Windows local security authority subsystem"
              />
              <RFFCFormSwitch
                name="ASR.BlockPSExec"
                label="Block process creations originating from PSExec and WMI commands"
              />
              <RFFCFormSwitch
                name="ASR.WMIPersistence"
                label="Block persistence through WMI event subscription"
              />
              <RFFCFormSwitch
                name="ASR.BlockOfficeExes"
                label="Block Office applications from creating executable content"
              />
              <RFFCFormSwitch
                name="ASR.BlockOfficeApps"
                label="Block Office applications from injecting code into other processes"
              />
            </CCol>
            <CCol md={6}>
              <RFFCFormSwitch
                name="ASR.BlockYoungExe"
                label="Block executable files from running unless they meet a prevalence, age, or trusted list criterion"
              />
              <RFFCFormSwitch
                name="ASR.blockJSVB"
                label="Block JavaScript or VBScript from launching downloaded executable content"
              />

              <RFFCFormSwitch
                name="ASR.blockOfficeComChild"
                label="Block Office communication application from creating child processes"
              />
              <RFFCFormSwitch
                name="ASR.blockOfficeChild"
                label="Block all Office applications from creating child processes"
              />
              <RFFCFormSwitch
                name="ASR.BlockUntrustedUSB"
                label="Block untrusted and unsigned processes that run from USB"
              />
              <RFFCFormSwitch
                name="ASR.EnableRansomwareVac"
                label="Use advanced protection against ransomware"
              />
              <RFFCFormSwitch
                name="ASR.BlockExesMail"
                label="Block executable content from email client and webmail"
              />
              <RFFCFormSwitch
                name="ASR.BlockUnsignedDrivers"
                label="Block abuse of exploited vulnerable signed drivers (Device)"
              />
            </CCol>
            <center>
              <h5 className="card-title mb-4">Assign to group</h5>
            </center>
            <RFFCFormRadio
              value="none"
              name="ASR.AssignTo"
              label="Do not assign"
              validate={false}
            ></RFFCFormRadio>
            <RFFCFormRadio
              value="allLicensedUsers"
              name="ASR.AssignTo"
              label="Assign to all users"
              validate={false}
            ></RFFCFormRadio>
            <RFFCFormRadio
              value="AllDevices"
              name="ASR.AssignTo"
              label="Assign to all devices"
              validate={false}
            ></RFFCFormRadio>
            <RFFCFormRadio
              value="AllDevicesAndUsers"
              name="ASR.AssignTo"
              label="Assign to all users and devices"
            ></RFFCFormRadio>
          </CRow>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>

      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 4</h3>
          <h5 className="card-title mb-4">Confirm and apply</h5>
        </center>
        <hr className="my-4" />
        {postResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        )}
        {!postResults.isSuccess && (
          <FormSpy>
            {(props) => (
              /* eslint-disable react/prop-types */ <>
                <CRow>
                  <CCol md={{ span: 6, offset: 3 }}>
                    <h5 className="mb-0">Selected Tenants</h5>
                    <CCallout color="info">
                      {props.values.selectedTenants.map((tenant, idx) => (
                        <li key={idx}>
                          {tenant.displayName}- {tenant.defaultDomainName}
                        </li>
                      ))}
                    </CCallout>
                    <h5 className="mb-0">Selected MEM Compliance settings</h5>
                    <CCallout color="info">
                      {Object.entries(props.values.Compliance).map(([key, value], idx) => (
                        <li key={idx}>
                          {key}: {value ? 'Enabled' : 'Disabled'}
                        </li>
                      ))}
                    </CCallout>
                    <h5 className="mb-0">Selected AV settings</h5>
                    <CCallout color="info">
                      {Object.entries(props.values.Policy).map(([key, value], idx) => (
                        <li key={idx}>
                          {key}: {value ? 'Enabled' : 'Disabled'}
                        </li>
                      ))}
                    </CCallout>
                    <h5 className="mb-0">Selected ASR Settings</h5>
                    <CCallout color="info">
                      {Object.entries(props.values.ASR).map(([key, value], idx) => (
                        <li key={idx}>
                          {key}: {value ? 'Enabled' : 'Disabled'}
                        </li>
                      ))}
                    </CCallout>
                    <hr />
                  </CCol>
                </CRow>
              </>
            )}
          </FormSpy>
        )}
        {postResults.isSuccess && (
          <CCallout color="success">
            {postResults.data.Results.map((result, idx) => {
              return <li key={idx}>{result}</li>
            })}
          </CCallout>
        )}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default DeployDefender
