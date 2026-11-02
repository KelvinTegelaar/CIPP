import React from 'react'
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography, Paper } from '@mui/material'
import { expect, within } from 'storybook/test'
import { getCippFormatting } from '../../../src/utils/get-cipp-formatting'

const FormattingShowcase = ({ cases }) => (
  <Paper sx={{ p: 2 }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><strong>cellName</strong></TableCell>
          <TableCell><strong>Input Data</strong></TableCell>
          <TableCell><strong>Text Output</strong></TableCell>
          <TableCell><strong>Component Output</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {cases.map(({ cellName, data, canReceive, description }, i) => (
          <TableRow key={`${cellName}-${i}`}>
            <TableCell>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{cellName}</Typography>
              {description && <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "text.secondary"
                }}>{description}</Typography>}
            </TableCell>
            <TableCell>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {typeof data === 'object' ? JSON.stringify(data) : String(data)}
              </Typography>
            </TableCell>
            <TableCell>{String(getCippFormatting(data, cellName, 'text', canReceive))}</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                {getCippFormatting(data, cellName, 'component', canReceive)}
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
)

export default {
  title: 'Components/CippComponents/CippFormatting',
  component: FormattingShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export const SpecialFields = {
  args: {
    cases: [
      { cellName: 'addrow', data: null, description: 'No data placeholder' },
      { cellName: 'baselineOption', data: null, description: 'Download link' },
      { cellName: 'delegatedPrivilegeStatus', data: 'directTenant', description: 'Direct tenant' },
      { cellName: 'delegatedPrivilegeStatus', data: 'gdap', description: 'GDAP tenant' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('fixed labels for addrow, baseline, delegated privilege', async () => {
      await expect(canvasElement.textContent).toContain('Download Baseline')
      await expect(canvasElement.textContent).toContain('Direct Tenant')
      await expect(canvasElement.textContent).toContain('GDAP Tenant')
      // addrow: 'No data' in text cell + chip
      expect(canvas.getAllByText('No data').length).toBeGreaterThanOrEqual(2)
    })
  },
}

export const SeverityAndStatus = {
  args: {
    cases: [
      { cellName: 'Severity', data: 'High', description: 'Error color' },
      { cellName: 'Severity', data: 'Medium', description: 'Warning color' },
      { cellName: 'Severity', data: 'Informational', description: 'Info color' },
      { cellName: 'Severity', data: 'Debug', description: 'Default color' },
      { cellName: 'Severity', data: ['High', 'Medium', 'Low'], description: 'Array of severities' },
      { cellName: 'Status', data: 'Success' },
      { cellName: 'Status', data: 'Failed' },
      { cellName: 'Status', data: 'In Progress' },
      { cellName: 'Status', data: 'Warning' },
      { cellName: 'Status', data: 'Not Started' },
      { cellName: 'Risk', data: 'High' },
      { cellName: 'Risk', data: 'Medium' },
      { cellName: 'UserImpact', data: 'High' },
      { cellName: 'Status', data: 'Active', description: 'Active status' },
      { cellName: 'Status', data: 'InProgress', description: 'InProgress (one word)' },
      { cellName: 'Status', data: 'Resolved' },
      { cellName: 'Status', data: 'Redirected' },
      { cellName: 'Status', data: 'Skipped' },
      { cellName: 'Status', data: 'Passed' },
      { cellName: 'Status', data: 'Investigate' },
      { cellName: 'Status', data: 'Unknown Status', description: 'Default/unknown status' },
      { cellName: 'complianceState', data: 'Compliant' },
      { cellName: 'complianceState', data: 'NonCompliant' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('array severity joins in text mode', async () => {
      await expect(canvasElement.textContent).toContain('High, Medium, Low')
    })

    await step('status chips carry semantic colors', async () => {
      expect(canvasElement.querySelector('.MuiChip-colorSuccess')).not.toBeNull()
      expect(canvasElement.querySelector('.MuiChip-colorError')).not.toBeNull()
      expect(canvasElement.querySelector('.MuiChip-colorWarning')).not.toBeNull()
      expect(canvasElement.querySelector('.MuiChip-colorInfo')).not.toBeNull()
    })
  },
}

export const StateField = {
  args: {
    cases: [
      { cellName: 'state', data: 'enabled' },
      { cellName: 'state', data: 'disabled' },
      { cellName: 'state', data: 'enabledForReportingButNotEnforced', description: 'Report Only' },
      { cellName: 'state', data: 'report-only', description: 'Alternate report only' },
      { cellName: 'state', data: 'CustomState', description: 'Unknown state' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('state values normalize to display labels', async () => {
      await expect(canvasElement.textContent).toContain('Enabled')
      await expect(canvasElement.textContent).toContain('Disabled')
      // both report-only spellings, each in text cell + chip (5th match is this row's description cell)
      expect(canvas.getAllByText('Report Only').length).toBeGreaterThanOrEqual(4)
    })
  },
}

export const Booleans = {
  args: {
    cases: [
      { cellName: 'accountEnabled', data: true, description: 'Boolean true' },
      { cellName: 'accountEnabled', data: false, description: 'Boolean false' },
      { cellName: 'bool', data: true, description: 'Bool cellName' },
      { cellName: 'someField', data: { enabled: true }, description: 'Object with enabled=true' },
      { cellName: 'someField', data: { enabled: false }, description: 'Object with enabled=false' },
      { cellName: 'someField', data: { enabled: true, date: '2026-04-10T10:00:00Z' }, description: 'Scheduled enabled' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('booleans render Yes/No text and check/cancel icons', async () => {
      await expect(canvasElement.textContent).toContain('Yes')
      await expect(canvasElement.textContent).toContain('No')
      expect(canvasElement.querySelector('[data-testid="CheckIcon"]')).not.toBeNull()
      expect(canvasElement.querySelector('[data-testid="CloseIcon"]')).not.toBeNull()
    })

    await step('enabled+date renders the scheduled variant', async () => {
      await expect(canvasElement.textContent).toContain('Yes, Scheduled for')
    })
  },
}

export const DateTimeFields = {
  args: {
    cases: [
      { cellName: 'createdDateTime', data: new Date(Date.now() - 3600000).toISOString(), description: '1 hour ago' },
      { cellName: 'lastModifiedDateTime', data: '2024-01-15T10:30:00Z', description: 'Old date' },
      { cellName: 'Timestamp', data: new Date(Date.now() - 300000).toISOString(), description: '5 min ago' },
      { cellName: 'Expires', data: '2026-12-31T23:59:59Z', description: 'Future date' },
      { cellName: 'customExpirationDate', data: '2025-06-15T00:00:00Z', description: 'Regex match' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('date fields render relative time in component mode', async () => {
      await expect(canvasElement.textContent).toContain('1 hour ago')
      await expect(canvasElement.textContent).toContain('5 minutes ago')
    })
  },
}

export const PasswordsAndSecrets = {
  args: {
    cases: [
      { cellName: 'breachPass', data: 'S3cr3tP@ss!', description: 'Breach password' },
      { cellName: 'applicationSecret', data: 'abc-123-def-456', description: 'App secret' },
      { cellName: 'refreshToken', data: 'eyJhbGciOiJSUzI1NiIs...', description: 'Refresh token' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('secret fields hide their value in text mode', async () => {
      // 2 not 3: passwordItems lists camelCase 'breachPass' but the compare lowercases
      // the cellName, so breachPass never matches and renders raw
      expect(canvas.getAllByText('Password hidden')).toHaveLength(2)
    })
  },
}

export const PortalLinks = {
  args: {
    cases: [
      { cellName: 'portal_m365', data: 'https://admin.microsoft.com', description: 'M365 Admin' },
      { cellName: 'portal_exchange', data: 'https://admin.exchange.microsoft.com', description: 'Exchange' },
      { cellName: 'portal_entra', data: 'https://entra.microsoft.com', description: 'Entra ID' },
      { cellName: 'portal_teams', data: 'https://admin.teams.microsoft.com', description: 'Teams' },
      { cellName: 'portal_intune', data: 'https://intune.microsoft.com', description: 'Intune' },
      { cellName: 'portal_security', data: 'https://security.microsoft.com', description: 'Security' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('each portal renders a new-tab icon link with its url', async () => {
      expect(canvasElement.querySelectorAll('a[target="_blank"]')).toHaveLength(6)
      expect(canvasElement.querySelector('a[href="https://entra.microsoft.com"]')).not.toBeNull()
    })
  },
}

export const BytesAndPercentages = {
  args: {
    cases: [
      { cellName: 'storageUsedInBytes', data: 5368709120, description: '5 GB' },
      { cellName: 'prohibitSendReceiveQuotaInBytes', data: 53687091200, description: '50 GB' },
      { cellName: 'storageUsedInBytes', data: null, description: 'Null bytes' },
      { cellName: 'alignmentScore', data: 75, description: '75% alignment' },
      { cellName: 'combinedAlignmentScore', data: 42, description: '42% alignment' },
      { cellName: 'LicenseMissingPercentage', data: 15, description: '15% missing (flipped)' },
      { cellName: 'ScorePercentage', data: 88, description: '88% score' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('bytes convert to two-decimal GB, null falls back to No data', async () => {
      await expect(canvasElement.textContent).toContain('5.00 GB')
      await expect(canvasElement.textContent).toContain('50.00 GB')
      await expect(canvasElement.textContent).toContain('No data')
    })

    await step('scores render as percentages', async () => {
      await expect(canvasElement.textContent).toContain('75%')
      await expect(canvasElement.textContent).toContain('15%')
      await expect(canvasElement.textContent).toContain('88%')
    })
  },
}

export const DomainAnalysis = {
  args: {
    cases: [
      { cellName: 'DMARCPolicy', data: 's', description: 'Strict' },
      { cellName: 'DMARCPolicy', data: 'r', description: 'Relaxed' },
      { cellName: 'DMARCPolicy', data: 'afrf', description: 'Auth Failure' },
      { cellName: 'DMARCActionPolicy', data: '', description: 'No action' },
      { cellName: 'DMARCActionPolicy', data: 'quarantine', description: 'Quarantine' },
      { cellName: 'MailProvider', data: 'Null', description: 'Unknown provider' },
      { cellName: 'MailProvider', data: 'Microsoft', description: 'Known provider' },
      { cellName: 'ScoreExplanation', data: 'All checks passed', description: 'Score explanation' },
      { cellName: 'ReportInterval', data: 86400, description: '1 day in seconds' },
      { cellName: 'ReportInterval', data: 604800, description: '7 days in seconds' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('DMARC shorthand expands to readable labels', async () => {
      await expect(canvasElement.textContent).toContain('Strict')
      await expect(canvasElement.textContent).toContain('Relaxed')
      await expect(canvasElement.textContent).toContain('Authentication Failure')
      await expect(canvasElement.textContent).toContain('No DMARC Action')
    })

    await step('Null provider maps to Unknown, intervals to days', async () => {
      await expect(canvasElement.textContent).toContain('Unknown')
      await expect(canvasElement.textContent).toContain('1 days')
      await expect(canvasElement.textContent).toContain('7 days')
    })
  },
}

export const RepeatSchedules = {
  args: {
    cases: [
      { cellName: 'RepeatsEvery', data: '1d', description: 'Daily' },
      { cellName: 'RepeatsEvery', data: '4h', description: 'Every 4 hours' },
      { cellName: 'RepeatsEvery', data: '1w', description: 'Weekly' },
      { cellName: 'RepeatsEvery', data: '30m', description: 'Every 30 minutes' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('shorthand expands to Every N unit', async () => {
      await expect(canvasElement.textContent).toContain('Every 1 day')
      await expect(canvasElement.textContent).toContain('Every 4 hour')
      await expect(canvasElement.textContent).toContain('Every 1 week')
      await expect(canvasElement.textContent).toContain('Every 30 minutes')
    })
  },
}

export const TenantFields = {
  args: {
    cases: [
      { cellName: 'Tenant', data: 'contoso.com', description: 'Single string tenant' },
      { cellName: 'Tenant', data: { label: 'Contoso Ltd', value: 'contoso.com' }, description: 'Tenant with label' },
      { cellName: 'Tenant', data: ['contoso.com', 'fabrikam.com'], description: 'Array of tenants' },
      { cellName: 'Tenant', data: [{ label: 'Contoso', value: 'c', type: 'Group' }], description: 'Tenant group' },
      { cellName: 'Tenant', data: null, description: 'Null tenant' },
      { cellName: 'tenantFilter', data: 'contoso.com', description: 'Tenant filter' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('label objects and arrays flatten to labels', async () => {
      await expect(canvasElement.textContent).toContain('Contoso Ltd')
      await expect(canvasElement.textContent).toContain('contoso.com, fabrikam.com')
      await expect(canvasElement.textContent).toContain('No data')
    })
  },
}

export const ArraysAndObjects = {
  args: {
    cases: [
      { cellName: 'proxyAddresses', data: ['SMTP:alice@contoso.com', 'smtp:alice.smith@contoso.com'], description: 'Proxy addresses' },
      { cellName: 'proxyAddresses', data: [], description: 'Empty proxy' },
      { cellName: 'businessPhones', data: ['+1-555-1234', '+1-555-5678'], description: 'Phone numbers' },
      { cellName: 'businessPhones', data: [], description: 'No phones' },
      { cellName: 'assignedLicenses', data: [{ skuId: '05e9a617-0261-4cee-bb44-138d3ef5d965' }], description: 'License SKU' },
      { cellName: 'AssignedUsers', data: [{ displayName: 'Alice' }, { displayName: 'Bob' }], description: 'Assigned users' },
      { cellName: 'AssignedGroups', data: [{ displayName: 'All Users' }], description: 'Assigned groups' },
      { cellName: 'AccessRights', data: ['FullAccess', 'SendAs'], description: 'Access rights array' },
      { cellName: 'AccessRights', data: 'FullAccess, SendAs', description: 'Access rights string' },
      { cellName: 'From', data: 'alice@contoso.com;bob@fabrikam.com', description: 'From addresses' },
      { cellName: 'someField', data: ['tag1', 'tag2', 'tag3'], description: 'Generic string array' },
      { cellName: 'someField', data: { key1: 'val1', key2: 'val2' }, description: 'Generic object' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('proxyAddresses strip the smtp prefix and join', async () => {
      await expect(canvasElement.textContent).toContain('alice@contoso.com, alice.smith@contoso.com')
    })

    await step('sku translates, display names and arrays join', async () => {
      await expect(canvasElement.textContent).toContain('Microsoft 365 E3')
      await expect(canvasElement.textContent).toContain('Alice,Bob')
      await expect(canvasElement.textContent).toContain('FullAccess, SendAs')
      await expect(canvasElement.textContent).toContain('tag1, tag2, tag3')
    })
  },
}

export const JSONStrings = {
  args: {
    cases: [
      { cellName: 'config', data: '{"setting": "value"}', description: 'JSON object string' },
      { cellName: 'tags', data: '["tag1", "tag2", "tag3"]', description: 'JSON array of strings' },
      { cellName: 'flag', data: '[true]', description: 'JSON single boolean' },
      { cellName: 'name', data: '["onlyOne"]', description: 'JSON single string' },
      { cellName: 'broken', data: '{invalid json', description: 'Invalid JSON fallback' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('json strings parse to joined arrays, booleans, quoted singles', async () => {
      await expect(canvasElement.textContent).toContain('tag1, tag2, tag3')
      await expect(canvasElement.textContent).toContain('Yes')
      await expect(canvasElement.textContent).toContain('"onlyOne"')
      expect(canvasElement.querySelector('[data-testid="CheckIcon"]')).not.toBeNull()
    })
  },
}

export const MiscFields = {
  args: {
    cases: [
      { cellName: 'hardwareHash', data: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', description: 'Long hardware hash (CSS ellipsis + hover tooltip)' },
      { cellName: 'hardwareHash', data: 'SHORT', description: 'Short hardware hash' },
      { cellName: 'Message', data: 'A very long log message that exceeds 120 characters and should be truncated with an ellipsis because it is too long to display in a table cell without wrapping.', description: 'Long message (CSS ellipsis + hover tooltip)' },
      { cellName: 'Message', data: 'Short message', description: 'Short message' },
      { cellName: 'info.logoUrl', data: 'https://via.placeholder.com/16', description: 'Logo URL' },
      { cellName: 'info.logoUrl', data: null, description: 'No logo' },
      { cellName: 'ClientId', data: '12345-abcde-67890', description: 'Client ID chip' },
      { cellName: 'role', data: 'Global Administrator', description: 'Role chip' },
      { cellName: 'standardType', data: 'drift', description: 'Drift standard' },
      { cellName: 'standardType', data: 'classic', description: 'Classic standard' },
      { cellName: 'Visibility', data: 'public', description: 'GitHub public' },
      { cellName: 'Visibility', data: 'private', description: 'GitHub private' },
      { cellName: 'htmlDescription', data: '<b>Bold</b> and <em>italic</em>', description: 'HTML content' },
      { cellName: 'someUrl', data: 'https://example.com/path', description: 'URL auto-link' },
      { cellName: 'key', data: 'accountEnabled', description: 'Translation key' },
      { cellName: 'bulkUser', data: [1, 2, 3, 4, 5], description: '5 bulk users' },
      { cellName: 'PostExecution', data: 'webhook, email, teams', description: 'Post execution actions' },
      { cellName: 'AutoMapUrl', data: '\\\\server\\share\\path', description: 'AutoMap UNC path' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('long strings keep their full text in an ellipsis cell, bulk users count', async () => {
      // Truncation is CSS-only now (CippCellText applies text-overflow: ellipsis and shows the
      // full value in a hover tooltip), so the DOM must contain the untruncated string.
      const cells = Array.from(canvasElement.querySelectorAll('.cipp-cell-text'))
      const hashCell = cells.find((el) => el.textContent === 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
      expect(hashCell).not.toBeUndefined()
      expect(canvasElement.textContent).not.toContain('ABCDEFGHIJKLMNO...')
      await expect(canvasElement.textContent).toContain('5 new users to create')
    })

    await step('standard types, translation keys, html and links', async () => {
      await expect(canvasElement.textContent).toContain('Drift Standard')
      await expect(canvasElement.textContent).toContain('Classic Standard')
      await expect(canvasElement.textContent).toContain('Account Enabled')
      expect(canvasElement.querySelector('b')?.textContent).toBe('Bold')
      expect(canvasElement.querySelector('a[href="https://example.com/path"]')).not.toBeNull()
    })
  },
}

export const ISODurations = {
  args: {
    cases: [
      { cellName: 'autoExtendDuration', data: 'PT1H30M', description: '1 hour 30 minutes' },
      { cellName: 'deploymentDuration', data: 'PT45M', description: '45 minutes' },
      { cellName: 'deviceSetupDuration', data: 'PT2H15M30S', description: '2h 15m 30s' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('*Duration fields humanize from ISO 8601', async () => {
      await expect(canvasElement.textContent).toContain('1 hour 30 minutes')
      await expect(canvasElement.textContent).toContain('45 minutes')
      await expect(canvasElement.textContent).toContain('2 hours 15 minutes 30 seconds')
    })
  },
}

export const ArrayOfJSONStrings = {
  args: {
    cases: [
      { cellName: 'configs', data: ['{"name":"policy1"}', '{"name":"policy2"}'], description: 'Array of JSON object strings' },
      { cellName: 'simpleJsonArray', data: ['"tag1"', '"tag2"'], description: 'Array of JSON string values (not parsed, quotes stay)' },
      { cellName: 'badJsonArray', data: ['{broken', '{also broken}'], description: 'Array of invalid JSON strings (catch branch)' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('quoted strings join unparsed, broken json falls back to raw join', async () => {
      // '"tag1"' starts with a quote, not {/[, so the parse branch never runs, quotes stay
      await expect(canvasElement.textContent).toContain('"tag1", "tag2"')
      await expect(canvasElement.textContent).toContain('{broken, {also broken}')
    })
  },
}

export const CountriesAndRoles = {
  args: {
    cases: [
      { cellName: 'countriesAndRegions', data: ['US', 'GB', 'DE'], description: 'Country codes array' },
      { cellName: 'countriesAndRegions', data: 'FR', description: 'Single country code' },
      { cellName: 'unifiedRoles', data: [{ roleDefinitionId: '62e90394-69f5-4237-9190-012177145e10' }], description: 'Role array' },
      { cellName: 'unifiedRoles', data: [], description: 'No roles' },
      { cellName: 'roleDefinitionId', data: '62e90394-69f5-4237-9190-012177145e10', description: 'Single role ID' },
      { cellName: 'CIPPAction', data: '[{"label":"Enable User"},{"label":"Set Password"}]', description: 'JSON actions' },
      { cellName: 'CIPPAction', data: '{"label":"Single Action"}', description: 'Single JSON action' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('country codes resolve to names', async () => {
      await expect(canvasElement.textContent).toContain('United States, United Kingdom, Germany')
      await expect(canvasElement.textContent).toContain('France')
    })

    await step('role guids translate, CIPPAction labels join', async () => {
      await expect(canvasElement.textContent).toContain('Global Administrator')
      await expect(canvasElement.textContent).toContain('Enable User, Set Password')
      await expect(canvasElement.textContent).toContain('Single Action')
    })
  },
}

export const ODataAndLocation = {
  args: {
    cases: [
      { cellName: '@odata.type', data: '#microsoft.graph.conditionalAccessPolicy', description: 'Graph type' },
      { cellName: '@odata.type', data: 'customType', description: 'Non-graph type' },
      { cellName: 'status.errorCode', data: 0, description: 'Sign-in error code 0' },
      { cellName: 'status.errorCode', data: 50126, description: 'Sign-in error code' },
      { cellName: 'location', data: { geoCoordinates: { latitude: 47.6, longitude: -122.3 }, city: 'Seattle', state: 'WA' }, description: 'Location with coordinates' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('graph types and sign-in error codes translate', async () => {
      await expect(canvasElement.textContent).toContain('Conditional Access Policy')
      await expect(canvasElement.textContent).toContain('Success')
      await expect(canvasElement.textContent).toContain('Invalid username or password')
    })
  },
}

export const ScheduleAndLicense = {
  args: {
    cases: [
      { cellName: 'Parameters.ScheduledBackupValues', data: { tenants: true, users: false, alerts: true }, description: 'Backup params' },
      { cellName: 'licenseAssignmentStates', data: [{ skuId: '05e9a617-0261-4cee-bb44-138d3ef5d965', disabledPlans: [], state: 'Active' }], description: 'License states' },
      { cellName: 'licenseAssignmentStates', data: [], description: 'Empty license states' },
      { cellName: 'CIPPExtendedProperties', data: '[{"Name":"IP","Value":"1.2.3.4"}]', description: 'Extended properties' },
      { cellName: 'excludedTenants', data: ['tenant1.com', 'tenant2.com'], description: 'Excluded tenants array' },
      { cellName: 'excludedTenants', data: null, description: 'Null excluded tenants' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step('license states translate the sku, tenants join', async () => {
      await expect(canvasElement.textContent).toContain('Microsoft 365 E3')
      await expect(canvasElement.textContent).toContain('tenant1.com, tenant2.com')
      await expect(canvasElement.textContent).toContain('No data')
    })
  },
}

export const NullAndFallbacks = {
  args: {
    cases: [
      { cellName: 'anyField', data: null, description: 'Null data' },
      { cellName: 'anyField', data: undefined, description: 'Undefined data' },
      { cellName: 'anyField', data: 'plain string', description: 'Plain string fallback' },
      { cellName: 'anyField', data: 42, description: 'Number fallback' },
      { cellName: 'excludedTenants', data: null, description: 'Null excluded tenants' },
      { cellName: 'excludedTenants', data: ['tenant1', 'tenant2'], description: 'Excluded tenants array' },
      { cellName: 'anyField', data: { label: 'Option A', value: 'a' }, description: 'Autocomplete label/value' },
      { cellName: 'anyField', data: [{ label: 'X', value: 'x' }, { label: 'Y', value: 'y' }], description: 'Array of autocomplete' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('null-ish inputs fall back to No data', async () => {
      expect(canvas.getAllByText('No data').length).toBeGreaterThanOrEqual(3)
    })

    await step('autocomplete shapes flatten to labels', async () => {
      await expect(canvasElement.textContent).toContain('Option A')
      await expect(canvasElement.textContent).toContain('X, Y')
      await expect(canvasElement.textContent).toContain('tenant1, tenant2')
    })
  },
}
