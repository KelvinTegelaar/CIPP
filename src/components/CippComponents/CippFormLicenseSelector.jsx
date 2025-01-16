import React from "react";
import { CippFormComponent } from "./CippFormComponent";
import { getCippLicenseTranslation } from "../../utils/get-cipp-license-translation";
import { useSettings } from "../../hooks/use-settings";

export const CippFormLicenseSelector = ({
  formControl,
  name,
  label,
  multiple = true,
  select,
  addedField,
  ...other
}) => {
  const userSettingsDefaults = useSettings();
  return (
    <CippFormComponent
      name={name}
      label={label}
      type="autoComplete"
      formControl={formControl}
      multiple={multiple}
      creatable={false}
      api={{
        addedField: addedField,
        tenantFilter: userSettingsDefaults.currentTenant ?? undefined,
        url: "/api/ListGraphRequest",
        dataKey: "Results",
        labelField: (option) =>
          `${getCippLicenseTranslation([option])} (${
            option.prepaidUnits.enabled - option.consumedUnits
          } available)`,
        valueField: "skuId",
        queryKey: `ListLicenses-${userSettingsDefaults.currentTenant ?? undefined}`,
        data: {
          Endpoint: "subscribedSkus",
          $count: true,
        },
      }}
    />
  );
};
