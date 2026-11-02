import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { CippIcons } from "../../utils/icon-registry";
import { useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippPropertyList } from "../CippComponents/CippPropertyList";
import GDAPRoles from "../../data/GDAPRoles";
import cippDefaults from "../../data/CIPPDefaultGDAPRoles";
import {
  GLOBAL_ADMIN_ROLE_ID,
  buildGdapRoleOptions,
  gdapPreviewStatus,
  gdapSelectionRoleId,
  resolveGdapSelections,
  selectGdapDefaultOptions,
} from "../../utils/gdap-role-options";

export const CippAddEditGdapRoleTemplate = (props) => {
  const { formControl, availableRoles, extraOptions, mixedSuffixes } = props;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const selectedRoles = useWatch({ control: formControl.control, name: "roleMappings" });
  const customSuffix = useWatch({ control: formControl.control, name: "customSuffix" });
  const mappings = availableRoles?.data;

  // The suffix decides which group each role targets, so both the option list and its
  // mapped/unmapped headings have to be rebuilt when it changes.
  const roleOptions = useMemo(() => {
    const options = buildGdapRoleOptions(GDAPRoles, mappings, customSuffix);
    const known = new Set(options.map((option) => option.value));
    return [...options, ...(extraOptions ?? []).filter((option) => !known.has(option.value))];
  }, [mappings, customSuffix, extraOptions]);

  const resolved = useMemo(
    () => resolveGdapSelections(selectedRoles, mappings, customSuffix),
    [selectedRoles, mappings, customSuffix]
  );

  const handleDefaults = () => {
    formControl.setValue("roleMappings", selectGdapDefaultOptions(roleOptions, cippDefaults), {
      shouldDirty: true,
    });
    formControl.trigger();
  };

  const globalAdminSelected = (selectedRoles ?? []).some(
    (option) => gdapSelectionRoleId(option) === GLOBAL_ADMIN_ROLE_ID
  );

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Alert severity="info">
        <Typography variant="subtitle">
          A role template is the set of admin roles a GDAP invite grants. Pick the roles you need -
          CIPP maps each one to a security group in your partner tenant, creating the group if it
          does not exist yet. Add your technicians to those groups to give them the access.
        </Typography>
      </Alert>
      <Alert severity="warning">
        <b>Certain roles may not be compatible with GDAP</b>. See the{" "}
        <Link href="https://learn.microsoft.com/en-us/partner-center/customers/gdap-least-privileged-roles-by-task">
          Microsoft Documentation
        </Link>{" "}
        on GDAP Role Guidance.
      </Alert>
      {mixedSuffixes && (
        <Alert severity="info">
          This template mixes group naming, so the roles a suffix cannot reproduce were loaded as
          fixed groups. They keep the group they already use.
        </Alert>
      )}

      <Box>
        <CippFormComponent
          formControl={formControl}
          name="templateId"
          label="Template Name"
          type="textField"
          required={true}
        />
      </Box>

      <Box>
        <Button
          onClick={handleDefaults}
          startIcon={
            <SvgIcon fontSize="small">
              <CippIcons.ShieldCheckIcon />
            </SvgIcon>
          }
        >
          Add CIPP Default Roles
        </Button>
      </Box>

      <Box>
        <CippFormComponent
          formControl={formControl}
          name="roleMappings"
          label="Admin Roles"
          type="autoComplete"
          isFetching={availableRoles?.isFetching}
          options={roleOptions}
          groupBy={(option) => option.group}
          multiple={true}
          creatable={false}
          required={true}
          validators={{
            validate: (value) => {
              if (!value || value.length === 0) {
                return "Please select at least one admin role";
              }
              return true;
            },
          }}
        />
        {customSuffix && !advancedOpen && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Suffix: {customSuffix}
          </Typography>
        )}
      </Box>

      {globalAdminSelected && (
        <Alert severity="warning">
          The Global Administrator role is a highly privileged role that should be used with
          caution. GDAP Relationships with this role will not be eligible for auto-extend.
        </Alert>
      )}

      {resolved.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Group mappings
          </Typography>
          <CippPropertyList
            align="horizontal"
            showDivider={false}
            propertyItems={resolved.map((item) => {
              const status = gdapPreviewStatus(item);
              return {
                label: item.option.label,
                value: (
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: "wrap", alignItems: "center" }}
                  >
                    <span>{item.groupName}</span>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={status.color}
                      label={status.label}
                    />
                  </Stack>
                ),
              };
            })}
          />
        </Box>
      )}

      <Accordion
        variant="outlined"
        expanded={advancedOpen}
        onChange={(event, expanded) => setAdvancedOpen(expanded)}
      >
        <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>Advanced</AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Alert severity="info">
              The suffix changes which group each selected role uses: `M365 GDAP RoleName - Suffix`.
              Existing groups with that name are reused, missing ones are created. Use it to keep
              separate groups per team.
            </Alert>
            <CippFormComponent
              formControl={formControl}
              name="customSuffix"
              label="Custom Suffix (optional)"
              type="textField"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};
