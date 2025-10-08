import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useFormState } from "react-hook-form";
import { ApiPostCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Stack,
  CardContent,
  Typography,
  Divider,
  CardActions,
} from "@mui/material";

import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";

const availableTargetObjects = [
  { value: "User", label: "User" },
  { value: "Group", label: "Group" },
  { value: "AdministrativeUnit", label: "Administrative Unit" },
  { value: "Application", label: "Application" },
  { value: "Device", label: "Device" },
  { value: "Organization", label: "Organization" },
];

const Page = () => {
  const router = useRouter();
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      isMultiValued: false,
      targetObjects: [],
    },
  });

  const formState = useFormState({ control: formControl.control });

  const addDirectoryExtensionApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["DirectoryExtensionsListPage"],
  });

  const handleAddDirectoryExtension = (data) => {
    addDirectoryExtensionApi.mutate({
      url: "/api/ExecCustomData",
      data: {
        Action: "AddDirectoryExtension",
        name: data.name,
        dataType: data.dataType,
        isMultiValued: data.isMultiValued,
        targetObjects: data.targetObjects.map((targetObject) => targetObject.value),
      },
    });
  };

  const formFields = [
    {
      name: "name",
      label: "Extension Name",
      type: "textField",
      required: true,
      placeholder: "Enter a unique name for the directory extension",
      disableVariables: true,
    },
    {
      name: "dataType",
      label: "Data Type",
      type: "select",
      required: true,
      placeholder: "Select the data type for the directory extension",
      options: [
        { value: "Binary", label: "Binary (256 bytes max)" },
        { value: "Boolean", label: "Boolean" },
        { value: "DateTime", label: "DateTime (ISO 8601, UTC)" },
        { value: "Integer", label: "Integer (32-bit)" },
        { value: "LargeInteger", label: "LargeInteger (64-bit)" },
        { value: "String", label: "String (256 characters max)" },
      ],
    },
    {
      name: "isMultiValued",
      label: "Is Multi-Valued",
      type: "switch",
      required: false,
    },
    {
      name: "targetObjects",
      label: "Target Objects",
      type: "autoComplete",
      placeholder: "Select the directory objects that can use this extension",
      required: true,
      multiple: true,
      options: availableTargetObjects,
      validate: (value) => {
        if (value.length > 0) return true;
        return "Please select at least one target object.";
      },
      creatable: false,
    },
  ];

  return (
    <CippPageCard
      title="Add Directory Extension"
      backButtonTitle="Directory Extensions"
      noTenantInHead={true}
    >
      <CardContent>
        <Box sx={{ width: "100%" }}>
          <Stack spacing={2}>
            <Box>
              <Stack spacing={1}>
                <Typography variant="h6">Directory Extension Details</Typography>
                <Divider />
                {formFields.map((field, index) => (
                  <CippFormComponent key={index} {...field} formControl={formControl} />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>

        <CippApiResults apiObject={addDirectoryExtensionApi} />
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={formControl.handleSubmit(handleAddDirectoryExtension)}
            disabled={addDirectoryExtensionApi.isPending || !formState.isValid}
          >
            Add Directory Extension
          </Button>
        </Stack>
      </CardActions>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
