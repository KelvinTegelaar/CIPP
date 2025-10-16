import { IconButton, Tooltip } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getCippFormatting } from "../utils/get-cipp-formatting";
import { useSettings } from "../hooks/use-settings";

export const PDFExportButton = (props) => {
  const { rows, columns, reportName, columnVisibility, ...other } = props;
  const brandingSettings = useSettings().customBranding;
  //we need to use jspdf here because the react-pdf library gets killed with our amount of data.
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

    // Add custom branding logo if available
    let logoHeight = 0;
    if (brandingSettings?.logo) {
      try {
        const logoSize = 60; // Fixed logo height
        const logoX = 40; // Left margin
        const logoY = 30; // Top margin

        // Add the base64 image to the PDF
        doc.addImage(brandingSettings.logo, "PNG", logoX, logoY, logoSize, logoSize);
        logoHeight = logoSize + 20; // Logo height plus some spacing
      } catch (error) {
        console.warn("Failed to add logo to PDF:", error);
      }
    }

    // Calculate column widths based on content and available space
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40; // Consistent margins from edges
    const availableWidth = pageWidth - 2 * margin;
    const columnCount = exportColumns.length;

    // Calculate dynamic column widths based on content length
    const columnWidths = exportColumns.map((col) => {
      const headerLength = col.header.length;
      const maxContentLength = Math.max(
        ...formattedData.map((row) => String(row[col.dataKey] || "").length)
      );
      const estimatedWidth = Math.max(headerLength, maxContentLength) * 6; // 6 points per character
      return Math.min(estimatedWidth, (availableWidth / columnCount) * 1.5); // Cap at 1.5x average
    });

    // Normalize widths to fit available space
    const totalEstimatedWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const normalizedWidths = columnWidths.map(
      (width) => (width / totalEstimatedWidth) * availableWidth
    );

    // Convert hex color to RGB if custom branding color is provided
    const getHeaderColor = () => {
      if (brandingSettings?.colour) {
        const hex = brandingSettings.colour.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return [r, g, b];
      }
      return [247, 127, 0]; // Default orange color
    };

    let content = {
      startY: 100 + logoHeight, // Adjust table start position based on logo
      head: [exportColumns.map((col) => col.header)],
      body: formattedData.map((row) => exportColumns.map((col) => String(row[col.dataKey] || ""))),
      theme: "striped",
      headStyles: {
        fillColor: getHeaderColor(),
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 10,
        cellPadding: 8,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 6,
        valign: "top",
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      columnStyles: exportColumns.reduce((styles, col, index) => {
        styles[index] = {
          cellWidth: normalizedWidths[index],
          halign: "left",
          valign: "top",
        };
        return styles;
      }, {}),
      margin: {
        top: margin,
        right: margin,
        bottom: margin,
        left: margin,
      },
      tableWidth: "auto",
      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
        fontSize: 9,
        cellPadding: 6,
      },
    };
    autoTable(doc, content);

    doc.save(`${reportName}.pdf`);
  };
  return (
    <Tooltip title="Export to PDF">
      <span>
        <IconButton disabled={rows.length === 0} onClick={() => handleExportRows(rows)} {...other}>
          <PictureAsPdf />
        </IconButton>
      </span>
    </Tooltip>
  );
};
