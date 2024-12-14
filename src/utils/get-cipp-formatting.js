import {
  Cancel,
  Check,
  CompassCalibration,
  LaptopWindows,
  MailOutline,
  Shield,
} from "@mui/icons-material";
import { Chip, Link, SvgIcon } from "@mui/material";
import { Box } from "@mui/system";
import { CippCopyToClipBoard } from "../components/CippComponents/CippCopyToClipboard";
import { getCippLicenseTranslation } from "./get-cipp-license-translation";
import CippDataTableButton from "../components/CippTable/CippDataTableButton";
import { LinearProgressWithLabel } from "../components/linearProgressWithLabel";
import { isoDuration, en } from "@musement/iso-duration";
import { CippTimeAgo } from "../components/CippComponents/CippTimeAgo";
import { getCippRoleTranslation } from "./get-cipp-role-translation";
import { CogIcon, ServerIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import { getCippTranslation } from "./get-cipp-translation";

export const getCippFormatting = (data, cellName, type) => {
  const isText = type === "text";
  const cellNameLower = cellName.toLowerCase();
  // if data is a data object, return a formatted date
  if (cellName === "addrow") {
    return isText ? (
      "No data"
    ) : (
      <Box component="span">
        <Chip variant="outlined" label="No data" size="small" color="info" />
      </Box>
    );
  }

  const portalIcons = {
    portal_m365: CogIcon,
    portal_exchange: MailOutline,
    portal_entra: UserIcon,
    portal_teams: UsersIcon,
    portal_azure: ServerIcon,
    portal_intune: LaptopWindows,
    portal_security: Shield,
    portal_compliance: CompassCalibration,
  };

  //if the cellName starts with portal_, return text, or a link with an icon
  if (cellName.startsWith("portal_")) {
    const IconComponent = portalIcons[cellName];
    return isText ? (
      data
    ) : (
      <Link href={data} target="_blank" rel="noreferrer">
        <SvgIcon color="action" fontSize="small">
          <IconComponent />
        </SvgIcon>
      </Link>
    );
  }

  const timeAgoArray = [
    "ExecutedTime",
    "ScheduledTime",
    "Timestamp",
    "DateTime",
    "LastRun",
    "LastRefresh",
    "createdDateTime",
    "activatedDateTime",
    "lastModifiedDateTime",
    "endDateTime",
    "ReceivedTime",
    "Expires",
    "updatedAt",
    "createdAt",
    "Received",
    "Date",
    "WhenCreated",
    "WhenChanged",
  ];
  if (timeAgoArray.includes(cellName)) {
    return isText ? new Date(data).toLocaleDateString() : <CippTimeAgo data={data} type={type} />;
  }

  const passwordItems = ["password", "applicationsecret", "refreshtoken"];

  if (passwordItems.includes(cellNameLower)) {
    //return a button that shows/hides the password if it has a password. In text mode, return "Password hidden"
    return isText ? "Password hidden" : <CippCopyToClipBoard text={data} type="password" />;
  }

  if (cellName === "RepeatsEvery") {
    //convert 1d to "Every 1 day", 1w to "Every 1 week" etc.
    const match = data.match(/(\d+)([a-zA-Z]+)/);
    if (match) {
      const value = match[1];
      const unit = match[2];
      const unitText =
        unit === "d"
          ? "day"
          : unit === "h"
          ? "hour"
          : unit === "w"
          ? "week"
          : unit === "m"
          ? "minutes"
          : unit === "y"
          ? "year"
          : unit;
      return isText ? `Every ${value} ${unitText}` : `Every ${value} ${unitText}`;
    }
  }
  if (cellName === "ReportInterval") {
    //domainAnalyser layouts
    //device by 86400 to get days, then return "days"
    const days = data / 86400;
    return isText ? `${days} days` : `${days} days`;
  }
  if (cellName === "DMARCPolicy") {
    if (data === "s") {
      data = "Strict";
    }
    if (data === "r") {
      data = "Relaxed";
    }
    if (data === "afrf") {
      data = "Authentication Failure";
    }
    return isText ? data : <Chip variant="outlined" label={data} size="small" color="info" />;
  }

  if (cellName === "ScorePercentage") {
    return isText ? `${data}%` : <LinearProgressWithLabel variant="determinate" value={data} />;
  }

  if (cellName === "DMARCPercentagePass") {
    return isText ? `${data}%` : <LinearProgressWithLabel variant="determinate" value={data} />;
  }

  if (cellName === "ScoreExplanation") {
    return isText ? data : <Chip variant="outlined" label={data} size="small" color="info" />;
  }

  if (cellName === "DMARCActionPolicy") {
    if (data === "") {
      data = "No DMARC Action";
    }
    return isText ? data : <Chip variant="outlined" label={data} size="small" color="info" />;
  }

  if (cellName === "MailProvider") {
    if (data === "Null") {
      data = "Unknown";
    }
    return isText ? data : <Chip variant="outlined" label={data} size="small" color="info" />;
  }

  //if the cellName is tenantFilter, return a chip with the tenant name. This can sometimes be an array, sometimes be a single item.
  if (cellName === "tenantFilter" || cellName === "Tenant") {
    //check if data is an array.
    if (Array.isArray(data)) {
      return isText
        ? data.join(", ")
        : data.map((item) => (
            <CippCopyToClipBoard
              key={`${item.label}`}
              text={item.label ? item.label : item}
              type="chip"
            />
          ));
    } else {
      return isText ? (
        data
      ) : (
        <CippCopyToClipBoard text={data.label ? data.label : data} type="chip" />
      );
    }
  }

  if (cellName === "excludedTenants") {
    //check if data is an array.
    if (Array.isArray(data)) {
      return isText
        ? data.join(", ")
        : data.map((item) => (
            <CippCopyToClipBoard key={item.value} text={item.label} type="chip" />
          ));
    }
  }
  if (cellName === "bulkUser") {
    return isText ? `${data.length} new users to create` : `${data.length} new users to create`;
  }

  if (data?.enabled === true && data?.date) {
    return isText
      ? `Yes, Scheduled for ${new Date(data.date).toLocaleString()}`
      : `Yes, Scheduled for ${new Date(data.date).toLocaleString()}`;
  }
  if (data?.enabled === true || data?.enabled === false) {
    return isText ? (
      data.enabled ? (
        "Yes"
      ) : (
        "No"
      )
    ) : data.enabled ? (
      <Check fontSize="10" />
    ) : (
      <Cancel fontSize="10" />
    );
  }

  if (cellName === "state") {
    data =
      data === "enabled"
        ? "Enabled"
        : data === "enabledForReportingButNotEnforced"
        ? "Report Only"
        : data;
    return isText ? data : <Chip variant="outlined" label={data} size="small" color="info" />;
  }

  if (cellName === "@odata.type") {
    if (data.startsWith("#microsoft.graph")) {
      data = data.replace("#microsoft.graph.", "");
    }
    return getCippTranslation(data, "odataType");
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

  // Handle assigned licenses
  if (cellName === "assignedLicenses") {
    return isText ? getCippLicenseTranslation(data) : getCippLicenseTranslation(data);
  }

  // Handle roleDefinitionId
  if (cellName === "roleDefinitionId") {
    return getCippRoleTranslation(data);
  }

  // Handle boolean data
  if (typeof data === "boolean" || cellNameLower === "bool") {
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

  const durationArray = ["autoExtendDuration"];
  if (durationArray.includes(cellName)) {
    isoDuration.setLocales(
      {
        en,
      },
      {
        fallbackLocale: "en",
      }
    );
    const duration = isoDuration(data);
    return duration.humanize("en");
  }

  //if string starts with http, return a link
  if (typeof data === "string" && data.toLowerCase().startsWith("http")) {
    return isText ? (
      data
    ) : (
      <>
        <Link href={data} target="_blank" rel="noreferrer">
          URL
        </Link>
        <CippCopyToClipBoard text={data} />
      </>
    );
  }

  if (cellName === "AutoMapUrl") {
    return isText ? data : <CippCopyToClipBoard text={data} />;
  }

  // Handle arrays of strings
  if (Array.isArray(data) && data.every((item) => typeof item === "string")) {
    //if the array is empty, return "No data"
    return isText
      ? data.join(", ")
      : data.map((item) => <CippCopyToClipBoard key={item} text={item} type="chip" />);
  }

  // Handle objects
  if (typeof data === "object" && data !== null) {
    return isText ? (
      JSON.stringify(data)
    ) : (
      <CippDataTableButton data={data} tableTitle={getCippTranslation(cellName)} />
    );
  }

  // Default case: return data as-is
  return isText ? String(data) : <span>{data}</span>;
};
