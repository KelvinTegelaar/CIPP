import React, { useMemo, useCallback, useEffect } from "react";
import {
  Typography,
  Divider,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Tooltip,
  IconButton,
  Paper,
  Button,
  Box,
} from "@mui/material";
import { Grid } from "@mui/system";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PublicIcon from "@mui/icons-material/Public";
import { useWatch, useFieldArray } from "react-hook-form";
import CippFormComponent from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import caSchema from "../../data/conditionalAccessSchema.json";
import gdapRoles from "../../data/GDAPRoles.json";
import countryList from "../../data/countryList.json";

/**
 * CippCAPolicyBuilder — A schema-driven Conditional Access policy builder.
 *
 * Renders structured form sections for every CA policy property, with:
 * - Enum validation via the Microsoft Graph v1.0 schema
 * - Friendly labels sourced from the schema's enumLabels
 * - Licence requirement indicators (P2 for risk fields)
 * - Grant control constraint validation (block vs other controls)
 * - Accordion sections matching the Entra admin centre layout
 *
 * Props:
 *   formControl   — react-hook-form's return from useForm()
 *   existingPolicy — optional JSON to pre-populate fields (edit mode)
 *   disabled       — optional boolean to make the form read-only
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a $ref path like "#/$defs/conditionalAccessUsers" in the schema */
function resolveRef(ref) {
  if (!ref) return null;
  const path = ref.replace("#/", "").split("/");
  let node = caSchema;
  for (const segment of path) {
    node = node?.[segment];
  }
  return node ?? null;
}

/** Convert schema enum + enumLabels into {label, value} options */
function enumToOptions(schemaProp) {
  if (!schemaProp) return [];
  const enumVals = schemaProp.items?.enum ?? schemaProp.enum ?? [];
  const labels = schemaProp.items?.enumLabels ?? schemaProp.enumLabels ?? {};
  return enumVals.map((v) => ({
    label: labels[v] ?? v,
    value: v,
  }));
}

/** Build options from wellKnownValues or wellKnownDirectoryRoles */
function wellKnownToOptions(values) {
  if (!values) return [];
  return Object.entries(values).map(([id, label]) => ({ label: `${label}`, value: id }));
}

/** Build special-value options from schema metadata */
function specialValueOptions(schemaProp) {
  const vals = schemaProp?.specialValues ?? [];
  const labels = schemaProp?.specialValueLabels ?? {};
  return vals.map((v) => ({ label: labels[v] ?? v, value: v }));
}

// ---------------------------------------------------------------------------
// Sub-section renderers
// ---------------------------------------------------------------------------

