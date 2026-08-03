import {
  Alert,
  Box,
  Divider,
  InputAdornment,
  Typography,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material'
import { ExpandMore, ContentCopy, Lightbulb } from '@mui/icons-material'
import { Grid } from '@mui/system'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import { CippFormDomainSelector } from '../CippComponents/CippFormDomainSelector'
import { CippFormUserSelector } from '../CippComponents/CippFormUserSelector'
import { CippFormLicenseSelector } from '../CippComponents/CippFormLicenseSelector'
import { useWatch } from 'react-hook-form'
import { useState } from 'react'

// Common dynamic membership rule examples
const dynamicRuleExamples = [
  {
    category: 'Department-Based',
    examples: [
      {
        name: 'Single Department',
        rule: '(user.department -eq "Sales")',
        description: 'All users in the Sales department',
      },
      {
        name: 'Multiple Departments',
        rule: '(user.department -eq "Sales") -or (user.department -eq "Marketing")',
        description: 'Users in Sales OR Marketing departments',
      },
      {
        name: 'Department Contains',
        rule: '(user.department -contains "Engineering")',
        description: "Users whose department contains 'Engineering'",
      },
    ],
  },
  {
    category: 'Job Title & Role',
    examples: [
      {
        name: 'Specific Job Title',
        rule: '(user.jobTitle -eq "Manager")',
        description: "All users with 'Manager' job title",
      },
      {
        name: 'Job Title Contains',
        rule: '(user.jobTitle -contains "Director")',
        description: "Users whose title contains 'Director'",
      },
      {
        name: 'Multiple Titles',
        rule: '(user.jobTitle -eq "CEO") -or (user.jobTitle -eq "CFO") -or (user.jobTitle -eq "CTO")',
        description: 'C-level executives only',
      },
    ],
  },
  {
    category: 'Location-Based',
    examples: [
      {
        name: 'Specific Country',
        rule: '(user.country -eq "United States")',
        description: 'All users located in the United States',
      },
      {
        name: 'Specific Office',
        rule: '(user.officeLocation -eq "New York")',
        description: 'Users in the New York office',
      },
      {
        name: 'Usage Location',
        rule: '(user.usageLocation -eq "US")',
        description: 'Users with US usage location (for licensing)',
      },
    ],
  },
  {
    category: 'Account Status',
    examples: [
      {
        name: 'Enabled Accounts Only',
        rule: '(user.accountEnabled -eq true)',
        description: 'Only enabled user accounts',
      },
      {
        name: 'Guest Users',
        rule: '(user.userType -eq "Guest")',
        description: 'All guest/external users',
      },
      {
        name: 'Member Users',
        rule: '(user.userType -eq "Member")',
        description: 'All member (internal) users',
      },
    ],
  },
  {
    category: 'Combined Rules',
    examples: [
      {
        name: 'Department + Enabled',
        rule: '(user.department -eq "IT") -and (user.accountEnabled -eq true)',
        description: 'Enabled IT department users only',
      },
      {
        name: 'Manager in Location',
        rule: '(user.jobTitle -contains "Manager") -and (user.country -eq "United States")',
        description: 'Managers located in the US',
      },
      {
        name: 'Exclude Specific Users',
        rule: '(user.department -eq "Sales") -and (user.jobTitle -ne "Intern")',
        description: 'Sales department excluding interns',
      },
    ],
  },
  {
    category: 'Extension Attributes',
    examples: [
      {
        name: 'Extension Attribute',
        rule: '(user.extensionAttribute1 -eq "FullTime")',
        description: 'Users with specific extension attribute value',
      },
      {
        name: 'Extension Not Null',
        rule: '(user.extensionAttribute1 -ne null)',
        description: 'Users where extension attribute has any value',
      },
    ],
  },
]

// Dynamic Distribution Group filter examples (Exchange recipient filters)
const dynamicDistributionExamples = [
  {
    category: 'Recipient Type',
    examples: [
      {
        name: 'All Mailboxes',
        rule: "RecipientType -eq 'UserMailbox'",
        description: 'All user mailboxes in the organization',
      },
      {
        name: 'All Mail Users',
        rule: "RecipientTypeDetails -eq 'MailUser'",
        description: 'All mail-enabled users',
      },
    ],
  },
  {
    category: 'Department & Company',
    examples: [
      {
        name: 'Single Department',
        rule: "Department -eq 'Sales'",
        description: 'All recipients in the Sales department',
      },
      {
        name: 'Specific Company',
        rule: "Company -eq 'Contoso'",
        description: 'All recipients from Contoso company',
      },
      {
        name: 'Department + Company',
        rule: "(Department -eq 'Engineering') -and (Company -eq 'Contoso')",
        description: 'Engineering at Contoso only',
      },
    ],
  },
  {
    category: 'Location',
    examples: [
      {
        name: 'State or Province',
        rule: "StateOrProvince -eq 'California'",
        description: 'Recipients in California',
      },
      {
        name: 'Country',
        rule: "CountryOrRegion -eq 'United States'",
        description: 'Recipients in the United States',
      },
      {
        name: 'Office Location',
        rule: "Office -eq 'Building A'",
        description: 'Recipients in Building A',
      },
    ],
  },
  {
    category: 'Custom Attributes',
    examples: [
      {
        name: 'Custom Attribute',
        rule: "CustomAttribute1 -eq 'ProjectTeam'",
        description: 'Recipients with specific custom attribute',
      },
      {
        name: 'Multiple Conditions',
        rule: "(CustomAttribute1 -eq 'VIP') -and (RecipientType -eq 'UserMailbox')",
        description: 'VIP mailboxes only',
      },
    ],
  },
]

// Group type definitions with descriptions
const groupTypeOptions = [
  {
    label: 'Security Group',
    value: 'generic',
    description:
      'Control access to resources like SharePoint sites, applications, and Azure resources. No email capabilities.',
  },
  {
    label: 'Microsoft 365 Group',
    value: 'm365',
    description: 'Collaborative group with shared mailbox, calendar, files, and Teams integration.',
  },
  {
    label: 'Distribution List',
    value: 'distribution',
    description: 'Email distribution group for sending messages to multiple recipients.',
  },
  {
    label: 'Mail Enabled Security Group',
    value: 'security',
    description:
      'Security group that can also receive email. Combines access control with email distribution.',
  },
  {
    label: 'Dynamic Group',
    value: 'dynamic',
    description:
      'Security group with automatic membership based on user attributes (e.g., department, job title).',
  },
  {
    label: 'Dynamic Distribution Group',
    value: 'dynamicdistribution',
    description:
      'Email distribution group with automatic membership based on recipient attributes.',
  },
  {
    label: 'Azure Role Group',
    value: 'azurerole',
    description:
      'Privileged group that can be assigned to Azure AD roles. Use for administrative access.',
  },
]

// Helper function to get description for selected group type
const getGroupTypeDescription = (groupType) => {
  const option = groupTypeOptions.find((opt) => opt.value === groupType)
  return option?.description || ''
}

// Collapsible component showing dynamic rule examples
const DynamicRuleExamplesAccordion = ({ formControl, selectedGroupType }) => {
  const [copiedRule, setCopiedRule] = useState(null)

  const handleCopyRule = (rule) => {
    navigator.clipboard.writeText(rule)
    setCopiedRule(rule)
    setTimeout(() => setCopiedRule(null), 2000)
  }

  const handleUseRule = (rule) => {
    formControl.setValue('membershipRules', rule, { shouldValidate: true })
  }

  // Choose examples based on group type
  const examples =
    selectedGroupType === 'dynamicdistribution' ? dynamicDistributionExamples : dynamicRuleExamples

  const syntaxGuide =
    selectedGroupType === 'dynamicdistribution' ? (
      <>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
          Exchange Recipient Filter Syntax
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          <li>
            <code>-eq</code> = equals
          </li>
          <li>
            <code>-ne</code> = not equals
          </li>
          <li>
            <code>-like</code> = wildcard match (use * for wildcards)
          </li>
          <li>
            <code>-and</code> / <code>-or</code> = combine conditions
          </li>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Common attributes: <code>Department</code>, <code>Company</code>,{' '}
          <code>StateOrProvince</code>,<code>CountryOrRegion</code>, <code>Office</code>,{' '}
          <code>Title</code>, <code>CustomAttribute1-15</code>
        </Typography>
      </>
    ) : (
      <>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
          OData Filter Syntax
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          <li>
            <code>-eq</code> = equals
          </li>
          <li>
            <code>-ne</code> = not equals
          </li>
          <li>
            <code>-contains</code> = string contains
          </li>
          <li>
            <code>-match</code> = regex match
          </li>
          <li>
            <code>-and</code> / <code>-or</code> = combine conditions
          </li>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Common attributes: <code>user.department</code>, <code>user.jobTitle</code>,{' '}
          <code>user.country</code>,<code>user.accountEnabled</code>, <code>user.userType</code>,{' '}
          <code>user.extensionAttribute1-15</code>
        </Typography>
      </>
    )

  return (
    <Accordion
      sx={{
        mt: 2,
        backgroundColor: 'background.default',
        '&:before': { display: 'none' },
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          minHeight: 48,
          '&.Mui-expanded': { minHeight: 48 },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Lightbulb color="info" fontSize="small" />
          <Typography variant="subtitle2">Rule Examples & Syntax Guide</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        {/* Syntax Guide */}
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 }}>
          {syntaxGuide}
        </Box>

        {/* Examples by Category */}
        {examples.map((category) => (
          <Accordion
            key={category.category}
            sx={{
              boxShadow: 'none',
              '&:before': { display: 'none' },
              backgroundColor: 'transparent',
            }}
            disableGutters
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                minHeight: 40,
                px: 1,
                '&.Mui-expanded': { minHeight: 40 },
              }}
            >
              <Typography variant="subtitle2" color="primary">
                {category.category}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1, pt: 0 }}>
              <Stack spacing={1.5}>
                {category.examples.map((example) => (
                  <Box
                    key={example.name}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {example.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 1 }}
                        >
                          {example.description}
                        </Typography>
                        <Box
                          component="code"
                          sx={{
                            display: 'block',
                            p: 1,
                            backgroundColor: 'grey.900',
                            color: 'grey.100',
                            borderRadius: 0.5,
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                          }}
                        >
                          {example.rule}
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={0.5} sx={{ ml: 1, flexShrink: 0 }}>
                        <Tooltip title={copiedRule === example.rule ? 'Copied!' : 'Copy rule'}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyRule(example.rule)}
                            color={copiedRule === example.rule ? 'success' : 'default'}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Chip
                          label="Use"
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={() => handleUseRule(example.rule)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Additional Resources */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Need more help?{' '}
            {selectedGroupType === 'dynamicdistribution' ? (
              <Link
                href="https://learn.microsoft.com/en-us/exchange/recipients/dynamic-distribution-groups/dynamic-distribution-groups"
                target="_blank"
                rel="noopener noreferrer"
              >
                Exchange Dynamic Distribution Groups Documentation
              </Link>
            ) : (
              <Link
                href="https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-membership"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft Entra Dynamic Group Rules Documentation
              </Link>
            )}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

const CippAddGroupForm = (props) => {
  const { formControl } = props
  const groupTypeWatch = useWatch({ control: formControl.control, name: 'groupType' })
  // Handle both object format from autoComplete and string format
  const selectedGroupType = groupTypeWatch?.value || groupTypeWatch

  return (
    <Grid container spacing={2}>
      {/* Section 1: Group Type Selection */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom>
          Group Type
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select the type of group you want to create. This determines the available features and
          settings.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          name="groupType"
          label="Select Group Type"
          formControl={formControl}
          options={groupTypeOptions.map(({ label, value }) => ({ label, value }))}
          multiple={false}
          required={true}
          placeholder="Choose a group type..."
        />
      </Grid>

      {/* Show description for selected group type */}
      {selectedGroupType && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>
                {groupTypeOptions.find((opt) => opt.value === selectedGroupType)?.label}:
              </strong>{' '}
              {getGroupTypeDescription(selectedGroupType)}
            </Typography>
          </Alert>
        </Grid>
      )}

      <CippFormCondition
        formControl={formControl}
        field="groupType"
        compareType="isOneOf"
        compareValue={['generic', 'azurerole', 'm365', 'dynamic']}
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Disable group nesting (prevent other groups from being members)"
            name="disableNesting"
            formControl={formControl}
          />
        </Grid>
      </CippFormCondition>

      {/* Only show rest of form after group type is selected */}
      {selectedGroupType && (
        <>
          {/* Section 2: Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Display Name"
              name="displayName"
              formControl={formControl}
              fullWidth
              required={true}
              placeholder="Enter a name for the group"
              helperText="The name that will be displayed in the address book and group lists"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Description"
              name="description"
              formControl={formControl}
              fullWidth
              placeholder="Enter a description for the group (optional)"
              helperText="Help others understand the purpose of this group"
            />
          </Grid>

          {/* Section 3: Email Settings - Only for email-enabled groups */}
          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="isOneOf"
            compareValue={['m365', 'distribution', 'dynamicdistribution', 'security']}
          >
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Email Settings
              </Typography>
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Email Prefix"
                name="username"
                formControl={formControl}
                fullWidth
                required={true}
                placeholder="e.g., sales-team"
                InputProps={{
                  endAdornment: <InputAdornment position="end">@</InputAdornment>,
                }}
                helperText="The part before @ in the group's email address"
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormDomainSelector
                formControl={formControl}
                name="primDomain"
                label="Domain"
                required={true}
              />
            </Grid>
          </CippFormCondition>

          {/* Email aliases + GAL visibility - distribution and mail-enabled security groups */}
          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="isOneOf"
            compareValue={['distribution', 'security']}
          >
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Email Aliases"
                placeholder="One alias per line, e.g. postmaster@%tenantfilter%"
                name="aliases"
                formControl={formControl}
                multiline
                rows={4}
                fullWidth
                helperText="Additional email addresses for this group, one per line"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Hide this group from the Global Address List (GAL)"
                name="hideFromGAL"
                formControl={formControl}
              />
            </Grid>
          </CippFormCondition>

          {/* Section 4: Dynamic Membership Rules - Only for dynamic groups */}
          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="isOneOf"
            compareValue={['dynamic', 'dynamicdistribution']}
          >
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Dynamic Membership Rules
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Define rules to automatically add or remove members based on user attributes.{' '}
                <Link
                  href="https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-membership"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about dynamic membership rules
                </Link>
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Membership Rule"
                name="membershipRules"
                formControl={formControl}
                placeholder='Example: (user.department -eq "Sales") -or (user.department -eq "Marketing")'
                multiline
                rows={4}
                fullWidth
                required={true}
                helperText="Enter a dynamic membership rule using OData filter syntax"
              />
            </Grid>

            {/* Collapsible Examples Section */}
            <Grid size={{ xs: 12 }}>
              <DynamicRuleExamplesAccordion
                formControl={formControl}
                selectedGroupType={selectedGroupType}
              />
            </Grid>
          </CippFormCondition>

          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="is"
            compareValue="generic"
          >
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Licenses
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Optionally assign licenses to this security group. They will be applied to all
                members.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormLicenseSelector
                formControl={formControl}
                name="licenses"
                label="Licenses (optional)"
                multiple={true}
              />
            </Grid>
          </CippFormCondition>

          {/* Section 5: Members & Owners - Only for non-dynamic groups */}
          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="isNotOneOf"
            compareValue={['dynamic', 'dynamicdistribution']}
          >
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Members & Owners
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add owners to manage the group and members who will be part of it. You can also add
                members later.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CippFormUserSelector
                formControl={formControl}
                name="owners"
                label="Owners (Optional)"
                multiple={true}
                select={'id,userPrincipalName,displayName'}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                Owners can manage group membership and settings
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CippFormUserSelector
                formControl={formControl}
                name="members"
                label="Members (Optional)"
                multiple={true}
                select={'id,userPrincipalName,displayName'}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                Members will have access to group resources
              </Typography>
            </Grid>
          </CippFormCondition>

          {/* Section 6: Additional Settings */}
          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="isOneOf"
            compareValue={['distribution', 'dynamicdistribution', 'm365']}
          >
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Additional Settings
              </Typography>
            </Grid>
          </CippFormCondition>

          {/* External senders option for distribution groups */}
          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="isOneOf"
            compareValue={['distribution', 'dynamicdistribution']}
          >
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Allow external senders"
                name="allowExternal"
                formControl={formControl}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 6 }}>
                When enabled, people outside your organization can send email to this group
              </Typography>
            </Grid>
          </CippFormCondition>

          {/* Subscribe members option for M365 groups */}
          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="is"
            compareValue="m365"
          >
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Auto-subscribe members to group emails"
                name="subscribeMembers"
                formControl={formControl}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 6 }}>
                Members will automatically receive copies of group conversations in their inbox
              </Typography>
            </Grid>
          </CippFormCondition>
        </>
      )}

      {/* Initial prompt when no group type selected */}
      {!selectedGroupType && (
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              mt: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Select a group type above to continue
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  )
}

export default CippAddGroupForm
