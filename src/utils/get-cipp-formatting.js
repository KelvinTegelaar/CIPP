import { Cancel, Check } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { Box } from "@mui/system";
import { CippCopyToClipBoard } from "../components/CippComponents/CippCopyToClipboard";
import { getCippLicenseTranslation } from "./get-cipp-license-translation";

export const getCippFormatting = (data, cellName, type) => {
  const isText = type === "text";
  const cellNameLower = cellName.toLowerCase();
  // Handle date formatting
  if (cellNameLower.includes("date")) {
    return isText ? (
      new Date(data).toLocaleString()
    ) : (
      <span>{new Date(data).toLocaleString()}</span>
    );
  }

  // Handle null or undefined data
  if (data === null || data === undefined) {
    return isText ? (
      "No data"
    ) : (
      <Box component="span">
        <Chip variant="outlined" label="No data" size="small" color="info" />
      </Box>
    );
  }

  // Handle proxyAddresses
  if (cellName === "proxyAddresses") {
    const emails = data.map((email) => email.replace(/smtp:/i, ""));
    return isText
      ? emails.join(", ")
      : emails.map((email) => <CippCopyToClipBoard key={email} text={email} type="chip" />);
  }

  // Handle mail-related fields
  if (cellNameLower.includes("mail") && data) {
    return isText ? data : <CippCopyToClipBoard text={data} type="chip" />;
  }

  // Handle assigned licenses
  if (cellName === "assignedLicenses") {
    return isText ? getCippLicenseTranslation(data) : getCippLicenseTranslation(data);
  }

  // Handle boolean data
  if (typeof data === "boolean") {
    return isText ? (
      data ? (
        "Yes"
      ) : (
        "No"
      )
    ) : (
      <Box component="span">{data ? <Check fontSize="10" /> : <Cancel fontSize="10" />}</Box>
    );
  }

  // Handle null or undefined data
  if (data === null || data === undefined) {
    return isText ? (
      "No data"
    ) : (
      <Box component="span">
        <Chip variant="outlined" label="No data" size="small" color="info" />
      </Box>
    );
  }

  // Handle arrays of strings
  if (Array.isArray(data) && data.every((item) => typeof item === "string")) {
    return isText
      ? data.join(", ")
      : data.map((item) => <CippCopyToClipBoard key={item} text={item} type="chip" />);
  }

  // Handle objects
  if (typeof data === "object" && data !== null) {
    return isText ? JSON.stringify(data) : <span>{JSON.stringify(data)}</span>;
  }

  // Default case: return data as-is
  return isText ? String(data) : <span>{data}</span>;
};