function SectionHeader({ title, description, requiresLicense, icon }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      {icon}
      <Typography variant="h6">{title}</Typography>
      {requiresLicense && (
        <Tooltip title={`Requires ${requiresLicense} licence`}>
          <Chip label={requiresLicense} size="small" color="warning" variant="outlined" />
        </Tooltip>
      )}
      {description && (
        <Tooltip title={description}>
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Users & Groups section
// ---------------------------------------------------------------------------
function UsersSection({ formControl, disabled, prefix = "conditions.users" }) {
  const schemaDef = resolveRef("#/$defs/conditionalAccessUsers");
  const guestSchema = resolveRef("#/$defs/conditionalAccessGuestsOrExternalUsers");
  const roleOptions = useMemo(
    () => gdapRoles.map((r) => ({ label: r.Name, value: r.ObjectId })),
    []
  );
  const specialUserOpts = useMemo(
    () => specialValueOptions(schemaDef?.properties?.includeUsers),
    [schemaDef]
  );

  const guestTypeOpts = useMemo(() => {
    const prop = guestSchema?.properties?.guestOrExternalUserTypes;
    const flags = prop?.flagEnum ?? [];
    const labels = prop?.flagEnumLabels ?? {};
    return flags
      .filter((f) => f !== "none")
      .map((f) => ({ label: labels[f] ?? f, value: f }));
  }, [guestSchema]);

  return (
    <Grid container spacing={2}>
      {/* Include users */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.includeUsers`}
          label="Include Users"
          formControl={formControl}
          multiple
          freeSolo
          disabled={disabled}
          options={specialUserOpts}
          placeholder="All, None, GuestsOrExternalUsers, or user display names/IDs"
        />
      </Grid>
      {/* Exclude users */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.excludeUsers`}
          label="Exclude Users"
          formControl={formControl}
          multiple
          freeSolo
          disabled={disabled}
          options={[{ label: "GuestsOrExternalUsers", value: "GuestsOrExternalUsers" }]}
          placeholder="User display names or IDs"
        />
      </Grid>
      {/* Include groups */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.includeGroups`}
          label="Include Groups"
          formControl={formControl}
          multiple
          freeSolo
          disabled={disabled}
          placeholder="Group display names or IDs"
        />
      </Grid>
      {/* Exclude groups */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.excludeGroups`}
          label="Exclude Groups"
          formControl={formControl}
          multiple
          freeSolo
          disabled={disabled}
          placeholder="Group display names or IDs"
        />
      </Grid>
      {/* Include roles */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.includeRoles`}
          label="Include Directory Roles"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={roleOptions}
          placeholder="Select roles"
        />
      </Grid>
      {/* Exclude roles */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.excludeRoles`}
          label="Exclude Directory Roles"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={roleOptions}
          placeholder="Select roles"
        />
      </Grid>

      {/* Guest / External User Exclusions */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Exclude Guests or External Users
          </Typography>
        </Divider>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.excludeGuestsOrExternalUsers.guestOrExternalUserTypes`}
          label="External User Types to Exclude"
          formControl={formControl}
          multiple
          creatable={false}
          disabled={disabled}
          options={guestTypeOpts}
          placeholder="e.g. Service provider, B2B collaboration guest"
        />
        <Typography variant="caption" color="text.secondary">
          Select one or more external user types to exclude from this policy.
        </Typography>
      </Grid>
      <CippFormCondition
        field={`${prefix}.excludeGuestsOrExternalUsers.guestOrExternalUserTypes`}
        compareType="hasValue"
        formControl={formControl}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="autoComplete"
            name={`${prefix}.excludeGuestsOrExternalUsers.externalTenants._scope`}
            label="Tenant Scope"
            formControl={formControl}
            multiple={false}
            disabled={disabled}
            creatable={false}
            options={[
              { label: "All external tenants", value: "all" },
              { label: "Specific tenants", value: "enumerated" },
            ]}
            placeholder="Select tenant scope"
          />
          <Typography variant="caption" color="text.secondary">
            Choose whether the exclusion applies to all external tenants or specific ones. Only
            relevant for external user types (not internal guests).
          </Typography>
        </Grid>
        <CippFormCondition
          field={`${prefix}.excludeGuestsOrExternalUsers.externalTenants._scope`}
          compareType="valueEq"
          compareValue="enumerated"
          formControl={formControl}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="autoComplete"
              name={`${prefix}.excludeGuestsOrExternalUsers.externalTenants.members`}
              label="External Tenant IDs"
              formControl={formControl}
              multiple
              freeSolo
              disabled={disabled}
              placeholder="Enter tenant GUIDs"
            />
            <Typography variant="caption" color="text.secondary">
              Enter the tenant IDs to scope this exclusion to (e.g. your partner tenant ID for
              service provider exclusion).
            </Typography>
          </Grid>
        </CippFormCondition>
      </CippFormCondition>
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Applications section
// ---------------------------------------------------------------------------
function ApplicationsSection({ formControl, disabled, prefix = "conditions.applications" }) {
  const schemaDef = resolveRef("#/$defs/conditionalAccessApplications");
  const includeAppOpts = useMemo(
    () => specialValueOptions(schemaDef?.properties?.includeApplications),
    [schemaDef]
  );
  const userActionOpts = useMemo(
    () => enumToOptions(schemaDef?.properties?.includeUserActions),
    [schemaDef]
  );

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.includeApplications`}
          label="Include Applications"
          formControl={formControl}
          multiple
          freeSolo
          disabled={disabled}
          options={includeAppOpts}
          placeholder="All, Office365, MicrosoftAdminPortals, or app IDs"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.excludeApplications`}
          label="Exclude Applications"
          formControl={formControl}
          multiple
          freeSolo
          disabled={disabled}
          placeholder="Application client IDs"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name={`${prefix}.includeUserActions`}
          label="User Actions (instead of cloud apps)"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={userActionOpts}
        />
      </Grid>
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Conditions (client apps, platforms, locations, risk, etc.)
// ---------------------------------------------------------------------------
function ConditionsSection({ formControl, disabled }) {
  const condSchema = resolveRef("#/$defs/conditionalAccessConditionSet");
  const platformSchema = resolveRef("#/$defs/conditionalAccessPlatforms");
  const authFlowSchema = resolveRef("#/$defs/conditionalAccessAuthenticationFlows");

  const clientAppOpts = useMemo(
    () => enumToOptions(condSchema?.properties?.clientAppTypes),
    [condSchema]
  );
  const includePlatOpts = useMemo(
    () => enumToOptions(platformSchema?.properties?.includePlatforms),
    [platformSchema]
  );
  const excludePlatOpts = useMemo(
    () => enumToOptions(platformSchema?.properties?.excludePlatforms),
    [platformSchema]
  );
  const signInRiskOpts = useMemo(
    () => enumToOptions(condSchema?.properties?.signInRiskLevels),
    [condSchema]
  );
  const userRiskOpts = useMemo(
    () => enumToOptions(condSchema?.properties?.userRiskLevels),
    [condSchema]
  );
  const spRiskOpts = useMemo(
    () => enumToOptions(condSchema?.properties?.servicePrincipalRiskLevels),
    [condSchema]
  );
  const insiderRiskOpts = useMemo(
    () => enumToOptions(condSchema?.properties?.insiderRiskLevels),
    [condSchema]
  );
  const authFlowOpts = useMemo(
    () => enumToOptions(authFlowSchema?.properties?.transferMethods),
    [authFlowSchema]
  );

  const locationSchema = resolveRef("#/$defs/conditionalAccessLocations");
  const includeLocOpts = useMemo(
    () => specialValueOptions(locationSchema?.properties?.includeLocations),
    [locationSchema]
  );
  const excludeLocOpts = useMemo(
    () => specialValueOptions(locationSchema?.properties?.excludeLocations),
    [locationSchema]
  );

  return (
    <Grid container spacing={2}>
      {/* Client app types */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.clientAppTypes"
          label="Client App Types"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={clientAppOpts}
          validators={{ required: "At least one client app type is required" }}
        />
      </Grid>

      {/* Platforms */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.platforms.includePlatforms"
          label="Include Platforms"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={includePlatOpts}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.platforms.excludePlatforms"
          label="Exclude Platforms"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={excludePlatOpts}
        />
      </Grid>

      {/* Locations */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.locations.includeLocations"
          label="Include Locations"
          formControl={formControl}
          multiple
          freeSolo
          disabled={disabled}
          options={includeLocOpts}
          placeholder="All, AllTrusted, or named location names"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.locations.excludeLocations"
          label="Exclude Locations"
          formControl={formControl}
          multiple
          freeSolo
          disabled={disabled}
          options={excludeLocOpts}
          placeholder="AllTrusted or named location names"
        />
      </Grid>

      {/* Device filter */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Device Filter
          </Typography>
        </Divider>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.devices.deviceFilter.mode"
          label="Device Filter Mode"
          formControl={formControl}
          multiple={false}
          disabled={disabled}
          options={[
            { label: "Include filtered devices", value: "include" },
            { label: "Exclude filtered devices", value: "exclude" },
          ]}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <CippFormComponent
          type="textField"
          name="conditions.devices.deviceFilter.rule"
          label="Device Filter Rule"
          formControl={formControl}
          disabled={disabled}
          placeholder='e.g. device.extensionAttribute1 -eq "SAW"'
        />
      </Grid>

      {/* Risk levels */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Risk Levels
            </Typography>
            <Chip label="Entra ID P2" size="small" color="warning" variant="outlined" />
          </Stack>
        </Divider>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.signInRiskLevels"
          label="Sign-in Risk Levels"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={signInRiskOpts}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.userRiskLevels"
          label="User Risk Levels"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={userRiskOpts}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.servicePrincipalRiskLevels"
          label="Service Principal Risk Levels"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={spRiskOpts}
        />
      </Grid>

      {/* Insider risk */}
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.insiderRiskLevels"
          label="Insider Risk Levels"
          formControl={formControl}
          multiple={false}
          disabled={disabled}
          options={insiderRiskOpts}
        />
      </Grid>

      {/* Auth flows */}
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="autoComplete"
          name="conditions.authenticationFlows.transferMethods"
          label="Authentication Flow Transfer Methods"
          formControl={formControl}
          multiple={false}
          disabled={disabled}
          options={authFlowOpts}
        />
      </Grid>
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Grant Controls section
// ---------------------------------------------------------------------------
function GrantControlsSection({ formControl, disabled }) {
  const grantSchema = resolveRef("#/$defs/conditionalAccessGrantControls");
  const operatorOpts = useMemo(
    () => enumToOptions(grantSchema?.properties?.operator),
    [grantSchema]
  );
  const builtInOpts = useMemo(
    () => enumToOptions(grantSchema?.properties?.builtInControls),
    [grantSchema]
  );

  const authStrengthSchema = resolveRef("#/$defs/authenticationStrengthPolicy");
  const authStrengthOpts = useMemo(
    () => wellKnownToOptions(authStrengthSchema?.properties?.id?.wellKnownValues),
    [authStrengthSchema]
  );

  const selectedControls = useWatch({
    control: formControl.control,
    name: "grantControls.builtInControls",
  });

  const hasBlock = useMemo(() => {
    if (!selectedControls) return false;
    return (Array.isArray(selectedControls) ? selectedControls : [selectedControls]).some(
      (c) => (c?.value ?? c) === "block"
    );
  }, [selectedControls]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="autoComplete"
          name="grantControls.operator"
          label="Grant Operator"
          formControl={formControl}
          disabled={disabled}
          options={operatorOpts}
          multiple={false}
          validators={{ required: "Grant operator is required when grant controls are set" }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <CippFormComponent
          type="autoComplete"
          name="grantControls.builtInControls"
          label="Built-in Controls"
          formControl={formControl}
          multiple
          disabled={disabled}
          options={builtInOpts}
        />
        {hasBlock && (
          <Alert severity="info" sx={{ mt: 1 }}>
            &quot;Block access&quot; cannot be combined with other grant controls. All other
            selections will be ignored by Entra ID.
          </Alert>
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name="grantControls.authenticationStrength.id"
          label="Authentication Strength Policy"
          formControl={formControl}
          multiple={false}
          disabled={disabled}
          freeSolo
          options={authStrengthOpts}
          placeholder="Select a built-in policy or enter a custom policy ID"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="autoComplete"
          name="grantControls.termsOfUse"
          label="Terms of Use"
          formControl={formControl}
          multiple
          freeSolo
          disabled={disabled}
          placeholder="Terms of use agreement IDs"
        />
      </Grid>
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Session Controls section
// ---------------------------------------------------------------------------
function SessionControlsSection({ formControl, disabled }) {
  const casSchema = resolveRef("#/$defs/cloudAppSecuritySessionControl");
  const casTypeOpts = useMemo(
    () => enumToOptions(casSchema?.properties?.cloudAppSecurityType),
    [casSchema]
  );

  const signinSchema = resolveRef("#/$defs/signInFrequencySessionControl");
  const freqTypeOpts = useMemo(
    () => enumToOptions(signinSchema?.properties?.type),
    [signinSchema]
  );
  const freqIntervalOpts = useMemo(
    () => enumToOptions(signinSchema?.properties?.frequencyInterval),
    [signinSchema]
  );
  const freqAuthTypeOpts = useMemo(
    () => enumToOptions(signinSchema?.properties?.authenticationType),
    [signinSchema]
  );

  const persistSchema = resolveRef("#/$defs/persistentBrowserSessionControl");
  const persistModeOpts = useMemo(
    () => enumToOptions(persistSchema?.properties?.mode),
    [persistSchema]
  );

  return (
    <Grid container spacing={2}>
      {/* App enforced restrictions */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2" sx={{ mt: 1 }}>
          Application Enforced Restrictions
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Only Exchange Online and SharePoint Online support this control.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          name="sessionControls.applicationEnforcedRestrictions.isEnabled"
          label="Enable App Enforced Restrictions"
          formControl={formControl}
          disabled={disabled}
        />
      </Grid>

      {/* Cloud App Security */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">Conditional Access App Control</Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          name="sessionControls.cloudAppSecurity.isEnabled"
          label="Enable App Control"
          formControl={formControl}
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="autoComplete"
          name="sessionControls.cloudAppSecurity.cloudAppSecurityType"
          label="Control Type"
          formControl={formControl}
          multiple={false}
          disabled={disabled}
          options={casTypeOpts}
        />
      </Grid>

      {/* Sign-in frequency */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">Sign-in Frequency</Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <CippFormComponent
          type="switch"
          name="sessionControls.signInFrequency.isEnabled"
          label="Enable Sign-in Frequency"
          formControl={formControl}
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <CippFormComponent
          type="autoComplete"
          name="sessionControls.signInFrequency.frequencyInterval"
          label="Interval Mode"
          formControl={formControl}
          multiple={false}
          disabled={disabled}
          options={freqIntervalOpts}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <CippFormComponent
          type="number"
          name="sessionControls.signInFrequency.value"
          label="Value"
          formControl={formControl}
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <CippFormComponent
          type="autoComplete"
          name="sessionControls.signInFrequency.type"
          label="Unit"
          formControl={formControl}
          multiple={false}
          disabled={disabled}
          options={freqTypeOpts}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <CippFormComponent
          type="autoComplete"
          name="sessionControls.signInFrequency.authenticationType"
          label="Auth Type"
          formControl={formControl}
          multiple={false}
          disabled={disabled}
          options={freqAuthTypeOpts}
        />
      </Grid>

      {/* Persistent browser */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">Persistent Browser Session</Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          name="sessionControls.persistentBrowser.isEnabled"
          label="Enable Persistent Browser"
          formControl={formControl}
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="autoComplete"
          name="sessionControls.persistentBrowser.mode"
          label="Persistence Mode"
          formControl={formControl}
          multiple={false}
          disabled={disabled}
          options={persistModeOpts}
        />
      </Grid>

      {/* Resilience defaults */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 1 }} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          name="sessionControls.disableResilienceDefaults"
          label="Disable Resilience Defaults"
          formControl={formControl}
          disabled={disabled}
        />
        <Typography variant="caption" color="text.secondary">
          When enabled, Entra ID will not extend existing sessions during outages.
        </Typography>
      </Grid>
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Named Locations (template-embedded) section
// ---------------------------------------------------------------------------
//
// CIPP CA templates persist the named locations referenced by a policy under
// the top-level `LocationInfo` array (one entry per named location). Each
// entry uses Microsoft Graph shape:
//   - country: { "@odata.type": "#microsoft.graph.countryNamedLocation",
//                displayName, countriesAndRegions: [iso2…],
//                includeUnknownCountriesAndRegions, countryLookupMethod }
//   - ip:      { "@odata.type": "#microsoft.graph.ipNamedLocation",
//                displayName, isTrusted,
//                ipRanges: [{ "@odata.type": "#microsoft.graph.iPv4CidrRange"
//                             | "#microsoft.graph.iPv6CidrRange",
//                             cidrAddress }] }
//
// We can't bind react-hook-form directly to keys containing dots
// (`@odata.type`), so the form uses a sanitised shape with `_type` and
// `_ipRangesText` fields that we map back on save.

const COUNTRY_TYPE = "#microsoft.graph.countryNamedLocation";
const IP_TYPE = "#microsoft.graph.ipNamedLocation";
const IPV4_RANGE_TYPE = "#microsoft.graph.iPv4CidrRange";
const IPV6_RANGE_TYPE = "#microsoft.graph.iPv6CidrRange";

const countryOptions = countryList.map(({ Code, Name }) => ({ value: Code, label: Name }));

/** Convert one Graph-shape named location to form-shape. */
function namedLocationToForm(loc) {
  if (!loc || typeof loc !== "object") return null;
  const type = loc["@odata.type"] === IP_TYPE ? "ip" : "country";
  if (type === "ip") {
    const ipRangesText = Array.isArray(loc.ipRanges)
      ? loc.ipRanges
          .map((r) => r?.cidrAddress)
          .filter((v) => typeof v === "string" && v.trim() !== "")
          .join("\n")
      : "";
    return {
      _type: { label: "IP Ranges", value: "ip" },
      displayName: loc.displayName ?? "",
      isTrusted: !!loc.isTrusted,
      _ipRangesText: ipRangesText,
    };
  }
  const countries = Array.isArray(loc.countriesAndRegions) ? loc.countriesAndRegions : [];
  const lookup = loc.countryLookupMethod ?? "clientIpAddress";
  return {
    _type: { label: "Countries / Regions", value: "country" },
    displayName: loc.displayName ?? "",
    countriesAndRegions: countries.map((code) => {
      const match = countryOptions.find((o) => o.value === code);
      return match ?? { label: code, value: code };
    }),
    includeUnknownCountriesAndRegions: !!loc.includeUnknownCountriesAndRegions,
    countryLookupMethod: {
      label: lookup === "authenticatorAppGps" ? "Authenticator app GPS" : "Client IP address",
      value: lookup,
    },
  };
}

/** Unwrap an autoComplete `{label,value}` object to its underlying value. */
function unwrapAC(v) {
  if (v && typeof v === "object" && !Array.isArray(v) && "value" in v) return v.value;
  return v;
}

/** Convert one form-shape named location back to Graph shape. */
function namedLocationToGraph(item) {
  if (!item || !item.displayName || !item.displayName.trim()) return null;
  const typeRaw = unwrapAC(item._type);
  if (!typeRaw) return null;
  const type = typeRaw === "ip" ? "ip" : "country";
  if (type === "ip") {
    const lines = String(item._ipRangesText ?? "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s !== "");
    if (lines.length === 0) return null;
    return {
      "@odata.type": IP_TYPE,
      displayName: item.displayName.trim(),
      isTrusted: !!item.isTrusted,
      ipRanges: lines.map((cidr) => ({
        "@odata.type": cidr.includes(":") ? IPV6_RANGE_TYPE : IPV4_RANGE_TYPE,
        cidrAddress: cidr,
      })),
    };
  }
  // Country shape — unwrap autoComplete {label,value} objects if present
  const countries = Array.isArray(item.countriesAndRegions)
    ? item.countriesAndRegions
        .map((c) => unwrapAC(c))
        .filter((v) => typeof v === "string" && v !== "")
    : [];
  if (countries.length === 0) return null;
  const lookup = unwrapAC(item.countryLookupMethod);
  return {
    "@odata.type": COUNTRY_TYPE,
    displayName: item.displayName.trim(),
    countriesAndRegions: countries,
    includeUnknownCountriesAndRegions: !!item.includeUnknownCountriesAndRegions,
    countryLookupMethod: lookup || "clientIpAddress",
  };
}

function NamedLocationsSection({ formControl, disabled }) {
  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: "LocationInfo",
  });

  return (
    <Stack spacing={2}>
      <Alert severity="info" icon={<PublicIcon fontSize="small" />}>
        Named locations defined here are stored inside the template and recreated (or matched by
        display name) in the target tenant when the template is deployed. Reference them by name
        in the <strong>Include Locations</strong> / <strong>Exclude Locations</strong> fields
        under <em>Conditions</em>.
      </Alert>

      {fields.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No named locations embedded in this template.
        </Typography>
      )}

      {fields.map((field, index) => (
        <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              Named Location #{index + 1}
            </Typography>
            <Tooltip title="Remove named location">
              <span>
                <IconButton
                  size="small"
                  onClick={() => remove(index)}
                  disabled={disabled}
                  aria-label="remove named location"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="textField"
                name={`LocationInfo.${index}.displayName`}
                label="Display Name"
                formControl={formControl}
                disabled={disabled}
                validators={{ required: "Display name is required" }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="autoComplete"
                name={`LocationInfo.${index}._type`}
                label="Location Type"
                formControl={formControl}
                multiple={false}
                creatable={false}
                disabled={disabled}
                options={[
                  { label: "Countries / Regions", value: "country" },
                  { label: "IP Ranges", value: "ip" },
                ]}
                validators={{ required: "Location type is required" }}
              />
            </Grid>

            {/* IP fields */}
            <CippFormCondition
              field={`LocationInfo.${index}._type`}
              compareType="valueEq"
              compareValue="ip"
              formControl={formControl}
            >
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  name={`LocationInfo.${index}._ipRangesText`}
                  label="IP Ranges (CIDR, one per line)"
                  formControl={formControl}
                  multiline
                  rows={4}
                  disabled={disabled}
                  placeholder="e.g. 203.0.113.0/24"
                  validators={{ required: "At least one CIDR range is required" }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="switch"
                  name={`LocationInfo.${index}.isTrusted`}
                  label="Mark as Trusted Location"
                  formControl={formControl}
                  disabled={disabled}
                />
              </Grid>
            </CippFormCondition>

            {/* Country fields */}
            <CippFormCondition
              field={`LocationInfo.${index}._type`}
              compareType="valueEq"
              compareValue="country"
              formControl={formControl}
            >
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  name={`LocationInfo.${index}.countriesAndRegions`}
                  label="Countries / Regions"
                  formControl={formControl}
                  multiple
                  disabled={disabled}
                  options={countryOptions}
                  validators={{ required: "At least one country must be selected" }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="autoComplete"
                  name={`LocationInfo.${index}.countryLookupMethod`}
                  label="Country Lookup Method"
                  formControl={formControl}
                  multiple={false}
                  creatable={false}
                  disabled={disabled}
                  options={[
                    { label: "Client IP address", value: "clientIpAddress" },
                    { label: "Authenticator app GPS", value: "authenticatorAppGps" },
                  ]}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="switch"
                  name={`LocationInfo.${index}.includeUnknownCountriesAndRegions`}
                  label="Include Unknown Countries / Regions"
                  formControl={formControl}
                  disabled={disabled}
                />
              </Grid>
            </CippFormCondition>
          </Grid>
        </Paper>
      ))}

      <Box>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          disabled={disabled}
          onClick={() =>
            append({
              _type: null,
              displayName: "",
            })
          }
        >
          Add Named Location
        </Button>
      </Box>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const CippCAPolicyBuilder = ({
  formControl,
  existingPolicy,
  disabled = false,
  showNamedLocations = false,
}) => {
  const policySchema = caSchema;

  // Pre-populate form from existing policy when editing
  useEffect(() => {
    if (existingPolicy && formControl) {
      const populate = (obj, prefix = "") => {
        if (!obj || typeof obj !== "object") return;
        Object.entries(obj).forEach(([key, value]) => {
          // Skip read-only / OData / internal / Graph metadata properties
          if (
            (key === "id" && !prefix) || // Only skip top-level policy id
            key === "createdDateTime" ||
            key === "modifiedDateTime" ||
            key === "deletedDateTime" ||
            key === "templateId" ||
            key === "partialEnablementStrategy" ||
            key.includes("@odata") || // Catch both @odata.type and includePlatforms@odata.type
            key.startsWith("#") || // Catch #microsoft.graph.restore etc.
            key === "GUID" ||
            key === "source" ||
            key === "isSynced" ||
            key === "package"
          ) {
            return;
          }
          // Skip null, empty arrays, and empty strings — treat as "not set"
          if (value === null || value === undefined) return;
          if (Array.isArray(value) && value.length === 0) return;
          if (typeof value === "string" && value.trim() === "") return;

          const path = prefix ? `${prefix}.${key}` : key;

          // Special handling for LocationInfo (template-embedded named locations).
          // Graph-shape entries contain `@odata.type` keys that react-hook-form
          // would interpret as nested paths, so we map them onto a form-friendly
          // shape (`_type`, `_ipRangesText`, …) that NamedLocationsSection consumes.
          if (key === "LocationInfo" && Array.isArray(value) && !prefix) {
            const formItems = value
              .map((item) => namedLocationToForm(item))
              .filter((v) => v !== null);
            if (formItems.length > 0) {
              formControl.setValue("LocationInfo", formItems);
            }
            return;
          }

          // Special handling for authenticationStrength — only extract the policy ID,
          // not the full expanded object (displayName, description, allowedCombinations, etc.)
          if (key === "authenticationStrength" && typeof value === "object" && !Array.isArray(value)) {
            if (value.id) {
              formControl.setValue(`${path}.id`, value.id);
            }
            return;
          }

          // Special handling for guestOrExternalUserTypes — Graph stores as comma-separated
          // string but our form uses a multi-select array
          if (key === "guestOrExternalUserTypes" && typeof value === "string") {
            const types = value.split(",").filter((t) => t.trim() !== "" && t !== "none");
            if (types.length > 0) {
              formControl.setValue(path, types);
            }
            return;
          }

          // Special handling for externalTenants — extract members and set _scope
          if (key === "externalTenants" && typeof value === "object" && !Array.isArray(value)) {
            if (value.members && Array.isArray(value.members) && value.members.length > 0) {
              formControl.setValue(`${path}.members`, value.members);
              formControl.setValue(`${path}._scope`, { label: "Specific tenants", value: "enumerated" });
            } else {
              formControl.setValue(`${path}._scope`, { label: "All external tenants", value: "all" });
            }
            return;
          }

          if (typeof value === "object" && !Array.isArray(value)) {
            populate(value, path);
          } else {
            formControl.setValue(path, value);
          }
        });
      };
      populate(existingPolicy);
    }
  }, [existingPolicy, formControl]);

  // Schema-level validation: extract options for top-level policy state
  const stateOpts = useMemo(
    () => enumToOptions(policySchema.properties.state),
    [policySchema]
  );

  return (
    <Stack spacing={2}>
      {/* Policy basics */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <SectionHeader title="Policy Basics" description="Display name and enforcement state." />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <CippFormComponent
              type="textField"
              name="displayName"
              label="Display Name"
              formControl={formControl}
              disabled={disabled}
              validators={{ required: "Display name is required" }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CippFormComponent
              type="autoComplete"
              name="state"
              label="Policy State"
              formControl={formControl}
              disabled={disabled}
              multiple={false}
              options={stateOpts}
              validators={{ required: "Policy state is required" }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Users & Groups */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Users and Groups
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <UsersSection formControl={formControl} disabled={disabled} />
        </AccordionDetails>
      </Accordion>

      {/* Cloud Apps or Actions */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Cloud Apps or Actions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ApplicationsSection formControl={formControl} disabled={disabled} />
        </AccordionDetails>
      </Accordion>

      {/* Conditions */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Conditions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ConditionsSection formControl={formControl} disabled={disabled} />
        </AccordionDetails>
      </Accordion>

      {/* Grant Controls */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Grant Controls
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <GrantControlsSection formControl={formControl} disabled={disabled} />
        </AccordionDetails>
      </Accordion>

      {/* Session Controls */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Session Controls
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SessionControlsSection formControl={formControl} disabled={disabled} />
        </AccordionDetails>
      </Accordion>

      {/* Named Locations (template only) */}
      {showNamedLocations && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                Named Locations
              </Typography>
              <Chip label="Template" size="small" variant="outlined" />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <NamedLocationsSection formControl={formControl} disabled={disabled} />
          </AccordionDetails>
        </Accordion>
      )}
    </Stack>
  );
};

export default CippCAPolicyBuilder;

/**
 * Utility: extract a clean CA policy JSON from react-hook-form values.
 *
 * Call this in your form's submit handler to strip out { label, value }
 * wrapper objects from autoComplete fields, remove empty/null branches,
 * and ensure the JSON is ready to send to AddCAPolicy / AddCATemplate.
 */
export function extractCAPolicyJSON(formValues) {
  const clean = (obj) => {
    if (obj === null || obj === undefined) return undefined;

    // Unwrap {label,value} from autoComplete
    if (typeof obj === "object" && "value" in obj && "label" in obj) {
      return obj.value;
    }

    if (Array.isArray(obj)) {
      const arr = obj.map(clean).filter((v) => v !== undefined && v !== null && v !== "");
      return arr.length > 0 ? arr : undefined;
    }

    if (typeof obj === "object") {
      const result = {};
      let hasContent = false;
      for (const [key, value] of Object.entries(obj)) {
        // Strip internal builder fields (e.g. _scope)
        if (key.startsWith("_")) continue;
        // Strip OData annotations EXCEPT @odata.type (required by Graph for polymorphic types)
        if (key === "@odata.type") {
          result[key] = value;
          hasContent = true;
          continue;
        }
        if (key.includes("@odata") || key.startsWith("#")) continue;

        const cleaned = clean(value);
        if (cleaned !== undefined) {
          result[key] = cleaned;
          hasContent = true;
        }
      }
      return hasContent ? result : undefined;
    }

    // Booleans, numbers, non-empty strings pass through
    if (typeof obj === "string" && obj.trim() === "") return undefined;
    return obj;
  };

  const cleaned = clean(formValues) ?? {};

  // Post-process: fix guestsOrExternalUsers structures for Graph API
  const fixGuestExternalUsers = (guestObj) => {
    if (!guestObj) return guestObj;
    // Graph expects guestOrExternalUserTypes as a comma-separated string
    if (Array.isArray(guestObj.guestOrExternalUserTypes)) {
      guestObj.guestOrExternalUserTypes = guestObj.guestOrExternalUserTypes.join(",");
    }
    // Determine scope from the internal _scope field or from members presence
    const scope = guestObj.externalTenants?._scope;
    const hasMembers =
      guestObj.externalTenants?.members && guestObj.externalTenants.members.length > 0;

    if (guestObj.externalTenants) {
      // Remove internal _scope field
      delete guestObj.externalTenants._scope;

      if (scope === "enumerated" || hasMembers) {
        guestObj.externalTenants["@odata.type"] =
          "#microsoft.graph.conditionalAccessEnumeratedExternalTenants";
        guestObj.externalTenants.membershipKind = "enumerated";
      } else {
        guestObj.externalTenants = {
          "@odata.type": "#microsoft.graph.conditionalAccessAllExternalTenants",
          membershipKind: "all",
        };
      }
    } else if (guestObj.guestOrExternalUserTypes) {
      // No tenants specified — default to all external tenants
      guestObj.externalTenants = {
        "@odata.type": "#microsoft.graph.conditionalAccessAllExternalTenants",
        membershipKind: "all",
      };
    }
    return guestObj;
  };

  if (cleaned.conditions?.users?.excludeGuestsOrExternalUsers) {
    cleaned.conditions.users.excludeGuestsOrExternalUsers = fixGuestExternalUsers(
      cleaned.conditions.users.excludeGuestsOrExternalUsers
    );
  }
  if (cleaned.conditions?.users?.includeGuestsOrExternalUsers) {
    cleaned.conditions.users.includeGuestsOrExternalUsers = fixGuestExternalUsers(
      cleaned.conditions.users.includeGuestsOrExternalUsers
    );
  }

  // Post-process: strip session control sub-objects where isEnabled is false.
  // Graph validates fields like `mode` even when disabled — safest to omit entirely.
  if (cleaned.sessionControls) {
    const sessionKeys = [
      "applicationEnforcedRestrictions",
      "cloudAppSecurity",
      "signInFrequency",
      "persistentBrowser",
    ];
    for (const key of sessionKeys) {
      if (cleaned.sessionControls[key]?.isEnabled === false) {
        delete cleaned.sessionControls[key];
      }
    }
    // If sessionControls is now empty, remove it too
    if (Object.keys(cleaned.sessionControls).length === 0) {
      delete cleaned.sessionControls;
    }
  }

  // Post-process: convert template-embedded named locations from form-shape
  // back to Graph shape. We read from the raw form values (not `cleaned`)
  // because `clean()` strips internal keys prefixed with `_` (e.g. `_type`,
  // `_ipRangesText`) that the conversion needs.
  delete cleaned.LocationInfo;
  if (Array.isArray(formValues?.LocationInfo)) {
    const graphLocations = formValues.LocationInfo
      .map((item) => namedLocationToGraph(item))
      .filter((v) => v !== null);
    if (graphLocations.length > 0) {
      cleaned.LocationInfo = graphLocations;
    }
  }

  return cleaned;
}
