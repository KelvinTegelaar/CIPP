import { Cancel, Check } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { Box } from "@mui/system";
import { CippCopyToClipBoard } from "../components/CippComponents/CippCopyToClipboard";
import { getCippLicenseTranslation } from "./get-cipp-license-translation";

export const getCippFormatting = (data, cellName) => {
  const cellNameLower = cellName.toLowerCase();

  // Handle date formatting
  if (cellNameLower.includes("date")) {
    return new Date(data).toLocaleString();
  }

  // Handle proxyAddresses
  if (cellName === "proxyAddresses") {
    return data.map((email) => {
      const cleanedEmail = email.replace(/smtp:/i, ""); //have John check regex
      return <CippCopyToClipBoard key={cleanedEmail} text={cleanedEmail} type="chip" />;
    });
  }

  // Handle mail-related fields
  if (cellNameLower.includes("mail") && data) {
    return <CippCopyToClipBoard text={data} type="chip" />;
  }

  // Handle assigned licenses
  if (cellName === "assignedLicenses") {
    return getCippLicenseTranslation(data);
  }

  // Handle boolean data
  if (typeof data === "boolean") {
    return data ? (
      <Box component="span">
        <Check fontSize="10" />
      </Box>
    ) : (
      <Cancel fontSize="10" />
    );
  }

  // Handle null or undefined data
  if (data === null || data === undefined) {
    return (
      <Box component="span">
        <Chip variant="outlined" label="No data" size="small" color="info" />
      </Box>
    );
  }

  // Handle arrays of strings
  if (Array.isArray(data) && data.every((item) => typeof item === "string")) {
    return data.map((item) => <CippCopyToClipBoard key={item} text={item} type="chip" />);
  }

  // Handle objects
  if (typeof data === "object" && data !== null) {
    return JSON.stringify(data);
  }

  // Default case: return data as-is
  return data;
};
