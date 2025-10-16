import { CopyAll, Visibility, VisibilityOff } from "@mui/icons-material";
import { Chip, IconButton, SvgIcon, Tooltip } from "@mui/material";
import { useState } from "react";

export const CippCopyToClipBoard = (props) => {
  const { text, type = "button", visible = true, onClick, ...other } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onClick) onClick();
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onClick) onClick();
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
      }
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  if (!visible) return null;

  if (type === "button") {
    return (
      <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
        <IconButton size="small" onClick={handleCopy} {...other}>
          <SvgIcon fontSize="small">
            <CopyAll />
          </SvgIcon>
        </IconButton>
      </Tooltip>
    );
  }

  if (type === "chip") {
    return (
      <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
        <Chip
          label={text}
          variant="outlined"
          size="small"
          color="info"
          sx={{ mr: "0.25rem" }}
          onClick={handleCopy}
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
        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
          <Chip
            label={showPassword ? text : "********"}
            variant="outlined"
            size="small"
            color="info"
            sx={{ mr: "0.25rem" }}
            onClick={handleCopy}
          />
        </Tooltip>
      </>
    );
  }

  return null;
};
