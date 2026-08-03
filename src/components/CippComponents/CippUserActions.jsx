import { useEffect } from "react";
import { EyeIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Archive,
  Clear,
  CloudDone,
  Edit,
  Email,
  ForwardToInbox,
  GroupAdd,
  LockClock,
  LockPerson,
  LockReset,
  LocationOn,
  SupervisorAccount,
  MeetingRoom,
  Password,
  PersonOff,
  PhonelinkLock,
  PhonelinkSetup,
  Refresh,
  Shortcut,
  SwapHoriz,
  EditAttributes,
  CloudSync,
  Block,
  ContentCopy,
  SettingsEthernet,
  AdminPanelSettings,
} from "@mui/icons-material";
import { getCippLicenseTranslation } from "../../utils/get-cipp-license-translation";
import { useSettings } from "../../hooks/use-settings.js";
import { usePermissions } from "../../hooks/use-permissions";
import { Tooltip, Box, Divider, Typography, Alert, Skeleton, Link, IconButton } from "@mui/material";
import CippFormComponent from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import { useWatch } from "react-hook-form";
import { ApiGetCall } from "../../api/ApiCall";
import gdaproles from "../../data/GDAPRoles.json";

// Separate component for Manage Licenses form to avoid hook issues
const ManageLicensesForm = ({ formControl, tenant }) => {
  const licenseOperation = useWatch({
    control: formControl.control,
    name: "LicenseOperation",
  });

  const removeAllLicenses = useWatch({
    control: formControl.control,
    name: "RemoveAllLicenses",
  });

  const replaceAllLicenses = useWatch({
    control: formControl.control,
    name: "ReplaceAllLicenses",
  });

  // Handle both string values and object values with .value property
  const licenseOpValue = licenseOperation?.value || licenseOperation;
  
  const isRemoveOperation = licenseOpValue === "Remove";
  const isReplaceOperation = licenseOpValue === "Replace";
  const showLicensesToRemove = isRemoveOperation && !removeAllLicenses;
  const showLicensesToReplace = isReplaceOperation && !replaceAllLicenses;

  // Clear fields when operation changes to prevent stale data submission
  useEffect(() => {
    if (licenseOpValue) {
      // Clear all license-related fields when switching operations
      if (licenseOpValue === "Add") {
        // Clear Remove/Replace specific fields
        formControl.setValue("RemoveAllLicenses", false);
        formControl.setValue("ReplaceAllLicenses", false);
        formControl.setValue("LicensesToRemove", []);
        formControl.setValue("LicensesToReplace", []);
      } else if (licenseOpValue === "Remove") {
        // Clear Add/Replace specific fields
        formControl.setValue("ReplaceAllLicenses", false);
        formControl.setValue("LicensesToReplace", []);
        formControl.setValue("Licenses", []);
      } else if (licenseOpValue === "Replace") {
        // Clear Remove specific fields
        formControl.setValue("RemoveAllLicenses", false);
        formControl.setValue("LicensesToRemove", []);
      }
    }
  }, [licenseOpValue, formControl]);

  // Clear LicensesToReplace when ReplaceAllLicenses is toggled
  useEffect(() => {
    if (isReplaceOperation && replaceAllLicenses) {
      formControl.setValue("LicensesToReplace", []);
    }
  }, [replaceAllLicenses, isReplaceOperation, formControl]);

  return (
    <>
      <CippFormComponent
        type="radio"
        name="LicenseOperation"
        label="License Operation"
        formControl={formControl}
        options={[
          { label: "Add Licenses", value: "Add" },
          { label: "Remove Licenses", value: "Remove" },
          { label: "Replace Licenses", value: "Replace" },
        ]}
        validators={{ required: "Please select a license operation" }}
      />

      {isRemoveOperation && (
        <CippFormComponent
          type="switch"
          name="RemoveAllLicenses"
          label="Remove All Existing Licenses"
          formControl={formControl}
        />
      )}

      {isReplaceOperation && (
        <CippFormComponent
          type="switch"
          name="ReplaceAllLicenses"
          label="Replace All Existing Licenses"
          formControl={formControl}
        />
      )}

      {showLicensesToRemove && (
        <CippFormComponent
          type="autoComplete"
          name="LicensesToRemove"
          label="Select Licenses to Remove"
          multiple={true}
          creatable={false}
          formControl={formControl}
          validators={{ required: "Please select at least one license to remove" }}
          api={{
            url: "/api/ListLicenses",
            labelField: (option) => option.displayName || option.skuPartNumber,
            valueField: "skuId",
            data: { IncludeExcluded: true },
            queryKey: `ListLicenses-${tenant}`,
            showRefresh: true,
          }}
        />
      )}

      {showLicensesToReplace && (
        <CippFormComponent
          type="autoComplete"
          name="LicensesToReplace"
          label="Select Licenses to Replace"
          multiple={true}
          creatable={false}
          formControl={formControl}
          validators={{ required: "Please select at least one license to replace" }}
          api={{
            url: "/api/ListLicenses",
            labelField: (option) => option.displayName || option.skuPartNumber,
            valueField: "skuId",
            data: { IncludeExcluded: true },
            queryKey: `ListLicenses-${tenant}`,
            showRefresh: true,
          }}
        />
      )}

      {(licenseOpValue === "Add" || isReplaceOperation) && (
        <CippFormComponent
          type="autoComplete"
          name="Licenses"
          label={isReplaceOperation ? "Select New Licenses" : "Select Licenses"}
          multiple={true}
          creatable={false}
          formControl={formControl}
          validators={{ required: "Please select at least one license" }}
          api={{
            url: "/api/ListLicenses",
            labelField: (option) =>
              `${option.displayName || option.skuPartNumber} (${
                option.availableUnits || 0
              } available)`,
            valueField: "skuId",
            data: { IncludeExcluded: true },
            queryKey: `ListLicenses-Available-${tenant}`,
            showRefresh: true,
          }}
        />
      )}
    </>
  );
};

