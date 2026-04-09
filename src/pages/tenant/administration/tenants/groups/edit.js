import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall } from "../../../../../api/ApiCall";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import CippFormPage from "../../../../../components/CippFormPages/CippFormPage";
import CippAddEditTenantGroups from "../../../../../components/CippComponents/CippAddEditTenantGroups";

const Page = () => {
  const router = useRouter();
  const { id } = router.query;
  const formControl = useForm({
    mode: "onChange",
  });

  const groupDetails = ApiGetCall({
    url: id ? `/api/ListTenantGroups?groupId=${id}` : null,
    queryKey: id ? `TenantGroupProperties_${id}` : null,
  });

  useEffect(() => {
    if (groupDetails.isSuccess && groupDetails.data) {
      const groupData = groupDetails?.data?.Results?.[0];

      // Determine if this is a dynamic or static group
      const isDynamic = groupData?.GroupType === "dynamic" && groupData?.DynamicRules;

      // Format dynamic rules if they exist
      let formattedDynamicRules = [{}];
      if (isDynamic && groupData.DynamicRules) {
        try {
          let rules;
          if (Array.isArray(groupData.DynamicRules)) {
            rules = groupData.DynamicRules;
          } else if (typeof groupData.DynamicRules === "string") {
            rules = JSON.parse(groupData.DynamicRules);
          } else if (typeof groupData.DynamicRules === "object") {
            rules = [groupData.DynamicRules];
          } else {
            rules = [];
          }

          formattedDynamicRules = rules.map((rule) => {
            // Handle value - it's always an array of objects from the backend
            let valueForForm;

            // Special handling for custom variables (nested structure with variableName and value)
            if (
              rule.property === "customVariable" &&
              typeof rule.value === "object" &&
              rule.value?.variableName
            ) {
              valueForForm = {
                variableName: rule.value.variableName,
                value: rule.value.value,
              };
            } else if (Array.isArray(rule.value)) {
              // If it's an array of objects, extract all values
              valueForForm = rule.value.map((item) => ({
                label: item.label || item.value || item,
                value: item.value || item,
              }));
              // For single selection operators, take just the first item
              if (rule.operator === "eq" || rule.operator === "ne") {
                valueForForm = valueForForm[0];
              }
            } else if (typeof rule.value === "object" && rule.value?.value) {
              // If it's a single object with a value property
              valueForForm = {
                label: rule.value.label || rule.value.value,
                value: rule.value.value,
              };
            } else {
              // Simple value
              valueForForm = {
                label: rule.value,
                value: rule.value,
              };
            }

            return {
              property: {
                label:
                  rule.property === "availableLicense"
                    ? "Available License"
                    : rule.property === "availableServicePlan"
                    ? "Available Service Plan"
                    : rule.property === "delegatedAccessStatus"
                    ? "Delegated Access Status"
                    : rule.property === "tenantGroupMember"
                    ? "Member of Tenant Group"
                    : rule.property === "customVariable"
                    ? "Custom Variable"
                    : rule.property,
                value: rule.property,
                type:
                  rule.property === "availableLicense"
                    ? "license"
                    : rule.property === "availableServicePlan"
                    ? "servicePlan"
                    : rule.property === "delegatedAccessStatus"
                    ? "delegatedAccess"
                    : rule.property === "tenantGroupMember"
                    ? "tenantGroup"
                    : rule.property === "customVariable"
                    ? "customVariable"
                    : "unknown",
              },
              operator: {
                label:
                  rule.operator === "eq"
                    ? "Equals"
                    : rule.operator === "ne"
                    ? "Not Equals"
                    : rule.operator === "in"
                    ? "In"
                    : rule.operator === "notIn"
                    ? "Not In"
                    : rule.operator === "like"
                    ? "Contains"
                    : rule.operator === "notlike"
                    ? "Does Not Contain"
                    : rule.operator,
                value: rule.operator,
              },
              value: valueForForm,
            };
          });
        } catch (e) {
          console.error("Error parsing dynamic rules:", e, groupData.DynamicRules);
          formattedDynamicRules = [{}];
        }
      }

      formControl.reset({
        groupId: id,
        groupName: groupData?.Name ?? "",
        groupDescription: groupData?.Description ?? "",
        groupType: isDynamic ? "dynamic" : "static",
        ruleLogic: groupData?.RuleLogic || "and",
        members: !isDynamic
          ? groupData?.Members?.map((member) => ({
              label: member.displayName,
              value: member.customerId,
            })) || []
          : [],
        dynamicRules: formattedDynamicRules,
      });
    }
  }, [groupDetails.isSuccess, groupDetails.data, id]);

  const customDataFormatter = (values) => {
    const formattedData = {
      ...values,
      Action: "AddEdit",
    };

    // If it's a dynamic group, format the rules for the backend
    if (values.groupType === "dynamic" && values.dynamicRules) {
      formattedData.dynamicRules = values.dynamicRules.map((rule) => ({
        property: rule.property?.value || rule.property,
        operator: rule.operator?.value || rule.operator,
        value: rule.value,
      }));
      formattedData.ruleLogic = values.ruleLogic || "and";
    }

    return formattedData;
  };

  return (
    <CippFormPage
      title={`Tenant Group${
        groupDetails.isSuccess && groupDetails?.data?.Results?.[0]?.Name
          ? ` - ${groupDetails.data.Results[0].Name}`
          : ""
      }`}
      backButtonTitle="Tenant Groups"
      formControl={formControl}
      postUrl="/api/ExecTenantGroup"
      queryKey={[`TenantGroupProperties_${id}`, "TenantGroupListPage"]}
      customDataformatter={customDataFormatter}
      formPageType="Edit"
    >
      <Box sx={{ width: "100%" }}>
        <CippAddEditTenantGroups
          formControl={formControl}
          title="Tenant Group"
          backButtonTitle="Tenant Groups"
          hideSubmitButton={true}
        />
      </Box>
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
