import {
  Box,
  Grid,
  CardContent,
  Skeleton,
  Typography,
  Divider,
  Tooltip,
  IconButton,
  Button,
} from "@mui/material";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import { useForm } from "react-hook-form";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import extensions from "/src/data/Extensions.json";
import { useEffect } from "react";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Sync } from "@mui/icons-material";
import { Stack } from "@mui/system";

const CippIntegrationFieldMapping = () => {
  const router = useRouter();

  const fieldMapping = ApiGetCall({
    url: "/api/ExecExtensionMapping",
    data: {
      List: `${router.query.id}Fields`,
    },
    queryKey: `IntegrationFieldMapping-${router.query.id}`,
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: fieldMapping?.data?.Mappings?.map((mapping) => {
      return {
        [mapping.RowKey]: {
          label: mapping?.IntegrationName,
          value: mapping?.IntegrationId,
        },
      };
    }),
  });

  const extension = extensions.find((extension) => extension.id === router.query.id);

  useEffect(() => {
    if (fieldMapping.isSuccess) {
      var newMappings = {};
      fieldMapping?.data?.Mappings?.map((mapping) => {
        newMappings[mapping.RowKey] = {
          label: mapping?.IntegrationName,
          value: mapping?.IntegrationId,
        };
      });

      formControl.reset({
        ...newMappings,
      });
      formControl.trigger();
    }
  }, [fieldMapping.isSuccess]);

  return (
    <>
      {fieldMapping.isSuccess && extension ? (
        <CippFormSection
          queryKey={`IntegrationFieldMapping-${router.query.id}-Post`}
          formControl={formControl}
          title={extension.name}
          backButtonTitle="Integrations"
          postUrl={`/api/ExecExtensionMapping?AddMapping=${router.query.id}Fields`}
          resetForm={false}
        >
          <>
            {fieldMapping?.data?.CIPPFieldHeaders?.map((header, index) => (
              <>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography key={index} variant="h4">
                      {header.Title}
                    </Typography>
                    <Typography key={index} variant="body2" sx={{ mb: 2 }}>
                      {header.Description}
                    </Typography>
                  </Box>
                  {index === 0 && (
                    <Box>
                      <Tooltip title="Refresh Mappings">
                        <Button
                          onClick={() => {
                            fieldMapping.refetch();
                          }}
                          variant="contained"
                        >
                          <Sync />
                        </Button>
                      </Tooltip>
                    </Box>
                  )}
                </Stack>
                <Divider />
                <Grid container spacing={3} sx={{ mt: 1, mb: 3 }}>
                  {fieldMapping?.data?.CIPPFields?.filter(
                    (field) => field.FieldType === header.FieldType
                  ).map((field, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Box sx={{ p: 1 }}>
                        <CippFormComponent
                          name={field.FieldName}
                          type="autoComplete"
                          label={field.FieldLabel}
                          options={fieldMapping?.data?.IntegrationFields?.filter(
                            (integrationField) =>
                              (integrationField?.type === field.Type &&
                                integrationField?.FieldType === field.FieldType) ||
                              integrationField?.type === undefined ||
                              integrationField?.FieldType === undefined
                          )?.map((integrationField) => {
                            return {
                              label: integrationField?.name,
                              value: integrationField?.value,
                            };
                          })}
                          formControl={formControl}
                          multiple={false}
                          fullWidth
                          isFetching={fieldMapping.isFetching}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            ))}
          </>
        </CippFormSection>
      ) : (
        <CardContent>
          {fieldMapping.isLoading && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box>
                    <Skeleton variant="rectangular" height={60} />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box>
                    <Skeleton variant="rectangular" height={60} />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          {fieldMapping.isSuccess && !extension && (
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

export default CippIntegrationFieldMapping;
