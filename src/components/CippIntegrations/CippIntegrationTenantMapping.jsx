import { Box, CardContent, Grid } from "@mui/material";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useForm } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import extensions from "/src/data/Extensions.json";
import { useEffect } from "react";
import { CippDataTable } from "../CippTable/CippDataTable";

const CippIntegrationSettings = ({ children }) => {
  const router = useRouter();

  const mappings = ApiGetCall({
    url: "/api/ExecExtensionMapping",
    data: {
      List: router.query.id,
    },
    queryKey: `IntegrationTenantMapping-${router.query.id}`,
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: mappings?.data,
  });

  const extension = extensions.find((extension) => extension.id === router.query.id);

  useEffect(() => {
    if (mappings.isSuccess) {
      formControl.reset({
        ...mappings.data,
      });
      formControl.trigger();
    }
  }, [mappings.isSuccess]);

  return (
    <>
      {mappings.isSuccess && extension ? (
        <CippFormSection
          queryKey={`IntegrationTenantMapping-${router.query.id}`}
          formControl={formControl}
          postUrl={`/api/ExecExtensionsConfig?AddMapping=${router.query.id}`}
        >
          {children}

          <Box>
            <CippDataTable
              noCard={true}
              reportTitle={`${extension.id}-tenant-map`}
              data={mappings.data.Mappings}
              simple={false}
              simpleColumns={["Tenant", "IntegrationName"]}
            />
          </Box>
        </CippFormSection>
      ) : (
        <CardContent>
          {mappings.isLoading && <Box>Loading...</Box>}
          {mappings.isSuccess && !extension && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
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
