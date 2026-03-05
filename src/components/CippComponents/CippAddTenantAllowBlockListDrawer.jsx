import { useEffect, useState } from "react";
import { Button, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { PlaylistAdd } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";
import { getCippValidator } from "../../utils/get-cipp-validator";

const defaultValues = {
  tenantID: [],
  entries: "",
  notes: "",
  listType: null,
  listMethod: null,
  NoExpiration: false,
  RemoveAfter: false,
};

export const CippAddTenantAllowBlockListDrawer = ({
  buttonText = "Add Entry",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const formControl = useForm({
    mode: "onChange",
    defaultValues,
  });

  const { isValid } = useFormState({ control: formControl.control });

  const noExpiration = useWatch({ control: formControl.control, name: "NoExpiration" });
  const removeAfter = useWatch({ control: formControl.control, name: "RemoveAfter" });
  const listMethod = useWatch({ control: formControl.control, name: "listMethod" });
  const listType = useWatch({ control: formControl.control, name: "listType" });

  const isListMethodBlock = listMethod?.value === "Block";
  const isListTypeFileHash = listType?.value === "FileHash";
  const isListTypeSenderUrlOrFileHash = ["Sender", "Url", "FileHash"].includes(listType?.value);
  const isNoExpirationCompatible =
    isListMethodBlock || (listMethod?.value === "Allow" && ["Url", "IP"].includes(listType?.value));

  const addEntry = ApiPostCall({});

  useEffect(() => {
    if (noExpiration && formControl.getValues("RemoveAfter")) {
      formControl.setValue("RemoveAfter", false, { shouldValidate: true });
    }

    if (removeAfter && formControl.getValues("NoExpiration")) {
      formControl.setValue("NoExpiration", false, { shouldValidate: true });
    }

    if (isListMethodBlock && formControl.getValues("RemoveAfter")) {
      formControl.setValue("RemoveAfter", false, { shouldValidate: true });
    }

    if (listType && !isListTypeSenderUrlOrFileHash && formControl.getValues("RemoveAfter")) {
      formControl.setValue("RemoveAfter", false, { shouldValidate: true });
    }

    if (isListTypeFileHash && listMethod?.value !== "Block") {
      formControl.setValue(
        "listMethod",
        { label: "Block", value: "Block" },
        { shouldValidate: true },
      );
    }

    if ((listMethod || listType) && noExpiration && !isNoExpirationCompatible) {
      formControl.setValue("NoExpiration", false, { shouldValidate: true });
    }
  }, [
    noExpiration,
    removeAfter,
    isListMethodBlock,
    listType,
    isListTypeSenderUrlOrFileHash,
    isListTypeFileHash,
    isNoExpirationCompatible,
    listMethod,
    formControl,
  ]);

  const validateEntries = (value) => {
    if (!value) return true;

    const entries = value
      .split(/[,;]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    const currentListType = listType?.value;

    if (currentListType === "FileHash") {
      for (const entry of entries) {
        if (entry.length !== 64) return "File hash entries must be exactly 64 characters";

        const hashResult = getCippValidator(entry, "sha256");
        if (hashResult !== true) return hashResult;
      }
      return true;
    }

    if (currentListType === "IP") {
      for (const entry of entries) {
        const ipv6Result = getCippValidator(entry, "ipv6");
        const ipv6CidrResult = getCippValidator(entry, "ipv6cidr");

        if (ipv6Result !== true && ipv6CidrResult !== true) {
          return "Invalid IPv6 address format. Use colon-hexadecimal or CIDR notation";
        }
      }
      return true;
    }

    if (currentListType === "Url") {
      for (const entry of entries) {
        if (entry.length > 250) {
          return "URL entries must be 250 characters or less";
        }

        if (entry.includes("*") || entry.includes("~")) {
          const wildcardUrlResult = getCippValidator(entry, "wildcardUrl");
          const wildcardDomainResult = getCippValidator(entry, "wildcardDomain");

          if (wildcardUrlResult === true || wildcardDomainResult === true) {
            continue;
          }

          if (!/^[a-zA-Z0-9.\-*~\/]+$/.test(entry)) {
            return "Invalid wildcard pattern. Use only letters, numbers, dots, hyphens, slashes, and wildcards (* or ~)";
          }

          return "Invalid wildcard format. Common formats are *.domain.com or domain.*";
        }

        const ipv4Result = getCippValidator(entry, "ip");
        const ipv4CidrResult = getCippValidator(entry, "ipv4cidr");
        const ipv6Result = getCippValidator(entry, "ipv6");
        const ipv6CidrResult = getCippValidator(entry, "ipv6cidr");
        const hostnameResult = getCippValidator(entry, "hostname");
        const urlResult = getCippValidator(entry, "url");

        if (
          ipv4Result !== true &&
          ipv4CidrResult !== true &&
          ipv6Result !== true &&
          ipv6CidrResult !== true &&
          hostnameResult !== true &&
          urlResult !== true
        ) {
          return "Invalid URL format. Enter hostnames, IPv4, or IPv6 addresses";
        }
      }
      return true;
    }

    if (currentListType === "Sender") {
      for (const entry of entries) {
        if (entry.includes("*") || entry.includes("~")) {
          const wildcardDomainResult = getCippValidator(entry, "wildcardDomain");

          if (wildcardDomainResult !== true) {
            return "Invalid sender wildcard pattern. Common format is *.domain.com";
          }
          continue;
        }

        const senderResult = getCippValidator(entry, "senderEntry");
        if (senderResult !== true) {
          return senderResult;
        }
      }
      return true;
    }

    return true;
  };

  const handleSubmit = formControl.handleSubmit((values) => {
    const payload = {
      tenantID: values.tenantID,
      entries: values.entries,
      listType: values.listType?.value,
      notes: values.notes,
      listMethod: values.listMethod?.value,
      NoExpiration: values.NoExpiration,
      RemoveAfter: values.RemoveAfter,
    };

    addEntry.mutate({
      url: "/api/AddTenantAllowBlockList",
      data: payload,
    });
  });

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset(defaultValues);
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<PlaylistAdd />}
      >
        {buttonText}
      </PermissionButton>

      <CippOffCanvas
        title="Add Tenant Allow/Block List Entry"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={addEntry.isLoading || !isValid}
            >
              {addEntry.isLoading ? "Adding..." : addEntry.isSuccess ? "Add Another" : "Add Entry"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CippFormTenantSelector
              formControl={formControl}
              label="Select Tenants"
              name="tenantID"
              type="multiple"
              preselectedEnabled={true}
              allTenants={true}
              validators={{ required: "At least one tenant must be selected" }}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Entries"
              name="entries"
              formControl={formControl}
              validators={{
                required: "Entries field is required",
                validate: validateEntries,
              }}
              helperText={
                listType?.value === "FileHash"
                  ? "Enter SHA256 hash values separated by commas or semicolons (e.g., 768a813668695ef2483b2bde7cf5d1b2db0423a0d3e63e498f3ab6f2eb13ea3e)"
                  : listType?.value === "Url"
                    ? "Enter URLs, IPv4, or IPv6 addresses with optional wildcards separated by commas or semicolons"
                    : listType?.value === "Sender"
                      ? "Enter domains or email addresses separated by commas or semicolons (e.g., contoso.com,user@example.com)"
                      : listType?.value === "IP"
                        ? "Enter IPv6 addresses only in colon-hexadecimal format or CIDR notation"
                        : ""
              }
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Notes"
              name="notes"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="List Type"
              name="listType"
              formControl={formControl}
              multiple={false}
              creatable={false}
              options={[
                { label: "Sender", value: "Sender" },
                { label: "Url/IPv4", value: "Url" },
                { label: "FileHash", value: "FileHash" },
                { label: "IPv6", value: "IP" },
              ]}
              validators={{ required: "Please choose a List Type." }}
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Block or Allow Entry"
              name="listMethod"
              formControl={formControl}
              multiple={false}
              creatable={false}
              options={[
                { label: "Block", value: "Block" },
                { label: "Allow", value: "Allow" },
              ]}
              validators={{ required: "Please select Block or Allow." }}
              disabled={isListTypeFileHash}
              helperText={
                isListTypeFileHash
                  ? "FileHash entries can only be Blocked"
                  : "Choose whether to block or allow the entries"
              }
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="No Expiration"
              name="NoExpiration"
              formControl={formControl}
              helperText={
                isListMethodBlock
                  ? "Block entries will never expire"
                  : "Available only for Block entries or specific Allow entries (URL/IP)"
              }
              disabled={
                removeAfter ||
                !(
                  isListMethodBlock ||
                  (listMethod?.value === "Allow" && ["Url", "IP"].includes(listType?.value))
                )
              }
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Remove After 45 Days"
              name="RemoveAfter"
              formControl={formControl}
              helperText="If checked, allow entries will be removed after 45 days of last use"
              disabled={
                noExpiration ||
                listMethod?.value !== "Allow" ||
                !["Sender", "FileHash", "Url"].includes(listType?.value)
              }
            />
          </Grid>

          <CippApiResults apiObject={addEntry} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};

export default CippAddTenantAllowBlockListDrawer;
