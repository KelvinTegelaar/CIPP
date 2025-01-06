import { getCippFilterVariant } from "../../utils/get-cipp-filter-variant";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../utils/get-cipp-translation";

// Function to merge keys from all objects in the array
const mergeKeys = (dataArray) => {
  return dataArray.reduce((acc, item) => {
    const mergeRecursive = (obj, base = {}) => {
      Object?.keys(obj)?.forEach((key) => {
        // If base[key] is a string, it should not be merged as an object
        if (typeof base[key] === "string") {
          return; // Skip further merging for this key
        }

        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          base[key] = mergeRecursive(obj[key], base[key] || {});
        } else if (typeof obj[key] === "string" && obj[key].toUpperCase() === "FAILED") {
          base[key] = base[key]; // Keep existing value if it's 'FAILED'
        } else if (obj[key] !== undefined && obj[key] !== null) {
          base[key] = obj[key]; // Assign valid primitive values
        }
      });
      return base;
    };

    return mergeRecursive(item, acc);
  }, {});
};

export const utilColumnsFromAPI = (dataArray) => {
  const dataSample = mergeKeys(dataArray);

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
          accessorFn: (row) => {
            let value;
            if (accessorKey.includes("@odata")) {
              value = row[accessorKey];
            } else {
              value = accessorKey.split(".").reduce((acc, part) => acc && acc[part], row);
            }
            return getCippFormatting(value, accessorKey, "text");
          },
          ...getCippFilterVariant(key),
          Cell: ({ row }) => {
            let value;
            if (accessorKey.includes("@odata")) {
              value = row.original[accessorKey];
            } else {
              value = accessorKey.split(".").reduce((acc, part) => acc && acc[part], row.original);
            }
            return getCippFormatting(value, accessorKey);
          },
        };
      })
      .flat();
  };

  return generateColumns(dataSample);
};
