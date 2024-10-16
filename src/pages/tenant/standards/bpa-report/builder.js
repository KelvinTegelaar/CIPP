import { Layout as DashboardLayout } from "/src/layouts/index.js";
import {
  Box,
  Container,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Stack,
  SvgIcon,
} from "@mui/material";
import { useState } from "react";
import Head from "next/head";
import DeleteIcon from "@mui/icons-material/Delete";

import { useForm } from "react-hook-form";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useRouter } from "next/router";
import { CippFormCondition } from "../../../../components/CippComponents/CippFormCondition";

const Page = () => {
  const formControl = useForm({
    defaultValues: {
      name: "",
      style: "Table",
      Fields: [],
    },
  });

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
  };

  const saveConfig = () => {
    const jsonConfig = JSON.stringify(blockCards, null, 2);
    console.log("Saved Config:", jsonConfig);
  };

  const handleLayoutModeChange = (event) => {
    const newMode = event.target.value;
    setLayoutMode(newMode);

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

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };
  const router = useRouter();
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth={false}>
          <Stack spacing={4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                color="inherit"
                onClick={() => router.back()}
                startIcon={
                  <SvgIcon fontSize="small">
                    <ArrowLeftIcon />
                  </SvgIcon>
                }
              >
                Back to Templates
              </Button>
            </Stack>

            <Typography variant="h4" gutterBottom>
              {pageTitle}
            </Typography>
          </Stack>
          {/* Card for Layout Controls */}
          <CippButtonCard
            CardButton={
              <Button variant="contained" onClick={saveConfig} sx={{ ml: 2 }}>
                Save Dashboard Configuration
              </Button>
            }
            title="Layout Controls"
          >
            <Grid container spacing={4}>
              {/* First item for Report Name and Layout Mode */}
              <Grid item xs={12} sm={12} md={12}>
                <CippFormComponent label="Report Name" name={`name`} formControl={formControl} />
              </Grid>

              <Grid item xs={12} sm={12} md={12}>
                <FormControl fullWidth>
                  <InputLabel id="layout-mode-label">Layout Mode</InputLabel>
                  <Select
                    labelId="layout-mode-label"
                    id="layout-mode"
                    value={layoutMode}
                    onChange={handleLayoutModeChange}
                    fullWidth
                  >
                    <MenuItem value="Block">Block</MenuItem>
                    <MenuItem value="Table">Table</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Third item for Buttons */}
              {layoutMode === "Block" && (
                <Grid item xs={12} sm={12} md={12}>
                  <Box sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={handleAddBlock}>
                      Add Block
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CippButtonCard>

          {/* Canvas Area */}
          <Typography variant="h6" gutterBottom>
            Canvas
          </Typography>

          <Grid container spacing={2}>
            {blockCards.map((block, index) => (
              <Grid
                item
                xs={10}
                sm={layoutMode === "Table" ? 12 : 6}
                md={layoutMode === "Table" ? 12 : 4}
                key={block.id}
              >
                <CippButtonCard
                  title={block.id === "table-card" ? `Default Table Card` : `BPA Report`}
                  cardActions={
                    layoutMode === "Block" && (
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleRemoveBlock(block.id)} // Remove block on click
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  {/* Form inside each card */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Report Style */}
                    <CippFormComponent
                      label="Report Style"
                      name={`Fields.${index}.style`}
                      formControl={formControl}
                      autoCompleteOptions={["Table", "Tenant"]}
                      type="autocomplete"
                    />

                    {/* Frontend Fields */}
                    <CippFormComponent
                      label="Card Name"
                      name={`Fields.${index}.FrontendFields.0.name`}
                      formControl={formControl}
                    />

                    <CippFormComponent
                      label="Card Description"
                      name={`Fields.${index}.desc`}
                      formControl={formControl}
                    />

                    <CippFormComponent
                      label="Card Formatter"
                      name={`Fields.${index}.FrontendFields.0.formatter`}
                      formControl={formControl}
                      multiple={false}
                      options={[
                        { label: "String - Show as text", value: "string" },
                        { label: "Boolean - Show a true/false check", value: "bool" },
                        {
                          label: "Warn Boolean - Show a true/false check that is orange when false",
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

                    <CippFormComponent
                      label="Use information CIPP has previously gathered in another report"
                      name={`Fields.${index}.UseExistingInfo`}
                      formControl={formControl}
                      type="switch"
                    />
                    <CippFormCondition
                      field={`Fields.${index}.UseExistingInfo`}
                      compareValue={true}
                      formControl={formControl}
                    >
                      <CippFormComponent
                        name={`Fields.${index}.value`}
                        label={"Field Name"}
                        type="autoComplete"
                        formControl={formControl}
                        multiple={false}
                        api={{
                          queryKey: `ListBPA`,
                          url: "/api/ListBPA",
                          dataKey: "Keys",
                          labelField: (option) => `${option}`,
                          valueField: "id",
                        }}
                      />
                    </CippFormCondition>

                    <CippFormCondition
                      field={`Fields.${index}.UseExistingInfo`}
                      compareValue={false}
                      formControl={formControl}
                    >
                      <CippFormComponent
                        label="Data source"
                        name={`Fields.${index}.API`}
                        formControl={formControl}
                        multiple={false}
                        options={[
                          { label: "Microsoft Graph", value: "Graph" },
                          { label: "Exchange Online PowerShell", value: "Exchange" },
                          { label: "CIPP Function", value: "CIPPFunction" },
                        ]}
                        type="autoComplete"
                      />
                      <CippFormCondition
                        field={`Fields.${index}.API`}
                        compareType="is"
                        compareValue={{ label: "Microsoft Graph", value: "Graph" }}
                        formControl={formControl}
                      >
                        <CippFormComponent
                          label="Graph URL"
                          name={`Fields.${index}.URL`}
                          formControl={formControl}
                        />
                        <CippFormComponent
                          label="Where Object (PowerShell Syntax, optional)"
                          name={`Fields.${index}.where`}
                          formControl={formControl}
                        />
                        <CippFormComponent
                          label="Use Application Permissions"
                          name={`Fields.${index}.parameters.asApp`}
                          formControl={formControl}
                          type="switch"
                        />
                      </CippFormCondition>
                      <CippFormCondition
                        field={`Fields.${index}.API`}
                        compareType="is"
                        compareValue={{ label: "Exchange Online PowerShell", value: "Exchange" }}
                        formControl={formControl}
                      >
                        <CippFormComponent
                          label="Exchange Command (PowerShell Syntax)"
                          name={`Fields.${index}.Command`}
                          formControl={formControl}
                        />
                        <CippFormComponent
                          label="Where Object (PowerShell Syntax, optional)"
                          name={`Fields.${index}.where`}
                          formControl={formControl}
                        />
                      </CippFormCondition>
                      <CippFormCondition
                        field={`Fields.${index}.API`}
                        compareType="is"
                        compareValue={{ label: "CIPP Function", value: "CIPPFunction" }}
                        formControl={formControl}
                      >
                        <CippFormComponent
                          label="CIPP Command (Get- only)"
                          name={`Fields.${index}.Command`}
                          formControl={formControl}
                        />
                        <CippFormComponent
                          label="Where Object (PowerShell Syntax, optional)"
                          name={`Fields.${index}.where`}
                          formControl={formControl}
                        />
                      </CippFormCondition>
                      <CippFormComponent
                        label="What fields from the API response should we save?"
                        name={`Fields.${index}.ExtractFields`}
                        formControl={formControl}
                        type="array"
                      />

                      <CippFormComponent
                        label="Store As"
                        name={`Fields.${index}.StoreAs`}
                        formControl={formControl}
                        autoCompleteOptions={["string", "JSON", "bool"]}
                        type="autocomplete"
                      />
                    </CippFormCondition>
                    {/* Submit Button */}
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
