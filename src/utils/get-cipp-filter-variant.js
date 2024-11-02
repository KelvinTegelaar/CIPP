export const getCippFilterVariant = (providedColumnKeys) => {
  switch (providedColumnKeys) {
    case "assignedLicenses":
      return {
        filterVariant: "select",
      };
    case "accountEnabled":
      return {
        filterVariant: "select",
      };
    case "primDomain":
      return "select";
    case "createdDateTime":
      return { filterVariant: "date-range" };
    case "number":
      return "range";
    case "id":
      return "text";
    default:
      return { filterVariant: "text" };
  }
};
