import { CopyAll, Visibility, VisibilityOff } from "@mui/icons-material";
import { Chip, IconButton, SvgIcon, Tooltip } from "@mui/material";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

export const CippCopyToClipBoard = (props) => {
  const { text, type = "button", ...other } = props;
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <>
      {type === "button" && (
        <CopyToClipboard text={props.text}>
          <Tooltip title="Copy to clipboard">
            <IconButton size="small">
              <SvgIcon fontSize="small">
                <CopyAll />
              </SvgIcon>
            </IconButton>
          </Tooltip>
        </CopyToClipboard>
      )}
      {type === "chip" && (
        <CopyToClipboard text={props.text}>
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
      )}
      {type === "password" && (
        <>
          <Tooltip title={showPassword ? "Hide password" : "Show password"}>
            <IconButton size="small" onClick={handleTogglePassword}>
              <SvgIcon>{showPassword ? <VisibilityOff /> : <Visibility />}</SvgIcon>
            </IconButton>
          </Tooltip>
          <CopyToClipboard text={props.text}>
            <Tooltip title="Copy to clipboard">
              <Chip
                label={showPassword ? props.text : "********"}
                variant="outlined"
                size="small"
                color="info"
                sx={{ mr: "0.25rem" }}
              />
            </Tooltip>
          </CopyToClipboard>
        </>
      )}
    </>
  );
};
