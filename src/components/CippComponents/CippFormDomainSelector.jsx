import { CippFormComponent } from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";
import { useMemo } from "react";

export const CippFormDomainSelector = ({
  formControl,
  name,
  label,
  allTenants = false,
  type = "multiple",
  multiple = false,
  preselectDefaultDomain = true,
  ...other
}) => {
  const currentTenant = useWatch({ control: formControl.control, name: "tenantFilter" });
  const selectedTenant = useSettings().currentTenant;

  const apiConfig = useMemo(
    () => ({
      autoSelectFirstItem: preselectDefaultDomain && !multiple,
      tenantFilter: currentTenant ? currentTenant.value : selectedTenant,
      queryKey: `listDomains-${currentTenant?.value ? currentTenant.value : selectedTenant}`,
      url: "/api/ListGraphRequest",
      dataKey: "Results",
      labelField: (option) => `${option.id}`,
      valueField: "id",
      addedField: {
        isDefault: "isDefault",
        isInitial: "isInitial",
        isVerified: "isVerified",
      },
      data: {
        Endpoint: "domains",
        manualPagination: true,
        $count: true,
        $top: 99,
      },
      dataFilter: (domains) => {
        // Always sort domains so that the default domain appears first
        return domains.sort((a, b) => {
          if (a.addedFields?.isDefault === true) return -1;
          if (b.addedFields?.isDefault === true) return 1;
          return 0;
        });
      },
    }),
    [currentTenant, selectedTenant, preselectDefaultDomain, multiple]
  );

  return (
    <CippFormComponent
      name={name}
      label={label}
      type="autoComplete"
      formControl={formControl}
      multiple={multiple}
      api={apiConfig}
      {...other}
    />
  );
};
