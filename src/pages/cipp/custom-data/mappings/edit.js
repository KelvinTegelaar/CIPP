import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm, useFormState } from "react-hook-form";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ApiPostCall, ApiGetCall } from "../../../../api/ApiCall";
import { Button, Stack, CardContent, CardActions, Skeleton } from "@mui/material";

import CippPageCard from "../../../../components/CippCards/CippPageCard";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import CippCustomDataMappingForm from "../../../../components/CippFormPages/CippCustomDataMappingForm";

const Page = () => {
  const router = useRouter();
  const { id } = router.query;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {}, // Default values will be populated after fetching data
  });

  const formState = useFormState({ control: formControl.control });

  const fetchMappingApi = ApiGetCall({
    url: `/api/ExecCustomData?Action=GetMapping&id=${id}`,
    onResult: (data) => {
      formControl.reset(data?.Results); // Populate form with fetched data
    },
  });

  const editMappingApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["MappingsListPage"],
  });

  const handleEditMapping = (data) => {
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

    editMappingApi.mutate({
      url: "/api/ExecCustomData",
      data: {
        Action: "AddEditMapping",
        id: id, // ID at top level for PowerShell function
        Mapping: filteredData,
      },
    });
  };

  useEffect(() => {
    if (id) {
      fetchMappingApi.refetch(); // Fetch mapping data when `id` is available
    }
  }, [id]);

  return (
    <CippPageCard title="Edit Mapping" backButtonTitle="Mappings" noTenantInHead={true}>
      <CardContent>
        <Stack spacing={2}>
          {fetchMappingApi.isFetching ? (
            <Skeleton variant="rectangular" height={400} sx={{ my: 4 }} />
          ) : (
            <CippCustomDataMappingForm formControl={formControl} />
          )}
          <CippApiResults apiObject={editMappingApi} />
        </Stack>
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={formControl.handleSubmit(handleEditMapping)}
            disabled={editMappingApi.isPending || !formState.isValid}
          >
            Save Changes
          </Button>
        </Stack>
      </CardActions>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
