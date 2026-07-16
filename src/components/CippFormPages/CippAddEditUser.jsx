import { Alert, Divider, InputAdornment, Typography, Card, CardContent } from '@mui/material'
import { Stack, Box } from '@mui/system'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import { CippFormDomainSelector } from '../CippComponents/CippFormDomainSelector'
import { CippFormUserSelector } from '../CippComponents/CippFormUserSelector'
import { getCippValidator } from '../../utils/get-cipp-validator'
import countryList from '../../data/countryList.json'
import { CippFormLicenseSelector } from '../CippComponents/CippFormLicenseSelector'
import { Grid } from '@mui/system'
import { ApiGetCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'
import { useWatch } from 'react-hook-form'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Person,
  Key,
  Badge,
  Business,
  ContactPhone,
  Group,
  Schedule,
  Extension,
  FileCopy,
} from '@mui/icons-material'

// Section Header Component for consistent styling
const SectionHeader = ({ icon: Icon, title }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
    <Icon color="primary" fontSize="small" />
    <Typography variant="subtitle1" fontWeight={600}>
      {title}
    </Typography>
  </Stack>
)

// Section Card Component for visual grouping
const FormSection = ({ icon, title, children, noPadding = false }) => (
  <Card variant="outlined" sx={{ mb: 3 }}>
    <CardContent sx={{ p: noPadding ? 0 : 2.5, '&:last-child': { pb: noPadding ? 0 : 2.5 } }}>
      {title && <SectionHeader icon={icon} title={title} />}
      {children}
    </CardContent>
  </Card>
)