// Separate component for the Temporary Access Pass form so it can query the tenant's
// TAP policy to validate the allowed lifetime range and enforce one-time use when forced
const TemporaryAccessPassForm = ({ formControl, row }) => {
  const tenantFilter = useSettings().currentTenant;
  const rowData = Array.isArray(row) ? row[0] : row;
  const tenant = tenantFilter === "AllTenants" && rowData?.Tenant ? rowData.Tenant : tenantFilter;

  const tapPolicy = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint:
        "policies/authenticationMethodsPolicy/authenticationMethodConfigurations/TemporaryAccessPass",
      tenantFilter: tenant,
    },
    queryKey: `TAPPolicy-${tenant}`,
  });

  const policy = tapPolicy.data?.Results?.[0];
  const oneTimeUseForced = policy?.isUsableOnce === true;

  useEffect(() => {
    if (!policy) return;
    // Deferred a tick: CippApiDialog resets the form in a mount effect that runs after
    // this child effect, so an immediate setValue would be wiped when the query is cached
    const timer = setTimeout(() => {
      formControl.setValue("isUsableOnce", oneTimeUseForced);
    }, 0);
    return () => clearTimeout(timer);
  }, [tapPolicy.dataUpdatedAt]);

  if (tapPolicy.isLoading) {
    return (
      <>
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={40} />
      </>
    );
  }

  return (
    <>
      {tapPolicy.isSuccess && policy?.state !== "enabled" && (
        <Alert
          severity="error"
          action={
            <Tooltip title="Re-check the TAP policy state">
              <span>
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => tapPolicy.refetch()}
                  disabled={tapPolicy.isFetching}
                >
                  <Refresh fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          }
        >
          Temporary Access Pass is not enabled in this tenant's authentication method policy and
          creating a TAP will fail. Enable it on the{" "}
          <Link href="/tenant/administration/authentication-methods" target="_blank">
            Authentication Methods
          </Link>{" "}
          page first, then re-check.
        </Alert>
      )}
      <CippFormComponent
        type="number"
        name="lifetimeInMinutes"
        label="Lifetime (Minutes)"
        formControl={formControl}
        placeholder="Leave blank for default"
        helperText={
          policy
            ? `Tenant policy allows ${policy.minimumLifetimeInMinutes ?? 10} to ${
                policy.maximumLifetimeInMinutes ?? 480
              } minutes (default ${policy.defaultLifetimeInMinutes ?? 60})`
            : undefined
        }
        validators={
          policy
            ? {
                min: {
                  value: policy.minimumLifetimeInMinutes ?? 10,
                  message: `Minimum lifetime is ${policy.minimumLifetimeInMinutes ?? 10} minutes`,
                },
                max: {
                  value: policy.maximumLifetimeInMinutes ?? 480,
                  message: `Maximum lifetime is ${policy.maximumLifetimeInMinutes ?? 480} minutes`,
                },
              }
            : undefined
        }
      />
      <Tooltip
        title={oneTimeUseForced ? "One-time use is enforced by the tenant TAP policy" : ""}
        placement="bottom"
      >
        <Box>
          <CippFormComponent
            type="switch"
            name="isUsableOnce"
            label={
              oneTimeUseForced ? "One-time use only (enforced by policy)" : "One-time use only"
            }
            formControl={formControl}
            disabled={oneTimeUseForced}
          />
        </Box>
      </Tooltip>
      <CippFormComponent
        type="datePicker"
        name="startDateTime"
        label="Start Date/Time (leave blank for immediate)"
        dateTimeType="datetime"
        formControl={formControl}
      />
    </>
  );
};

