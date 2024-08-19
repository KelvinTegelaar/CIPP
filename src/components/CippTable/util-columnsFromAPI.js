export const utilColumnsFromAPI = (obj) => {
  const newColumns = [];
  const keysSet = new Set();
  const extractKeys = (obj, parentKey = "") => {
    Object.keys(obj).forEach((key) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        extractKeys(obj[key], fullKey);
      } else {
        if (!keysSet.has(fullKey)) {
          newColumns.push({
            accessorKey: fullKey,
            header: fullKey.split(".").pop(),
          });
          keysSet.add(fullKey);
        }
      }
    });
  };
  extractKeys(obj);
  return newColumns;
};
