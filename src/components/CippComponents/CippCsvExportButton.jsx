import { BackupTableTwoTone } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { mkConfig, generateCsv, download } from "export-to-csv";

// Utility to flatten nested objects
const flattenObject = (obj, parent = "", res = {}) => {
  for (let key in obj) {
    const propName = parent ? `${parent}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};

export const CippCsvExportButton = ({ rawData, reportName = "Export", includeFields = [] }) => {
  const handleExport = () => {
    if (!rawData || rawData.length === 0) {
      console.warn("No raw data available for export.");
      return;
    }

    // Flatten and process raw data
    const flattenedData = rawData.map((item) => flattenObject(item));

    // Optionally filter specific fields
    const exportData = includeFields.length
      ? flattenedData.map((row) =>
          includeFields.reduce((filteredRow, field) => {
            if (row[field] !== undefined) {
              filteredRow[field] = row[field];
            }
            return filteredRow;
          }, {})
        )
      : flattenedData;

    // Generate CSV configuration
    const csvConfig = mkConfig({
      fieldSeparator: ",",
      decimalSeparator: ".",
      useKeysAsHeaders: true,
      filename: `${reportName}_${new Date().toISOString()}.csv`,
    });

    // Generate and download CSV
    const csv = generateCsv(csvConfig)(exportData);
    download(csvConfig)(csv);
  };

  return (
    <Tooltip title="Export Raw Data to CSV">
      <span>
        <IconButton disabled={!rawData || rawData.length === 0} onClick={handleExport}>
          <BackupTableTwoTone />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default CippCsvExportButton;
