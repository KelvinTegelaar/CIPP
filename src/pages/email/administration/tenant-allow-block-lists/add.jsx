import { useEffect } from "react";
import "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";
import { getCippValidator } from "/src/utils/get-cipp-validator";

const AddTenantAllowBlockList = () => {
  const tenantDomain = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      entries: "",
      notes: "",
      listType: null,
      listMethod: null,
      NoExpiration: false,
      RemoveAfter: false,
    },
  });

  const noExpiration = useWatch({ control: formControl.control, name: "NoExpiration" });
  const removeAfter = useWatch({ control: formControl.control, name: "RemoveAfter" });
  const listMethod = useWatch({ control: formControl.control, name: "listMethod" });
  const listType = useWatch({ control: formControl.control, name: "listType" });

  const isListMethodBlock = listMethod?.value === "Block";
  const isListTypeFileHash = listType?.value === "FileHash";
  const isListTypeSenderUrlOrFileHash = ["Sender", "Url", "FileHash"].includes(listType?.value);
  const isNoExpirationCompatible = isListMethodBlock || 
    (listMethod?.value === "Allow" && (listType?.value === "Url" || listType?.value === "IP"));

  useEffect(() => {
    if (noExpiration) {
      formControl.setValue("RemoveAfter", false);
    }
    
    if (removeAfter) {
      formControl.setValue("NoExpiration", false);
    }
    
    if (isListMethodBlock) {
      formControl.setValue("RemoveAfter", false);
    }

    if (listType && !isListTypeSenderUrlOrFileHash) {
      formControl.setValue("RemoveAfter", false);
    }

    if (isListTypeFileHash) {
      formControl.setValue("listMethod", { label: "Block", value: "Block" });
    }

    if (listMethod || listType) {
      if (!isNoExpirationCompatible && noExpiration) {
        formControl.setValue("NoExpiration", false);
      }
    }
  }, [
    noExpiration, 
    removeAfter, 
    isListMethodBlock, 
    listType, 
    isListTypeSenderUrlOrFileHash,
    isListTypeFileHash,
    isNoExpirationCompatible,
    formControl
  ]);

  const validateEntries = (value) => {
    if (!value) return true;
    
    const entries = value.split(/[,;]/).map(e => e.trim());
    const currentListType = listType?.value;
    
    if (currentListType === "FileHash") {
      for (const entry of entries) {
        if (entry.length !== 64) 
          return "File hash entries must be exactly 64 characters";
        
        const hashResult = getCippValidator(entry, "sha256");
        if (hashResult !== true)
          return hashResult;
      }
    } else if (currentListType === "IP") {
      for (const entry of entries) {
        const ipv6Result = getCippValidator(entry, "ipv6");
        const ipv6CidrResult = getCippValidator(entry, "ipv6cidr");
        
        if (ipv6Result !== true && ipv6CidrResult !== true) 
          return "Invalid IPv6 address format. Use colon-hexadecimal or CIDR notation";
      }
    } else if (currentListType === "Url") {
      for (const entry of entries) {
        if (entry.length > 250) 
          return "URL entries must be 250 characters or less";
        
        // For entries with wildcards, use the improved wildcard validators
        if (entry.includes('*') || entry.includes('~')) {
          // Try both wildcard validators
          const wildcardUrlResult = getCippValidator(entry, "wildcardUrl");
          const wildcardDomainResult = getCippValidator(entry, "wildcardDomain");
          
          if (wildcardUrlResult !== true && wildcardDomainResult !== true) {
            // If basic pattern check fails too, give a more specific message
            if (!/^[a-zA-Z0-9\.\-\*\~\/]+$/.test(entry)) {
              return "Invalid wildcard pattern. Use only letters, numbers, dots, hyphens, slashes, and wildcards (* or ~)";
            }
            
            // If it has basic valid characters but doesn't match our patterns
            return "Invalid wildcard format. Common formats are *.domain.com or domain.*";
          }
          continue;
        }
        
        // For non-wildcard entries, use standard validators
        const ipv4Result = getCippValidator(entry, "ip");
        const ipv4CidrResult = getCippValidator(entry, "ipv4cidr");
        const ipv6Result = getCippValidator(entry, "ipv6");
        const ipv6CidrResult = getCippValidator(entry, "ipv6cidr");
        const hostnameResult = getCippValidator(entry, "hostname");
        const urlResult = getCippValidator(entry, "url");
        
        // If none of the validators pass
        if (ipv4Result !== true && 
            ipv4CidrResult !== true && 
            ipv6Result !== true && 
            ipv6CidrResult !== true && 
            hostnameResult !== true && 
            urlResult !== true) {
          return "Invalid URL format. Enter hostnames, IPv4, or IPv6 addresses";
        }
      }
    } else if (currentListType === "Sender") {
      for (const entry of entries) {
        // Check for wildcards first
        if (entry.includes('*') || entry.includes('~')) {
          const wildcardDomainResult = getCippValidator(entry, "wildcardDomain");
          
          if (wildcardDomainResult !== true) {
            return "Invalid sender wildcard pattern. Common format is *.domain.com";
          }
          continue;
        }
        
        // For non-wildcard entries, use senderEntry validator
        const senderResult = getCippValidator(entry, "senderEntry");
        
        if (senderResult !== true) {
          return senderResult;
        }
      }
    }
    
    return true;
  };

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="TenantAllowBlockList"
      title="Add Tenant Allow/Block List"
      backButtonTitle="Overview"
      postUrl="/api/AddTenantAllowBlockList"
      customDataformatter={(values) => {
        return {
          tenantID: tenantDomain,
          entries: values.entries,
          listType: values.listType?.value,
          notes: values.notes,
          listMethod: values.listMethod?.value,
          NoExpiration: values.NoExpiration,
          RemoveAfter: values.RemoveAfter
        };
      }}
    >
      <Grid container spacing={2}>
        {/* Entries */}
        <Grid item size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Entries"
            name="entries"
            formControl={formControl}
            validators={{ 
              required: "Entries field is required",
              validate: validateEntries
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
        {/* Notes & List Type */}
        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Notes"
            name="notes"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={{ md: 4, xs: 12 }}>
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

        {/* List Method */}
        <Grid item size={{ md: 4, xs: 12 }}>
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

        {/* No Expiration */}
        <Grid item size={{ md: 4, xs: 12 }}>
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
              !(isListMethodBlock || 
                (listMethod?.value === "Allow" && 
                (listType?.value === "Url" || 
                  listType?.value === "IP")))
            }
          />
        </Grid>

        {/* Remove After */}
        <Grid item size={{ md: 4, xs: 12 }}>
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
      </Grid>
    </CippFormPage>
  );
};

AddTenantAllowBlockList.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddTenantAllowBlockList;
