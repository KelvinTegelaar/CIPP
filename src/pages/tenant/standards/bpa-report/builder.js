import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { Box, Container, Typography, Button, IconButton, Stack, SvgIcon } from "@mui/material";
import { Grid } from "@mui/system";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, useWatch } from "react-hook-form";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useRouter } from "next/router";
import { CippFormCondition } from "../../../../components/CippComponents/CippFormCondition";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { CippHead } from "../../../../components/CippComponents/CippHead";
import { Add, Save } from "@mui/icons-material";

const Page = () => {
  const router = useRouter();

  const addBPATemplate = ApiPostCall({
    relatedQueryKeys: "ListBPATemplates",
  });

  const bpaTemplateList = ApiGetCall({
    url: "/api/ListBPATemplates?RawJson=true",
    queryKey: "ListBPATemplates-Raw",
  });

  const formControl = useForm({
    defaultValues: {
      name: "",
      style: "Table",
      Fields: [{ UseExistingInfo: false }],
    },
  });

  useEffect(() => {
    if (bpaTemplateList.isSuccess) {
      const templateName = router.query.id;
      const template = bpaTemplateList.data.find((template) => template.name === templateName);
      if (template) {
        if (router.query.clone) {
          template.name = `${template.name} (Clone)`;
        }
        setLayoutMode(template.style);
        setBlockCards(
          template.Fields.map((field, index) => {
            return {
              id: `block-${index}`,
            };
          })
        );

        const convertedTemplate = {
          ...template,
          Fields: template.Fields.map((field) => ({
            ...field,
            ExtractFields: field.ExtractFields
              ? field.ExtractFields.map((ef) => ({
                  label: ef,
                  value: ef,
                }))
              : [],
          })),
        };

        formControl.reset(convertedTemplate);
      }
    }
  }, [bpaTemplateList.isSuccess]);

  const { watch, handleSubmit } = formControl;

  const pageTitle = "BPA Report Builder";
  const [layoutMode, setLayoutMode] = useState("Table"); // Set "Table" as default layout
  const [blockCards, setBlockCards] = useState([
    {
      id: `table-card`,
    },
  ]);

  const handleAddBlock = () => {
    setBlockCards((prevCards) => [
      ...prevCards,
      {
        id: `block-${prevCards.length + 1}`,
      },
    ]);
  };

  const handleRemoveBlock = (blockId) => {
    setBlockCards((prevCards) => prevCards.filter((block) => block.id !== blockId));
    //remove the field from the form control
    const fieldIndex = blockId.split("-")[1];
    formControl.setValue(`Fields.${fieldIndex}`, null);
  };

  // Updated saveConfig function to handle autocomplete and clean empty values without touching FrontendFields
  const saveConfig = () => {
    const formData = formControl.getValues();

    // Helper function to recursively clean data while preserving necessary structure
    const cleanData = (data) => {
      if (Array.isArray(data)) {
        return data
          .map(cleanData)
          .filter((item) => item !== null && item !== undefined && item !== "");
      } else if (typeof data === "object" && data !== null) {
        const cleanedObj = {};
        Object.keys(data).forEach((key) => {
          const cleanedValue = cleanData(data[key]);

          // Preserve FrontendFields structure and other arrays
          if (key === "FrontendFields" || Array.isArray(cleanedValue)) {
            cleanedObj[key] = cleanedValue;
          } else if (cleanedValue !== null && cleanedValue !== undefined && cleanedValue !== "") {
            cleanedObj[key] = cleanedValue;
          }
        });
        return Object.keys(cleanedObj).length === 0 ? null : cleanedObj;
      } else if (typeof data === "string") {
        return data.trim() === "" ? null : data;
      }

      return data;
    };

    // Clean the form data
    const cleanedData = cleanData(formData);

    // Process autocomplete fields to only store the value
    const processAutoComplete = (fields) => {
      Object.keys(fields).forEach((key) => {
        if (
          typeof fields[key] === "object" &&
          fields[key] !== null &&
          fields[key].value !== undefined &&
          fields[key].label !== undefined
        ) {
          fields[key] = fields[key].value; // Save only the value part of autocomplete
        } else if (typeof fields[key] === "object") {
          processAutoComplete(fields[key]); // Recurse for nested objects
        }
      });
    };

    processAutoComplete(cleanedData); // Apply the processing to the cleaned data

    const jsonConfig = JSON.stringify(cleanedData, null, 2);
    addBPATemplate.mutate({ url: "/api/AddBPATemplate", data: cleanedData });
  };

  const handleLayoutModeChange = (newMode) => {
    setLayoutMode(newMode);
    //formControl.setValue("style", newMode);

    // Reset cards based on the layout mode
    if (newMode === "Table") {
      // Default table card
      setBlockCards([
        {
          id: `table-card`,
        },
      ]);
    } else {
      // Reset to a block-based layout with a default card
      setBlockCards([
        {
          id: `block-default`,
        },
      ]);
    }
  };

  const style = useWatch({ control: formControl.control, name: "style" });

  useEffect(() => {
    if (style && style !== layoutMode) {
      handleLayoutModeChange(style);
    }
  }, [style]);

  const onSubmit = (data) => {};
  return (
    <>
      <CippHead title={pageTitle} />
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <Container maxWidth={false}>
          <Stack spacing={4}>
            <Typography variant="h4" gutterBottom>
              {pageTitle}
            </Typography>
          </Stack>
          {/* Card for Layout Controls */}
          <CippButtonCard
            CardButton={
              <>
                <Button variant="contained" onClick={saveConfig} startIcon={<Save />}>
                  Save Report
                </Button>
              </>
            }
            title="Report Settings"
          >
            <Grid container spacing={2}>
              {/* First item for Report Name and Layout Mode */}
              <Grid size={{ md: 12, sm: 12, xs: 12 }}>
                <CippFormComponent label="Report Name" name={`name`} formControl={formControl} />
              </Grid>

              <Grid size={{ md: 12, sm: 12, xs: 12 }}>
                <CippFormComponent
                  label="Layout Mode"
                  name="style"
                  type="select"
                  options={[
                    { label: "Block", value: "Tenant" },
                    { label: "Table", value: "Table" },
                  ]}
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ md: 12, sm: 12, xs: 12 }}>
                <CippApiResults apiObject={addBPATemplate} />
              </Grid>
            </Grid>
          </CippButtonCard>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 3 }}>
            <Typography variant="h5">Fields</Typography>
            <Button variant="outlined" size="small" onClick={handleAddBlock} startIcon={<Add />}>
              Add Field
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {blockCards.map((block, index) => (
              <Grid
                size={{
                  md: layoutMode === "Table" ? 12 : 4,
                  sm: layoutMode === "Table" ? 12 : 6,
                  xs: 10,
                }}
                key={block.id}
              >
                <CippButtonCard
                  title={`${layoutMode === "Table" ? "Table Column" : "Block"} - ${
                    watch(`Fields.${index}.FrontendFields.0.name`) || "New Field"
                  }`}
                  cardActions={
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleRemoveBlock(block.id)} // Remove block on click
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  {/* Form inside each card */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                      {/* Report Style - Full Width */}
                      <Grid size={{ xs: 6 }}>
                        <CippFormComponent
                          label="Card Name"
                          name={`Fields.${index}.FrontendFields.0.name`} // Corrected index
                          formControl={formControl}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <CippFormComponent
                          label="Card Description"
                          name={`Fields.${index}.FrontendFields.0.desc`} // Corrected index
                          formControl={formControl}
                          type="textField"
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <CippFormComponent
                          label="Use information CIPP has previously gathered in another report"
                          name={`Fields.${index}.UseExistingInfo`} // Use correct index for the card
                          formControl={formControl}
                          type="switch"
                        />
                      </Grid>
                      <CippFormCondition
                        field={`Fields.${index}.UseExistingInfo`} // Corrected condition field
                        compareType="isNot"
                        compareValue={true}
                        formControl={formControl}
                      >
                        <Grid size={{ xs: 12 }}>
                          <CippFormComponent
                            label="Data source"
                            name={`Fields.${index}.API`} // Corrected index
                            formControl={formControl}
                            multiple={false}
                            options={[
                              { label: "Graph", value: "Graph" },
                              { label: "Exchange Online PowerShell", value: "Exchange" },
                              { label: "CIPP Function", value: "CIPPFunction" },
                            ]}
                            type="autoComplete"
                          />
                        </Grid>
                        <CippFormCondition
                          field={`Fields.${index}.API`}
                          compareType="is"
                          compareValue={"Graph"}
                          formControl={formControl}
                        >
                          <Grid size={{ xs: 12 }}>
                            <CippFormComponent
                              label="Graph URL"
                              name={`Fields.${index}.URL`} // Corrected index
                              formControl={formControl}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <CippFormComponent
                              label="Where Object (PowerShell Syntax, optional)"
                              name={`Fields.${index}.where`} // Corrected index
                              formControl={formControl}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <CippFormComponent
                              label="Use Application Permissions"
                              name={`Fields.${index}.Parameters.asApp`} // Corrected index
                              formControl={formControl}
                              type="switch"
                            />
                          </Grid>
                        </CippFormCondition>

                        <CippFormCondition
                          field={`Fields.${index}.API`}
                          compareType="is"
                          compareValue={"Exchange"}
                          formControl={formControl}
                        >
                          <Grid size={{ xs: 12 }}>
                            <CippFormComponent
                              label="Exchange Command (PowerShell Syntax)"
                              name={`Fields.${index}.Command`} // Corrected index
                              formControl={formControl}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <CippFormComponent
                              label="Where Object (PowerShell Syntax, optional)"
                              name={`Fields.${index}.where`} // Corrected index
                              formControl={formControl}
                            />
                          </Grid>
                        </CippFormCondition>
                        <CippFormCondition
                          field={`Fields.${index}.API`}
                          compareType="is"
                          compareValue={"CIPPFunction"}
                          formControl={formControl}
                        >
                          <Grid size={{ xs: 12 }}>
                            <CippFormComponent
                              label="CIPP Command (Get- only)"
                              name={`Fields.${index}.Command`} // Corrected index
                              formControl={formControl}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <CippFormComponent
                              label="Where Object (PowerShell Syntax, optional)"
                              name={`Fields.${index}.where`} // Corrected index
                              formControl={formControl}
                            />
                          </Grid>
                        </CippFormCondition>
                        <Grid size={{ xs: 12 }}>
                          <CippFormComponent
                            label="What fields from the API response should we save?"
                            name={`Fields.${index}.ExtractFields`} // Corrected index
                            formControl={formControl}
                            type="autoComplete"
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CippFormComponent
                            label="Store this data as"
                            name={`Fields.${index}.StoreAs`} // Corrected index
                            formControl={formControl}
                            multiple={false}
                            options={[
                              {
                                label: "String - Useful if you are extracting a specific string.",
                                value: "string",
                              },
                              {
                                label: "JSON - Useful when storing as a complex object",
                                value: "JSON",
                              },
                              { label: "Bool - useful to store true/false values.", value: "bool" },
                            ]}
                            type="autoComplete"
                          />
                        </Grid>
                      </CippFormCondition>
                      <Grid size={{ xs: 12 }}>
                        <CippFormComponent
                          label="Datasource Reference Name - This is the name stored in the database."
                          name={`Fields.${index}.name`} // Corrected index
                          formControl={formControl}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        {layoutMode === "Table" ? null : (
                          <CippFormComponent
                            label="Card Formatter"
                            name={`Fields.${index}.FrontendFields.0.formatter`} // Corrected index
                            formControl={formControl}
                            multiple={false}
                            options={[
                              { label: "String - Show as text", value: "string" },
                              { label: "Boolean - Show a true/false check", value: "bool" },
                              {
                                label:
                                  "Warn Boolean - Show a true/false check that is orange when false",
                                value: "warnBool",
                              },
                              {
                                label: "Reverse Boolean - False is green, True is red.",
                                value: "reverseBool",
                              },
                              { label: "Table - Show the data in a table", value: "table" },
                              { label: "Number - Show the value as a number", value: "number" },
                              {
                                label: "Percentage - Show the value as a percentage",
                                value: "percentage",
                              },
                            ]}
                            type="autoComplete"
                          />
                        )}
                      </Grid>
                      <CippFormCondition
                        field={`Fields.${index}.UseExistingInfo`} // Corrected condition field
                        compareValue={true}
                        formControl={formControl}
                      >
                        <Grid size={{ xs: 12 }}>
                          <CippFormComponent
                            name={`Fields.${index}.FrontendFields.0.value`} // Corrected index
                            label={"Card Content"}
                            type="autoComplete"
                            formControl={formControl}
                            multiple={false}
                            options={
                              bpaTemplateList.data
                                ?.flatMap(
                                  (template) => template.Fields?.map((field) => field.name) ?? []
                                )
                                .filter(
                                  (value, index, self) => value && self.indexOf(value) === index
                                )
                                .map((field) => ({ label: field, value: field }))
                                .sort((a, b) => a.label.localeCompare(b.label)) ?? []
                            }
                          />
                        </Grid>
                      </CippFormCondition>

                      <CippFormCondition
                        field={`Fields.${index}.UseExistingInfo`} // Corrected condition field
                        compareValue={false}
                        formControl={formControl}
                      >
                        <Grid size={{ xs: 12 }}>
                          {layoutMode === "Table" ? null : (
                            <CippFormComponent
                              label="Card Value"
                              name={`Fields.${index}.FrontendFields.0.value`} // Corrected index
                              formControl={formControl}
                              type="textField"
                            />
                          )}
                        </Grid>
                      </CippFormCondition>
                      {/* Formatter - Full Width */}
                    </Grid>
                  </form>
                </CippButtonCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