const CippAddEditUser = (props) => {
  const { formControl, userSettingsDefaults, formType = 'add' } = props
  const tenantDomain = useSettings().currentTenant
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [displayNameManuallySet, setDisplayNameManuallySet] = useState(false)
  const [usernameManuallySet, setUsernameManuallySet] = useState(false)
  // Tracks the template already applied to the form so we can tell a first
  // apply (fill empty fields) apart from a switch (replace/clear stale values)
  const appliedTemplateKeyRef = useRef(null)
  const router = useRouter()
  const { userId } = router.query

  // Get user default templates (only in add mode)
  const userTemplates = ApiGetCall({
    url: `/api/ListNewUserDefaults?TenantFilter=${tenantDomain}`,
    queryKey: `UserDefaults-${tenantDomain}`,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: formType === 'add',
  })
  const integrationSettings = ApiGetCall({
    url: '/api/ListExtensionsConfig',
    queryKey: 'ListExtensionsConfig',
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  // Get all groups the is the user is a member of
  const userGroups = ApiGetCall({
    url: `/api/ListUserGroups?userId=${userId}&tenantFilter=${tenantDomain}`,
    queryKey: `User-${userId}-Groups-${tenantDomain}`,
    refetchOnMount: false,
    refetchOnReconnect: false,
    waiting: !!userId,
  })

  // Get all groups for the tenant
  const tenantGroups = ApiGetCall({
    url: `/api/ListGroups?tenantFilter=${tenantDomain}`,
    queryKey: `TenantGroupsList-${tenantDomain}`,
    refetchOnMount: false,
    refetchOnReconnect: false,
    waiting: !!userId,
  })

  // Get manual entry custom data mappings for current tenant
  const manualEntryMappings = ApiGetCall({
    url: `/api/ListCustomDataMappings?sourceType=Manual Entry&directoryObject=User&tenantFilter=${tenantDomain}`,
    queryKey: `ManualEntryMappings-${tenantDomain}`,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  // Use mappings directly since they're already filtered by the API
  const currentTenantManualMappings = useMemo(() => {
    if (manualEntryMappings.isSuccess) {
      return manualEntryMappings.data?.Results || []
    }
    return []
  }, [manualEntryMappings.isSuccess, manualEntryMappings.data])

  // Prefill manual entry custom data fields in edit mode. The fetched user's extension values sit
  // at the top level of the form (edit.jsx resets with the spread user object), while these fields
  // live under customData.*
  const currentUserObjectId = useWatch({ control: formControl.control, name: 'id' })
  useEffect(() => {
    if (formType === 'add' || !currentUserObjectId || currentTenantManualMappings.length === 0)
      return
    currentTenantManualMappings.forEach((mapping) => {
      const attribute = mapping.customDataAttribute?.value
      if (!attribute) return
      const existing = formControl.getValues(`customData.${attribute}`)
      if (existing !== undefined && existing !== null && existing !== '') return
      const value = formControl.getValues(attribute)
      if (value !== undefined && value !== null) {
        formControl.setValue(`customData.${attribute}`, value)
      }
    })
  }, [formType, currentUserObjectId, currentTenantManualMappings])

  // Make new list of groups by removing userGroups from tenantGroups
  const filteredTenantGroups = useMemo(() => {
    if (tenantGroups.isSuccess && userGroups.isSuccess) {
      const tenantGroupsList = tenantGroups?.data || []

      return tenantGroupsList.filter(
        (tenantGroup) => !userGroups?.data?.some((userGroup) => userGroup.id === tenantGroup.id)
      )
    }
    return []
  }, [tenantGroups.isSuccess, userGroups.isSuccess, tenantGroups.data, userGroups.data])

  const watcher = useWatch({ control: formControl.control })

  // Helper function to generate username from template format
  const generateUsername = (format, firstName, lastName) => {
    if (!format || !firstName || !lastName) return ''

    // Ensure format is a string
    const formatString = typeof format === 'string' ? format : String(format)

    let username = formatString

    // Replace %FirstName[n]% patterns (extract first n characters)
    username = username.replace(/%FirstName\[(\d+)\]%/gi, (match, num) => {
      return firstName.substring(0, parseInt(num))
    })

    // Replace %LastName[n]% patterns (extract first n characters)
    username = username.replace(/%LastName\[(\d+)\]%/gi, (match, num) => {
      return lastName.substring(0, parseInt(num))
    })

    // Replace %FirstName% and %LastName%
    username = username.replace(/%FirstName%/gi, firstName)
    username = username.replace(/%LastName%/gi, lastName)

    // Convert to lowercase
    return username.toLowerCase()
  }

  useEffect(() => {
    //if watch.firstname changes, and watch.lastname changes, set displayname to firstname + lastname
    if (watcher.givenName && watcher.surname && formType === 'add') {
      // Only auto-set display name if user hasn't manually changed it
      if (!displayNameManuallySet) {
        // Build base display name from first and last name
        let displayName = `${watcher.givenName} ${watcher.surname}`

        // Add template displayName as suffix if it exists
        if (selectedTemplate?.displayName) {
          displayName += selectedTemplate.displayName
        }

        formControl.setValue('displayName', displayName, { shouldDirty: true })
      }

      // Auto-generate username if template has usernameFormat
      if (selectedTemplate?.usernameFormat && !usernameManuallySet) {
        // Extract the actual format string - it might be an object {label, value} or a string
        const formatString =
          typeof selectedTemplate.usernameFormat === 'string'
            ? selectedTemplate.usernameFormat
            : selectedTemplate.usernameFormat?.value || selectedTemplate.usernameFormat?.label

        if (formatString) {
          const generatedUsername = generateUsername(
            formatString,
            watcher.givenName,
            watcher.surname
          )
          if (generatedUsername) {
            formControl.setValue('username', generatedUsername, { shouldDirty: true })
          }
        }
      }
    }
  }, [watcher.givenName, watcher.surname, selectedTemplate])

  // Reset manual flags and selected template when form is reset (fields become empty)
  useEffect(() => {
    if (formType === 'add' && !watcher.givenName && !watcher.surname && !watcher.userTemplate) {
      setDisplayNameManuallySet(false)
      setUsernameManuallySet(false)
      // Only clear selected template if it's not the default template
      if (selectedTemplate && !selectedTemplate.defaultForTenant) {
        setSelectedTemplate(null)
        appliedTemplateKeyRef.current = null
      }
    }
  }, [watcher.givenName, watcher.surname, watcher.userTemplate, formType, selectedTemplate])

  // Auto-select default template for tenant
  useEffect(() => {
    if (formType === 'add' && userTemplates.isSuccess && !watcher.userTemplate) {
      const defaultTemplate = userTemplates.data?.find(
        (template) => template.defaultForTenant === true
      )
      if (defaultTemplate) {
        formControl.setValue('userTemplate', {
          label: defaultTemplate.templateName,
          value: defaultTemplate.GUID,
          addedFields: defaultTemplate,
        })
        setSelectedTemplate(defaultTemplate)
      }
    }
  }, [userTemplates.isSuccess, formType])

  // Auto-populate fields when template selected
  useEffect(() => {
    if (formType !== 'add' || !watcher.userTemplate?.addedFields) return
    const template = watcher.userTemplate.addedFields
    const templateKey = watcher.userTemplate.value ?? template.GUID ?? template.templateName

    // Distinguish the first apply from a switch. On a switch we replace
    // template-driven fields (and clear ones the new template doesn't define)
    // so stale values from the previous template don't linger. On the first
    // apply we only fill fields that have a template value, so we don't clobber
    // input the user already entered or copied from another user.
    const isSwitch =
      appliedTemplateKeyRef.current !== null && appliedTemplateKeyRef.current !== templateKey
    appliedTemplateKeyRef.current = templateKey
    setSelectedTemplate(template)

    // Reset manual edit flags when template changes
    setDisplayNameManuallySet(false)
    setUsernameManuallySet(false)

    // Apply a template value to a field. When the template has a value we set
    // it; when it doesn't and this is a switch we clear the field (emptyValue)
    // so the previous template's value doesn't linger.
    const applyField = (fieldName, value, emptyValue = '') => {
      const hasValue = Array.isArray(value)
        ? value.length > 0
        : value !== undefined && value !== null && value !== ''
      if (hasValue) {
        formControl.setValue(fieldName, value, { shouldDirty: true })
      } else if (isSwitch) {
        formControl.setValue(fieldName, emptyValue, { shouldDirty: true })
      }
    }

    // Primary domain - accept both object and string formats
    const primDomainValue = template.primDomain
      ? typeof template.primDomain === 'string'
        ? { label: template.primDomain, value: template.primDomain }
        : template.primDomain
      : null
    applyField('primDomain', primDomainValue, null)

    // Usage location - accept both object and string formats
    const usageLocationCode =
      typeof template.usageLocation === 'string'
        ? template.usageLocation
        : template.usageLocation?.value
    const country = usageLocationCode ? countryList.find((c) => c.Code === usageLocationCode) : null
    applyField('usageLocation', country ? { label: country.Name, value: country.Code } : null, null)

    applyField('jobTitle', template.jobTitle)
    applyField('streetAddress', template.streetAddress)
    applyField('city', template.city)
    applyField('state', template.state)
    applyField('postalCode', template.postalCode)
    applyField('country', template.country)
    applyField('companyName', template.companyName)
    applyField('department', template.department)
    applyField('mobilePhone', template.mobilePhone)
    const templateBusinessPhone = Array.isArray(template.businessPhones)
      ? template.businessPhones[0]
      : template.businessPhones
    applyField('businessPhones', templateBusinessPhone ? [templateBusinessPhone] : [], [])

    // Licenses - match the format expected by CippFormLicenseSelector
    applyField('licenses', Array.isArray(template.licenses) ? template.licenses : [], [])

    // Groups from template
    const templateGroups = template.addToGroups || template.groupMemberships
    const rawGroups = templateGroups
      ? Array.isArray(templateGroups)
        ? templateGroups
        : [templateGroups]
      : []
    const groups = rawGroups.map((g) => {
      if (g.label && g.value) return g
      const groupType = g.groupTypes?.includes('Unified')
        ? 'Microsoft 365'
        : g.mailEnabled && !g.groupTypes?.includes('Unified')
          ? g.securityEnabled
            ? 'Mail-Enabled Security'
            : 'Distribution list'
          : 'Security'
      return {
        label: g.displayName,
        value: g.id,
        addedFields: { groupType },
      }
    })
    applyField('AddToGroups', groups, [])

    // Custom user attributes. On a switch, clear every known attribute field
    // first so attributes the new template doesn't define don't linger, then
    // apply the template's values.
    if (isSwitch) {
      userSettingsDefaults?.userAttributes
        ?.filter((attribute) => attribute.value !== 'sponsor')
        .forEach((attribute) => {
          formControl.setValue(`defaultAttributes.${attribute.label}.Value`, '', {
            shouldDirty: true,
          })
        })
    }
    if (template.defaultAttributes) {
      Object.entries(template.defaultAttributes).forEach(([key, attr]) => {
        applyField(`defaultAttributes.${key}.Value`, attr?.Value)
      })
    }
  }, [watcher.userTemplate, formType])

  return (
    <Box>
      {/* Template/Copy Section - Only for Add mode */}
      {formType === 'add' && (
        <FormSection icon={FileCopy} title="Quick Setup">
          <Grid container spacing={2}>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormUserSelector
                formControl={formControl}
                name="userProperties"
                label="Copy properties from another user"
                multiple={false}
                select={
                  'id,userPrincipalName,displayName,givenName,surname,mailNickname,jobTitle,department,streetAddress,city,state,postalCode,companyName,mobilePhone,businessPhones,usageLocation,office'
                }
                addedField={{
                  groupType: 'calculatedGroupType',
                  displayName: 'displayName',
                  userPrincipalName: 'userPrincipalName',
                  id: 'id',
                  givenName: 'givenName',
                  surname: 'surname',
                  mailNickname: 'mailNickname',
                  jobTitle: 'jobTitle',
                  department: 'department',
                  streetAddress: 'streetAddress',
                  city: 'city',
                  state: 'state',
                  postalCode: 'postalCode',
                  companyName: 'companyName',
                  mobilePhone: 'mobilePhone',
                  businessPhones: 'businessPhones',
                  usageLocation: 'usageLocation',
                  office: 'office',
                }}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="User Template"
                name="userTemplate"
                multiple={false}
                options={
                  userTemplates.isSuccess
                    ? userTemplates.data?.map((template) => ({
                        label: template.templateName,
                        value: template.GUID,
                        addedFields: template,
                      }))
                    : []
                }
                formControl={formControl}
              />
            </Grid>
          </Grid>
        </FormSection>
      )}

      {/* Account Information Section */}
      <FormSection icon={Person} title="Account Information">
        <Grid container spacing={2}>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="First Name"
              name="givenName"
              formControl={formControl}
              validators={{
                maxLength: { value: 64, message: 'First Name must be 64 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Last Name"
              name="surname"
              formControl={formControl}
              validators={{
                maxLength: { value: 64, message: 'Last Name must be 64 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Display Name"
              name="displayName"
              formControl={formControl}
              onChange={(e) => {
                setDisplayNameManuallySet(true)
              }}
              required={true}
              validators={{
                required: 'Display Name is required',
                maxLength: { value: 256, message: 'Display Name must be 256 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Username"
              InputProps={{
                endAdornment: <InputAdornment position="end">@</InputAdornment>,
              }}
              name="username"
              formControl={formControl}
              onChange={(e) => {
                setUsernameManuallySet(true)
              }}
              required={true}
              validators={{
                required: 'Username is required',
                maxLength: { value: 64, message: 'Username must be 64 characters or less' },
                pattern: {
                  value: /^[a-zA-Z0-9._-]+$/,
                  message:
                    'Username can only contain letters, numbers, dots, hyphens, and underscores',
                },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormDomainSelector
              formControl={formControl}
              name="primDomain"
              label="Primary Domain"
              required={true}
              validators={{ required: 'Primary Domain is required' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Email Aliases"
              placeholder="One alias per line"
              name="addedAliases"
              formControl={formControl}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Password & Security Section */}
      <FormSection icon={Key} title="Password & Security">
        <Grid container spacing={2}>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Set password manually"
              name="Autopassword"
              formControl={formControl}
            />
            <CippFormCondition
              formControl={formControl}
              field="Autopassword"
              compareType="is"
              compareValue={true}
            >
              <Box sx={{ mt: 2 }}>
                <CippFormComponent
                  type="password"
                  fullWidth
                  label="Password"
                  name="password"
                  formControl={formControl}
                />
              </Box>
            </CippFormCondition>
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Require password change at next logon"
              name="MustChangePass"
              formControl={formControl}
            />
          </Grid>
          {formType === 'add' && (
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Disable legacy protocols (IMAP & POP)"
                name="disableLegacyProtocols"
                formControl={formControl}
                defaultValue={true}
              />
            </Grid>
          )}
        </Grid>
      </FormSection>

      {/* Licensing Section */}
      <FormSection icon={Badge} title="Licensing">
        <Grid container spacing={2}>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Usage Location"
              name="usageLocation"
              multiple={false}
              defaultValue={userSettingsDefaults?.usageLocation || 'US'}
              options={countryList.map(({ Code, Name }) => ({
                label: Name,
                value: Code,
              }))}
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Remove all licenses"
              name="removeLicenses"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormLicenseSelector label="Licenses" name="licenses" formControl={formControl} />
          </Grid>
        </Grid>
      </FormSection>

      {/* Organization Section */}
      <FormSection icon={Business} title="Organization">
        <Grid container spacing={2}>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Job Title"
              name="jobTitle"
              formControl={formControl}
              validators={{
                maxLength: { value: 128, message: 'Job Title must be 128 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Department"
              name="department"
              formControl={formControl}
              validators={{
                maxLength: { value: 64, message: 'Department must be 64 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Company Name"
              name="companyName"
              formControl={formControl}
              validators={{
                maxLength: { value: 64, message: 'Company Name must be 64 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormUserSelector
              formControl={formControl}
              name="setManager"
              label="Manager"
              valueField="userPrincipalName"
              multiple={false}
            />
          </Grid>
          {userSettingsDefaults?.userAttributes?.some(
            (attribute) => attribute.value === 'sponsor'
          ) && (
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormUserSelector
                formControl={formControl}
                name="setSponsor"
                label="Sponsor"
                valueField="userPrincipalName"
                multiple={false}
              />
            </Grid>
          )}
        </Grid>
      </FormSection>

      {/* Contact Information Section */}
      <FormSection icon={ContactPhone} title="Contact Information">
        <Grid container spacing={2}>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="phone"
              fullWidth
              label="Mobile Phone"
              name="mobilePhone"
              formControl={formControl}
              defaultCountry="US"
              validators={{
                maxLength: { value: 64, message: 'Mobile Phone must be 64 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="phone"
              fullWidth
              label="Business Phone"
              name="businessPhones[0]"
              formControl={formControl}
              defaultCountry="US"
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Alternate Email"
              name="otherMails"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Street Address"
              name="streetAddress"
              formControl={formControl}
              validators={{
                maxLength: {
                  value: 1024,
                  message: 'Street Address must be 1024 characters or less',
                },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="City"
              name="city"
              formControl={formControl}
              validators={{
                maxLength: { value: 128, message: 'City must be 128 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="State/Province"
              name="state"
              formControl={formControl}
              validators={{
                maxLength: { value: 128, message: 'State/Province must be 128 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Postal Code"
              name="postalCode"
              formControl={formControl}
              validators={{
                maxLength: { value: 40, message: 'Postal Code must be 40 characters or less' },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Country"
              name="country"
              formControl={formControl}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Custom Attributes Section */}
      {userSettingsDefaults?.userAttributes?.filter((attribute) => attribute.value !== 'sponsor')
        .length > 0 && (
        <FormSection icon={Extension} title="Custom Attributes">
          <Grid container spacing={2}>
            {userSettingsDefaults?.userAttributes
              ?.filter((attribute) => attribute.value !== 'sponsor')
              .map((attribute, idx) => (
                <Grid size={{ md: 6, xs: 12 }} key={idx}>
                  <CippFormComponent
                    type="textField"
                    fullWidth
                    label={attribute.label}
                    name={`defaultAttributes.${attribute.label}.Value`}
                    formControl={formControl}
                  />
                </Grid>
              ))}
          </Grid>
        </FormSection>
      )}

      {/* Group Membership Section */}
      {(formType === 'edit' || formType === 'add') && (
        <FormSection icon={Group} title="Group Membership">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CippFormUserSelector
                formControl={formControl}
                name="copyFrom"
                label="Copy groups from user"
                multiple={false}
              />
            </Grid>
            {formType === 'edit' && (
              <>
                <Grid size={{ md: 6, xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label="Add to Groups"
                    name="AddToGroups"
                    multiple={true}
                    options={filteredTenantGroups?.map((tenantGroup) => ({
                      label: tenantGroup.displayName,
                      value: tenantGroup.id,
                      addedFields: {
                        groupType: tenantGroup.groupType,
                        calculatedGroupType: tenantGroup.calculatedGroupType,
                      },
                    }))}
                    creatable={false}
                    formControl={formControl}
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label="Remove from Groups"
                    name="RemoveFromGroups"
                    multiple={true}
                    options={userGroups?.data?.map((userGroups) => ({
                      label: userGroups.DisplayName,
                      value: userGroups.id,
                      addedFields: {
                        groupType: userGroups.groupType,
                        calculatedGroupType: userGroups.calculatedGroupType,
                      },
                    }))}
                    creatable={false}
                    formControl={formControl}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </FormSection>
      )}

      {/* Custom Data Section */}
      {currentTenantManualMappings.length > 0 && (
        <FormSection icon={Extension} title="Custom Data">
          <Grid container spacing={2}>
            {currentTenantManualMappings.map((mapping, index) => {
              const fieldName = `customData.${mapping.customDataAttribute.value}`
              const fieldLabel = mapping.manualEntryFieldLabel
              const dataType = mapping.customDataAttribute.addedFields.dataType

              // Determine field type based on the custom data attribute type
              const getFieldType = (dataType) => {
                switch (dataType?.toLowerCase()) {
                  case 'boolean':
                    return 'switch'
                  case 'datetime':
                  case 'date':
                    return 'datePicker'
                  case 'string':
                  default:
                    return 'textField'
                }
              }

              return (
                <Grid size={{ md: 6, xs: 12 }} key={`manual-entry-${index}`}>
                  <CippFormComponent
                    type={getFieldType(dataType)}
                    fullWidth
                    label={fieldLabel}
                    name={fieldName}
                    formControl={formControl}
                    placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                  />
                </Grid>
              )
            })}
          </Grid>
        </FormSection>
      )}

      {/* Schedule Section - creation (add) or this edit (edit) */}
      {(formType === 'add' || formType === 'edit') && (
        <FormSection icon={Schedule} title="Scheduling">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label={
                  formType === 'add'
                    ? 'Schedule user creation for later'
                    : 'Schedule this user edit for later'
                }
                name="Scheduled.enabled"
                formControl={formControl}
              />
            </Grid>
            <CippFormCondition
              formControl={formControl}
              field="Scheduled.enabled"
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="datePicker"
                  label="Scheduled Date"
                  name="Scheduled.date"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Notification Options
                </Typography>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  <CippFormComponent
                    type="switch"
                    label="Send to Webhook"
                    name="postExecution.webhook"
                    formControl={formControl}
                  />
                  <CippFormComponent
                    type="switch"
                    label="Send to Email"
                    name="postExecution.email"
                    formControl={formControl}
                  />
                  <CippFormComponent
                    type="switch"
                    label="Send to PSA"
                    name="postExecution.psa"
                    formControl={formControl}
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Reference"
                  name="reference"
                  placeholder="Enter a reference for the notification title"
                  formControl={formControl}
                />
              </Grid>
            </CippFormCondition>
          </Grid>
        </FormSection>
      )}
    </Box>
  )
}

export default CippAddEditUser
