// Demo data structure matching Zero Trust Assessment
export const dashboardDemoData = {
  ExecutedAt: "2025-12-16T10:00:00Z",
  TenantName: "Demo Tenant",
  Domain: "demo.contoso.com",
  TestResultSummary: {
    IdentityPassed: 85,
    IdentityTotal: 100,
    DevicesPassed: 25,
    DevicesTotal: 36,
    DataPassed: 20,
    DataTotal: 30,
  },
  TenantInfo: {
    TenantOverview: {
      UserCount: 1250,
      GuestCount: 85,
      GroupCount: 340,
      ApplicationCount: 156,
      DeviceCount: 765,
      ManagedDeviceCount: 733,
    },
    OverviewCaMfaAllUsers: {
      description:
        "Over the past 30 days, 68.5% of sign-ins were protected by conditional access policies enforcing multifactor authentication.",
      nodes: [
        { source: "User sign in", target: "No CA applied", value: 394 },
        { source: "User sign in", target: "CA applied", value: 856 },
        { source: "CA applied", target: "No MFA", value: 146 },
        { source: "CA applied", target: "MFA", value: 710 },
      ],
    },
    OverviewCaDevicesAllUsers: {
      description: "Over the past 30 days, 71.2% of sign-ins were from compliant devices.",
      nodes: [
        { source: "User sign in", target: "Unmanaged", value: 500 },
        { source: "User sign in", target: "Managed", value: 1150 },
        { source: "Managed", target: "Non-compliant", value: 260 },
        { source: "Managed", target: "Compliant", value: 890 },
      ],
    },
    OverviewAuthMethodsPrivilegedUsers: {
      description: "Authentication methods used by privileged users over the past 30 days.",
      nodes: [
        { source: "Users", target: "Single factor", value: 5 },
        { source: "Users", target: "Phishable", value: 28 },
        { source: "Users", target: "Phish resistant", value: 15 },
        { source: "Phishable", target: "Phone", value: 8 },
        { source: "Phishable", target: "Authenticator", value: 20 },
        { source: "Phish resistant", target: "Passkey", value: 12 },
        { source: "Phish resistant", target: "WHfB", value: 3 },
      ],
    },
    OverviewAuthMethodsAllUsers: {
      description: "Authentication methods used by all users over the past 30 days.",
      nodes: [
        { source: "Users", target: "Single factor", value: 120 },
        { source: "Users", target: "Phishable", value: 580 },
        { source: "Users", target: "Phish resistant", value: 550 },
        { source: "Phishable", target: "Phone", value: 180 },
        { source: "Phishable", target: "Authenticator", value: 400 },
        { source: "Phish resistant", target: "Passkey", value: 450 },
        { source: "Phish resistant", target: "WHfB", value: 100 },
      ],
    },
    DeviceOverview: {
      DesktopDevicesSummary: {
        description: "Desktop devices (Windows and macOS) by join type and compliance status.",
        nodes: [
          // Level 1: Desktop devices to OS
          { source: "Desktop devices", target: "Windows", value: 585 },
          { source: "Desktop devices", target: "macOS", value: 75 },
          // Level 2: Windows to join types
          { source: "Windows", target: "Entra joined", value: 285 },
          { source: "Windows", target: "Entra registered", value: 100 },
          { source: "Windows", target: "Entra hybrid joined", value: 200 },
          // Level 3: Windows join types to compliance
          { source: "Entra joined", target: "Compliant", value: 171 },
          { source: "Entra joined", target: "Non-compliant", value: 42 },
          { source: "Entra joined", target: "Unmanaged", value: 72 },
          { source: "Entra hybrid joined", target: "Compliant", value: 50 },
          { source: "Entra hybrid joined", target: "Non-compliant", value: 23 },
          { source: "Entra hybrid joined", target: "Unmanaged", value: 127 },
          { source: "Entra registered", target: "Compliant", value: 60 },
          { source: "Entra registered", target: "Non-compliant", value: 40 },
          { source: "Entra registered", target: "Unmanaged", value: 0 },
          // Level 2: macOS directly to compliance
          { source: "macOS", target: "Compliant", value: 56 },
          { source: "macOS", target: "Non-compliant", value: 15 },
          { source: "macOS", target: "Unmanaged", value: 4 },
        ],
      },
      MobileSummary: {
        description: "Mobile devices by compliance status.",
        nodes: [
          { source: "Mobile devices", target: "Android", value: 105 },
          { source: "Mobile devices", target: "iOS", value: 75 },
          { source: "Android", target: "Android (Company)", value: 72 },
          { source: "Android", target: "Android (Personal)", value: 33 },
          { source: "iOS", target: "iOS (Company)", value: 58 },
          { source: "iOS", target: "iOS (Personal)", value: 17 },
          { source: "Android (Company)", target: "Compliant", value: 60 },
          { source: "Android (Company)", target: "Non-compliant", value: 12 },
          { source: "Android (Personal)", target: "Compliant", value: 10 },
          { source: "Android (Personal)", target: "Non-compliant", value: 23 },
          { source: "iOS (Company)", target: "Compliant", value: 52 },
          { source: "iOS (Company)", target: "Non-compliant", value: 6 },
          { source: "iOS (Personal)", target: "Compliant", value: 11 },
          { source: "iOS (Personal)", target: "Non-compliant", value: 6 },
        ],
      },
      ManagedDevices: {
        deviceOperatingSystemSummary: {
          androidCount: 105,
          iosCount: 75,
          macOSCount: 75,
          windowsCount: 585,
          linuxCount: 15,
        },
      },
      DeviceCompliance: {
        compliantDeviceCount: 400,
        nonCompliantDeviceCount: 150,
      },
      DeviceOwnership: {
        corporateCount: 600,
        personalCount: 100,
      },
    },
  },
};
