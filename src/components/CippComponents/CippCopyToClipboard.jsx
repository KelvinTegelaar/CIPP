import { CopyAll, Visibility, VisibilityOff } from "@mui/icons-material";
import { Chip, IconButton, SvgIcon, Tooltip } from "@mui/material";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

export const CippCopyToClipBoard = (props) => {
  const { text, type = "button", visible = true, ...other } = props;
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  if (!visible) return null;

  if (type === "button") {
    return (
      <CopyToClipboard text={text}>
        <Tooltip title="Copy to clipboard">
          <IconButton size="small" {...other}>
            <SvgIcon fontSize="small">
              <CopyAll />
            </SvgIcon>
          </IconButton>
        </Tooltip>
      </CopyToClipboard>
    );
  }

  if (type === "chip") {
    return (
      <CopyToClipboard text={text}>
        <Tooltip title="Copy to clipboard">
          <Chip
            label={text}
            variant="outlined"
            size="small"
            color="info"
            sx={{ mr: "0.25rem" }}
            {...other}
          />
        </Tooltip>
      </CopyToClipboard>
    );
  }

  if (type === "password") {
    return (
      <>
        <Tooltip title={showPassword ? "Hide password" : "Show password"}>
          <IconButton size="small" onClick={handleTogglePassword}>
            <SvgIcon>{showPassword ? <VisibilityOff /> : <Visibility />}</SvgIcon>
          </IconButton>
        </Tooltip>
        <CopyToClipboard text={text}>
          <Tooltip title="Copy to clipboard">
            <Chip
              label={showPassword ? text : "********"}
              variant="outlined"
              size="small"
              color="info"
              sx={{ mr: "0.25rem" }}
            />
          </Tooltip>
        </CopyToClipboard>
      </>
    );
  }

  return null;
};
