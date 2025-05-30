import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { CippInfoBar } from "/src/components/CippCards/CippInfoBar";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog.jsx";
import { Alert, Typography, Stack, Tooltip, IconButton, SvgIcon, Button } from "@mui/material";
import { Grid } from "@mui/system";
import Link from "next/link";
import {
  AccessTime,
  CorporateFare,
  AlternateEmail,
  Language,
  Sync,
  RocketLaunch,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useSettings } from "/src/hooks/use-settings";
import { useDialog } from "/src/hooks/use-dialog";
import { ApiGetCall } from "/src/api/ApiCall";

const Page = () => {
  const pageTitle = "Quarantine Policies";
  const { currentTenant } = useSettings();
  
  const createDialog = useDialog();

  // Use ApiGetCall directly as a hook
  const GlobalQuarantinePolicy = ApiGetCall({
    url: "/api/ListQuarantinePolicy",
    data: { tenantFilter: currentTenant, type: "GlobalQuarantinePolicy" },
    queryKey: `GlobalQuarantinePolicy-${currentTenant}`,
  });

  // Get the policy data regardless of array or object
  const globalQuarantineData = Array.isArray(GlobalQuarantinePolicy.data)
    ? GlobalQuarantinePolicy.data[0]
    : GlobalQuarantinePolicy.data;

  const hasGlobalQuarantinePolicyData = !!globalQuarantineData;


  if (hasGlobalQuarantinePolicyData) {
    globalQuarantineData.EndUserSpamNotificationFrequency =
      globalQuarantineData?.EndUserSpamNotificationFrequency === "P1D"
        ? "Daily"
        : globalQuarantineData?.EndUserSpamNotificationFrequency === "P7D"
        ? "Weekly"
        : globalQuarantineData?.EndUserSpamNotificationFrequency === "PT4H"
        ? "4 hours"
        : globalQuarantineData?.EndUserSpamNotificationFrequency
  }

  const multiLanguagePropertyItems = hasGlobalQuarantinePolicyData
  ? (
      Array.isArray(globalQuarantineData?.MultiLanguageSetting) && globalQuarantineData.MultiLanguageSetting.length > 0
        ? globalQuarantineData.MultiLanguageSetting.map((language, idx) => ({
            language: language == "Default" ? "English_USA" 
              : language == "English" ? "English_GB"
              : language,
            senderDisplayName:
              globalQuarantineData.MultiLanguageSenderName[idx] &&
              globalQuarantineData.MultiLanguageSenderName[idx].trim() !== ""
                ? globalQuarantineData.MultiLanguageSenderName[idx]
                : "None",
            subject:
              globalQuarantineData.EsnCustomSubject[idx] &&
              globalQuarantineData.EsnCustomSubject[idx].trim() !== ""
                ? globalQuarantineData.EsnCustomSubject[idx]
                : "None",
            disclaimer:
              globalQuarantineData.MultiLanguageCustomDisclaimer[idx] &&
              globalQuarantineData.MultiLanguageCustomDisclaimer[idx].trim() !== ""
                ? globalQuarantineData.MultiLanguageCustomDisclaimer[idx]
                : "None",
          }))
        : [
            {
              language: "None",
              senderDisplayName: "None",
              subject: "None",
              disclaimer: "None",
            },
          ]
    )
  : [];

  const buttonCardActions = [
    <>
      <Button onClick={createDialog.handleOpen} startIcon={<Edit />}>
        Edit Settings
      </Button>
      <Tooltip title="Refresh Data">
          <IconButton
            className="MuiIconButton"
            disabled={
              GlobalQuarantinePolicy?.isLoading ||
              GlobalQuarantinePolicy?.isFetching
            }
            onClick={() => {
              GlobalQuarantinePolicy.refetch();
            }}
          >
            <SvgIcon
              fontSize="small"
              sx={{
                animation:
                  GlobalQuarantinePolicy?.isFetching
                    ? "spin 1s linear infinite"
                    : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            >
              <Sync />
            </SvgIcon>
          </IconButton>
      </Tooltip>
    </>
  ];

  // Actions to perform (Edit,Delete Policy)
  const actions = [
    {
      label: "Edit Policy",
      type: "POST",
      url: "/api/EditQuarantinePolicy?type=QuarantinePolicy",
      setDefaultValues: true,
      fields: [
        {
          type: "textField",
          name: "Name",
          label: "Policy Name",
          disabled: true,
        },
        {
          type: "autoComplete",
          name: "ReleaseActionPreference",
          label: "Select release action preference",
          multiple : false,
          creatable : false,
          options: [
            { label: "Release", value: "Release" },
            { label: "Request Release", value: "RequestRelease" },
          ],
        },
        {
          type: "switch",
          name: "Delete",
          label: "Delete",
        },
        {
          type: "switch",
          name: "Preview",
          label: "Preview",
        },        
        {
          type: "switch",
          name: "BlockSender",
          label: "Block Sender",
        },
        {
          type: "switch",
          name: "AllowSender",
          label: "Allow Sender",
        },
        {
          type: "switch",
          name: "QuarantineNotification",
          label: "Quarantine Notification",
        },
        {
          type: "switch",
          name: "IncludeMessagesFromBlockedSenderAddress",
          label: "Include Messages From Blocked Sender Address",
        },
      ],
      data: { Identity: "Guid", Action: "!Edit" },
      confirmText: "Update Quarantine Policy '[Name]'? Policy Name cannot be changed.",
      multiPost: false,
      icon: <Edit />,
      color: "info",
      condition: (row) => row.Guid != "00000000-0000-0000-0000-000000000000",
    },
    {
      label: "Delete Policy",
      type: "POST",
      icon: <Delete />,
      url: "/api/RemoveQuarantinePolicy",
      data: {
        Name: "Name",
        Identity: "Guid",
      },
      confirmText: (
        <>
          <Typography variant="body1">
            Are you sure you want to delete this policy?
          </Typography>
          <Typography variant="body2">
            <strong>Note:</strong> This will delete the Quarantine policy, even if it is currently in use.<br />
            Removing the Admin and User Access it applies to emails.
          </Typography>
          <Alert severity="warning">
            Confirm the Quarantine is not applied in any of the following policies:
            <ul style={{ paddingLeft: "15px" }}>
              <li>Anti-phishing</li>
              <li>Anti-spam</li>
              <li>Anti-malware</li>
              <li>Safe Attachments</li>
            </ul>
          </Alert>
        </>
      ),
      condition: (row) => row.Guid != "00000000-0000-0000-0000-000000000000",
    },
  ];

  // Off-canvas structure: displays extended details and includes actions (Enable/Disable Rule)
  const offCanvas = {
    extendedInfoFields: [
      "Id", // Policy Name/Id
      "Name", // Policy Name
      "EndUserQuarantinePermissions",
      "Guid", 
      "Builtin",
      "WhenCreated", // Creation Date
      "WhenChanged", // Last Modified Date
    ],
    actions: actions,
  };

  const filterList = [
    {
      filterName: "Custom Policies",
      value: [{ id: "Builtin", value: "No" }],
      type: "column",
    },
    {
      filterName: "Built-in Policies",
      value: [{ id: "Builtin", value: "Yes" }],
      type: "column",
    },
  ];


  const customLanguageOffcanvas =
    multiLanguagePropertyItems && multiLanguagePropertyItems.length > 0
      ? {
          offcanvas: {
            title: "Custom Language Settings",
            propertyItems: multiLanguagePropertyItems.map((item, idx) => ({
              label: "",
              value: (
                <CippButtonCard
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Language style={{ marginRight: "8px" }} />
                      {item.language}
                    </div>
                  }
                  cardSx={{ mb: 2 }}
                >
                  <Stack spacing={2}>
                    {Object.entries(item)
                      .filter(([key]) => key !== "language")
                      .map(([key, value]) => (
                        <Stack spacing={0.5} key={key}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Typography>
                          <Typography variant="body2">
                            {value}
                          </Typography>
                        </Stack>
                      ))}
                  </Stack>
                </CippButtonCard>
              ),
            })),
          }
        }
      : {};

    // Simplified columns for the table
  const simpleColumns = [
    "Name",
    "ReleaseActionPreference",
    "Delete",
    "Preview",
    "BlockSender",
    "AllowSender",
    "QuarantineNotification",
    "IncludeMessagesFromBlockedSenderAddress",
    "WhenCreated",
    "WhenChanged",
  ];



  // Prepare data for CippInfoBar as a const to clean up the code
  const infoBarData = [
    {
      icon: <AccessTime />,
      data: globalQuarantineData?.EndUserSpamNotificationFrequency ?? "n/a",
      name: "Notification Frequency",
    },
    {
      icon: <CorporateFare />,
      data: hasGlobalQuarantinePolicyData
        ? (globalQuarantineData?.OrganizationBrandingEnabled 
            ? "Enabled" 
            : "Disabled"
          ) 
        : "n/a",
      name: "Branding",
    },
    {
      icon: <AlternateEmail />,
      data: hasGlobalQuarantinePolicyData 
        ? (globalQuarantineData?.EndUserSpamNotificationCustomFromAddress
            ? globalQuarantineData?.EndUserSpamNotificationCustomFromAddress
            : "None") 
        : "n/a" ,
      name: "Custom Sender Address",
    },
    {
      icon: <Language />,
      toolTip: "More Info",
      data: hasGlobalQuarantinePolicyData
        ? (
            multiLanguagePropertyItems.length > 0
              ? multiLanguagePropertyItems.map(item => item.language).join(", ")
              : "None"
          )
        : "n/a",
      name: "Custom Language",
      ...customLanguageOffcanvas,
    },
  ];

  return (
    <>
      <Stack spacing={2} sx={{ p: 3, mt: 1 }}>
        <CippButtonCard
          component="card"
          title={`Global Quarantine Settings - ${currentTenant}`}
          cardActions={buttonCardActions}
        >
          <Grid container spacing={2}>
            <Grid size={12}>
              <CippInfoBar
                isFetching={GlobalQuarantinePolicy.isFetching}
                data={infoBarData}
              />
            </Grid>
          </Grid>
        </CippButtonCard> 
      </Stack> 
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListQuarantinePolicy"
        apiData={{ tenantFilter: currentTenant, type: "QuarantinePolicy" }}
        actions={actions}
        offCanvas={offCanvas}
        filters={filterList}
        simpleColumns={simpleColumns}
        cardButton={
        <>
          <Button
            component={Link}
            href="/email/spamfilter/list-quarantine-policies/add"
            startIcon={<RocketLaunch />}
          >
            Deploy Custom Policy
          </Button>
        </>
      }
      />
      <CippApiDialog
        title="Edit - Global Quarantine Settings"
        createDialog={createDialog}
        api={{
          type: "POST",
          url: "/api/EditQuarantinePolicy?type=GlobalQuarantinePolicy",
          setDefaultValues: true,
          data: {
            Name: "Name",
            Identity: "Guid",
          },
          relatedQueryKeys: [`GlobalQuarantinePolicy-${currentTenant}`],
          confirmText:
            "Are you sure you want to update Global Quarantine settings?",
        }}
        // row={globalQuarantineData}
        row={globalQuarantineData}
        setDefaultValues={true}
        fields={[
          {
            type: "autoComplete",
            name: "EndUserSpamNotificationFrequency",
            label: "Notification Frequency",
            multiple : false,
            creatable : false,
            required: true,
            options: [
              { label: "4 hours", value: "PT4H" },
              { label: "Daily", value: "P1D" },
              { label: "Weekly", value: "P7D" },
            ],
          },
          {
            type: "textField",
            name: "EndUserSpamNotificationCustomFromAddress",
            label: "Custom Sender Address (Optional)",
            placeholder: "Enter custom sender address",
            required: false,
          },
          {
            type: "switch",
            name: "OrganizationBrandingEnabled",
            label: "Organization Branding",
          },
        ]}
      />
    </>
  );
};

// Layout configuration: ensure page uses DashboardLayout
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
