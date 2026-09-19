import { pdf } from '@react-pdf/renderer'
import {
  LicenseReportDocument,
  DEFAULT_LICENSE_REPORT_SECTIONS,
} from '../../src/components/CippPdf/LicenseReportButton'

// Real render, not a stub: the point is that the document survives react-pdf's layout pass. A JSX
// error in a report only surfaces there, so a shallow render would assert nothing useful.
const renderToBlob = (node) => pdf(node).toBlob()

const baseProps = {
  brandingSettings: {},
  tenantName: 'Contoso Ltd',
  generatedOn: 'January 1, 2026',
  variables: {},
}

// The shape ListLicenseRecommendations returns, populated so every section has something to draw.
const SAMPLE_REPORT = {
  Summary: {
    Tenant: 'contoso.com',
    Currency: 'USD',
    ReportPeriodDays: 90,
    InactiveDays: 90,
    TenureMonths: 6,
    ProtectSecurityFeatures: true,
    MonthlySpend: 1840,
    AssignedSeats: 96,
    TotalSeats: 110,
    LicensedUsers: 96,
    ReclaimableMonthly: 294,
    ReclaimableSeats: 14,
    DowngradeMonthly: 150,
    DowngradeSeats: 15,
    ConsolidationMonthly: 9,
    TermMonthly: 44.8,
    ProtectInvestmentMonthly: 120,
    ProtectSeats: 15,
    TotalPotentialMonthly: 497.8,
    TotalPotentialAnnual: 5973.6,
    MonthlyCommitmentUplift: 0.2,
    AnonymizedReports: false,
    DataAvailable: true,
  },
  Optimization: {
    Opportunities: [
      {
        Tier: 'UnassignedSeats',
        FindingLabel: 'Unassigned',
        License: 'Microsoft 365 Business Premium',
        Seats: 8,
        MonthlySaving: 176,
        PriceKnown: true,
      },
      {
        Tier: 'DisabledAccount',
        FindingLabel: 'Disabled user',
        License: 'Microsoft 365 Business Standard',
        Seats: 3,
        MonthlySaving: 42,
        PriceKnown: true,
      },
      {
        Tier: 'Inactive',
        FindingLabel: 'Inactive 90d+',
        License: 'Microsoft 365 Business Basic',
        Seats: 3,
        MonthlySaving: 21,
        PriceKnown: true,
      },
      {
        Tier: 'Overlap',
        FindingLabel: 'Redundant',
        License: 'Exchange Online (Plan 1)',
        Seats: 2,
        MonthlySaving: 8,
        PriceKnown: true,
      },
      {
        Tier: 'Downgrade',
        FindingLabel: 'Mailbox-only',
        License: 'Microsoft 365 E3',
        Seats: 1,
        MonthlySaving: 0,
        PriceKnown: true,
      },
    ],
  },
  Downgrades: [
    {
      FromLicense: 'Microsoft 365 Business Standard',
      FromSkuId: 'f245ecc8-75af-4f8e-b61f-27d8114de5f3',
      ToLicense: 'Microsoft 365 Business Basic',
      ToSkuId: '3b555118-da6a-4418-894f-7df1e2096870',
      Action: 'Downgrade',
      Seats: 10,
      UnitCost: 14,
      TargetCost: 7,
      UnitSaving: 7,
      MonthlySaving: 70,
      Keeps: [
        'Email and calendar',
        'Teams chat and meetings',
        'File storage and sharing',
      ],
      Loses: ['Office desktop apps'],
      Users: [{ userPrincipalName: 'a@contoso.com', displayName: 'A' }],
    },
    {
      FromLicense: 'Microsoft Copilot for Microsoft 365',
      FromSkuId: '639dec6b-bb19-468b-871c-c5c441c4b0cb',
      ToLicense: 'No license',
      ToSkuId: null,
      Action: 'Remove',
      Seats: 5,
      UnitCost: 30,
      TargetCost: 0,
      UnitSaving: 30,
      MonthlySaving: 150,
      Keeps: [],
      Loses: ['Microsoft 365 Copilot'],
      Users: [],
    },
  ],
  Upgrades: [
    {
      Type: 'Consolidate',
      FromLicenses: [
        'Microsoft 365 Apps for Business',
        'Microsoft 365 Business Basic',
      ],
      ToLicense: 'Microsoft 365 Business Standard',
      Seats: 3,
      UnitCost: 17,
      TargetCost: 14,
      UnitDelta: -3,
      MonthlyDelta: -9,
      Gains: [],
      Users: [],
    },
    {
      Type: 'Protect',
      FromLicenses: ['Microsoft 365 Business Standard'],
      ToLicense: 'Microsoft 365 Business Premium',
      Seats: 15,
      UnitCost: 14,
      TargetCost: 22,
      UnitDelta: 8,
      MonthlyDelta: 120,
      Gains: [
        'Device management',
        'Advanced sign-in security',
        'Device threat protection',
      ],
      Users: [],
    },
  ],
  Terms: [
    {
      License: 'Microsoft 365 Business Premium',
      AssignedSeats: 60,
      TotalSeats: 68,
      StableSeats: 52,
      MonthlySeats: 30,
      YearlySeats: 38,
      TermKnown: true,
      RecommendedAnnual: 52,
      RecommendedMonthly: 8,
      ConvertibleSeats: 14,
      UnitCost: 22,
      MonthlySaving: 61.6,
      LockedUnusedSeats: 0,
      NextRenewalDays: 120,
      PriceKnown: true,
    },
    {
      License: 'Microsoft 365 Business Basic',
      AssignedSeats: 10,
      TotalSeats: 14,
      StableSeats: 9,
      MonthlySeats: 0,
      YearlySeats: 14,
      TermKnown: true,
      RecommendedAnnual: 9,
      RecommendedMonthly: 1,
      ConvertibleSeats: 0,
      UnitCost: 7,
      MonthlySaving: 0,
      LockedUnusedSeats: 4,
      NextRenewalDays: 45,
      PriceKnown: true,
    },
    {
      License: 'Power BI Pro',
      AssignedSeats: 4,
      TotalSeats: 4,
      StableSeats: 4,
      MonthlySeats: 0,
      YearlySeats: 0,
      TermKnown: false,
      RecommendedAnnual: 4,
      RecommendedMonthly: 0,
      ConvertibleSeats: null,
      UnitCost: 14,
      MonthlySaving: 0,
      LockedUnusedSeats: 0,
      NextRenewalDays: null,
      PriceKnown: true,
    },
  ],
  Products: [
    {
      License: 'Microsoft 365 Business Premium',
      TotalSeats: 68,
      AssignedSeats: 60,
      UnusedSeats: 8,
      UnitCost: 22,
      MonthlySpend: 1320,
      PriceKnown: true,
    },
    {
      License: 'Microsoft 365 Business Standard',
      TotalSeats: 20,
      AssignedSeats: 20,
      UnusedSeats: 0,
      UnitCost: 14,
      MonthlySpend: 280,
      PriceKnown: true,
    },
    {
      License: 'Microsoft 365 Business Basic',
      TotalSeats: 14,
      AssignedSeats: 10,
      UnusedSeats: 4,
      UnitCost: 7,
      MonthlySpend: 70,
      PriceKnown: true,
    },
    {
      License: 'Power BI Pro',
      TotalSeats: 4,
      AssignedSeats: 4,
      UnusedSeats: 0,
      UnitCost: 14,
      MonthlySpend: 56,
      PriceKnown: true,
    },
    {
      License: 'Microsoft Fabric (Free)',
      TotalSeats: 4,
      AssignedSeats: 2,
      UnusedSeats: 2,
      UnitCost: null,
      MonthlySpend: null,
      PriceKnown: false,
    },
  ],
  Capabilities: [
    { id: 'email', label: 'Email and calendar', measurable: true },
    { id: 'desktopApps', label: 'Office desktop apps', measurable: true },
    { id: 'deviceManagement', label: 'Device management', measurable: false },
  ],
}

describe('LicenseReportDocument', () => {
  it('renders the sample data to a PDF', async () => {
    const blob = await renderToBlob(
      <LicenseReportDocument {...baseProps} report={SAMPLE_REPORT} />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('renders with no data at all, so an empty tenant still produces a report', async () => {
    const blob = await renderToBlob(
      <LicenseReportDocument {...baseProps} report={{}} />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('renders the anonymised-report path with every optional section switched off', async () => {
    const sections = Object.fromEntries(
      Object.keys(DEFAULT_LICENSE_REPORT_SECTIONS).map((key) => [key, false])
    )
    const report = {
      ...SAMPLE_REPORT,
      Summary: {
        ...SAMPLE_REPORT.Summary,
        AnonymizedReports: true,
        ProtectSecurityFeatures: false,
      },
    }
    const blob = await renderToBlob(
      <LicenseReportDocument
        {...baseProps}
        report={report}
        sections={{ ...sections, downgrades: true }}
      />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)
})
