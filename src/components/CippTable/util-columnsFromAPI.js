import { getCippFilterVariant } from "../../utils/get-cipp-filter-variant";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../utils/get-cipp-translation";

const skipRecursion = ["location", "ScheduledBackupValues", "Tenant"];

// Number of rows to sample when measuring column content width.
const MAX_SIZE_SAMPLE = 30;
// Average character width in pixels at compact density (roughly 7–8px per char).
const CHAR_WIDTH = 8;
// Extra padding per cell (sort icon, filter icon, cell padding).
const CELL_PADDING = 36;
const MIN_COL_SIZE = 80;
const MAX_COL_SIZE = 500;

// Measure the pixel width a column needs based on its header and sampled cell values.
// rawValues are the original data values (before formatting) — if they contain arrays or
// complex objects the column renders as a button/chip list, so we cap to header width.
// Returns { size, minSize } where minSize is always header-width + 30px safe space.
const measureColumnSize = (header, valuesForColumn, rawValues) => {
  const headerLen = header ? header.length : 6;
  const headerPx = Math.round(headerLen * CHAR_WIDTH + CELL_PADDING + 30);
  const minSize = Math.max(MIN_COL_SIZE, headerPx);

  // If any raw value is an array or complex object, the cell renders as a compact
  // button or chip list. We measure the longest individual chip/item rather than the
  // full joined text. For object arrays that format into comma-separated chip labels
  // (e.g. assignedLicenses), we split the formatted text on commas to measure each chip.
  if (rawValues && rawValues.length > 0) {
    const hasComplex = rawValues.some(
      (v) => Array.isArray(v) || (typeof v === 'object' && v !== null)
    );
    if (hasComplex) {
      let longestItem = headerLen;
      for (let i = 0; i < rawValues.length; i++) {
        const v = rawValues[i];
        if (Array.isArray(v)) {
          const isObjectArray = v.some((el) => typeof el === 'object' && el !== null);
          if (isObjectArray) {
            // Object arrays get translated by getCippFormatting into comma-joined text.
            // Split on ", " and measure each segment (each becomes a chip).
            const formatted = valuesForColumn[i];
            if (typeof formatted === 'string') {
              for (const seg of formatted.split(', ')) {
                if (seg.length > longestItem) longestItem = seg.length;
              }
            }
            continue;
          }
          // Arrays of strings/numbers → chips — measure each item
          for (const el of v) {
            const s = typeof el === 'string' ? el : el != null ? String(el) : '';
            if (s.length > longestItem) longestItem = s.length;
          }
        }
        // Plain objects → may also format into chip text
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          const formatted = valuesForColumn[i];
          if (typeof formatted === 'string') {
            for (const seg of formatted.split(', ')) {
              if (seg.length > longestItem) longestItem = seg.length;
            }
          }
        }
      }
      const chipPx = Math.round(longestItem * CHAR_WIDTH + CELL_PADDING);
      const size = Math.max(minSize, Math.min(MAX_COL_SIZE, chipPx));
      return { size, minSize };
    }
  }

  let maxLen = headerLen;
  const sample = valuesForColumn.length > MAX_SIZE_SAMPLE
    ? valuesForColumn.slice(0, MAX_SIZE_SAMPLE)
    : valuesForColumn;
  for (const v of sample) {
    const str = typeof v === 'string' ? v : v != null ? String(v) : '';
    // URLs render as icons/links in the cell — don't measure the full URL text.
    if (str.match(/^https?:\/\//i)) continue;
    if (str.length > maxLen) maxLen = str.length;
  }
  const px = Math.round(maxLen * CHAR_WIDTH + CELL_PADDING);
  const size = Math.max(minSize, Math.min(MAX_COL_SIZE, px));
  return { size, minSize };
};

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

// Function to merge keys from a sample of objects in the array.
// Sampling the first MAX_SAMPLE rows is sufficient for schema detection and avoids
// O(n * keys) traversal on large datasets.
const MAX_MERGE_SAMPLE = 50;

const mergeKeys = (dataArray) => {
  const sample = dataArray.length > MAX_MERGE_SAMPLE ? dataArray.slice(0, MAX_MERGE_SAMPLE) : dataArray;
  return sample.reduce((acc, item) => {
    const mergeRecursive = (obj, base = {}) => {
      // Add null/undefined check before calling Object.keys
      if (!obj || typeof obj !== 'object') {
        return base;
      }
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

    // Add null/undefined check before calling mergeRecursive
    if (!item || typeof item !== 'object') {
      return acc;
    }
    return mergeRecursive(item, acc);
  }, {});
};

// Maximum rows to sample for filter heuristics (e.g. detecting value types).
// Scanning the full dataset is O(n * columns) and dominates render time on large tables.
const MAX_FILTER_SAMPLE = 50;

export const utilColumnsFromAPI = (dataArray) => {
  // Add safety check for dataArray
  if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
    return [];
  }

  const dataSample = mergeKeys(dataArray);

  // Use a small sample for filter heuristics instead of scanning every row.
  const filterSample = dataArray.length > MAX_FILTER_SAMPLE
    ? dataArray.slice(0, MAX_FILTER_SAMPLE)
    : dataArray;

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

        // Sample a small subset for filter heuristics instead of the full dataset.
        const valuesForColumn = filterSample
          .map((r) => resolveValue(r))
          .filter((v) => v !== undefined && v !== null);

        const sampleValue = valuesForColumn.length ? valuesForColumn[0] : undefined;

        // Measure content width from formatted text values for this column.
        const textValues = valuesForColumn.map((v) => getCippFormatting(v, accessorKey, "text"));
        const header = getCippTranslation(accessorKey);
        const measuredSize = measureColumnSize(header, textValues, valuesForColumn);

        const column = {
          header,
          id: accessorKey,
          ...measuredSize,
          accessorFn: (row) => {
            const value = resolveValue(row);
            return getCippFormatting(value, accessorKey, "text");
          },
          ...getCippFilterVariant(accessorKey, {
            sampleValue,
            values: valuesForColumn,
            getValue: (row) => resolveValue(row),
            dataArray: filterSample,
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
