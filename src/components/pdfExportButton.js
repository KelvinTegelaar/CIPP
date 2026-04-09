import { IconButton, Tooltip } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getCippFormatting } from "../utils/get-cipp-formatting";
import { useSettings } from "../hooks/use-settings";

// Flatten nested objects so deeply nested properties export properly.
// This function only restructures data without formatting - formatting happens later in one pass.
const flattenObject = (obj, parentKey = "") => {
  const flattened = {};
  Object.keys(obj).forEach((key) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(flattened, flattenObject(obj[key], fullKey));
    } else {
      // Store the raw value - formatting will happen in a single pass later
      flattened[fullKey] = obj[key];
    }
  });
  return flattened;
};

// Shared helper so the toolbar buttons and bulk export path share the same PDF logic.
export const exportRowsToPdf = ({
  rows = [],
  columns = [],
  reportName = "Export",
  columnVisibility = {},
  brandingSettings = {},
}) => {
  if (!rows.length || !columns.length) {
    return;
  }

  const unit = "pt";
  const size = "A3";
  const orientation = "landscape";
  const doc = new jsPDF(orientation, unit, size);
  const tableData = rows.map((row) => flattenObject(row.original ?? row));

  const exportColumns = columns
    .filter((c) => columnVisibility[c.id])
    .map((c) => ({ header: c.header, dataKey: c.id }));

  // Use the existing formatting helper so PDF output mirrors table formatting.
  const formattedData = tableData.map((row) => {
    const formattedRow = {};
    exportColumns.forEach((col) => {
      const key = col.dataKey;
      if (key in row) {
        formattedRow[key] = getCippFormatting(row[key], key, "text", false);
      }
    });
    return formattedRow;
  });

  let logoHeight = 0;
  if (brandingSettings?.logo) {
    try {
      const logoSize = 60;
      const logoX = 40;
      const logoY = 30;
      doc.addImage(brandingSettings.logo, "PNG", logoX, logoY, logoSize, logoSize);
      logoHeight = logoSize + 20;
    } catch (error) {
      console.warn("Failed to add logo to PDF:", error);
    }
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const availableWidth = pageWidth - 2 * margin;
  const columnCount = exportColumns.length;

  // Estimate column widths from content to keep tables readable regardless of dataset.
  const columnWidths = exportColumns.map((col) => {
    const headerLength = col.header.length;
    const maxContentLength = Math.max(
      ...formattedData.map((row) => String(row[col.dataKey] || "").length),
    );
    const estimatedWidth = Math.max(headerLength, maxContentLength) * 6;
    return Math.min(estimatedWidth, (availableWidth / columnCount) * 1.5);
  });

  const totalEstimatedWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const normalizedWidths = columnWidths.map(
    (width) => (width / totalEstimatedWidth) * availableWidth,
  );

  // Honor tenant branding colors when present so exports stay on-brand.
  const getHeaderColor = () => {
    if (brandingSettings?.colour) {
      const hex = brandingSettings.colour.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return [r, g, b];
    }
    return [247, 127, 0];
  };

  const content = {
    startY: 100 + logoHeight,
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

export const PDFExportButton = (props) => {
  const { rows = [], columns = [], reportName, columnVisibility = {}, ...other } = props;
  const brandingSettings = useSettings().customBranding;

  return (
    <Tooltip title="Export to PDF">
      <span>
        <IconButton
          disabled={rows.length === 0}
          onClick={() =>
            exportRowsToPdf({
              rows,
              columns,
              reportName,
              columnVisibility,
              brandingSettings,
            })
          }
          {...other}
        >
          <PictureAsPdf />
        </IconButton>
      </span>
    </Tooltip>
  );
};
