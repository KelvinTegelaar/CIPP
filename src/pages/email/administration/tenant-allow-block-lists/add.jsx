import React from "react";
import { useEffect } from "react";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";

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

  useEffect(() => {
    const subscription = formControl.watch((value, { name }) => {
      // If NoExpiration is turned on, disable RemoveAfter
      if (name === "NoExpiration" && value.NoExpiration) {
        formControl.setValue("RemoveAfter", false);
      }
      
      // If RemoveAfter is turned on, disable NoExpiration
      if (name === "RemoveAfter" && value.RemoveAfter) {
        formControl.setValue("NoExpiration", false);
      }
      
      // If ListMethod is Block, disable RemoveAfter
      if (name === "listMethod" && value.listMethod?.value === "Block") {
        formControl.setValue("RemoveAfter", false);
      }
      
      // If listType is not Sender, Url, or FileHash, disable RemoveAfter
      if (name === "listType" && !["Sender", "Url", "FileHash"].includes(value.listType?.value)) {
        formControl.setValue("RemoveAfter", false);
      }

      // If listType is FileHash, set ListMethod to Block
      if (name === "listType" && value.listType?.value === "FileHash") {
        formControl.setValue("listMethod", { label: "Block", value: "Block" });
      }
      
      // Handle NoExpiration compatibility based on rules
      const listMethod = value.listMethod?.value;
      const listType = value.listType?.value;
      
      // Check if NoExpiration should be enabled
      const isNoExpirationCompatible = 
        listMethod === "Block" || 
        (listMethod === "Allow" && (listType === "Url" || listType === "IP"));
      
      // If current selection is incompatible with NoExpiration, reset it to false
      if ((name === "listMethod" || name === "listType") && 
          !isNoExpirationCompatible && value.NoExpiration) {
        formControl.setValue("NoExpiration", false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [formControl]);

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
        <Grid item xs={12} md={12}>
          <CippFormComponent
            type="textField"
            label="Entries"
            name="entries"
            formControl={formControl}
            validators={{ 
              required: "Entries field is required",
              validate: (value) => {
                if (!value) return true;
                
                const entries = value.split(/[,;]/).map(e => e.trim());
                const listType = formControl.watch("listType")?.value;
                
                if (listType === "FileHash") {
                  // SHA256 hash validation - 64 hex characters
                  for (const entry of entries) {
                    if (entry.length !== 64) 
                      return "File hash entries must be exactly 64 characters";
                    if (!/^[A-Fa-f0-9]{64}$/.test(entry)) 
                      return "File hash must contain only hexadecimal characters";
                  }
                } else if (listType === "IP") {
                  // IPv6 address validation (for IP list type - IPv6 only)
                  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;
                  const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/;
                  
                  for (const entry of entries) {
                    if (!ipv6Regex.test(entry) && !ipv6CidrRegex.test(entry)) 
                      return "Invalid IPv6 address format. Use colon-hexadecimal or CIDR notation";
                  }
                } else if (listType === "Url") {
                  // For URL list type - check length and validate any IP addresses
                  // IPv4 regex
                  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;
                  // IPv4 CIDR regex
                  const ipv4CidrRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\/([0-9]|[12][0-9]|3[0-2])$/;
                  // IPv6 regex (same as above)
                  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;
                  const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/;
                  
                  // Hostname regex (allowing wildcards * and ~)
                  const hostnameRegex = /^((\*|\~)?[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\*|\~)?$/;
                  
                  for (const entry of entries) {
                    if (entry.length > 250) 
                      return "URL entries must be 250 characters or less";
                    
                    // Skip validation for entries with wildcards (more complex patterns)
                    if (entry.includes('*') || entry.includes('~')) continue;
                    
                    // If it's not a hostname and not an IP, it might be invalid
                    if (!ipv4Regex.test(entry) && !ipv4CidrRegex.test(entry) && 
                        !ipv6Regex.test(entry) && !ipv6CidrRegex.test(entry) && 
                        !hostnameRegex.test(entry)) {
                      // Allow some flexibility for wildcard patterns
                      // But at least provide a warning for obviously invalid formats
                      if (!/[a-zA-Z0-9\.\-\*\~]/.test(entry)) {
                        return "Invalid URL format. Enter hostnames, IPv4, or IPv6 addresses";
                      }
                    }
                  }
                }
                
                return true;
              }
            }}
            helperText={
              formControl.watch("listType")?.value === "FileHash"
                ? "Enter SHA256 hash values separated by commas or semicolons (e.g., 768a813668695ef2483b2bde7cf5d1b2db0423a0d3e63e498f3ab6f2eb13ea3)"
                : formControl.watch("listType")?.value === "Url"
                ? "Enter URLs, IPv4, or IPv6 addresses with optional wildcards separated by commas or semicolons"
                : formControl.watch("listType")?.value === "Sender"
                ? "Enter domains or email addresses separated by commas or semicolons (e.g., contoso.com,user@example.com)"
                : formControl.watch("listType")?.value === "IP"
                ? "Enter IPv6 addresses only in colon-hexadecimal format or CIDR notation"
                : ""
            }
          />
        </Grid>
        {/* Notes & List Type */}
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="textField"
            label="Notes"
            name="notes"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
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
            disabled={
              formControl.watch("listType")?.value === "FileHash"
                ? true
                : false
            }
            helperText={
              formControl.watch("listType")?.value === "FileHash"
                ? "FileHash entries can only be Blocked"
                : "Choose whether to block or allow the entries"
            }
          />
        </Grid>

        {/* No Expiration */}
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="switch"
            label="No Expiration"
            name="NoExpiration"
            formControl={formControl}
            helperText={
              formControl.watch("listMethod")?.value === "Block"
                ? "Block entries will never expire"
                : "Available only for Block entries or specific Allow entries (URL/IP)"
            }
            disabled={
              formControl.watch("RemoveAfter") || 
              !(formControl.watch("listMethod")?.value === "Block" || 
                (formControl.watch("listMethod")?.value === "Allow" && 
                (formControl.watch("listType")?.value === "Url" || 
                  formControl.watch("listType")?.value === "IP")))
            }
          />
        </Grid>

        {/* Remove After */}
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="switch"
            label="Remove After 45 Days"
            name="RemoveAfter"
            formControl={formControl}
            helperText="If checked, allow entries will be removed after 45 days of last use"
            disabled={
              formControl.watch("NoExpiration") || 
              formControl.watch("listMethod")?.value !== "Allow" || 
              !["Sender", "FileHash", "Url"].includes(formControl.watch("listType")?.value)
            }
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

AddTenantAllowBlockList.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddTenantAllowBlockList;
