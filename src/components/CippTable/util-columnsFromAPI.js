import { getCippFilterVariant } from "../../utils/get-cipp-filter-variant";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../utils/get-cipp-translation";

const skipRecursion = ["location", "ScheduledBackupValues", "Tenant"];

const getAtPath = (obj, path) =>
  path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);

// Function to merge keys from all objects in the array
const mergeKeys = (dataArray) => {
  return dataArray.reduce((acc, item) => {
    const mergeRecursive = (obj, base = {}) => {
      Object.keys(obj).forEach((key) => {
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key]) &&
          !skipRecursion.includes(key)
        ) {
          if (typeof base[key] === "boolean") return; // don't merge into a boolean
          if (typeof base[key] !== "object" || Array.isArray(base[key])) base[key] = {};
          base[key] = mergeRecursive(obj[key], base[key]);
        } else if (typeof obj[key] === "boolean") {
          base[key] = obj[key];
        } else if (typeof obj[key] === "string" && obj[key].toUpperCase() === "FAILED") {
          // keep existing value if it's 'FAILED'
          base[key] = base[key];
        } else if (obj[key] !== undefined && obj[key] !== null) {
          base[key] = obj[key];
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

        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key]) &&
          !skipRecursion.includes(key)
        ) {
          return generateColumns(obj[key], accessorKey);
        }

        // Build a value resolver usable by both accessorFn/Cell and the filter util
        const resolveValue = (rowLike) =>
          accessorKey.includes("@odata") ? rowLike?.[accessorKey] : getAtPath(rowLike, accessorKey);

        // Pre-compute some sample values for filter heuristics (optional)
        const valuesForColumn = (Array.isArray(dataArray) ? dataArray : [])
          .map((r) => resolveValue(r))
          .filter((v) => v !== undefined && v !== null);

        const sampleValue = valuesForColumn.length ? valuesForColumn[0] : undefined;

        const column = {
          header: getCippTranslation(accessorKey),
          id: accessorKey,
          accessorFn: (row) => {
            const value = resolveValue(row);
            return getCippFormatting(value, accessorKey, "text");
          },
          ...getCippFilterVariant(accessorKey, {
            sampleValue,
            values: valuesForColumn,
            getValue: (row) => resolveValue(row),
          }),
          Cell: ({ row }) => {
            const value = resolveValue(row.original);
            return getCippFormatting(value, accessorKey);
          },
        };

        return column;
      })
      .flat();
  };

  return generateColumns(dataSample);
};