// Separate component for Out of Office form to avoid hook issues
const OutOfOfficeForm = ({ formControl }) => {
  // Send the browser's IANA timezone so the API can display local times in the response
  useEffect(() => {
    try {
      formControl.setValue('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
    } catch {
      // Fallback: leave timezone unset; API will display UTC
    }
  }, [])

  // Watch the Auto Reply State value
  const autoReplyState = useWatch({
    control: formControl.control,
    name: "AutoReplyState",
  });

  // Calculate if date fields should be disabled
  const areDateFieldsDisabled = autoReplyState?.value !== "Scheduled";

  return (
    <>
      <CippFormComponent
        type="autoComplete"
        name="AutoReplyState"
        label="Auto Reply State"
        multiple={false}
        formControl={formControl}
        creatable={false}
        options={[
          { label: "Enabled", value: "Enabled" },
          { label: "Disabled", value: "Disabled" },
          { label: "Scheduled", value: "Scheduled" },
        ]}
      />

      <Tooltip
        title={
          areDateFieldsDisabled
            ? "Scheduling is only available when Auto Reply State is set to Scheduled"
            : ""
        }
        placement="bottom"
      >
        <Box>
          <CippFormComponent
            type="datePicker"
            label="Start Date/Time"
            name="StartTime"
            formControl={formControl}
            disabled={areDateFieldsDisabled}
          />
        </Box>
      </Tooltip>

      <Tooltip
        title={
          areDateFieldsDisabled
            ? "Scheduling is only available when Auto Reply State is set to Scheduled"
            : ""
        }
        placement="bottom"
      >
        <Box>
          <CippFormComponent
            type="datePicker"
            label="End Date/Time"
            name="EndTime"
            formControl={formControl}
            disabled={areDateFieldsDisabled}
          />
        </Box>
      </Tooltip>

      <CippFormComponent
        type="richText"
        label="Internal Message"
        name="InternalMessage"
        formControl={formControl}
        multiline
        rows={4}
      />

      <CippFormComponent
        type="richText"
        label="External Message"
        name="ExternalMessage"
        formControl={formControl}
        multiline
        rows={4}
      />

      {!areDateFieldsDisabled && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2">Calendar Options</Typography>

          <CippFormComponent
            type="switch"
            name="CreateOOFEvent"
            label="Block my calendar for this period"
            formControl={formControl}
          />
          <CippFormCondition
            formControl={formControl}
            field="CreateOOFEvent"
            compareType="is"
            compareValue={true}
          >
            <CippFormComponent
              type="textField"
              name="OOFEventSubject"
              label="Calendar Event Subject"
              formControl={formControl}
            />
          </CippFormCondition>

          <CippFormComponent
            type="switch"
            name="AutoDeclineFutureRequestsWhenOOF"
            label="Automatically decline new invitations during this period"
            formControl={formControl}
          />

          <CippFormComponent
            type="switch"
            name="DeclineEventsForScheduledOOF"
            label="Decline and cancel my meetings during this period"
            formControl={formControl}
          />
          <CippFormCondition
            formControl={formControl}
            field="DeclineEventsForScheduledOOF"
            compareType="is"
            compareValue={true}
          >
            <CippFormComponent
              type="richText"
              name="DeclineMeetingMessage"
              label="Decline Message"
              formControl={formControl}
              multiline
              rows={3}
            />
          </CippFormCondition>
        </>
      )}
    </>
  );
};

