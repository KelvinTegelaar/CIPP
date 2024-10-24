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
  } = props;

  const extendedInfo = extendedInfoFields.map((field) => {
    return {
      label: getCippTranslation(field),
      value: getCippFormatting(extendedData?.[field], field, "text"),
    };
  });

  return (
    <>
      <Drawer
        PaperProps={{
          sx: { width: 400 },
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
