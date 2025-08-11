import {
  Cancel,
  Check,
  CompassCalibration,
  LaptopWindows,
  MailOutline,
  Shield,
  Description,
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
import { CollapsibleChipList } from "../components/CippComponents/CollapsibleChipList";

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

  // Create a helper function to render chips with CollapsibleChipList
  const renderChipList = (items, maxItems = 4) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <Chip variant="outlined" label="No data" size="small" color="info" />;
    }

    return (
      <CollapsibleChipList maxItems={maxItems}>
        {items.map((item, index) => {
          // Avoid JSON.stringify which can cause circular reference errors
          let key = index;
          if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
            key = item;
          } else if (typeof item === "object" && item?.label) {
            key = `item-${item.label}-${index}`;
          }

          return (
            <CippCopyToClipBoard
              key={key}
              text={typeof item === "object" && item?.label ? item.label : item}
              type="chip"
              icon={item?.icon ? item.icon : null}
            />
          );
        })}
      </CollapsibleChipList>
    );
  };

  if (cellName === "baselineOption") {
    return "Download Baseline";
  }

  if (cellName === "Severity" || cellName === "logsToInclude") {
    if (Array.isArray(data)) {
      return isText ? data.join(", ") : renderChipList(data);
    } else {
      return isText ? (
        data
      ) : (
        <Chip variant="outlined" label={data.label ?? data} size="small" color="info" />
      );
    }
  }

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
    "latestDataCollection",
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

  // Handle hardware hash fields
  const hardwareHashFields = ["hardwareHash", "Hardware Hash"];
  if (hardwareHashFields.includes(cellName) || cellNameLower.includes("hardware")) {
    if (typeof data === "string" && data.length > 15) {
      return isText ? data : `${data.substring(0, 15)}...`;
    }
    return isText ? data : data;
  }

  // Handle log message field
  const messageFields = ["Message"];
  if (messageFields.includes(cellName)) {
    if (typeof data === "string" && data.length > 120) {
      return isText ? data : `${data.substring(0, 120)}...`;
    }
    return isText ? data : data;
  }

  if (cellName === "alignmentScore" || cellName === "combinedAlignmentScore") {
    // Handle alignment score, return a percentage with a label
    return isText ? (
      `${data}%`
    ) : (
      <LinearProgressWithLabel colourLevels={true} variant="determinate" value={data} />
    );
  }

  if (cellName === "LicenseMissingPercentage") {
    return isText ? (
      `${data}%`
    ) : (
      <LinearProgressWithLabel colourLevels={"flipped"} variant="determinate" value={data} />
    );
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

  if (cellName === "delegatedPrivilegeStatus") {
    return data === "directTenant" ? "Direct Tenant" : "GDAP Tenant";
  }

  //if the cellName is tenantFilter, return a chip with the tenant name. This can sometimes be an array, sometimes be a single item.
  if (
    cellName === "tenantFilter" ||
    cellName === "Tenant" ||
    cellName === "Tenants" ||
    cellName === "AllowedTenants" ||
    cellName === "BlockedTenants"
  ) {
    //check if data is an array.
    if (Array.isArray(data)) {
      return isText
        ? data.join(", ")
        : renderChipList(
            data.map((item, key) => {
              const itemText = item?.label !== undefined ? item.label : item;
              let icon = null;

              if (item?.type === "Group") {
                icon = (
                  <SvgIcon sx={{ ml: 0.25 }}>
                    <GroupOutlined />
                  </SvgIcon>
                );
              } else {
                icon = (
                  <SvgIcon sx={{ ml: 0.25 }}>
                    <BuildingOfficeIcon />
                  </SvgIcon>
                );
              }

              return {
                label: itemText,
                icon: icon,
                key: key,
              };
            })
          );
    } else {
      const itemText = data?.label !== undefined ? data.label : data;
      let icon = null;

      if (data?.type === "Group") {
        icon = (
          <SvgIcon sx={{ ml: 0.25 }}>
            <GroupOutlined />
          </SvgIcon>
        );
      } else {
        icon = (
          <SvgIcon sx={{ ml: 0.25 }}>
            <BuildingOfficeIcon />
          </SvgIcon>
        );
      }
      return isText ? itemText : <CippCopyToClipBoard text={itemText} type="chip" icon={icon} />;
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
  if (cellName === "standardType") {
    return isText ? (
      data
    ) : (
      <Chip
        variant="outlined"
        label={data === "drift" ? "Drift Standard" : "Classic Standard"}
        size="small"
        color="info"
      />
    );
  }

  if (cellName === "type" && data === "drift") {
    return isText ? (
      "Drift Standard"
    ) : (
      <Chip variant="outlined" label="Drift Standard" size="small" color="info" />
    );
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
        : renderChipList(
            data
              .filter((item) => item)
              .map((item) => (typeof item === "object" && item?.label ? item.label : item))
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
    return isText ? accessRights.join(", ") : renderChipList(accessRights);
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
      return isText ? data.join(", ") : renderChipList(data);
    } else {
      // split on ; , and create chips per email
      const emails = data.split(/;|,/);
      return isText ? emails.join(", ") : renderChipList(emails);
    }
  }

  // Handle proxyAddresses
  if (cellName === "proxyAddresses") {
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return isText ? (
        "No data"
      ) : (
        <Chip variant="outlined" label="No data" size="small" color="info" />
      );
    }

    const primaryEmail = data.find((email) => email.startsWith("SMTP:"));
    const emails = data.map((email) => email.replace(/smtp:/i, ""));
    return isText ? (
      emails.join(", ")
    ) : (
      <CippDataTableButton
        tableTitle={getCippTranslation(cellName)}
        data={emails.map((email) => {
          if (primaryEmail && primaryEmail.includes(email)) {
            return {
              email: email,
              primary: true,
            };
          } else {
            return {
              email: email,
              primary: false,
            };
          }
        })}
      />
    );
  }

  // Handle assigned licenses
  if (cellName === "assignedLicenses") {
    var translatedLicenses = getCippLicenseTranslation(data);
    return isText
      ? Array.isArray(translatedLicenses)
        ? translatedLicenses.join(", ")
        : translatedLicenses
      : Array.isArray(translatedLicenses)
      ? renderChipList(translatedLicenses)
      : translatedLicenses;
  }

  if (cellName === "unifiedRoles") {
    if (Array.isArray(data)) {
      const roles = data.map((role) => getCippRoleTranslation(role.roleDefinitionId));
      return isText ? roles.join(", ") : renderChipList(roles, 12);
    }
    return isText ? (
      "No roles"
    ) : (
      <Chip variant="outlined" label="No roles" size="small" color="info" />
    );
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
      const parsedData = JSON.parse(data);

      // parsedData is an array and only contains one element
      if (
        Array.isArray(parsedData) &&
        parsedData.length === 1 &&
        typeof parsedData[0] !== "object"
      ) {
        // Handle boolean values
        if (typeof parsedData[0] === "boolean") {
          return isText ? (
            parsedData[0] ? (
              "Yes"
            ) : (
              "No"
            )
          ) : parsedData[0] ? (
            <Check fontSize="10" />
          ) : (
            <Cancel fontSize="10" />
          );
        }

        return isText ? (
          JSON.stringify(parsedData[0])
        ) : (
          <CippCopyToClipBoard text={parsedData[0]} type="chip" />
        );
      }

      // Check if parsed data is a simple array of strings
      if (
        Array.isArray(parsedData) &&
        parsedData.every((item) => typeof item === "string" || typeof item === "number") &&
        flatten
      ) {
        return isText ? parsedData.join(", ") : renderChipList(parsedData);
      }
      return isText ? (
        data
      ) : (
        <CippDataTableButton data={parsedData} tableTitle={getCippTranslation(cellName)} />
      );
    } catch (e) {
      // If parsing fails, return the original string
      return isText ? data : <span>{data}</span>;
    }
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

  // ISO 8601 Duration Formatting
  // Add property names here to automatically format ISO 8601 duration strings (e.g., "PT1H23M30S")
  // into human-readable format (e.g., "1 hour 23 minutes 30 seconds") across all CIPP tables.
  // This works for any API response property that contains ISO 8601 duration format.
  const durationArray = [
    "autoExtendDuration", // GDAP page (/tenant/gdap-management/relationships)
    "deploymentDuration", // AutoPilot deployments (/endpoint/reports/autopilot-deployment)
    "deploymentTotalDuration", // AutoPilot deployments (/endpoint/reports/autopilot-deployment)
    "deviceSetupDuration", // AutoPilot deployments (/endpoint/reports/autopilot-deployment)
    "accountSetupDuration", // AutoPilot deployments (/endpoint/reports/autopilot-deployment)
  ];
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

  // handle autocomplete labels
  if (data?.label && data?.value) {
    return isText ? data.label : <CippCopyToClipBoard text={data.label} type="chip" />;
  }

  // handle array of autocomplete labels
  if (Array.isArray(data) && data.length > 0 && data[0]?.label && data[0]?.value) {
    return isText
      ? data.map((item) => item.label).join(", ")
      : renderChipList(
          data.map((item) => {
            return {
              label: item.label,
            };
          })
        );
  }

  // Handle arrays of strings
  if (Array.isArray(data) && data.every((item) => typeof item === "string") && flatten) {
    // if string matches json format, parse it
    if (data.every((item) => item.startsWith("{") || item.startsWith("["))) {
      try {
        const parsedData = data.map((item) => JSON.parse(item));
        // Check if parsedData contains simple strings
        if (parsedData.every((item) => typeof item === "string")) {
          return isText ? parsedData.join(", ") : renderChipList(parsedData);
        }
        return isText ? (
          JSON.stringify(data)
        ) : (
          <CippDataTableButton data={parsedData} tableTitle={getCippTranslation(cellName)} />
        );
      } catch (e) {
        return isText ? JSON.stringify(data) : data.join(", ");
      }
    }

    //if the array is empty, return "No data"
    return isText ? data.join(", ") : renderChipList(data);
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