const ManageAdminRolesForm = ({ formControl }) => {
  const assignmentType = useWatch({
    control: formControl.control,
    name: "assignmentType",
  });

  const assignmentTypeValue = assignmentType?.value || assignmentType;
  const isTemporary = assignmentTypeValue === "Temporary";

  return (
    <>
      <CippFormComponent
        type="autoComplete"
        name="roles"
        label="Select Admin Roles"
        multiple={true}
        creatable={false}
        formControl={formControl}
        options={gdaproles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
        validators={{ required: "Please select at least one role" }}
      />
      <CippFormComponent
        type="radio"
        name="assignmentType"
        label="Assignment Type"
        formControl={formControl}
        options={[
          { label: "Permanent", value: "Permanent" },
          { label: "Temporary", value: "Temporary" },
        ]}
        validators={{ required: "Please select an assignment type" }}
      />
      {isTemporary && (
        <CippFormComponent
          type="datePicker"
          name="expiration"
          label="Expiration Date/Time"
          dateTimeType="datetime"
          formControl={formControl}
          validators={{ required: "Please select an expiration date" }}
        />
      )}
      <CippFormComponent
        type="textField"
        name="reason"
        label="Reason (optional)"
        formControl={formControl}
      />
    </>
  );
};

export const useCippUserActions = () => {
  const tenant = useSettings().currentTenant;

  const { checkPermissions } = usePermissions();
  const canWriteUser = checkPermissions(["Identity.User.ReadWrite"]);
  const canWriteMailbox = checkPermissions(["Exchange.Mailbox.ReadWrite"]);
  const canWriteGroup = checkPermissions(["Identity.Group.ReadWrite"]);
  const canWriteRole = checkPermissions(["Identity.Role.ReadWrite"]);

  return [
    // ====== VIEW ACTIONS ======
    {
      label: "View User",
      link: "/identity/administration/users/user?userId=[id]",
      multiPost: false,
      icon: <EyeIcon />,
      color: "success",
      category: "view",
    },
    {
      label: "Create Template from User",
      type: "POST",
      icon: <ContentCopy />,
      url: "/api/AddUserDefaults",
      fields: [
        {
          type: "textField",
          name: "templateName",
          label: "Template Name",
          validators: { required: "Please enter a template name" },
        },
        {
          type: "switch",
          name: "defaultForTenant",
          label: "Default for Tenant",
        },
      ],
      customDataformatter: (row, action, formData) => {
        const user = Array.isArray(row) ? row[0] : row;
        const licenses =
          user.assignedLicenses?.map((l) => ({
            label: getCippLicenseTranslation([l])?.[0] || l.skuId,
            value: l.skuId,
          })) || [];
        const primDomain = user.userPrincipalName?.split("@")[1] || "";
        return {
          tenantFilter: tenant,
          templateName: formData.templateName,
          defaultForTenant: formData.defaultForTenant || false,
          sourceUserId: user.id,
          primDomain: primDomain,
          jobTitle: user.jobTitle || "",
          department: user.department || "",
          streetAddress: user.streetAddress || "",
          city: user.city || "",
          state: user.state || "",
          postalCode: user.postalCode || "",
          country: user.country || "",
          companyName: user.companyName || "",
          mobilePhone: user.mobilePhone || "",
          "businessPhones[0]": user.businessPhones?.[0] || "",
          usageLocation: user.usageLocation || "",
          licenses: licenses,
        };
      },
      confirmText:
        "Create a new user default template based on [displayName]'s properties (job title, department, location, licenses, and group memberships).",
      multiPost: false,
      condition: () => canWriteUser,
      category: "edit",
    },
    {
      label: "Research Compromised Account",
      type: "GET",
      icon: <MagnifyingGlassIcon />,
      link: "/identity/administration/users/user/bec?userId=[id]",
      confirmText:
        "Are you sure you want to research if [userPrincipalName] is a compromised account?",
      multiPost: false,
      category: "security",
    },

    // ====== EDIT ACTIONS ======
    {
      label: "Edit User",
      link: "/identity/administration/users/user/edit?userId=[id]",
      icon: <Edit />,
      color: "success",
      target: "_self",
      condition: () => canWriteUser,
      category: "edit",
      quickAction: true,
    },
    {
      label: "Edit Properties",
      icon: <EditAttributes />,
      multiPost: true,
      noConfirm: true,
      customFunction: (users, action, formData) => {
        const userData = Array.isArray(users) ? users : [users];
        sessionStorage.setItem("patchWizardUsers", JSON.stringify(userData));
        import("next/router")
          .then(({ default: router }) => {
            router.push("/identity/administration/users/patch-wizard");
          })
          .catch(() => {
            window.location.href = "/identity/administration/users/patch-wizard";
          });
      },
      condition: () => canWriteUser,
      category: "edit",
    },
    {
      label: "Update Address & Company",
      type: "POST",
      icon: <LocationOn />,
      url: "/api/PatchUser",
      multiPost: true,
      fields: [
        { type: "textField", name: "streetAddress", label: "Street Address" },
        { type: "textField", name: "city", label: "City" },
        { type: "textField", name: "state", label: "State" },
        { type: "textField", name: "postalCode", label: "Postal Code" },
        { type: "textField", name: "country", label: "Country" },
        { type: "textField", name: "companyName", label: "Company Name" },
        { type: "textField", name: "department", label: "Department" },
      ],
      customDataformatter: (users, action, formData) => {
        const userList = Array.isArray(users) ? users : [users];
        const patchFields = [
          "streetAddress",
          "city",
          "state",
          "postalCode",
          "country",
          "companyName",
          "department",
        ];
        const cleanForm = patchFields.reduce((acc, key) => {
          const value = formData?.[key];
          if (value !== undefined && value !== null && String(value).trim() !== "") {
            acc[key] = value;
          }
          return acc;
        }, {});

        if (Object.keys(cleanForm).length === 0) {
          return [];
        }

        return userList.map((user) => ({
          id: user.id,
          tenantFilter: user.Tenant || tenant,
          ...cleanForm,
        }));
      },
      confirmText: "Update address/company details for selected users?",
      condition: () => canWriteUser,
      category: "edit",
    },
    {
      label: "Set Manager",
      type: "POST",
      icon: <SupervisorAccount />,
      url: "/api/ExecSetManager",
      data: {
        userPrincipalName: "userPrincipalName",
      },
      fields: [
        {
          type: "autoComplete",
          name: "managerId",
          label: "Select Manager",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListGraphRequest",
            data: {
              Endpoint: "users",
              $select: "id,displayName,userPrincipalName",
              $top: 999,
              $count: true,
            },
            queryKey: "ListUsersAutoComplete",
            dataKey: "Results",
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "id",
            showRefresh: true,
          },
        },
      ],
      confirmText: "Set manager for selected users?",
      multiPost: true,
      condition: () => canWriteUser,
      category: "edit",
    },
    {
      label: "Change Domain",
      type: "POST",
      icon: <SwapHoriz />,
      url: "/api/ExecDomainMigration",
      multiPost: true,
      fields: [
        {
          type: "autoComplete",
          name: "targetDomain",
          label: "Target Domain",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListGraphRequest",
            data: {
              Endpoint: "domains",
            },
            queryKey: "ListDomainsAutoComplete",
            dataKey: "Results",
            labelField: (domain) => domain.id,
            valueField: "id",
            addedField: {
              isVerified: "isVerified",
              isInitial: "isInitial",
            },
          },
        },
      ],
      customDataformatter: (users, action, formData) => {
        const userList = Array.isArray(users) ? users : [users];
        const targetDomain = formData?.targetDomain?.value || formData?.targetDomain;
        if (!targetDomain) return [];

        const userPayload = userList.map((user) => ({
          id: user.id,
          userPrincipalName: user.userPrincipalName,
          mail: user.mail,
          displayName: user.displayName,
        }));

        return {
          tenantFilter: userList[0]?.Tenant || tenant,
          targetDomain: targetDomain,
          users: userPayload,
          groups: [],
        };
      },
      confirmText:
        "This will change the primary email and sign-in for the selected users to the new domain. Existing email addresses will be kept as aliases to preserve mail delivery.",
      condition: () => canWriteUser,
      category: "edit",
    },
    {
      label: "Convert Mailbox",
      type: "POST",
      icon: <Email />,
      url: "/api/ExecConvertMailbox",
      data: { ID: "userPrincipalName" },
      fields: [
        {
          type: "radio",
          name: "MailboxType",
          label: "Mailbox Type",
          options: [
            { label: "User Mailbox", value: "Regular" },
            { label: "Shared Mailbox", value: "Shared" },
            { label: "Room Mailbox", value: "Room" },
            { label: "Equipment Mailbox", value: "Equipment" },
          ],
          validators: { required: "Please select a mailbox type" },
        },
      ],
      confirmText: "Pick the type of mailbox you want to convert [userPrincipalName] to:",
      multiPost: false,
      condition: () => canWriteMailbox,
      category: "edit",
    },
    {
      label: "Manage Licenses",
      type: "POST",
      url: "/api/ExecBulkLicense",
      icon: <CloudDone />,
      data: { userIds: "id" },
      multiPost: true,
      allowResubmit: true,
      relatedQueryKeys: ["ListUsers*", `Licenses-${tenant}`],
      children: ({ formHook: formControl }) => (
        <ManageLicensesForm formControl={formControl} tenant={tenant} />
      ),
      confirmText: "Are you sure you want to manage licenses for the selected users?",
      condition: () => canWriteUser,
      category: "edit",
      quickAction: true,
    },

    // ====== SECURITY ACTIONS ======
    {
      label: "Reset Password",
      type: "POST",
      icon: <LockReset />,
      url: "/api/ExecResetPass",
      data: {
        ID: "userPrincipalName",
        displayName: "displayName",
      },
      fields: [
        {
          type: "password",
          name: "password",
          label: "Password (leave blank to auto-generate)",
        },
        {
          type: "switch",
          name: "MustChange",
          label: "Must Change Password at Next Logon",
          helperText:
            "Not supported for directory-synced (on-premises AD) accounts. Those resets go through password writeback, which always requires a change at next logon.",
        },
      ],
      confirmText: "Are you sure you want to reset the password for the selected user(s)?",
      multiPost: true,
      condition: () => canWriteUser,
      category: "security",
      quickAction: true,
    },
    {
      label: "Expire Password",
      type: "POST",
      icon: <Password />,
      url: "/api/ExecExpirePassword",
      data: {
        ID: "userPrincipalName",
        displayName: "displayName",
      },
      confirmText:
        "This will mark the password as expired for [userPrincipalName]. The user will be required to change their password on their next sign-in. Their current password remains valid until they log in. Use 'Revoke all user sessions' to force immediate re-authentication.",
      multiPost: false,
      condition: () => canWriteUser,
      category: "security",
    },
    {
      label: "Create Temporary Access Pass",
      type: "POST",
      icon: <Password />,
      url: "/api/ExecCreateTAP",
      data: { ID: "userPrincipalName" },
      children: ({ formHook, row }) => <TemporaryAccessPassForm formControl={formHook} row={row} />,
      confirmText:
        "Are you sure you want to create a Temporary Access Pass for [userPrincipalName]?",
      multiPost: false,
      allowResubmit: true,
      condition: () => canWriteUser,
      category: "security",
      quickAction: true,
    },
    {
      label: "Re-require MFA registration",
      type: "POST",
      icon: <PhonelinkSetup />,
      url: "/api/ExecResetMFA",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to reset MFA for [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteUser,
      category: "security",
      quickAction: true,
    },
    {
      label: "Send MFA Push",
      type: "POST",
      icon: <PhonelinkLock />,
      url: "/api/ExecSendPush",
      data: { UserEmail: "userPrincipalName" },
      confirmText: "Are you sure you want to send an MFA request to [userPrincipalName]?",
      multiPost: false,
      category: "security",
    },
    {
      label: "Set Per-User MFA",
      type: "POST",
      icon: <LockPerson />,
      url: "/api/ExecPerUserMFA",
      data: { userId: "id", userPrincipalName: "userPrincipalName" },
      fields: [
        {
          type: "autoComplete",
          name: "State",
          label: "State",
          options: [
            { label: "Enforced", value: "Enforced" },
            { label: "Enabled", value: "Enabled" },
            { label: "Disabled", value: "Disabled" },
          ],
          multiple: false,
          creatable: false,
          validators: { required: "Please select an MFA state" },
        },
      ],
      confirmText: "Are you sure you want to set per-user MFA for these users?",
      multiPost: false,
      condition: () => canWriteUser,
      category: "security",
      quickAction: true,
    },
    {
      label: "Set Password Expiration",
      type: "POST",
      icon: <LockClock />,
      url: "/api/ExecPasswordNeverExpires",
      data: { userId: "id", userPrincipalName: "userPrincipalName" },
      fields: [
        {
          type: "radio",
          name: "PasswordPolicy",
          label: "Password Policy",
          options: [
            { label: "Disable Password Expiration", value: "DisablePasswordExpiration" },
            { label: "Enable Password Expiration", value: "None" },
          ],
          validators: { required: "Please select a password policy" },
        },
      ],
      confirmText:
        "Set Password Never Expires state for [userPrincipalName]. If the password of the user is older than the set expiration date of the organization, the user will be prompted to change their password at their next login.",
      multiPost: false,
      condition: () => canWriteUser,
      category: "security",
    },
    {
      label: "Revoke all user sessions",
      type: "POST",
      icon: <PersonOff />,
      url: "/api/ExecRevokeSessions",
      data: { ID: "id", Username: "userPrincipalName" },
      confirmText: "Are you sure you want to revoke all sessions for [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteUser,
      category: "security",
      quickAction: true,
    },
    {
      label: "Set Sign In State",
      type: "POST",
      icon: <LockPerson />,
      url: "/api/ExecDisableUser",
      data: { ID: "id" },
      // Pre-select the current sign-in state; leave unselected when the
      // selected rows have mixed states. String values match what a radio
      // click produces (e.target.value is always a string).
      defaultvalues: (row) => {
        const states = [
          ...new Set((Array.isArray(row) ? row : [row]).map((r) => r?.accountEnabled)),
        ];
        return states.length === 1 && typeof states[0] === "boolean"
          ? { Enable: String(states[0]) }
          : {};
      },
      fields: [
        {
          type: "radio",
          name: "Enable",
          label: "Sign In State",
          options: [
            { label: "Enabled", value: true },
            { label: "Disabled", value: false },
          ],
          validators: {
            required: "Please select a sign-in state",
            validate: (value, formValues, row) => {
              const states = [
                ...new Set((Array.isArray(row) ? row : [row]).map((r) => r?.accountEnabled)),
              ];
              if (
                states.length === 1 &&
                typeof states[0] === "boolean" &&
                String(value) === String(states[0])
              ) {
                return "Sign-in state is unchanged";
              }
              return true;
            },
          },
        },
      ],
      confirmText: "Are you sure you want to set the sign-in state for [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteUser,
      category: "security",
    },
    {
      label: "Disable IMAP & POP (Recommended)",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecSetCASMailbox",
      data: { 
        user: "userPrincipalName",
        protocols: "!IMAP,POP",
        enable: false,
      },
      confirmText: "Are you sure you want to disable IMAP and POP for [userPrincipalName]? This is recommended for security as these legacy protocols may bypass MFA protections.",
      multiPost: false,
      condition: () => canWriteMailbox,
      category: "security",
    },
    {
      label: "Disable IMAP Protocol",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecSetCASMailbox",
      data: { 
        user: "userPrincipalName",
        protocol: "!IMAP",
        enable: false,
      },
      confirmText: "Are you sure you want to disable IMAP for [userPrincipalName]? IMAP is a legacy protocol that may bypass MFA protections.",
      multiPost: false,
      condition: () => canWriteMailbox,
      category: "security",
    },
    {
      label: "Disable POP Protocol",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecSetCASMailbox",
      data: { 
        user: "userPrincipalName",
        protocol: "!POP",
        enable: false,
      },
      confirmText: "Are you sure you want to disable POP for [userPrincipalName]? POP is a legacy protocol that may bypass MFA protections.",
      multiPost: false,
      condition: () => canWriteMailbox,
      category: "security",
    },
    {
      label: "Manage Mailbox Protocols",
      type: "POST",
      icon: <SettingsEthernet />,
      url: "/api/ExecSetCASMailbox",
      data: { 
        user: "userPrincipalName",
      },
      fields: [
        {
          type: "autoComplete",
          name: "protocol",
          label: "Select Protocol",
          multiple: false,
          creatable: false,
          options: [
            { label: "IMAP (Legacy - Not Recommended)", value: "IMAP" },
            { label: "POP (Legacy - Not Recommended)", value: "POP" },
            { label: "SMTP Auth (Basic Auth - Not Recommended)", value: "SMTP" },
            { label: "EWS (Exchange Web Services)", value: "EWS" },
            { label: "MAPI (Outlook Desktop)", value: "MAPI" },
            { label: "OWA (Outlook on the Web)", value: "OWA" },
            { label: "ActiveSync (Mobile Devices)", value: "ActiveSync" },
          ],
          validators: { required: "Please select a protocol" },
        },
        {
          type: "radio",
          name: "enable",
          label: "Protocol State",
          options: [
            { label: "Enable Protocol", value: true },
            { label: "Disable Protocol", value: false },
          ],
          validators: { required: "Please select a state" },
        },
      ],
      confirmText: "Are you sure you want to change the protocol settings for [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteMailbox,
      category: "security",
    },

    // ====== MANAGE ACTIONS ======
    {
      label: "Enable Online Archive",
      type: "POST",
      icon: <Archive />,
      url: "/api/ExecEnableArchive",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to enable the online archive for [userPrincipalName]?",
      multiPost: false,
      condition: (row) => canWriteMailbox,
      category: "manage",
    },
    {
      label: "Set Out of Office",
      type: "POST",
      icon: <MeetingRoom />,
      url: "/api/ExecSetOoO",
      data: {
        userId: "userPrincipalName",
        tenantFilter: "Tenant",
      },
      children: ({ formHook: formControl }) => <OutOfOfficeForm formControl={formControl} />,
      confirmText: "Are you sure you want to set the out of office?",
      multiPost: false,
      condition: () => canWriteMailbox,
      category: "manage",
    },
    {
      label: "Add to Group",
      type: "POST",
      icon: <GroupAdd />,
      url: "/api/EditGroup",
      customDataformatter: (row, action, formData) => {
        let addMember = [];
        if (Array.isArray(row)) {
          row
            .map((r) => ({
              label: r.displayName,
              value: r.id,
              addedFields: {
                id: r.id,
                userPrincipalName: r.userPrincipalName,
                displayName: r.displayName,
              },
            }))
            .forEach((r) => addMember.push(r));
        } else {
          addMember.push({
            label: row.displayName,
            value: row.id,
            addedFields: {
              id: row.id,
              userPrincipalName: row.userPrincipalName,
              displayName: row.displayName,
            },
          });
        }
        const selectedGroups = Array.isArray(formData.groupId)
          ? formData.groupId
          : [formData.groupId];
        return selectedGroups.map((group) => ({
          addMember: addMember,
          tenantFilter: tenant,
          groupId: group,
        }));
      },
      fields: [
        {
          type: "autoComplete",
          name: "groupId",
          label: "Select groups to add the user to",
          multiple: true,
          creatable: false,
          validators: { required: "Please select at least one group" },
          api: {
            url: "/api/ListGroups",
            labelField: (option) =>
              option?.calculatedGroupType
                ? `${option.displayName} (${option.calculatedGroupType})`
                : (option?.displayName ?? ""),
            valueField: "id",
            addedField: {
              groupType: "groupType",
              groupName: "displayName",
            },
            queryKey: `groups-${tenant}`,
            showRefresh: true,
          },
        },
      ],
      confirmText: "Are you sure you want to add [userPrincipalName] to the selected groups?",
      multiPost: false,
      allowResubmit: true,
      condition: () => canWriteGroup,
      category: "manage",
      quickAction: true,
    },
    {
      label: "Manage Admin Roles",
      type: "POST",
      url: "/api/ExecRoleAssignment",
      icon: <AdminPanelSettings />,
      data: {
        userId: "id",
        userPrincipalName: "userPrincipalName",
        displayName: "displayName",
      },
      multiPost: true,
      relatedQueryKeys: ["ListRoles", "ListUsers*"],
      children: ({ formHook: formControl }) => (
        <ManageAdminRolesForm formControl={formControl} />
      ),
      customDataformatter: (users, action, formData) => {
        const userList = Array.isArray(users) ? users : [users];
        const assignmentType = formData?.assignmentType?.value || formData?.assignmentType;
        const actionType = assignmentType === "Temporary" ? "AddTemporary" : "Add";
        return userList.map((user) => ({
          userId: user.id,
          userPrincipalName: user.userPrincipalName,
          displayName: user.displayName,
          tenantFilter: user.Tenant || undefined,
          roles: formData.roles,
          action: actionType,
          expiration: formData.expiration
            ? Math.floor(new Date(formData.expiration).getTime() / 1000)
            : undefined,
          reason: formData.reason || undefined,
        }));
      },
      confirmText: "Are you sure you want to manage admin roles for the selected user(s)?",
      condition: () => canWriteRole,
      category: "manage",
      quickAction: true,
    },
    {
      label: "Disable Email Forwarding",
      type: "POST",
      url: "/api/ExecEmailForward",
      icon: <ForwardToInbox />,
      data: {
        username: "userPrincipalName",
        userid: "userPrincipalName",
        ForwardOption: "!disabled",
      },
      confirmText: "Are you sure you want to disable forwarding of [userPrincipalName]'s emails?",
      multiPost: false,
      condition: () => canWriteMailbox,
      category: "manage",
    },
    {
      label: "Pre-provision OneDrive",
      type: "POST",
      icon: <CloudDone />,
      url: "/api/ExecOneDriveProvision",
      data: { UserPrincipalName: "userPrincipalName" },
      confirmText: "Are you sure you want to pre-provision OneDrive for [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteUser,
      category: "manage",
    },
    {
      label: "Add OneDrive Shortcut",
      type: "POST",
      icon: <Shortcut />,
      url: "/api/ExecOneDriveShortCut",
      data: {
        username: "userPrincipalName",
        userid: "id",
      },
      fields: [
        {
          type: "autoComplete",
          name: "siteUrl",
          label: "Select a Site",
          multiple: false,
          creatable: true,
          validators: { required: "Please select or enter a SharePoint site URL" },
          api: {
            url: "/api/ListSites",
            data: { type: "SharePointSiteUsage", URLOnly: true },
            labelField: "webUrl",
            valueField: "webUrl",
            queryKey: `sharepointSites-${tenant}`,
          },
        },
      ],
      confirmText: "Select a SharePoint site to create a shortcut for:",
      multiPost: false,
      condition: () => canWriteUser,
      category: "manage",
    },
    {
      label: "Clear Immutable ID",
      type: "POST",
      icon: <Clear />,
      url: "/api/ExecClrImmId",
      data: {
        ID: "id",
      },
      confirmText: "Are you sure you want to clear the Immutable ID for [userPrincipalName]?",
      multiPost: false,
      condition: (row) => !row?.onPremisesSyncEnabled && row?.onPremisesImmutableId && canWriteUser,
      category: "manage",
    },
    {
      label: "Set Source of Authority",
      type: "POST",
      url: "/api/ExecSetCloudManaged",
      icon: <CloudSync />,
      data: {
        ID: "id",
        displayName: "displayName",
        type: "!User",
      },
      // Pre-select the current source of authority (onPremisesSyncEnabled: true means
      // on-premises managed; null/false means cloud managed); leave unselected when
      // the selected rows have mixed states
      defaultvalues: (row) => {
        const states = [
          ...new Set(
            (Array.isArray(row) ? row : [row]).map((r) => r?.onPremisesSyncEnabled === true),
          ),
        ];
        return states.length === 1 ? { isCloudManaged: String(!states[0]) } : {};
      },
      fields: [
        {
          type: "radio",
          name: "isCloudManaged",
          label: "Source of Authority",
          options: [
            { label: "Cloud Managed", value: true },
            { label: "On-Premises Managed", value: false },
          ],
          validators: {
            required: "Please select a source of authority",
            validate: (value, formValues, row) => {
              const states = [
                ...new Set(
                  (Array.isArray(row) ? row : [row]).map((r) => r?.onPremisesSyncEnabled === true),
                ),
              ];
              if (states.length === 1 && String(value) === String(!states[0])) {
                return "Source of authority is unchanged";
              }
              return true;
            },
          },
        },
      ],
      confirmText:
        "Are you sure you want to change the source of authority for [userPrincipalName]? Setting it to On-Premises Managed will take until the next sync cycle to show the change.",
      multiPost: false,
      // Only meaningful for users that are on-premises managed (convert to cloud) or
      // were synced at some point (revert to on-premises); hide for cloud-native users
      condition: (row) =>
        row?.onPremisesSyncEnabled === true ||
        !!(
          row?.onPremisesImmutableId ||
          row?.OnPremisesImmutableId ||
          row?.onPremisesLastSyncDateTime ||
          row?.onPremisesDistinguishedName
        ),
      category: "manage",
    },
    {
      label: "Reprocess License Assignments",
      type: "POST",
      icon: <CloudDone />,
      url: "/api/ExecReprocessUserLicenses",
      data: { ID: "id", userPrincipalName: "userPrincipalName" },
      confirmText:
        "Are you sure you want to reprocess license assignments for [userPrincipalName]?",
      multiPost: false,
      condition: (row) => canWriteUser,
      category: "manage",
    },

    // ====== DANGER ACTIONS ======
    {
      label: "Delete User",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveUser",
      data: { ID: "id", userPrincipalName: "userPrincipalName" },
      confirmText: "Are you sure you want to delete [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteUser,
      category: "danger",
    },
  ];
};

// Legacy wrapper function for backward compatibility - but this should not be used
// Instead, components should use the useCippUserActions hook
export const CippUserActions = () => {
  console.warn("CippUserActions() function is deprecated. Use useCippUserActions() hook instead.");
  return useCippUserActions();
};

export default CippUserActions;
