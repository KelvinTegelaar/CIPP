import {
  Box,
  Button,
  IconButton,
  ListItem,
  ListItemText,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { CopyAll } from "@mui/icons-material";

export const PropertyListItem = (props) => {
  const {
    align = "vertical",
    children,
    component,
    label,
    value = "",
    type,
    copyItems,
    ...other
  } = props;
  const [showPassword, setShowPassword] = useState(false);
  return (
    <ListItem
      component={component}
      disableGutters
      sx={{
        px: 3,
        py: 1.5,
      }}
      {...other}
    >
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
                {copyItems && (
                  <CopyToClipboard text={value}>
                    <Tooltip title="Copy to clipboard">
                      <IconButton size="small">
                        <SvgIcon fontSize="5px">
                          <CopyAll fontSize="small" />
                        </SvgIcon>
                      </IconButton>
                    </Tooltip>
                  </CopyToClipboard>
                )}
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
