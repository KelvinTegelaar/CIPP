import { useEffect } from "react";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import CippGeoLocation from "./CippGeoLocation";
import { Tooltip, CircularProgress, Stack } from "@mui/material";
import { useGuidResolver } from "../../hooks/use-guid-resolver";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";

const CippAuditLogDetails = ({ row }) => {
  const {
    guidMapping,
    upnMapping,
    isLoadingGuids,
    resolveGuids,
    isGuid,
    replaceGuidsAndUpnsInString,
  } = useGuidResolver();

  // Use effect for initial scan to resolve GUIDs and special UPNs
  useEffect(() => {
    if (row) {
      // Scan the main row data
      resolveGuids(row);

      // Scan audit data if present
      if (row.auditData) {
        resolveGuids(row.auditData);
      }
    }
  }, [row?.id, resolveGuids]); // Dependencies for when to resolve GUIDs

  // Function to replace GUIDs and special UPNs in strings with resolved names
  const replaceGuidsInString = (str) => {
    if (typeof str !== "string") return str;

    // Use the hook's helper function to replace both GUIDs and special UPNs
    const { result, hasResolvedNames } = replaceGuidsAndUpnsInString(str);

    // If we have resolved names, return a tooltip showing original and resolved
    if (hasResolvedNames) {
      return (
        <Tooltip title={`Original: ${str}`} placement="top">
          <span>{result}</span>
        </Tooltip>
      );
    }

    // Check for GUIDs and special UPNs to see if we should show loading state
    const guidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
    const partnerUpnRegex = /user_([0-9a-f]{32})@([^@]+\.onmicrosoft\.com)/gi;

    let hasGuids = guidRegex.test(str);

    // Reset regex state and check for partner UPNs
    partnerUpnRegex.lastIndex = 0;
    let hasUpns = false;
    let match;

    // Need to extract and check if the GUIDs from UPNs are in the pending state
    while ((match = partnerUpnRegex.exec(str)) !== null) {
      const hexId = match[1];
      if (hexId && hexId.length === 32) {
        hasUpns = true;
        break; // At least one UPN pattern found
      }
    }

    // If we have unresolved GUIDs or UPNs and are currently loading
    if ((hasGuids || hasUpns) && isLoadingGuids) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          <span>{str}</span>
        </div>
      );
    }

    return str;
  };

  // Convert data to property items format for CippPropertyListCard
  const convertToPropertyItems = (data, excludeAuditData = false) => {
    if (!data) return [];

    return Object.entries(data)
      .map(([key, value]) => {
        // Skip certain blacklisted fields
        const blacklist = ["selectedOption", "GUID", "ID", "id", "noSubmitButton"];
        if (blacklist.includes(key)) return null;

        // Exclude auditData from main log items if specified
        if (excludeAuditData && key === "auditData") return null;

        let displayValue;
        // Handle different value types
        if (typeof value === "string" && isGuid(value)) {
          // Handle pure GUID strings
          displayValue = renderGuidValue(value);
        } else if (
          typeof value === "string" &&
          value.match(/^user_[0-9a-f]{32}@[^@]+\.onmicrosoft\.com$/i)
        ) {
          // Handle special partner UPN format as direct values
          displayValue = renderGuidValue(value);
        } else if (
          key.toLowerCase().includes("clientip") &&
          value &&
          value !== null &&
          isValidIpAddress(value)
        ) {
          // Handle IP addresses (with optional ports) using CippGeoLocation
          // Check for various IP field names: clientIp, ClientIP, IP, etc.
          const cleanIp = extractIpForGeolocation(value);
          displayValue = (
            <div>
              <CippGeoLocation ipAddress={cleanIp} displayIpAddress={value} showIpAddress={true} />
            </div>
          );
        } else if (typeof value === "string") {
          // Handle strings that might contain embedded GUIDs
          // First apply GUID replacement to get the processed string
          const guidProcessedValue = replaceGuidsInString(value);

          // If GUID replacement returned a React element (with tooltips), use it directly
          if (typeof guidProcessedValue === "object" && guidProcessedValue?.type) {
            displayValue = guidProcessedValue;
          } else {
            // Otherwise, apply getCippFormatting to the GUID-processed string
            // This preserves key-based formatting while including GUID replacements
            displayValue = getCippFormatting(guidProcessedValue, key);
          }
        } else if (typeof value === "object" && value !== null) {
          // Handle nested objects and arrays - expand GUIDs within them
          displayValue = renderNestedValue(value);
        } else {
          // Handle regular values
          displayValue = getCippFormatting(value, key);
        }

        return {
          label: getCippTranslation(key),
          value: displayValue,
        };
      })
      .filter(Boolean);
  };

  // Render GUID values with proper resolution states
  const renderGuidValue = (guidValue) => {
    // Handle standard GUIDs directly
    if (guidMapping[guidValue]) {
      return (
        <Tooltip title={`GUID: ${guidValue}`} placement="top">
          <span>{guidMapping[guidValue]}</span>
        </Tooltip>
      );
    }

    // Special handling for partner UPN format (user_<guid_no_dashes>@partnertenant.onmicrosoft.com)
    const partnerUpnRegex = /^user_([0-9a-f]{32})@([^@]+\.onmicrosoft\.com)$/i;
    const upnMatch = typeof guidValue === "string" ? guidValue.match(partnerUpnRegex) : null;

    if (upnMatch) {
      const hexId = upnMatch[1];
      if (hexId && hexId.length === 32) {
        const guid = [
          hexId.slice(0, 8),
          hexId.slice(8, 12),
          hexId.slice(12, 16),
          hexId.slice(16, 20),
          hexId.slice(20, 32),
        ].join("-");

        // For partner UPN format, use the actual UPN if available, otherwise fall back to display name
        if (upnMapping && upnMapping[guid]) {
          return (
            <Tooltip title={`Original UPN: ${guidValue}`} placement="top">
              <span>{upnMapping[guid]}</span>
            </Tooltip>
          );
        } else if (guidMapping[guid]) {
          return (
            <Tooltip title={`UPN: ${guidValue}`} placement="top">
              <span>{guidMapping[guid]}</span>
            </Tooltip>
          );
        }
      }
    }

    // Loading state
    if (isLoadingGuids) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          <span>{guidValue}</span>
        </div>
      );
    }

    // Fallback for unresolved values
    return (
      <Tooltip
        title="This identifier could not be resolved to a directory object name"
        placement="top"
      >
        <span style={{ fontFamily: "monospace", fontSize: "0.9em" }}>{guidValue}</span>
      </Tooltip>
    );
  };

  // Recursively render nested objects and arrays with GUID expansion
  const renderNestedValue = (value) => {
    if (Array.isArray(value)) {
      // Handle arrays
      return renderArrayValue(value);
    } else if (typeof value === "object" && value !== null) {
      // Handle objects
      return renderObjectValue(value);
    }
    return getCippFormatting(value, "nested");
  };

  // Render array values with GUID expansion
  const renderArrayValue = (arrayValue) => {
    if (arrayValue.length === 0) return "[]";

    // If it's a simple array, show it formatted
    if (arrayValue.length <= 5 && arrayValue.every((item) => typeof item !== "object")) {
      return (
        <div>
          {arrayValue.map((item, index) => (
            <div key={index} style={{ marginBottom: "2px" }}>
              {typeof item === "string" && isGuid(item)
                ? renderGuidValue(item)
                : typeof item === "string"
                ? replaceGuidsInString(item)
                : getCippFormatting(item, `item-${index}`)}
            </div>
          ))}
        </div>
      );
    }

    // For complex arrays, use the formatted version which might include table buttons
    return getCippFormatting(arrayValue, "array");
  };

  // Render object values with GUID expansion
  const renderObjectValue = (objectValue) => {
    const entries = Object.entries(objectValue);

    // If it's a simple object with few properties, show them inline
    if (entries.length <= 3 && entries.every(([, val]) => typeof val !== "object")) {
      return (
        <div>
          {entries.map(([objKey, objVal]) => (
            <div key={objKey} style={{ marginBottom: "2px" }}>
              <strong>{getCippTranslation(objKey)}:</strong>{" "}
              {typeof objVal === "string" && isGuid(objVal)
                ? renderGuidValue(objVal)
                : typeof objVal === "string"
                ? replaceGuidsInString(objVal)
                : getCippFormatting(objVal, objKey)}
            </div>
          ))}
        </div>
      );
    }

    // For complex objects, use the formatted version which might include table buttons
    return getCippFormatting(objectValue, "object");
  };

  // Helper function to validate IP addresses (with optional ports)
  const isValidIpAddress = (ip) => {
    if (typeof ip !== "string") return false;

    // Extract IP part if there's a port (split by last colon for IPv6 compatibility)
    let ipPart = ip;
    let portPart = null;

    // Check for IPv4:port format
    const ipv4PortMatch = ip.match(/^(.+):(\d+)$/);
    if (ipv4PortMatch) {
      ipPart = ipv4PortMatch[1];
      portPart = ipv4PortMatch[2];
    }

    // IPv4 regex
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 regex (simplified) - note: IPv6 with ports use [::]:port format, handled separately
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

    // Check for IPv6 with port [::]:port format
    const ipv6PortMatch = ip.match(/^\[(.+)\]:(\d+)$/);
    if (ipv6PortMatch) {
      ipPart = ipv6PortMatch[1];
      portPart = ipv6PortMatch[2];
    }

    // Validate port number if present
    if (portPart !== null) {
      const port = parseInt(portPart, 10);
      if (port < 1 || port > 65535) return false;
    }

    return ipv4Regex.test(ipPart) || ipv6Regex.test(ipPart);
  };

  // Extract clean IP address from IP:port combinations for geolocation
  const extractIpForGeolocation = (ipWithPort) => {
    if (typeof ipWithPort !== "string") return ipWithPort;

    // IPv4:port format
    const ipv4PortMatch = ipWithPort.match(/^(.+):(\d+)$/);
    if (ipv4PortMatch) {
      return ipv4PortMatch[1];
    }

    // IPv6 with port [::]:port format
    const ipv6PortMatch = ipWithPort.match(/^\[(.+)\]:(\d+)$/);
    if (ipv6PortMatch) {
      return ipv6PortMatch[1];
    }

    // Return as-is if no port detected
    return ipWithPort;
  };

  const mainLogItems = convertToPropertyItems(row, true); // Exclude auditData from main items
  const auditDataItems = row?.auditData ? convertToPropertyItems(row.auditData) : [];

  return (
    <Stack spacing={3}>
      <CippPropertyListCard
        title="Audit Log Details"
        propertyItems={mainLogItems}
        layout="double" // Use two-column layout for better display
        cardSx={{ width: "100%" }}
        showDivider={false}
      />

      {auditDataItems.length > 0 && (
        <CippPropertyListCard
          title="Audit Data"
          propertyItems={auditDataItems}
          layout="double" // Use two-column layout for better display
          cardSx={{ width: "100%" }}
          showDivider={false}
        />
      )}
    </Stack>
  );
};

export default CippAuditLogDetails;
