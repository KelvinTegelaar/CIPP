import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useFormState } from "react-hook-form";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ApiPostCall, ApiGetCall } from "/src/api/ApiCall";
import {
  Box,
  Button,
  Stack,
  CardContent,
  Typography,
  Divider,
  CardActions,
  Skeleton,
} from "@mui/material";

import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import CippCustomDataMappingForm from "/src/components/CippFormPages/CippCustomDataMappingForm";

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
    editMappingApi.mutate({
      url: "/api/ExecCustomData",
      data: {
        Action: "AddEditMapping",
        Mapping: { ...data, id }, // Include the ID for editing
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
