import { Typography, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";

const DeployDefenderForm = () => {
  const formControl = useForm({
    mode: "onChange",
  });

  return (
    <CippFormPage
      title="Defender Setup"
      formControl={formControl}
      postUrl="/api/AddDefenderDeployment"
      backButtonTitle="Defender Deployment"
    >
      <Typography variant="body2" sx={{ mb: 2 }}>
        Run this wizard to setup the default defender policies for your tenants, or use the
        standards to create specific policies.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <CippFormTenantSelector
            label="Select Tenants"
            formControl={formControl}
            name="selectedTenants"
            type="multiple"
            allTenants={true}
            validators={{ required: "At least one tenant must be selected" }}
          />
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Defender Setup Section */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Show Defender Setup Options"
            name="showDefenderSetup"
            formControl={formControl}
          />
        </Grid>

        <CippFormCondition
          formControl={formControl}
          field="showDefenderSetup"
          compareType="is"
          compareValue={true}
        >
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">Defender Setup</Typography>
            <Typography variant="subtitle1">Defender and MEM Reporting</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="switch"
                  label="Allow Microsoft Defender for Endpoint to enforce Endpoint Security Configurations (Compliance)"
                  name="Compliance.AllowMEMEnforceCompliance"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Connect iOS/iPadOS devices version 13.0 and above to Microsoft Defender for Endpoint (Compliance)"
                  name="Compliance.ConnectIosCompliance"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Connect Android devices version 6.0.0 and above to Microsoft Defender for Endpoint (Compliance)"
                  name="Compliance.ConnectAndroidCompliance"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Connect Windows devices version 10.0.15063 and above to Microsoft Defender for Endpoint (Compliance)"
                  name="Compliance.ConnectWindows"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="EDR: Expedite Telemetry Reporting Frequency"
                  name="EDR.Telemetry"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="switch"
                  label="Enable App Sync (sending application inventory) for iOS/iPadOS devices"
                  name="Compliance.AppSync"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block unsupported OS versions"
                  name="Compliance.BlockunsupportedOS"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Connect Android devices to Microsoft Defender for Endpoint"
                  name="Compliance.ConnectAndroid"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Connect iOS/iPadOS devices to Microsoft Defender for Endpoint"
                  name="Compliance.ConnectIos"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="EDR: Connect Defender Configuration Package automatically from Connector"
                  name="EDR.Config"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="EDR: Enable Sample Sharing"
                  name="EDR.SampleSharing"
                  formControl={formControl}
                />
              </Grid>
            </Grid>
          </Grid>
        </CippFormCondition>

        <Divider sx={{ my: 2 }} />

        {/* Defender Defaults Policy Section */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Show Defender Defaults Policy Options"
            name="showDefenderDefaults"
            formControl={formControl}
          />
        </Grid>

        <CippFormCondition
          formControl={formControl}
          field="showDefenderDefaults"
          compareType="is"
          compareValue={true}
        >
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">Defender Defaults Policy</Typography>
            <Typography variant="subtitle1">Select Defender policies to deploy</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="switch"
                  label="Allow Archive Scanning"
                  name="Policy.ScanArchives"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow behavior monitoring"
                  name="Policy.AllowBehavior"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow Cloud Protection"
                  name="Policy.AllowCloudProtection"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow e-mail scanning"
                  name="Policy.AllowEmailScanning"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow Full Scan on Network Drives"
                  name="Policy.AllowFullScanNetwork"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow Full Scan on Removable Drives"
                  name="Policy.AllowFullScanRemovable"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow Script Scanning"
                  name="Policy.AllowScriptScan"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow Intrusion Prevention System"
                  name="Policy.AllowIPS"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Enable Low CPU priority"
                  name="Policy.LowCPU"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="switch"
                  label="Allow scanning of downloaded files"
                  name="Policy.AllowDownloadable"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow Realtime monitoring"
                  name="Policy.AllowRealTime"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow scanning of mapped drives"
                  name="Policy.AllowNetwork"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Allow users to access UI"
                  name="Policy.AllowUI"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Enable Network Protection in Block Mode"
                  name="Policy.NetworkProtectionBlock"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Enable Network Protection in Audit Mode"
                  name="Policy.NetworkProtectionAudit"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Check Signatures before scan"
                  name="Policy.CheckSigs"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Disable Catchup Full Scan"
                  name="Policy.DisableCatchupFullScan"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Disable Catchup Quick Scan"
                  name="Policy.DisableCatchupQuickScan"
                  formControl={formControl}
                />
              </Grid>

              {/* Assign to Group */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1">Assign to Group</Typography>
                <CippFormComponent
                  type="radio"
                  label=""
                  name="Policy.AssignTo"
                  options={[
                    { label: "Do not assign", value: "none" },
                    { label: "Assign to all users", value: "allLicensedUsers" },
                    { label: "Assign to all devices", value: "AllDevices" },
                    { label: "Assign to all users and devices", value: "AllDevicesAndUsers" },
                  ]}
                  formControl={formControl}
                  validators={{ required: "Assignment must be selected" }}
                  row
                />
              </Grid>
            </Grid>
          </Grid>
        </CippFormCondition>

        <Divider sx={{ my: 2 }} />

        {/* ASR Section */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Show ASR Options"
            name="showASR"
            formControl={formControl}
          />
        </Grid>

        <CippFormCondition
          formControl={formControl}
          field="showASR"
          compareType="is"
          compareValue={true}
        >
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">ASR Rules</Typography>
            <Typography variant="subtitle1">Set Attack Surface Reduction Rules</Typography>
            <CippFormComponent
              type="radio"
              label=""
              name="ASR.Mode"
              options={[
                { label: "Block mode", value: "block" },
                { label: "Audit mode", value: "audit" },
                { label: "Warn mode", value: "warn" },
              ]}
              formControl={formControl}
              validators={{ required: "Mode must be selected" }}
              row
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="switch"
                  label="Block execution of potentially obfuscated scripts"
                  name="ASR.BlockObfuscatedScripts"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block Adobe Reader from creating child processes"
                  name="ASR.BlockAdobeChild"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block Win32 API calls from Office macros"
                  name="ASR.BlockWin32Macro"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block credential stealing from the Windows local security authority subsystem"
                  name="ASR.BlockCredentialStealing"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block process creations originating from PSExec and WMI commands"
                  name="ASR.BlockPSExec"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block persistence through WMI event subscription"
                  name="ASR.WMIPersistence"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block use of copied or impersonated system tools"
                  name="ASR.BlockSystemTools"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block Office applications from creating executable content"
                  name="ASR.BlockOfficeExes"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block Office applications from injecting code into other processes"
                  name="ASR.BlockOfficeApps"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block rebooting machine in Safe Mode"
                  name="ASR.BlockSafeMode"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="switch"
                  label="Block executable files from running unless they meet a prevalence, age, or trusted list criterion"
                  name="ASR.BlockYoungExe"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block JavaScript or VBScript from launching downloaded executable content"
                  name="ASR.blockJSVB"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block Webshell creation for Servers"
                  name="ASR.BlockWebshellForServers"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block Office communication application from creating child processes"
                  name="ASR.blockOfficeComChild"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block all Office applications from creating child processes"
                  name="ASR.blockOfficeChild"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block untrusted and unsigned processes that run from USB"
                  name="ASR.BlockUntrustedUSB"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Use advanced protection against ransomware"
                  name="ASR.EnableRansomwareVac"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block executable content from email client and webmail"
                  name="ASR.BlockExesMail"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Block abuse of exploited vulnerable signed drivers (Device)"
                  name="ASR.BlockUnsignedDrivers"
                  formControl={formControl}
                />
              </Grid>

              {/* Assign to Group */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1">Assign to Group</Typography>
                <CippFormComponent
                  type="radio"
                  label=""
                  name="ASR.AssignTo"
                  options={[
                    { label: "Do not assign", value: "none" },
                    { label: "Assign to all users", value: "allLicensedUsers" },
                    { label: "Assign to all devices", value: "AllDevices" },
                    { label: "Assign to all users and devices", value: "AllDevicesAndUsers" },
                  ]}
                  formControl={formControl}
                  validators={{ required: "Assignment must be selected" }}
                  row
                />
              </Grid>
            </Grid>
          </Grid>
        </CippFormCondition>

        {/* Remove the Review and Confirm section as per your request */}
      </Grid>
    </CippFormPage>
  );
};

DeployDefenderForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default DeployDefenderForm;
