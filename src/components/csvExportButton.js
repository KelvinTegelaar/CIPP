import { BackupTableTwoTone } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { getCippFormatting } from "../utils/get-cipp-formatting";
const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

export const CSVExportButton = (props) => {
  const { rows, columns, reportName, columnVisibility } = props;

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const columnKeys = columns.filter((c) => columnVisibility[c.id]).map((c) => c.id);
    rowData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!columnKeys.includes(key)) {
          delete row[key];
        }
      });
    });

    //for every existing row, get the valid formatting using getCippFormatting.
    const formattedData = rowData.map((row) => {
      const formattedRow = {};
      Object.keys(row).forEach((key) => {
        formattedRow[key] = getCippFormatting(row[key], key, "text", false);
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
        <IconButton disabled={rows.length === 0} onClick={() => handleExportRows(rows)}>
          <BackupTableTwoTone />
        </IconButton>
      </span>
    </Tooltip>
  );
};
