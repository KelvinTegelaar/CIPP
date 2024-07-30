import React, { useState } from 'react'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CRow,
  CSpinner,
} from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'react-final-form'
import { RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms'
import _nav from 'src/_nav'

import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

import 'react-datepicker/dist/react-datepicker.css'
import TenantListSelector from 'src/components/utilities/TenantListSelector'
import { PageSizeSwitcher, ThemeSwitcher, UsageLocation } from 'src/components/utilities'
import ReportImage from 'src/components/utilities/ReportImage'
import { useLoadClientPrincipalQuery } from 'src/store/api/auth'
import { setUserSettingsDefaults } from 'src/store/features/app'
import { CippCallout } from 'src/components/layout'

const UserSettings = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [addedAttributes, setAddedAttribute] = React.useState(0)
  const [random3, setRandom3] = useState('')
  const availableProperties = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      Endpoint: 'users',
      ListProperties: true,
      TenantFilter: tenant.defaultDomainName,
      IgnoreErrors: true,
    },
  })
  const exclusionList = [
    'id',
    'accountEnabled',
    'deletedDateTime',
    'ageGroup',
    'businessPhones',
    'city',
    'createdDateTime',
    'creationType',
    'companyName',
    'country',
    'department',
    'displayName',
    'givenName',
    'imAddresses',
    'infoCatalogs',
    'isLicenseReconciliationNeeded',
    'isManagementRestricted',
    'isResourceAccount',
    'jobTitle',
    'mail',
    'mailNickname',
    'mobilePhone',
    'onPremisesDistinguishedName',
    'onPremisesDomainName',
    'onPremisesImmutableId',
    'onPremisesLastSyncDateTime',
    'onPremisesObjectIdentifier',
    'onPremisesSecurityIdentifier',
    'onPremisesSamAccountName',
    'onPremisesSyncEnabled',
    'onPremisesUserPrincipalName',
    'passwordPolicies',
    'postalCode',
    'preferredDataLocation',
    'preferredLanguage',
    'proxyAddresses',
    'refreshTokensValidFromDateTime',
    'securityIdentifier',
    'signInSessionsValidFromDateTime',
    'streetAddress',
    'surname',
    'usageLocation',
    'userPrincipalName',
    'externalUserConvertedOn',
    'externalUserState',
    'externalUserStateChangeDateTime',
    'userType',
    'employeeOrgData',
    'assignedLicenses',
    'assignedPlans',
    'authorizationInfo',
    'cloudRealtimeCommunicationInfo',
    'deviceKeys',
    'identities',
    'onPremisesExtensionAttributes',
    'onPremisesProvisioningErrors',
    'onPremisesSipInfo',
    'passwordProfile',
    'provisionedPlans',
    'serviceProvisioningErrors',
  ]
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const { data: profile, isFetching, isLoading } = useLoadClientPrincipalQuery()
  const dispatch = useDispatch()
  const currentSettings = useSelector((state) => state.app)

  const onSubmit = (values) => {
    dispatch(setUserSettingsDefaults({ userSettingsDefaults: values }))
    const shippedvalues = {
      user: values.user,
      currentSettings: currentSettings,
    }

    genericPostRequest({ path: '/api/ExecUserSettings', values: shippedvalues }).then((res) => {})
  }

  return (
    <>
      <CRow className="mb-3">
        <CCol md={6}>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>
                User Settings - {profile.clientPrincipal.userDetails} -{' '}
                {profile.clientPrincipal.userRoles
                  .filter((role) => role !== 'anonymous' && role !== 'authenticated')
                  .join(', ')}
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <Form
                initialValues={{ ...currentSettings.userSettingsDefaults }}
                onSubmit={onSubmit}
                render={({ handleSubmit, form, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <h3 className="underline mb-5">General</h3>
                      <CRow className="mb-3">
                        <CCol className="mb-3" md={6}>
                          <TenantListSelector className="mb-3" />
                          <UsageLocation />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <h3 className="underline mb-5">Appearance</h3>
                        <CCol className="mb-3">
                          <ThemeSwitcher />
                          <PageSizeSwitcher />
                        </CCol>
                        <CCol className="mb-3">
                          <ReportImage />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <h3 className="underline mb-5">Offboarding Defaults</h3>
                        <CCol>
                          <RFFCFormSwitch
                            name="ConvertToShared"
                            label="Convert to Shared Mailbox"
                          />
                          <RFFCFormSwitch
                            name="HideFromGAL"
                            label="Hide from Global Address List"
                          />
                          <RFFCFormSwitch
                            name="removeCalendarInvites"
                            label="Cancel all calendar invites"
                          />
                          <RFFCFormSwitch
                            name="removePermissions"
                            label="Remove users mailbox permissions"
                          />
                          <RFFCFormSwitch name="RemoveRules" label="Remove all Rules" />
                          <RFFCFormSwitch
                            name="keepCopy"
                            label="Keep copy of forwarded mail in source mailbox"
                          />
                          <RFFCFormSwitch name="RemoveMobile" label="Remove all Mobile Devices" />
                        </CCol>
                        <CCol>
                          <RFFCFormSwitch name="RemoveGroups" label="Remove from all groups" />
                          <RFFCFormSwitch name="RemoveLicenses" label="Remove Licenses" />
                          <RFFCFormSwitch name="RevokeSessions" label="Revoke all sessions" />
                          <RFFCFormSwitch name="DisableSignIn" label="Disable Sign in" />
                          <RFFCFormSwitch name="ResetPass" label="Reset Password" />
                          <RFFCFormSwitch name="DeleteUser" label="Delete user" />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <h3 className="underline mb-5">New User Attribute Defaults</h3>
                        <div className="mb-3">
                          <RFFSelectSearch
                            name="defaultAttributes"
                            label="Select the attributes you want as defaults on the Add User or Edit User forms"
                            placeholder="Select Attributes"
                            retainInput={true}
                            multi={true}
                            values={
                              availableProperties?.data?.Results?.filter(
                                (prop) => !exclusionList.includes(prop),
                              )?.map((prop) => ({
                                name: prop,
                                value: prop,
                              })) ?? []
                            }
                            allowCreate={true}
                            refreshFunction={() =>
                              setRandom3((Math.random() + 1).toString(36).substring(7))
                            }
                            isLoading={availableProperties.isFetching}
                          />
                        </div>
                      </CRow>
                      <CRow className="mb-3">
                        <h3 className="underline mb-5">Favourite Menu Items</h3>
                        <div className="mb-3">
                          <RFFSelectSearch
                            name="favourites"
                            label="Select the menu items you'd like as favourites"
                            placeholder="Select items"
                            retainInput={true}
                            multi={true}
                            values={_nav
                              .reduce((acc, val) => acc.concat(val.items), [])
                              //only map if 'name' property is not null
                              .filter((item) => item?.name)
                              .map((item) => ({
                                name: item?.name,
                                value: { to: item?.to, name: item?.name },
                              }))}
                            allowCreate={false}
                            refreshFunction={() =>
                              setRandom3((Math.random() + 1).toString(36).substring(7))
                            }
                            isLoading={availableProperties.isFetching}
                          />
                        </div>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol className="mb-3" md={6}>
                          <CButton
                            onClick={() => {
                              form.change('user', profile.clientPrincipal.userDetails)
                            }}
                            className="me-3 mb-3"
                            name="singleuser"
                            type="submit"
                          >
                            Save Settings
                            {postResults.isFetching && <CSpinner size="sm" />}
                          </CButton>
                          {
                            //if the role contains admin, show the all user button. //
                            profile.clientPrincipal.userRoles.includes('admin') && (
                              <CButton
                                onClick={() => {
                                  form.change('user', 'allUsers')
                                }}
                                className="mb-3"
                                name="allUsers"
                                type="submit"
                              >
                                Save for all users
                                {postResults.isFetching && <CSpinner size="sm" />}
                              </CButton>
                            )
                          }
                        </CCol>
                      </CRow>
                      {postResults.isError && (
                        <CCallout color="danger">
                          <h4>Error</h4>
                          <p>{postResults.error.message}</p>
                        </CCallout>
                      )}
                      {postResults.isSuccess && (
                        <CippCallout color="success">{postResults.data[0]?.Results}</CippCallout>
                      )}
                    </CForm>
                  )
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default UserSettings
