import React from "react";
import { CippFormComponent } from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { getCippLicenseTranslation } from "../../utils/get-cipp-license-translation";

export const CippFormLicenseSelector = ({
  formControl,
  name,
  label,
  multiple = true,
  select,
  addedField,
  ...other
}) => {
  const currentTenant = useWatch({ control: formControl.control, name: "tenantFilter" });
  return (
    <CippFormComponent
      name={name}
      label={label}
      type="autoComplete"
      formControl={formControl}
      multiple={multiple}
      api={{
        addedField: addedField,
        tenantFilter: currentTenant ? currentTenant.value : undefined,
        url: "/api/ListGraphRequest",
        dataKey: "Results",
        labelField: (option) =>
          `${getCippLicenseTranslation([option])} (${
            option.prepaidUnits.enabled - option.consumedUnits
          } available)`,
        valueField: "skuId",
        queryKey: `ListLicenses-${currentTenant?.value}`,
        data: {
          Endpoint: "subscribedSkus",
          $count: true,
        },
      }}
    />
  );
};
