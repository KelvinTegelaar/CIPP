import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent.jsx";
import { Box } from "@mui/material";
import { Check, Block, Settings, Public } from "@mui/icons-material";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useSettings } from "../../../../hooks/use-settings.js";

const Page = () => {
  const pageTitle = "Auth Methods";
  const tenant = useSettings().currentTenant;
  const apiUrl = "/api/ListGraphRequest";

  // Columns configuration based on provided structure
  const simpleColumns = ["id", "state", "includeTargets", "excludeTargets"];

  // Tri-state dropdown shared by several Microsoft feature settings
  const tristateOptions = [
    { label: "Default", value: "default" },
    { label: "Enabled", value: "enabled" },
    { label: "Disabled", value: "disabled" },
  ];

  // Group picker reused by "Deploy to Custom Group" and the Email exclude-groups field
  const groupFieldApi = {
    url: "/api/ListGraphRequest",
    dataKey: "Results",
    queryKey: `ListAuthenticationPolicyGroups-${tenant}`,
    labelField: (group) => (group.id ? `${group.displayName} (${group.id})` : group.displayName),
    valueField: "id",
    addedField: {
      description: "description",
    },
    data: {
      Endpoint: "groups",
      manualPagination: true,
      $select: "id,displayName,description",
      $orderby: "displayName",
      $top: 999,
      $count: true,
    },
  };

  // Coerce a number field (registered as a string) to a Number, dropping empties
  const num = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));

  // Match a method row by id, case-insensitively (Graph casing varies)
  const isId = (row, id) => row?.id?.toLowerCase() === id.toLowerCase();

  // Methods that expose configurable sub-settings (others only support enable/disable + targeting)
  const configurableMethods = [
    "TemporaryAccessPass",
    "MicrosoftAuthenticator",
    "Email",
    "QRCodePin",
    "Fido2",
    "Voice",
    "SMS",
  ];

  // Per-method field definitions for the "Configure" action. Keyed by method id so the
  // right set can be looked up directly from the row, instead of relying on dialog-level
  // per-field conditions. rowDefaultPath is page-local metadata (used by defaultvalues
  // below) and is stripped before the fields reach CippFormComponent.
  const methodFieldDefs = {
    TemporaryAccessPass: [
      {
        type: "switch",
        name: "TAPisUsableOnce",
        label: "One-time use only",
        rowDefaultPath: "isUsableOnce",
      },
      {
        type: "number",
        name: "TAPMinimumLifetime",
        label: "Minimum lifetime (minutes)",
        rowDefaultPath: "minimumLifetimeInMinutes",
      },
      {
        type: "number",
        name: "TAPMaximumLifetime",
        label: "Maximum lifetime (minutes)",
        rowDefaultPath: "maximumLifetimeInMinutes",
      },
      {
        type: "number",
        name: "TAPDefaultLifeTime",
        label: "Default lifetime (minutes)",
        rowDefaultPath: "defaultLifetimeInMinutes",
      },
      {
        type: "number",
        name: "TAPDefaultLength",
        label: "Default length (characters)",
        rowDefaultPath: "defaultLength",
      },
    ],
    MicrosoftAuthenticator: [
      {
        type: "switch",
        name: "MicrosoftAuthenticatorSoftwareOathEnabled",
        label: "Allow software OATH tokens",
        rowDefaultPath: "isSoftwareOathEnabled",
      },
      {
        type: "select",
        name: "MicrosoftAuthenticatorDisplayAppInfo",
        label: "Show application name in push and passwordless notifications",
        creatable: false,
        options: tristateOptions,
        rowDefaultPath: "featureSettings.displayAppInformationRequiredState.state",
      },
      {
        type: "select",
        name: "MicrosoftAuthenticatorDisplayLocation",
        label: "Show geographic location in push and passwordless notifications",
        creatable: false,
        options: tristateOptions,
        rowDefaultPath: "featureSettings.displayLocationInformationRequiredState.state",
      },
      {
        type: "select",
        name: "MicrosoftAuthenticatorCompanionApp",
        label: "Companion app allowed state",
        creatable: false,
        options: tristateOptions,
        rowDefaultPath: "featureSettings.companionAppAllowedState.state",
      },
    ],
    Email: [
      {
        type: "select",
        name: "EmailAllowExternalIdToUseEmailOtp",
        label: "Allow external users to use Email OTP",
        creatable: false,
        options: tristateOptions,
        rowDefaultPath: "allowExternalIdToUseEmailOtp",
      },
      {
        type: "autoComplete",
        name: "EmailExcludeGroupIds",
        label: "Exclude group(s)",
        multiple: true,
        creatable: false,
        rowDefaultPath: "excludeTargets",
        api: groupFieldApi,
      },
    ],
    QRCodePin: [
      {
        type: "number",
        name: "QRCodeLifetimeInDays",
        label: "Standard QR code lifetime (days, 1-395)",
        rowDefaultPath: "standardQRCodeLifetimeInDays",
      },
      {
        type: "number",
        name: "QRCodePinLength",
        label: "PIN length (8-20)",
        rowDefaultPath: "pinLength",
      },
    ],
    Fido2: [
      {
        type: "switch",
        name: "FIDO2AttestationEnforced",
        label: "Enforce attestation",
        rowDefaultPath: "isAttestationEnforced",
      },
      {
        type: "switch",
        name: "FIDO2SelfServiceRegistration",
        label: "Allow self-service registration",
        rowDefaultPath: "isSelfServiceRegistrationAllowed",
      },
    ],
    Voice: [
      {
        type: "switch",
        name: "VoiceIsOfficePhoneAllowed",
        label: "Allow office phone registration",
        rowDefaultPath: "isOfficePhoneAllowed",
      },
    ],
    // SMS (isUsableForSignIn lives on each include-target)
    SMS: [
      {
        type: "switch",
        name: "SmsIsUsableForSignIn",
        label: "Use for sign-in",
        rowDefaultPath: "includeTargets.0.isUsableForSignIn",
      },
    ],
  };

  // Look up the field set for whichever configurable method this row is
  const getMethodFields = (row) => {
    const methodId = Object.keys(methodFieldDefs).find((id) => isId(row, id));
    return methodId ? methodFieldDefs[methodId] : [];
  };

  const getNested = (obj, path) =>
    path
      .split(".")
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

  // Build the POST body for the selected method by coercing each visible field by its type.
  // Field names match the backend parameter names, so methodFieldDefs is the single source of truth.
  const buildConfigBody = (row, formData) => {
    const body = {
      tenantFilter: tenant === "AllTenants" && row?.Tenant ? row.Tenant : tenant,
      id: row?.id,
      state: row?.state,
    };
    getMethodFields(row).forEach((field) => {
      const value = formData?.[field.name];
      if (field.type === "switch") {
        body[field.name] = !!value;
      } else if (field.type === "number") {
        body[field.name] = num(value);
      } else if (field.type === "autoComplete") {
        body[field.name] = Array.isArray(value)
          ? value.map((item) => item.value).filter(Boolean)
          : [];
      } else {
        body[field.name] = value; // select / scalar — undefined is dropped by JSON
      }
    });
    return body;
  };

  const actions = [
    {
      label: "Enable Policy",
      type: "POST",
      icon: <Check />,
      url: "/api/SetAuthMethod",
      data: { state: "!enabled", id: "id" },
      confirmText: "Are you sure you want to enable this policy?",
      multiPost: false,
    },
    {
      label: "Disable Policy",
      type: "POST",
      icon: <Block />,
      url: "/api/SetAuthMethod",
      data: { state: "!disabled", id: "id" },
      confirmText: "Are you sure you want to disable this policy?",
      multiPost: false,
    },
    {
      label: "Deploy to Custom Group",
      type: "POST",
      icon: <UserGroupIcon />,
      url: "/api/SetAuthMethod",
      confirmText: 'Select one or more groups for "[id]".',
      fields: [
        {
          type: "autoComplete",
          name: "groupTargets",
          label: "Group(s)",
          multiple: true,
          creatable: false,
          allowResubmit: true,
          validators: { required: "Please select at least one group" },
          api: groupFieldApi,
        },
      ],
      customDataformatter: (row, action, formData) => {
        const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : [];
        return {
          tenantFilter: tenant === "AllTenants" && row?.Tenant ? row.Tenant : tenant,
          state: row?.state,
          id: row?.id,
          GroupIds: selectedGroups.map((group) => group.value).filter(Boolean),
        };
      },
      multiPost: false,
    },
    {
      label: "Assign to All Users",
      type: "POST",
      icon: <Public />,
      url: "/api/SetAuthMethod",
      hideBulk: true,
      confirmText: 'Are you sure you want to scope "[id]" to all users?',
      customDataformatter: (row) => ({
        tenantFilter: tenant === "AllTenants" && row?.Tenant ? row.Tenant : tenant,
        state: row?.state,
        id: row?.id,
        GroupIds: ["all_users"],
      }),
      multiPost: false,
    },
    {
      label: "Configure",
      type: "POST",
      icon: <Settings />,
      url: "/api/SetAuthMethod",
      hideBulk: true,
      condition: (row) => row?.state === "enabled" && configurableMethods.some((m) => isId(row, m)),
      confirmText: "Configure authentication method settings.",
      // Computed straight from the row via CippApiDialog's existing `defaultvalues` function
      // prop — no dialog-level default-value handling needed for this action.
      defaultvalues: (row) => {
        const out = {};
        getMethodFields(row).forEach(({ name, type, rowDefaultPath }) => {
          const val = getNested(row, rowDefaultPath);
          if (type === "autoComplete") {
            out[name] = (Array.isArray(val) ? val : []).map((v) => ({
              label: v?.id ?? v,
              value: v?.id ?? v,
            }));
          } else if (type === "select") {
            out[name] = tristateOptions.find((o) => o.value === val) ?? tristateOptions[0];
          } else {
            out[name] = val;
          }
        });
        return out;
      },
      // Rendered via CippApiDialog's existing `children` render-prop instead of `fields`, so
      // the per-method field set can be picked by plain JS off `row` without any dialog changes.
      children: ({ formHook, row }) => (
        <>
          {getMethodFields(row).map(({ rowDefaultPath, ...fieldProps }, i) => (
            <Box key={i} sx={{ width: "100%" }}>
              <CippFormComponent formControl={formHook} row={row} {...fieldProps} />
            </Box>
          ))}
        </>
      ),
      customDataformatter: (row, action, formData) => buildConfigBody(row, formData),
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["id", "displayName", "state", "includeTargets", "excludeTargets"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={{
        Endpoint: "authenticationMethodsPolicy",
      }}
      apiDataKey="Results.0.authenticationMethodConfigurations"
      simpleColumns={simpleColumns}
      offCanvas={offCanvas}
      actions={actions}
      dynamicColumns={false}
    />
  );
};

// Adding the layout for the dashboard
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
