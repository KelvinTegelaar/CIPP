export const getCippFilterVariant = (providedColumnKeys) => {
  const timeAgoArray = [
    "ExecutedTime",
    "ScheduledTime",
    "Timestamp",
    "DateTime",
    "LastRun",
    "LastRefresh",
    "createdDateTime",
    "activatedDateTime",
    "lastModifiedDateTime",
    "endDateTime",
    "ReceivedTime",
    "Expires",
    "updatedAt",
    "createdAt",
    "Received",
    "Date",
    "WhenCreated",
    "WhenChanged",
  ];

  if (timeAgoArray.includes(providedColumnKeys)) {
    return {
      filterVariant: "datetime-range",
      sortingFn: "datetime",
      filterFn: "betweenInclusive",
    };
  }

  switch (providedColumnKeys) {
    case "assignedLicenses":
      return {
        filterVariant: "multi-select",
      };
    case "accountEnabled":
      return {
        filterVariant: "select",
      };
    case "primDomain":
      return "select";
    case "DateTime":

    case "number":
      return "range";
    case "id":
      return "text";
    default:
      return { filterVariant: "text" };
  }
};
