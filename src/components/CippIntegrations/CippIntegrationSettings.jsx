import { Box, CardContent } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormSection from "../CippFormPages/CippFormSection";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useForm } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";
import { ApiGetCall } from "../../api/ApiCall";
import { useRouter } from "next/router";
import extensions from "../../data/Extensions.json";
import React, { useEffect, useMemo, useRef } from "react";
import { CippFormCondition } from "../CippComponents/CippFormCondition";

const CippIntegrationSettings = ({ children }) => {
  const router = useRouter();
  const settings = useSettings();
  const preferredTheme = settings.currentTheme?.value;

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: integrations?.data,
  });

  const extension = extensions.find((extension) => extension.id === router.query.id);
  const enabled = formControl.watch(`${extension?.id}.Enabled`);

  var logo = extension?.logo;
  if (preferredTheme === "dark" && extension?.logoDark) {
    logo = extension.logoDark;
  }

  // Some dropdowns are scoped by another setting - Halo's priority and outcome lists only cover
  // the saved ticket type - so their cached options go stale as soon as the form is saved.
  // Invalidate every option query this extension uses, not just Integrations, or the lists keep
  // serving the previous ticket type's values until the refresh button is pressed by hand.
  // Tenant-scoped options register as `${queryKey}-${tenant}`, so match on the prefix.
  const relatedQueryKeys = useMemo(
    () => [
      "Integrations",
      ...(extension?.SettingOptions ?? [])
        .map((setting) => setting?.api?.queryKey)
        .filter(Boolean)
        .map((queryKey) => `${queryKey}*`),
    ],
    [extension]
  );

  // Settings that declare dependsOn get their options from whatever that other setting is set to.
  // Changing the parent leaves the old selection sitting in the field, and it still saves - so a
  // Halo priority from the previous ticket type's SLA ends up on tickets raised under a ticket
  // type that never offered it. Clear the dependents when the parent actually changes.
  const dependentSettings = useMemo(
    () => (extension?.SettingOptions ?? []).filter((setting) => setting?.dependsOn),
    [extension]
  );
  const parentNames = useMemo(
    () => [...new Set(dependentSettings.map((setting) => setting.dependsOn))],
    [dependentSettings]
  );
  const parentValues = formControl.watch(parentNames);
  // Holds the parent values as of the last load/change, so we only clear on a real user change
  // and not while the form is being populated from saved config.
  const previousParentValues = useRef(null);

  useEffect(() => {
    if (integrations.isSuccess) {
      formControl.reset({
        ...integrations.data,
      });
      formControl.trigger();
      // Re-baseline: the next run of the effect below records the freshly loaded parent values
      // instead of treating them as a change and wiping the saved dependents.
      previousParentValues.current = null;
    }
  }, [integrations.isSuccess]);

  // Options for a dependent field come from whatever its parent is set to, so send the parent's
  // current form value with the request rather than letting the backend fall back to the saved
  // config. The query key carries the same value, otherwise react-query serves the previous
  // parent's cached options and the list only catches up after a save.
  const buildApi = (setting) => {
    if (!setting?.api || !setting?.dependsOn) return setting?.api;
    const parentValue = formControl.getValues(setting.dependsOn);
    const scope = parentValue?.value ?? parentValue ?? "";
    const paramName = setting.dependsOnParam ?? setting.dependsOn.split(".").pop();
    return {
      ...setting.api,
      data: { ...setting.api.data, [paramName]: scope },
      queryKey: `${setting.api.queryKey}-${scope}`,
    };
  };

  // Halo returns an explanatory row with an id of -1 when it has nothing real to offer ("no SLA
  // attached", "select a ticket type first"). It's there to be read, not picked - without this
  // it can be selected and saved as if it were a priority or an outcome.
  const isPlaceholderOption = (option) => option?.value === -1;

  // Existing configs can already hold one of those rows from before it was blocked, and it would
  // otherwise sit there looking like a real setting. Drop it so the field reads as unset.
  const dependentValues = formControl.watch(dependentSettings.map((setting) => setting.name));
  useEffect(() => {
    dependentSettings.forEach((setting, index) => {
      if (isPlaceholderOption(dependentValues?.[index])) {
        formControl.setValue(setting.name, null);
      }
    });
  }, [dependentValues, dependentSettings, formControl]);

  const extraFieldProps = (setting) => {
    const props = { api: buildApi(setting) };
    if (setting?.type === "autoComplete" && setting?.api) {
      props.getOptionDisabled = isPlaceholderOption;
    }
    return props;
  };

  useEffect(() => {
    if (!parentNames.length) return;
    const current = parentNames.map((_, index) => JSON.stringify(parentValues?.[index] ?? null));
    if (previousParentValues.current === null) {
      previousParentValues.current = current;
      return;
    }
    parentNames.forEach((parentName, index) => {
      if (previousParentValues.current[index] === current[index]) return;
      dependentSettings
        .filter((setting) => setting.dependsOn === parentName)
        .forEach((setting) => formControl.setValue(setting.name, null, { shouldDirty: true }));
    });
    previousParentValues.current = current;
  }, [parentValues, parentNames, dependentSettings, formControl]);

  return (
    <>
      {integrations.isSuccess && extension ? (
        <CippFormSection
          relatedQueryKeys={relatedQueryKeys}
          formControl={formControl}
          formPageType="Integration"
          title={extension.name}
          backButtonTitle="Integrations"
          postUrl="/api/ExecExtensionsConfig"
          resetForm={false}
        >
          {children}
          <Grid container sx={{ alignItems: "center" }}>
            {extension.SettingOptions.map((setting, index) => (
              <React.Fragment key={index}>
                {setting?.condition ? (
                  <CippFormCondition {...setting.condition} formControl={formControl} disabled={extension.SettingOptions.find(s => s.name === `${extension.id}.Enabled`) && !enabled}>
                    <Grid size={{ xs: 12, md: setting.fullRow || setting.type === "switch" ? 12 : 6 }}>
                      <Box sx={{ p: 1 }}>
                        <CippFormComponent
                          name={setting.name}
                          type={setting.type}
                          label={setting.label}
                          options={setting.options}
                          formControl={formControl}
                          placeholder={setting?.placeholder}
                          fullWidth
                          {...setting}
                          {...extraFieldProps(setting)}
                        />
                      </Box>
                    </Grid>
                  </CippFormCondition>
                ) : (
                  <Grid size={{ xs: 12, md: setting.fullRow || setting.type === "switch" ? 12 : 6 }}>
                    <Box sx={{ p: 1 }}>
                      <CippFormComponent
                        name={setting.name}
                        type={setting.type}
                        label={setting.label}
                        options={setting.options}
                        formControl={formControl}
                        placeholder={setting?.placeholder}
                        fullWidth
                        {...setting}
                        {...extraFieldProps(setting)}
                      />
                    </Box>
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        </CippFormSection>
      ) : (
        <CardContent>
          {integrations.isLoading && <Box>Loading...</Box>}
          {integrations.isSuccess && !extension && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ textAlign: "center" }}>Extension not found</Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      )}
    </>
  );
};

export default CippIntegrationSettings;
