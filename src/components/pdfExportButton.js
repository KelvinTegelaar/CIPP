import { IconButton, Tooltip } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getCippFormatting } from "../utils/get-cipp-formatting";

export const PDFExportButton = (props) => {
  const { rows, columns, reportName, columnVisibility } = props;

  const handleExportRows = (rows) => {
    const unit = "pt";
    const size = "A3"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape
    const doc = new jsPDF(orientation, unit, size);
    const tableData = rows.map((row) => row.original);

    //only export columns that are visible.
    const exportColumns = columns
      .filter((c) => columnVisibility[c.id])
      .map((c) => ({ header: c.header, dataKey: c.id }));
    //for every existing row, get the valid formatting using getCippFormatting.
    const formattedData = tableData.map((row) => {
      const formattedRow = {};
      Object.keys(row).forEach((key) => {
        formattedRow[key] = getCippFormatting(row[key], key, "text", false);
      });
      return formattedRow;
    });

    let content = {
      startY: 100,
      columns: exportColumns,
      body: formattedData,
      theme: "striped",
      headStyles: { fillColor: [247, 127, 0] },
    };
    autoTable(doc, content);

    doc.save(`${reportName}.pdf`);
  };
  return (
    <Tooltip title="Export to PDF">
      <span>
        <IconButton disabled={rows.length === 0} onClick={() => handleExportRows(rows)}>
          <PictureAsPdf />
        </IconButton>
      </span>
    </Tooltip>
  );
};
