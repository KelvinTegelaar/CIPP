import React, { useState, useEffect } from "react";
import { Button, Box } from "@mui/material";
import { useForm, useFormState } from "react-hook-form";
import { GroupAdd } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";
import CippAddEditTenantGroups from "./CippAddEditTenantGroups";
import { getCippValidator } from "../../utils/get-cipp-validator";

export const CippAddTenantGroupDrawer = ({
  buttonText = "Add Tenant Group",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      groupType: "static",
      ruleLogic: "and",
      dynamicRules: [{}]
    },
  });

  const createTenantGroup = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["TenantGroupListPage"],
  });

  const { isValid, isDirty } = useFormState({ control: formControl.control });

  useEffect(() => {
    if (createTenantGroup.isSuccess) {
      formControl.reset({
        groupType: "static",
        ruleLogic: "and",
        dynamicRules: [{}]
      });
    }
  }, [createTenantGroup.isSuccess]);

  const handleSubmit = (data) => {
    const formattedData = {
      ...data,
      Action: "AddEdit",
    };

    // If it's a dynamic group, format the rules for the backend
    if (data.groupType === "dynamic" && data.dynamicRules) {
      formattedData.dynamicRules = data.dynamicRules.map(rule => ({
        property: rule.property?.value || rule.property,
        operator: rule.operator?.value || rule.operator,
        value: rule.value,
      }));
      formattedData.ruleLogic = data.ruleLogic || "and";
    }

    createTenantGroup.mutate({
      url: "/api/ExecTenantGroup",
      data: formattedData,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      groupType: "static",
      ruleLogic: "and",
      dynamicRules: [{}]
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<GroupAdd />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add Tenant Group"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={formControl.handleSubmit(handleSubmit)}
              disabled={createTenantGroup.isPending || !isValid || (!isDirty && !createTenantGroup.isSuccess)}
            >
              {createTenantGroup.isPending
                ? "Creating Group..."
                : createTenantGroup.isSuccess
                ? "Create Another Group"
                : "Create Group"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Box sx={{ my: 2 }}>
          <CippAddEditTenantGroups
            formControl={formControl}
            title="Add Tenant Group"
            backButtonTitle="Tenant Groups"
            hideSubmitButton={true}
          />
        </Box>
        <CippApiResults apiObject={createTenantGroup} />
      </CippOffCanvas>
    </>
  );
};