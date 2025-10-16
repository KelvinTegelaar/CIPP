import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useFormState } from "react-hook-form";
import { ApiPostCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import { Button, Stack, CardContent, CardActions } from "@mui/material";

import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import CippCustomDataMappingForm from "/src/components/CippFormPages/CippCustomDataMappingForm";

const Page = () => {
  const router = useRouter();
  const formControl = useForm({
    mode: "onChange",
  });

  const formState = useFormState({ control: formControl.control });

  const addMappingApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["MappingsListPage", "ManualEntryMappings*"],
  });

  const handleAddMapping = (data) => {
    // Filter data based on source type to only include relevant fields
    let filteredData;

    if (data.sourceType?.value === "manualEntry") {
      // For manual entry, only include these fields
      filteredData = {
        sourceType: data.sourceType,
        manualEntryFieldLabel: data.manualEntryFieldLabel,
        directoryObjectType: data.directoryObjectType,
        customDataAttribute: data.customDataAttribute,
        tenantFilter: data.tenantFilter,
      };
    } else if (data.sourceType?.value === "extensionSync") {
      // For extension sync, include the original fields
      filteredData = {
        sourceType: data.sourceType,
        extensionSyncDataset: data.extensionSyncDataset,
        extensionSyncProperty: data.extensionSyncProperty,
        directoryObjectType: data.directoryObjectType,
        customDataAttribute: data.customDataAttribute,
        tenantFilter: data.tenantFilter,
      };
    } else {
      // Fallback to all data if source type is not recognized
      filteredData = data;
    }

    addMappingApi.mutate({
      url: "/api/ExecCustomData",
      data: {
        Action: "AddEditMapping",
        Mapping: filteredData,
      },
    });
  };

  return (
    <CippPageCard title="Add Mapping" backButtonTitle="Mappings" noTenantInHead={true}>
      <CardContent>
        <CippCustomDataMappingForm formControl={formControl} />
        <CippApiResults apiObject={addMappingApi} />
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={formControl.handleSubmit(handleAddMapping)}
            disabled={addMappingApi.isPending || !formState.isValid}
          >
            Add Mapping
          </Button>
        </Stack>
      </CardActions>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
