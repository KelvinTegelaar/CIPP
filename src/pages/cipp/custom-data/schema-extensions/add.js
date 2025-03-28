import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch, useFormState } from "react-hook-form";
import { ApiPostCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Stack,
  IconButton,
  CardContent,
  Typography,
  Divider,
  CardActions,
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";

import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";

const availableTargetTypes = [
  { value: "user", label: "User" },
  { value: "group", label: "Group" },
  { value: "administrativeUnit", label: "Administrative Unit" },
  { value: "contact", label: "Contact" },
  { value: "device", label: "Device" },
  { value: "event", label: "Event (User and Group Calendars)" },
  { value: "message", label: "Message" },
  { value: "organization", label: "Organization" },
  { value: "post", label: "Post" },
];

const Page = () => {
  const router = useRouter();
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      properties: [],
      status: "InDevelopment",
    },
  });

  const formState = useFormState({ control: formControl.control });

  const addSchemaApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["SchemaExtensionsListPage"],
  });

  const handleAddSchema = (data) => {
    console.log(data);
    if (!data.properties || data.properties.length === 0) {
      formControl.setError("properties", {
        type: "manual",
        message: "At least one property must be added.",
      });
      return;
    }

    addSchemaApi.mutate({
      url: "/api/ExecCustomData",
      data: {
        Action: "AddSchemaExtension",
        schemaExtension: {
          id: data.id,
          description: data.description,
          targetTypes: data.targetTypes.map((targetType) => targetType.value),
          status: data.status,
          properties: data.properties,
        },
      },
    });
  };

  const properties = useWatch({ control: formControl.control, name: "properties" });

  const addProperty = () => {
    formControl.setValue("properties", [...properties, { name: "", type: null }]);
    if (formControl.formState.errors.properties) {
      formControl.clearErrors("properties");
    }
  };

  const removeProperty = (index) => {
    const updatedProperties = properties.filter((_, i) => i !== index);
    formControl.setValue("properties", updatedProperties);
  };

  const handlePropertyChange = (index, field, value) => {
    const updatedProperties = properties.map((property, i) =>
      i === index ? { ...property, [field]: value } : property
    );
    formControl.setValue("properties", updatedProperties);
  };

  const formFields = [
    {
      name: "id",
      label: "Schema ID",
      type: "textField",
      required: true,
      placeholder:
        "Enter a schema id (e.g. cippUser). The prefix is generated automatically after creation.",
    },
    {
      name: "description",
      label: "Description",
      type: "textField",
      required: true,
      placeholder: "Enter a description for the schema extension",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      placeholder: "Select a status for the schema extensions (e.g. InDevelopment, Available)",
      options: [
        { value: "InDevelopment", label: "In Development" },
        { value: "Available", label: "Available" },
      ],
      creatable: false,
    },
    {
      name: "targetTypes",
      label: "Target Types",
      type: "autoComplete",
      placeholder: "Select the directory object target types for the schema extension",
      required: true,
      multiple: true,
      options: availableTargetTypes,
      creatable: false,
      validate: (value) => {
        if (value.length > 0) return true;
        return "Please select at least one target type.";
      },
    },
  ];

  const propertyTypeOptions = [
    { value: "Binary", label: "Binary (256 bytes max)" },
    { value: "Boolean", label: "Boolean" },
    { value: "DateTime", label: "DateTime (ISO 8601, UTC)" },
    { value: "Integer", label: "Integer (32-bit)" },
    { value: "String", label: "String (256 characters max)" },
  ];

  return (
    <CippPageCard
      title="Add Schema Extension"
      backButtonTitle="Schema Extensions"
      noTenantInHead={true}
    >
      <CardContent>
        <Box sx={{ width: "100%" }}>
          <Stack spacing={2}>
            <Box>
              <Stack spacing={1}>
                <Typography variant="h6">Schema Details</Typography>
                <Divider />
                {formFields.map((field, index) => (
                  <CippFormComponent key={index} {...field} formControl={formControl} />
                ))}

                <Typography variant="h6">Properties</Typography>
                <Divider />
                {properties &&
                  properties.map((property, index) => (
                    <Stack direction="row" spacing={1} key={index} alignItems="center">
                      <Box sx={{ width: "300px" }}>
                        <CippFormComponent
                          type="textField"
                          name={`properties[${index}].name`}
                          formControl={formControl}
                          label="Property Name"
                          value={property.name}
                          onChange={(e) => handlePropertyChange(index, "name", e.target.value)}
                          required={true}
                        />
                      </Box>
                      <Box sx={{ width: "300px" }}>
                        <CippFormComponent
                          type="select"
                          name={`properties[${index}].type`}
                          formControl={formControl}
                          label="Property Type"
                          value={property.type}
                          onChange={(e) => handlePropertyChange(index, "type", e.target.value)}
                          options={propertyTypeOptions}
                          required={true}
                          validate={(value) => {
                            if (value) return true;
                            return "Please select a property type.";
                          }}
                        />
                      </Box>
                      <IconButton onClick={() => removeProperty(index)}>
                        <RemoveCircle />
                      </IconButton>
                    </Stack>
                  ))}
                <Box>
                  <Button onClick={addProperty} startIcon={<AddCircle />}>
                    Add Property
                  </Button>
                  {formControl.formState.errors.properties && (
                    <Typography color="error" variant="body2">
                      {formControl.formState.errors.properties.message}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <CippApiResults apiObject={addSchemaApi} />
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={formControl.handleSubmit(handleAddSchema)}
            disabled={addSchemaApi.isPending || !formState.isValid}
          >
            Add Schema Extension
          </Button>
        </Stack>
      </CardActions>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
