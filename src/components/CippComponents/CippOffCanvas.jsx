import { Drawer, Box, Grid } from "@mui/material";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";

export const CippOffCanvas = (props) => {
  const {
    title = "Extended Info",
    visible,
    extendedInfoFields = [],
    extendedData,
    actions,
    onClose,
    isFetching,
    children,
    size = "sm",
  } = props;

  const extendedInfo = extendedInfoFields.map((field) => {
    const value = field.split(".").reduce((acc, part) => acc && acc[part], extendedData);
    if (value === undefined || value === null) {
      if (extendedData?.[field] !== undefined && extendedData?.[field] !== null) {
        return {
          label: getCippTranslation(field),
          value: getCippFormatting(extendedData[field], field, "text", "both"),
        };
      } else {
        return {
          label: getCippTranslation(field),
          value: "N/A",
        };
      }
    } else if (Array.isArray(value)) {
      return {
        label: getCippTranslation(field),
        value: getCippFormatting(value, field, "array", "both"),
      };
    } else {
      return {
        label: getCippTranslation(field),
        value: getCippFormatting(value, field, "text", "both"),
      };
    }
  });

  var drawerWidth = 400;
  switch (size) {
    case "sm":
      drawerWidth = 400;
      break;
    case "md":
      drawerWidth = 600;
      break;
    case "lg":
      drawerWidth = 800;
      break;
    case "xl":
      drawerWidth = 1000;
      break;
  }

  return (
    <>
      <Drawer
        PaperProps={{
          sx: { width: drawerWidth },
        }}
        ModalProps={{
          keepMounted: false,
        }}
        anchor={"right"}
        open={visible}
        onClose={onClose}
      >
        {/* Force vertical stacking in a column layout */}
        <Box
          sx={{ overflowY: "auto", maxHeight: "100%", display: "flex", flexDirection: "column" }}
        >
          <Grid container spacing={1}>
            <Grid item xs={12}>
              {extendedInfo.length > 0 && (
                <CippPropertyListCard
                  isFetching={isFetching}
                  align="vertical"
                  title={title}
                  propertyItems={extendedInfo}
                  copyItems={true}
                  actionItems={actions}
                  data={extendedData}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ m: 2 }}>
                {typeof children === "function" ? children(extendedData) : children}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Drawer>
    </>
  );
};
