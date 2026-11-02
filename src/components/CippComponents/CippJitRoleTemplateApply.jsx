import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";
import CippFormComponent from "./CippFormComponent";
import { useJitAllowedRoles } from "../../hooks/use-jit-allowed-roles";

/**
 * A convenience selector that pulls the roles from one or more JIT Role Templates into a target roles
 * field (e.g. adminRoles / defaultRoles). Roles are merged additively - existing selections are kept -
 * and remain fully editable afterward. If the current user is restricted by an assigned JIT Role
 * Template, roles outside their allow-list are dropped so the field never offers a role they cannot grant.
 */
export const CippJitRoleTemplateApply = ({
  formControl,
  targetField,
  name = "applyRoleTemplate",
  label = "Apply JIT Role Template",
}) => {
  const { restricted, allowedRoleIds } = useJitAllowedRoles();
  const selected = useWatch({ control: formControl.control, name });
  const lastApplied = useRef(null);

  useEffect(() => {
    if (!selected || selected.length === 0) return;
    const selectedKey = selected
      .map((t) => t?.value)
      .sort()
      .join(",");
    if (selectedKey === lastApplied.current) return;
    lastApplied.current = selectedKey;

    const templateRoles = selected
      .flatMap((t) => t?.addedFields?.roles || [])
      .filter((r) => r && r.value)
      .filter((r) => (restricted ? allowedRoleIds.includes(r.value) : true))
      .map((r) => ({ label: r.label, value: r.value }));

    const existing = formControl.getValues(targetField) || [];
    const merged = [...existing];
    templateRoles.forEach((role) => {
      if (!merged.some((m) => m.value === role.value)) {
        merged.push(role);
      }
    });
    formControl.setValue(targetField, merged, { shouldValidate: true, shouldDirty: true });
  }, [selected]);

  return (
    <CippFormComponent
      type="autoComplete"
      fullWidth
      label={label}
      name={name}
      multiple={true}
      creatable={false}
      api={{
        url: "/api/ListJITRoleTemplates",
        type: "GET",
        queryKey: "ListJITRoleTemplates",
        labelField: "templateName",
        valueField: "GUID",
        addedField: { roles: "roles" },
        showRefresh: true,
      }}
      formControl={formControl}
      helperText="Selecting a template adds its roles to the selection below. You can still adjust the roles afterward."
    />
  );
};

export default CippJitRoleTemplateApply;
