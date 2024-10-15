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
  Card,
  CardContent,
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

const Page = () => {
  const formControl = useForm({
    defaultValues: {
      name: "",
      style: "Table",
      Fields: [
        {
          name: "",
          UseExistingInfo: false,
          FrontendFields: [{ name: "", value: "", formatter: "string" }],
          desc: "",
          API: "Graph",
          StoreAs: "string",
          ExtractFields: [""],
          where: "",
          Command: "",
          URL: "",
          parameters: { asApp: false },
        },
      ],
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
          <Card sx={{ mb: 3 }}>
            <CardContent>
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

              {layoutMode === "Block" && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={handleAddBlock}>
                    Add Block
                  </Button>
                  <Button variant="contained" onClick={saveConfig} sx={{ ml: 2 }}>
                    Save Dashboard Configuration
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

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
                    {/* Report Name */}
                    <CippFormComponent
                      label="Report Name"
                      name={`Fields.${index}.name`}
                      formControl={formControl}
                    />

                    {/* Report Style */}
                    <CippFormComponent
                      label="Report Style"
                      name={`Fields.${index}.style`}
                      formControl={formControl}
                      autoCompleteOptions={["Table", "Tenant"]}
                      type="autocomplete"
                    />

                    {/* Use Existing Info Switch */}
                    <CippFormComponent
                      label="Use Existing Info?"
                      name={`Fields.${index}.UseExistingInfo`}
                      formControl={formControl}
                      type="switch"
                    />

                    {/* Frontend Fields */}
                    <CippFormComponent
                      label="Frontend Field Name"
                      name={`Fields.${index}.FrontendFields.0.name`}
                      formControl={formControl}
                    />

                    <CippFormComponent
                      label="Frontend Field Value"
                      name={`Fields.${index}.FrontendFields.0.value`}
                      formControl={formControl}
                    />

                    <CippFormComponent
                      label="Frontend Field Formatter"
                      name={`Fields.${index}.FrontendFields.0.formatter`}
                      formControl={formControl}
                      autoCompleteOptions={[
                        "string",
                        "bool",
                        "warnBool",
                        "reverseBool",
                        "table",
                        "number",
                      ]}
                      type="autocomplete"
                    />

                    {/* Field Description */}
                    <CippFormComponent
                      label="Field Description"
                      name={`Fields.${index}.desc`}
                      formControl={formControl}
                    />

                    {/* Additional Fields */}
                    <CippFormComponent
                      label="API"
                      name={`Fields.${index}.API`}
                      formControl={formControl}
                      autoCompleteOptions={["Graph", "Exchange", "CIPPFunction"]}
                      type="autocomplete"
                    />

                    <CippFormComponent
                      label="Store As"
                      name={`Fields.${index}.StoreAs`}
                      formControl={formControl}
                      autoCompleteOptions={["string", "JSON", "bool"]}
                      type="autocomplete"
                    />

                    <CippFormComponent
                      label="Extract Fields"
                      name={`Fields.${index}.ExtractFields`}
                      formControl={formControl}
                      type="array"
                    />

                    <CippFormComponent
                      label="Where"
                      name={`Fields.${index}.where`}
                      formControl={formControl}
                    />

                    <CippFormComponent
                      label="Command"
                      name={`Fields.${index}.Command`}
                      formControl={formControl}
                    />

                    <CippFormComponent
                      label="Graph URL"
                      name={`Fields.${index}.URL`}
                      formControl={formControl}
                    />

                    <CippFormComponent
                      label="Use Application Permissions"
                      name={`Fields.${index}.parameters.asApp`}
                      formControl={formControl}
                      type="switch"
                    />

                    {/* Submit Button */}
                    <Button type="submit" variant="contained">
                      Submit Report
                    </Button>
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
