import { Search } from "@mui/icons-material";
import { Chip, IconButton, SvgIcon, Tooltip } from "@mui/material";
import { useState } from "react";

export const CippDocsLookup = (props) => {
  const { text, type = "button", visible = true, ...other } = props;
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleDocsLookup = () => {
    const searchUrl = `https://docs.cipp.app/?q=Help+with:+${encodeURIComponent(text)}&ask=true`;
    window.open(searchUrl, '_blank');
  };

  if (!visible) return null;

  if (type === "button") {
    return (
      <Tooltip title="Search in documentation">
        <IconButton size="small" onClick={handleDocsLookup}>
          <SvgIcon fontSize="small">
            <Search />
          </SvgIcon>
        </IconButton>
      </Tooltip>
    );
  }

  if (type === "chip") {
    return (
      <Tooltip title="Search in documentation">
        <Chip
          label={text}
          variant="outlined"
          size="small"
          color="info"
          sx={{ mr: "0.25rem", cursor: "pointer" }}
          onClick={handleDocsLookup}
          {...other}
        />
      </Tooltip>
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
        <Tooltip title="Search in documentation">
          <Chip
            label={showPassword ? text : "********"}
            variant="outlined"
            size="small"
            color="info"
            sx={{ mr: "0.25rem", cursor: "pointer" }}
            onClick={handleDocsLookup}
          />
        </Tooltip>
      </>
    );
  }

  return null;
}; 