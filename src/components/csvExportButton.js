import { BackupTableTwoTone } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { getCippFormatting } from "../utils/get-cipp-formatting";
const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

// Flatten nested objects so deeply nested properties export as dotted columns.
const flattenObject = (obj, parentKey = "") => {
  const flattened = {};
  Object.keys(obj).forEach((key) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(flattened, flattenObject(obj[key], fullKey));
    } else if (Array.isArray(obj[key]) && typeof obj[key][0] === "string") {
      flattened[fullKey] = obj[key];
    } else if (Array.isArray(obj[key])) {
      let testFormatting = getCippFormatting(obj[key], key, "text", false, false);
      if (typeof testFormatting === "string" && !testFormatting.includes("[object Object]")) {
        flattened[fullKey] = testFormatting;
      } else {
        flattened[fullKey] = obj[key]
          .map((item) =>
            typeof item === "object"
              ? JSON.stringify(
                  Object.fromEntries(
                    Object.entries(flattenObject(item)).map(([k, v]) => [
                      k,
                      getCippFormatting(v, k, "text", false),
                    ])
                  )
                )
              : getCippFormatting(item, fullKey, "text", false, false)
          )
          .join(", ");
      }
    } else {
      flattened[fullKey] = obj[key];
    }
  });
  return flattened;
};

// Shared helper so both toolbar buttons and bulk actions reuse identical CSV logic.
export const exportRowsToCsv = ({
  rows = [],
  columns = [],
  reportName = "Export",
  columnVisibility = {},
}) => {
  if (!rows.length || !columns.length) {
    return;
  }

  const rowData = rows.map((row) => flattenObject(row.original ?? row));
  const columnKeys = columns.filter((c) => columnVisibility[c.id]).map((c) => c.id);

  const filterRowData = (row, allowedKeys) => {
    const filteredRow = {};
    allowedKeys.forEach((key) => {
      if (key in row) {
        filteredRow[key] = row[key];
      }
    });
    return filteredRow;
  };

  const filteredData = rowData.map((row) => filterRowData(row, columnKeys));

  // Apply standard CIPP formatting so CSV values match on-screen representations.
  const formattedData = filteredData.map((row) => {
    const formattedRow = {};
    columnKeys.forEach((key) => {
      const value = row[key];
      if (typeof value === "string") {
        formattedRow[key] = value;
        return;
      }

      formattedRow[key] = getCippFormatting(value, key, "text", false);
    });
    return formattedRow;
  });

  const csv = generateCsv(csvConfig)(formattedData);
  csvConfig["filename"] = `${reportName}`;
  download(csvConfig)(csv);
};

export const CSVExportButton = (props) => {
  const { rows = [], columns = [], reportName, columnVisibility = {}, ...other } = props;

  return (
    <Tooltip title="Export to CSV">
      <span>
        <IconButton
          disabled={rows.length === 0}
          onClick={() => exportRowsToCsv({ rows, columns, reportName, columnVisibility })}
          {...other}
        >
          <BackupTableTwoTone />
        </IconButton>
      </span>
    </Tooltip>
  );
};
