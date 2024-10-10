import { useWatch } from "react-hook-form";

export const CippFormCondition = (props) => {
  const { field, compareType = "is", compareValue, children, formControl } = props;
  if (
    field === undefined ||
    compareValue === undefined ||
    children === undefined ||
    formControl === undefined
  ) {
    return null;
  }
  let watcher = useWatch({ control: formControl.control, name: field });
  switch (compareType) {
    case "is":
      if (watcher === compareValue) {
        return children;
      }
      return null;

    case "isNot":
      if (watcher !== compareValue) {
        return children;
      }
      return null;

    case "contains":
      if (typeof watcher === "string") {
        if (watcher.includes(compareValue)) {
          return children;
        }
      }
      return null;
    case "doesNotContain":
      if (typeof watcher === "string") {
        if (!watcher.includes(compareValue)) {
          return children;
        }
      }

      return null;
    case "greaterThan":
      if (watcher > compareValue) {
        return children;
      }
      return null;

    case "lessThan":
      if (watcher < compareValue) {
        return children;
      }

    default:
      return null;
  }
};
