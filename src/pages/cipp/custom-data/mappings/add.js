import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { ApiPostCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import { Box, Button, Stack, CardContent, Typography, Divider, CardActions } from "@mui/material";

import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { GroupHeader, GroupItems } from "/src/components/CippComponents/CippAutocompleteGrouping";
import { getCippTranslation } from "/src/utils/get-cipp-translation";
import { Grid } from "@mui/system";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { CippCopyToClipBoard } from "/src/components/CippComponents/CippCopyToClipboard";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import extensionDataMapping from "/src/data/ExtensionDataMapping";
import { validate } from "numeral";

const Page = () => {
  const router = useRouter();
  const formControl = useForm({
    mode: "onChange",
  });

  const formState = useFormState({ control: formControl.control });
  const selectedAttribute = useWatch({ control: formControl.control, name: "customDataAttribute" });
  const selectedDirectoryObjectType = useWatch({
    control: formControl.control,
    name: "directoryObjectType",
  });
  const selectedExtensionSyncDataset = useWatch({
    control: formControl.control,
    name: "extensionSyncDataset",
  });
  const selectedExtensionSyncProperty = useWatch({
    control: formControl.control,
    name: "extensionSyncProperty",
  });

  const addMappingApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["MappingsListPage"],
  });

  const handleAddMapping = (data) => {
    addMappingApi.mutate({
      url: "/api/ExecCustomData",
      data: {
        Action: "AddMapping",
        Mapping: data,
      },
    });
  };

  // Static list of directory object types based on schema and directory extensions
  const staticTargetTypes = [
    /*{ value: "administrativeUnit", label: "Administrative Unit" },
    { value: "application", label: "Application" },
    { value: "contact", label: "Contact" },
    { value: "device", label: "Device" },
    { value: "event", label: "Event (User and Group Calendars)" },
    { value: "group", label: "Group" },
    { value: "message", label: "Message" },
    { value: "organization", label: "Organization" },
    { value: "post", label: "Post" },*/
    { value: "user", label: "User" },
  ];

  const sourceFields = [
    {
      name: "sourceType",
      label: "Source Type",
      type: "autoComplete",
      required: true,
      multiple: false,
      placeholder: "Select a Source Type",
      options: [{ value: "extensionSync", label: "Extension Sync" }],
    },
    {
      name: "extensionSyncDataset",
      label: "Extension Sync Dataset",
      type: "autoComplete",
      required: true,
      placeholder: "Select a Property",
      options: Object.keys(extensionDataMapping).map((key) => ({
        value: key,
        label: getCippTranslation(key),
        addedFields: extensionDataMapping[key],
      })),
      multiple: false,
      creatable: false,
      condition: {
        field: "sourceType",
        compareType: "is",
        compareValue: "extensionSync",
      },
    },
    {
      name: "extensionSyncProperty",
      label: "Source Property",
      type: "autoComplete",
      required: true,
      placeholder: "Select a Property",
      options:
        selectedExtensionSyncDataset?.addedFields?.properties?.length > 0
          ? selectedExtensionSyncDataset?.addedFields?.properties.map((property) => ({
              value: property.name,
              label: getCippTranslation(property.name),
              addedFields: property,
            }))
          : [],
      multiple: false,
      creatable: false,
      condition: {
        field: "extensionSyncDataset",
        propertyName: "addedFields.type",
        compareType: "isNot",
        compareValue: "array",
      },
      sortOptions: true,
      validate: (value) => {
        if (!value) {
          return "Please select a property";
        }
        return true;
      },
    },
  ];

  // Update the "customDataAttribute" field to use the static list
  const destinationFields = [
    {
      name: "directoryObjectType",
      label: "Directory Object Type",
      type: "autoComplete",
      required: true,
      placeholder: "Select an Object Type",
      options: staticTargetTypes,
      multiple: false,
      creatable: false,
    },
    {
      name: "customDataAttribute",
      label: "Destination Property",
      type: "autoComplete",
      required: true,
      placeholder: "Select an Attribute",
      api: {
        url: "/api/ExecCustomData?Action=ListAvailableAttributes",
        queryKey: "CustomAttributes",
        dataKey: "Results",
        dataFilter: (options) =>
          selectedDirectoryObjectType?.value
            ? options.filter(
                (option) =>
                  (option?.addedFields?.isMultiValued === false &&
                    selectedExtensionSyncDataset?.addedFields?.type === "object") ||
                  (option?.addedFields?.isMultiValued === true &&
                    selectedExtensionSyncDataset?.addedFields?.type === "array")
              )
            : options,
        valueField: "name",
        labelField: "name",
        showRefresh: true,
        addedField: {
          type: "type",
          targetObject: "targetObject",
          dataType: "dataType",
          isMultiValued: "isMultiValued",
        },
      },
      multiple: false,
      sortOptions: true,
      groupBy: (option) => option.addedFields.type,
      renderGroup: (params) => (
        <li key={params.key}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      ),
      creatable: false,
      condition: {
        field: "directoryObjectType",
        compareType: "hasValue",
        compareValue: true,
      },
    },
  ];

  return (
    <CippPageCard title="Add Mapping" backButtonTitle="Mappings" noTenantInHead={true}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item size={{ xl: 8, xs: 12 }}>
            <Box sx={{ width: "100%" }}>
              <Stack spacing={2}>
                <Box>
                  <Stack spacing={1}>
                    <Typography variant="h6">Tenant Selection</Typography>
                    <Divider />
                    <CippFormTenantSelector
                      name="tenantFilter"
                      formControl={formControl}
                      multiple={false}
                      includeGroups={true}
                      disableClearable={true}
                      allTenants={true}
                    />
                  </Stack>
                </Box>
                <Box>
                  <Stack spacing={1}>
                    <Typography variant="h6">Source Details</Typography>
                    <Divider />
                    {sourceFields.map((field, index) => (
                      <>
                        {field?.condition ? (
                          <CippFormCondition
                            key={index}
                            {...field.condition}
                            formControl={formControl}
                          >
                            <CippFormComponent {...field} formControl={formControl} />
                          </CippFormCondition>
                        ) : (
                          <CippFormComponent key={index} {...field} formControl={formControl} />
                        )}
                      </>
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Stack spacing={1}>
                    <Typography variant="h6">Destination Details</Typography>
                    <Divider />
                    {destinationFields.map((field, index) => (
                      <>
                        {field?.condition ? (
                          <CippFormCondition
                            key={index}
                            {...field.condition}
                            formControl={formControl}
                          >
                            <CippFormComponent {...field} formControl={formControl} />
                          </CippFormCondition>
                        ) : (
                          <CippFormComponent key={index} {...field} formControl={formControl} />
                        )}
                      </>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Grid>
          <Grid item size={{ xl: 4, xs: 12 }}>
            <Stack spacing={2}>
              {selectedExtensionSyncDataset && (
                <CippPropertyListCard
                  title="Source"
                  propertyItems={[
                    {
                      label: "Dataset Name",
                      value: (
                        <CippCopyToClipBoard
                          text={selectedExtensionSyncDataset?.label}
                          type="chip"
                        />
                      ),
                    },
                    {
                      label: "Description",
                      value: selectedExtensionSyncDataset?.addedFields?.description || "N/A",
                    },
                  ]}
                  variant="outlined"
                />
              )}

              {selectedAttribute && (
                <CippPropertyListCard
                  title="Destination"
                  propertyItems={[
                    {
                      label: "Attribute Name",
                      value: <CippCopyToClipBoard text={selectedAttribute?.value} type="chip" />,
                    },
                    {
                      label: "Custom Data Type",
                      value: selectedAttribute?.addedFields?.type,
                    },
                    {
                      label: "Target Object",
                      value: selectedAttribute?.addedFields?.targetObject,
                    },
                    {
                      label: "Data Type",
                      value: selectedAttribute?.addedFields?.dataType,
                    },
                    {
                      label: "Is Multi-Valued",
                      value: selectedAttribute?.addedFields?.isMultiValued ? "Yes" : "No",
                    },
                  ]}
                  variant="outlined"
                />
              )}
            </Stack>
          </Grid>
        </Grid>

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
