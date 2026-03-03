import { Box, Button, ListItem, ListItemText, Typography } from "@mui/material";
import { useState } from "react";
import { CippCopyToClipBoard } from "./CippComponents/CippCopyToClipboard";

export const PropertyListItem = (props) => {
  const {
    align = "vertical",
    children,
    component,
    label,
    value = "",
    type,
    copyItems,
    sx = {
      px: 3,
      py: 1.5,
    },
    ...other
  } = props;
  const [showPassword, setShowPassword] = useState(false);
  return (
    <ListItem component={component} disableGutters sx={sx} {...other}>
      <ListItemText
        disableTypography
        primary={
          <Typography sx={{ minWidth: align === "vertical" ? "inherit" : 180 }} variant="subtitle3">
            {label}
          </Typography>
        }
        secondary={
          <Box
            sx={{
              flexGrow: 1,
              mt: align === "vertical" ? 0.5 : 0,
            }}
          >
            {children || (
              <Typography color="text.secondary" variant="body3">
                {type !== "password" &&
                  (value === true ? "Yes" : value === false || value === null ? "No" : value)}
                {type === "password" && (
                  <>
                    {showPassword ? (
                      value
                    ) : (
                      <Button onClick={() => setShowPassword(true)}>Show Password</Button>
                    )}
                  </>
                )}
                {copyItems && <CippCopyToClipBoard text={value} type="button" />}
              </Typography>
            )}
          </Box>
        }
        sx={{
          alignItems: "flex-start",
          flexDirection: align === "vertical" ? "column" : "row",
          my: 0,
          width: "100%",
        }}
      />
    </ListItem>
  );
};
