import { getCippFilterVariant } from "../../utils/get-cipp-filter-variant";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../utils/get-cipp-translation";

const skipRecursion = ["location", "ScheduledBackupValues", "Tenant"];

// Variable replacement patterns - maps variable names to property patterns
const variableReplacements = {
  cippuserschema: (dataSample) => {
    // Find the first property that contains "_cippUser"
    const cippUserProp = Object.keys(dataSample).find((key) => key.includes("_cippUser"));
    return cippUserProp || "cippuserschema"; // fallback to original if not found
  },
};

// Function to resolve variable replacements in column names
const resolveVariables = (columnName, dataSample) => {
  return columnName.replace(/%(\w+)%/g, (match, variableName) => {
    const resolver = variableReplacements[variableName.toLowerCase()];
    if (resolver && typeof resolver === "function") {
      const resolved = resolver(dataSample);
      console.log("resolving " + match + " to " + resolved);
      return resolved;
    }
    return match; // return original if no resolver found
  });
};

const getAtPath = (obj, path) => {
  const parts = path.split(".");
  return parts.reduce((acc, part) => {
    if (acc && typeof acc === "object") {
      return acc[part];
    }
    return undefined;
  }, obj);
};

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
            dataArray: dataArray, // Pass the full data array for processing if needed
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

// Helper function to resolve variables in simple column names
export const resolveSimpleColumnVariables = (simpleColumns, dataArray) => {
  if (!simpleColumns || !Array.isArray(dataArray) || dataArray.length === 0) {
    return simpleColumns;
  }

  const dataSample = mergeKeys(dataArray);

  return simpleColumns.map((columnName) => {
    if (typeof columnName === "string" && columnName.includes("%")) {
      const resolved = resolveVariables(columnName, dataSample);
      console.log(`Resolving simple column: ${columnName} -> ${resolved}`);
      return resolved;
    }
    return columnName;
  });
};
