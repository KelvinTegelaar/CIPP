import { BackupTableTwoTone } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { mkConfig, generateCsv, download } from "export-to-csv";
const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

export const CSVExportButton = (props) => {
  const { rows, columns, reportName, columnVisibility } = props;

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    //only lsit columnKeys that are visible
    const columnKeys = columns
      .filter((c) => columnVisibility[c.accessorKey])
      .map((c) => c.accessorKey);
    rowData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!columnKeys.includes(key)) {
          delete row[key];
        }
      });
    });
    const csv = generateCsv(csvConfig)(rowData);
    csvConfig["filename"] = `${reportName}`;
    download(csvConfig)(csv);
  };
  return (
    <Tooltip title="Export to CSV">
      <IconButton disabled={rows.length === 0} onClick={() => handleExportRows(rows)}>
        <BackupTableTwoTone />
      </IconButton>
    </Tooltip>
  );
};
