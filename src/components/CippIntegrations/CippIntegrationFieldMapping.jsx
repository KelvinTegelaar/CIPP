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
  Alert,
} from "@mui/material";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import { useForm } from "react-hook-form";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import extensions from "/src/data/Extensions.json";
import React, { useEffect, useState } from "react";
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
  });

  const extension = extensions.find((extension) => extension.id === router.query.id);
  const [missingMappings, setMissingMappings] = useState([]);

  useEffect(() => {
    if (fieldMapping.isSuccess) {
      var newMappings = {};
      var missingMappings = [];
      fieldMapping?.data?.Mappings?.forEach((mapping) => {
        const exists = fieldMapping?.data?.IntegrationFields?.some(
          (integrationField) => String(integrationField.value) === mapping.IntegrationId
        );
        if (exists) {
          newMappings[mapping.RowKey] = {
            label: mapping?.IntegrationName,
            value: mapping?.IntegrationId,
          };
        } else if (mapping.IntegrationId === "") {
          newMappings[mapping.RowKey] = {
            label: "--- Do not synchronize ---",
            value: null,
          };
        } else {
          const missingField = fieldMapping?.data?.CIPPFields?.find(
            (field) => field.FieldName === mapping.RowKey
          );
          if (missingField) {
            missingMappings.push(missingField.FieldLabel);
          }
        }
      });

      setMissingMappings(missingMappings);

      formControl.reset({
        ...newMappings,
      });
      formControl.trigger();
    }
  }, [fieldMapping.isSuccess, fieldMapping?.data]);

  return (
    <>
      {fieldMapping.isSuccess && extension ? (
        <CippFormSection
          queryKey={`IntegrationFieldMapping-${router.query.id}-Post`}
          relatedQueryKeys={[`IntegrationFieldMapping-${router.query.id}`]}
          formControl={formControl}
          title={extension.name}
          backButtonTitle="Integrations"
          postUrl={`/api/ExecExtensionMapping?AddMapping=${router.query.id}Fields`}
          resetForm={false}
        >
          <>
            {fieldMapping?.data?.CIPPFieldHeaders?.map((header, headerIndex) => (
              <React.Fragment key={`header-${headerIndex}`}>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4">{header.Title}</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {header.Description}
                    </Typography>
                  </Box>
                  {headerIndex === 0 && (
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
                  ).map((field, fieldIndex) => (
                    <Grid item xs={12} md={6} key={`field-${headerIndex}-${fieldIndex}`}>
                      <Box sx={{ p: 1 }}>
                        <CippFormComponent
                          name={field.FieldName}
                          type="autoComplete"
                          label={field.FieldLabel}
                          options={fieldMapping?.data?.IntegrationFields?.filter(
                            (integrationField) =>
                              (integrationField?.type === field.Type &&
                                integrationField?.FieldType === field.FieldType) ||
                              integrationField?.type === "unset"
                          )?.map((integrationField) => {
                            return {
                              label: integrationField?.name,
                              value: integrationField?.value,
                            };
                          })}
                          formControl={formControl}
                          multiple={false}
                          creatable={false}
                          fullWidth
                          isFetching={fieldMapping.isFetching}
                          disableClearable={true}
                          required={true}
                          validators={{
                            validate: (value) => {
                              return value ? true : "Please select a value";
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </React.Fragment>
            ))}
            {missingMappings.length > 0 && (
              <Alert severity="warning">
                The following mappings are missing: {missingMappings.join(", ")}
              </Alert>
            )}
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
