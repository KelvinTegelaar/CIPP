import { getCippFilterVariant } from "../../utils/get-cipp-filter-variant";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../utils/get-cipp-translation";

// Function to merge keys from all objects in the array
const mergeKeys = (dataArray) => {
  return dataArray.reduce((acc, item) => {
    const mergeRecursive = (obj, base = {}) => {
      Object.keys(obj).forEach((key) => {
        if (typeof base[key] === "string") return;

        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          base[key] = mergeRecursive(obj[key], base[key] || {});
        } else {
          base[key] = obj[key];
        }
      });
      return base;
    };

    return mergeRecursive(item, acc);
  }, {});
};

// Generate columns based on merged keys and cache translations
export const utilColumnsFromAPI = (dataArray) => {
  // Merge data structure to generate columns
  const dataSample = mergeKeys(dataArray);
  const translationCache = {};

  const generateColumns = (obj, parentKey = "") => {
    return Object.keys(obj)
      .map((key) => {
        const accessorKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          return generateColumns(obj[key], accessorKey);
        }
        // Cache translation for each column header
        if (!translationCache[accessorKey]) {
          translationCache[accessorKey] = getCippTranslation(accessorKey);
        }
        return {
          header: translationCache[accessorKey],
          id: accessorKey,
          accessorFn: (row) => row?.[accessorKey]?.["text"], // Function to access data from row
          Cell: ({ row }) => row?.original?.[accessorKey]?.jsx, // Function to render cell
          ...getCippFilterVariant(key),
        };
      })
      .flat();
  };
  const returnedData = generateColumns(dataSample);
  return returnedData;
};
