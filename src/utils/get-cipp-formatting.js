import {
  Cancel,
  Check,
  CompassCalibration,
  LaptopWindows,
  MailOutline,
  Shield,
  Description,
  Group,
  MeetingRoom,
  GroupWork,
  GroupOutlined,
} from "@mui/icons-material";
import { Chip, Link, SvgIcon } from "@mui/material";
import { Box } from "@mui/system";
import { CippCopyToClipBoard } from "../components/CippComponents/CippCopyToClipboard";
import { getCippLicenseTranslation } from "./get-cipp-license-translation";
import CippDataTableButton from "../components/CippTable/CippDataTableButton";
import { LinearProgressWithLabel } from "../components/linearProgressWithLabel";
import { CippLocationDialog } from "../components/CippComponents/CippLocationDialog";
import { isoDuration, en } from "@musement/iso-duration";
import { CippTimeAgo } from "../components/CippComponents/CippTimeAgo";
import { getCippRoleTranslation } from "./get-cipp-role-translation";
import {
  BuildingOfficeIcon,
  CogIcon,
  ServerIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { getCippTranslation } from "./get-cipp-translation";
import DOMPurify from "dompurify";
import { getSignInErrorCodeTranslation } from "./get-cipp-signin-errorcode-translation";

export const getCippFormatting = (data, cellName, type, canReceive, flatten = true) => {
  const isText = type === "text";
  const cellNameLower = cellName.toLowerCase();
  // if data is a data object, return a fFormatted date
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
    portal_sharepoint: Description,
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

  if (cellName === "prohibitSendReceiveQuotaInBytes" || cellName === "storageUsedInBytes") {
    //convert bytes to GB
    const bytes = data;
    if (bytes === null || bytes === undefined) {
      return isText ? (
        "No data"
      ) : (
        <Chip variant="outlined" label="No data" size="small" color="info" />
      );
    }
    const gb = bytes / 1024 / 1024 / 1024;
    return isText ? `${gb.toFixed(2)} GB` : `${gb.toFixed(2)} GB`;
  }

  if (cellName === "info.logoUrl") {
    return isText ? (
      data
    ) : data ? (
      <img src={data} alt="logo" style={{ width: "16px", height: "16px" }} />
    ) : (
      ""
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
    "CreationTime",
    "renewalDate",
    "commitmentTerm.renewalConfiguration.renewalDate",
    "purchaseDate",
    "NextOccurrence",
    "LastOccurrence",
    "NotBefore",
    "NotAfter",
  ];

  const matchDateTime = /[dD]ate[tT]ime/;
  if (timeAgoArray.includes(cellName) || matchDateTime.test(cellName)) {
    return isText && canReceive === false ? (
      new Date(data).toLocaleString() // This runs if canReceive is false and isText is true
    ) : isText && canReceive !== "both" ? (
      new Date(data) // This runs if isText is true and canReceive is not "both" or false
    ) : (
      <CippTimeAgo data={data} type={type} />
    );
  }
  const passwordItems = ["breachPass", "applicationsecret", "refreshtoken"];

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
              key={`${item?.label}`}
              text={item?.label ? item?.label : item}
              icon={
                item?.type === "Group" ? (
                  <SvgIcon sx={{ ml: 0.25 }}>
                    <GroupOutlined />
                  </SvgIcon>
                ) : item?.type === "Tenant" ? (
                  <SvgIcon sx={{ ml: 0.25 }}>
                    <BuildingOfficeIcon />
                  </SvgIcon>
                ) : null
              }
              type="chip"
            />
          ));
    } else {
      return isText ? (
        data
      ) : (
        <CippCopyToClipBoard text={data?.label ? data?.label : data} type="chip" />
      );
    }
  }

  if (cellName === "PostExecution") {
    const values = data ? data?.split(",").map((item) => item.trim()) : [];
    if (values.length > 0) {
      return isText
        ? data
        : values.map((value, index) => (
            <Chip
              key={index}
              size="small"
              variant="outlined"
              label={value}
              color="info"
              sx={{ mr: 0.5 }}
            />
          ));
    }
  }

  if (cellName === "ClientId" || cellName === "role") {
    return isText ? data : <CippCopyToClipBoard text={data} type="chip" />;
  }

  if (cellName === "excludedTenants") {
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
    //check if data is an array.
    if (Array.isArray(data)) {
      return isText
        ? data
            .map((item) => (typeof item === "object" && item?.label ? item.label : item))
            .join(", ")
        : data.map(
            (item) =>
              item && (
                <CippCopyToClipBoard
                  key={typeof item === "object" ? item?.value || item?.label : item}
                  text={typeof item === "object" && item?.label ? item.label : item}
                  type="chip"
                />
              )
          );
    }
  }
  if (cellName === "bulkUser") {
    return isText ? `${data.length} new users to create` : `${data.length} new users to create`;
  }

  if (data?.enabled === true && data?.date) {
    return isText ? (
      `Yes, Scheduled for ${new Date(data.date).toLocaleString()}`
    ) : (
      <>
        Yes, Scheduled for <CippTimeAgo data={data.date} />
      </>
    );
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

  if (cellName === "Parameters.ScheduledBackupValues") {
    return isText ? (
      JSON.stringify(data)
    ) : (
      <CippDataTableButton
        data={Object.keys(data).map((key) => {
          return { key, value: data[key] };
        })}
        tableTitle={getCippTranslation(cellName)}
      />
    );
  }

  if (cellName === "AccessRights") {
    // Handle data as an array or string
    const accessRights = Array.isArray(data)
      ? data.flatMap((item) => (typeof item === "string" ? item.split(", ") : []))
      : typeof data === "string"
      ? data.split(", ")
      : [];
    return isText
      ? accessRights.join(", ")
      : accessRights.map((accessRight) => (
          <CippCopyToClipBoard key={accessRight} text={accessRight} type="chip" />
        ));
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

  if (cellName.includes("@odata.type")) {
    if (data.startsWith("#microsoft.graph")) {
      data = data.replace("#microsoft.graph.", "");
      return getCippTranslation(data, "@odata.type");
    }
    return data;
  }

  // Handle From address
  if (cellName === "From") {
    // if data is array
    if (Array.isArray(data)) {
      return isText ? data.join(", ") : data.join(", ");
    } else {
      // split on ; , and create chips per email
      const emails = data.split(/;|,/);
      return isText
        ? emails.join(", ")
        : emails.map((email) => <CippCopyToClipBoard key={email} text={email} type="chip" />);
    }
  }

  // Handle proxyAddresses
  if (cellName === "proxyAddresses") {
    if (!Array.isArray(data)) {
      data = [data];
    }
    const emails = data.map((email) => email.replace(/smtp:/i, ""));
    return isText
      ? emails.join(", ")
      : emails.map((email) => <CippCopyToClipBoard key={email} text={email} type="chip" />);
  }

  // Handle assigned licenses
  if (cellName === "assignedLicenses") {
    var translatedLicenses = getCippLicenseTranslation(data);
    return isText
      ? Array.isArray(translatedLicenses)
        ? translatedLicenses.join(", ")
        : translatedLicenses
      : translatedLicenses.map((license) => (
          <CippCopyToClipBoard key={license} text={license} type="chip" />
        ));
  }

  if (cellName === "unifiedRoles") {
    if (Array.isArray(data)) {
      const roles = data.map((role) => getCippRoleTranslation(role.roleDefinitionId));
      return isText ? roles.join(", ") : roles;
    }
  }

  // Handle roleDefinitionId
  if (cellName === "roleDefinitionId") {
    return getCippRoleTranslation(data);
  }

  // Handle CIPPAction property
  if (cellName === "CIPPAction") {
    try {
      var actions = JSON.parse(data);
    } catch (e) {
      actions = data;
    }
    if (!Array.isArray(actions)) {
      actions = [actions];
    }
    return isText
      ? actions.map((action) => action.label).join(", ")
      : actions.map((action) => (
          <CippCopyToClipBoard key={action.label} text={action.label} type="chip" />
        ));
  }

  // if data is a json string, parse it and return a table
  if (typeof data === "string" && (data.startsWith("{") || data.startsWith("["))) {
    try {
      return isText ? (
        data
      ) : (
        <CippDataTableButton data={JSON.parse(data)} tableTitle={getCippTranslation(cellName)} />
      );
    } catch (e) {}
  }

  if (cellName === "key") {
    return isText ? data : getCippTranslation(data);
  }

  // Handle CIPPExtendedProperties, parse JSON and display table of Name, Value
  if (cellName === "CIPPExtendedProperties") {
    const properties = JSON.parse(data);
    return isText ? (
      JSON.stringify(properties)
    ) : (
      <CippDataTableButton data={properties} tableTitle={getCippTranslation(cellName)} />
    );
  }

  if (cellName === "status.errorCode") {
    return getSignInErrorCodeTranslation(data);
  }

  if (cellName === "location" && data?.geoCoordinates) {
    return isText ? JSON.stringify(data) : <CippLocationDialog location={data} />;
  }

  const translateProps = ["riskLevel", "riskState", "riskDetail", "enrollmentType", "profileType"];

  if (translateProps.includes(cellName)) {
    return getCippTranslation(data);
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

  // handle htmlDescription
  if (cellName === "htmlDescription") {
    return isText ? (
      data
    ) : (
      <Box
        component="span"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(data),
        }}
      />
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

  if (cellName === "Visibility") {
    const gitHubVisibility = ["public", "private", "internal"];
    if (gitHubVisibility.includes(data)) {
      return isText ? (
        data
      ) : (
        <Chip
          variant="outlined"
          label={data}
          size="small"
          color={data === "private" ? "error" : data === "public" ? "success" : "primary"}
          sx={{ textTransform: "capitalize" }}
        />
      );
    }
  }

  if (cellName === "AutoMapUrl") {
    return isText ? data : <CippCopyToClipBoard text={data} />;
  }

  // Handle arrays of strings
  if (Array.isArray(data) && data.every((item) => typeof item === "string") && flatten) {
    // if string matches json format, parse it
    if (data.every((item) => item.startsWith("{") || item.startsWith("["))) {
      return isText ? (
        JSON.stringify(data)
      ) : (
        <CippDataTableButton
          data={data.map((item) => JSON.parse(item))}
          tableTitle={getCippTranslation(cellName)}
        />
      );
    }

    //if the array is empty, return "No data"
    return isText
      ? data.join(", ")
      : data.map((item) => <CippCopyToClipBoard key={item} text={item} type="chip" />);
  }

  // Handle objects
  if (typeof data === "object" && data !== null && flatten) {
    return isText ? (
      JSON.stringify(data)
    ) : (
      <CippDataTableButton data={data} tableTitle={getCippTranslation(cellName)} />
    );
  }

  // Default case: return data as-is
  return isText ? String(data) : <span>{data}</span>;
};
