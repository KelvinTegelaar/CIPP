import { getCippFilterVariant } from "../../utils/get-cipp-filter-variant";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../utils/get-cipp-translation";

export const utilColumnsFromAPI = (dataSample) => {
  const generateColumns = (obj, parentKey = "") => {
    return Object.keys(obj)
      .map((key) => {
        const accessorKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          return generateColumns(obj[key], accessorKey);
        }

        return {
          header: getCippTranslation(accessorKey),
          id: accessorKey,
          accessorFn: (row) => getCippFormatting(row[accessorKey], accessorKey, "text"),
          ...getCippFilterVariant(key),
          Cell: ({ row }) => {
            return getCippFormatting(row.original[accessorKey], accessorKey);
          },
        };
      })
      .flat();
  };

  return generateColumns(dataSample);
};
