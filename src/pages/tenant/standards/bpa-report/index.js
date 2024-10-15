import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { Box, Container, Typography, Button, IconButton } from "@mui/material";
import { useState } from "react";
import Head from "next/head";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import DeleteIcon from "@mui/icons-material/Delete"; // Import delete icon
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { useForm } from "react-hook-form";

const ResponsiveGridLayout = WidthProvider(Responsive);
const Page = () => {
  const formControl = useForm({ mode: "onChange" });

  const pageTitle = "Best Practice Analyser";
  const [gridConfig, setGridConfig] = useState([
    {
      i: `block-default`,
      x: 0 % 4, // Place the block in the next column (up to 4 columns)
      y: Math.floor(1 / 4), // Push to the next row after every 4 blocks
      w: 1,
      h: 2, // Default height, fixed
      minH: 2, // Prevent height resizing
      maxH: 2, // Prevent height resizing
    },
  ]);

  const handleAddBlock = () => {
    setGridConfig((prevConfig) => [
      ...prevConfig,
      {
        i: `block-${prevConfig.length + 1}`,
        x: prevConfig.length % 4, // Place the block in the next column (up to 4 columns)
        y: Math.floor(prevConfig.length / 4), // Push to the next row after every 4 blocks
        w: 1,
        h: 2, // Default height, fixed
        minH: 2, // Prevent height resizing
        maxH: 2, // Prevent height resizing
      },
    ]);
  };

  const handleRemoveBlock = (blockId) => {
    setGridConfig((prevConfig) => prevConfig.filter((block) => block.i !== blockId));
  };

  const saveConfig = () => {
    const jsonConfig = JSON.stringify(gridConfig, null, 2);
    console.log("Saved Config:", jsonConfig);
    // For now, just log the config. Later, this could be connected to an API.
  };

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
          <Button variant="contained" onClick={handleAddBlock} sx={{ mb: 2 }}>
            Add Block
          </Button>
          <Button variant="contained" onClick={saveConfig} sx={{ mb: 2, ml: 2 }}>
            Save Dashboard Configuration
          </Button>
          <ResponsiveGridLayout
            className="layout"
            layouts={{
              lg: gridConfig.map((block) => ({
                ...block,
                w: block.w || 1,
                h: block.h || 2, // Ensure blocks always have a default height
              })),
            }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
            rowHeight={100}
            width={1500}
            onLayoutChange={(layout) =>
              setGridConfig(
                layout.map((item) => ({
                  ...item,
                  w: Math.max(Math.round(item.w), 1),
                  h: 2, // Keep height fixed at 2
                  minH: 2, // Ensure minimum height
                }))
              )
            }
            isResizable={true}
            isDraggable={false} // Disable dragging
            preventCollision={true} // Prevent overlapping
            autoSize={true}
          >
            {gridConfig.map((block) => (
              <div key={block.i} data-grid={block}>
                <CippButtonCard
                  title={`BPA Report`}
                  cardActions={
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleRemoveBlock(block.i)} // Remove block on click
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Typography>
                    This block will display the data you set it up to display. You can add more
                    blocks.
                  </Typography>
                  <CippFormComponent
                    label={"Field Name"}
                    formControl={formControl}
                    name="fieldName"
                  />
                </CippButtonCard>
              </div>
            ))}
          </ResponsiveGridLayout>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
