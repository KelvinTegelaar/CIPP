import { Layout as DashboardLayout } from "/src/layouts/index.js";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import { useState } from "react";
import Head from "next/head";

const availableComponents = [
  { label: "CippTableCard", value: "CippTableCard" },
  { label: "CippButtonCard", value: "CippButtonCard" },
];

const Page = () => {
  const pageTitle = "Best Practice Analyser";
  const [gridConfig, setGridConfig] = useState([]);
  const [hoveredColumns, setHoveredColumns] = useState(null);

  const handleAddBlock = (columns) => {
    setGridConfig((prevConfig) => {
      const columnsUsed = prevConfig.reduce((sum, item) => sum + item.columns, 0);
      if (columnsUsed + columns <= 4) {
        return [
          ...prevConfig,
          {
            id: `block-${prevConfig.length + 1}`,
            component: "",
            columns,
          },
        ];
      }
      return prevConfig;
    });
  };

  const handleComponentChange = (id, value) => {
    setGridConfig((prevConfig) =>
      prevConfig.map((block) => (block.id === id ? { ...block, component: value } : block))
    );
  };

  const saveConfig = () => {
    const jsonConfig = JSON.stringify(gridConfig, null, 2);
    console.log("Saved Config:", jsonConfig);
    // For now, just log the config. Later, this could be connected to an API.
  };

  const handleMouseEnter = (columns) => {
    setHoveredColumns(columns);
  };

  const handleMouseLeave = () => {
    setHoveredColumns(null);
  };

  const columnsUsed = gridConfig.reduce((sum, item) => sum + item.columns, 0);
  const availableColumns = 4 - columnsUsed;

  const row1HasItems = gridConfig.some((block) => block.columns > 0);

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
          <Typography variant="h4" gutterBottom>
            {pageTitle}
          </Typography>
          <Button variant="contained" onClick={saveConfig} sx={{ mb: 2 }}>
            Save Dashboard Configuration
          </Button>
          <Grid container spacing={2}>
            {availableColumns > 0 && (
              <Grid
                item
                xs={(availableColumns / 4) * 12}
                onMouseMove={(e) => {
                  const boxWidth = e.currentTarget.offsetWidth;
                  const relativeX = e.nativeEvent.offsetX;
                  const hoveredCols = Math.ceil((relativeX / boxWidth) * availableColumns);
                  setHoveredColumns(Math.min(hoveredCols, availableColumns));
                }}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleAddBlock(hoveredColumns)}
                sx={{
                  height: 150,
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: hoveredColumns ? "#f0f0f0" : "transparent",
                  border: hoveredColumns ? "1px dotted #aaa" : "none",
                  transition: "width 0.3s ease",
                }}
              >
                {hoveredColumns && (
                  <Typography variant="h6" color="textSecondary">
                    + ({hoveredColumns} column{hoveredColumns > 1 ? "s" : ""})
                  </Typography>
                )}
              </Grid>
            )}
            {gridConfig.map((block) => (
              <Grid item key={block.id} xs={(block.columns / 4) * 12}>
                <Card sx={{ width: "100%", height: 150 }}>
                  <CardContent>
                    <FormControl fullWidth>
                      <InputLabel>Select Component</InputLabel>
                      <Select
                        value={block.component || ""}
                        label="Select Component"
                        onChange={(e) => handleComponentChange(block.id, e.target.value)}
                      >
                        {availableComponents.map((component) => (
                          <MenuItem key={component.value} value={component.value}>
                            {component.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {block.component && (
                      <Box sx={{ mt: 2 }}>
                        {block.component === "CippTableCard" && (
                          <Typography variant="body1">CippTableCard Placeholder</Typography>
                        )}
                        {block.component === "CippButtonCard" && (
                          <Button variant="outlined">CippButtonCard Placeholder</Button>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {row1HasItems && (
              <Grid
                item
                xs={12}
                onMouseMove={(e) => {
                  const boxWidth = e.currentTarget.offsetWidth;
                  const relativeX = e.nativeEvent.offsetX;
                  const hoveredCols = Math.ceil((relativeX / boxWidth) * 4);
                  setHoveredColumns(Math.min(hoveredCols, 4));
                }}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleAddBlock(hoveredColumns)}
                sx={{
                  height: 150,
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: hoveredColumns ? "#f0f0f0" : "transparent",
                  border: hoveredColumns ? "1px dotted #aaa" : "none",
                  transition: "width 0.3s ease",
                  mt: 2,
                }}
              >
                {hoveredColumns && (
                  <Typography variant="h6" color="textSecondary">
                    + ({hoveredColumns} column{hoveredColumns > 1 ? "s" : ""})
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
