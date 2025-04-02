import { BackupTableTwoTone } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { getCippFormatting } from "../utils/get-cipp-formatting";
const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const flattenObject = (obj, parentKey = "") => {
  const flattened = {};
  Object.keys(obj).forEach((key) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(flattened, flattenObject(obj[key], fullKey));
    } else if (Array.isArray(obj[key])) {
      // Handle arrays of objects by applying the formatter on each property
      flattened[fullKey] = obj[key]
        .map((item) =>
          typeof item === "object"
            ? JSON.stringify(
                Object.fromEntries(
                  Object.entries(flattenObject(item)).map(([k, v]) => [k, getCippFormatting(v, k, "text", false)])
                )
              )
            : getCippFormatting(item, fullKey, "text", false)
        )
        .join(", ");
    } else {
      flattened[fullKey] = obj[key];
    }
  });
  return flattened;
};

export const CSVExportButton = (props) => {
  const { rows, columns, reportName, columnVisibility, ...other } = props;

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => flattenObject(row.original));
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

    const formattedData = filteredData.map((row) => {
      const formattedRow = {};
      columnKeys.forEach((key) => {
        const value = row[key];
        // Pass flattened data to the formatter for CSV export
        formattedRow[key] = getCippFormatting(value, key, "text", false);
      });
      return formattedRow;
    });

    const csv = generateCsv(csvConfig)(formattedData);
    csvConfig["filename"] = `${reportName}`;
    download(csvConfig)(csv);
  };

  return (
    <Tooltip title="Export to CSV">
      <span>
        <IconButton disabled={rows.length === 0} onClick={() => handleExportRows(rows)} {...other}>
          <BackupTableTwoTone />
        </IconButton>
      </span>
    </Tooltip>
  );
};
