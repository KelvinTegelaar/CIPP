import { useWatch } from "react-hook-form";
import isEqual from "lodash/isEqual"; // lodash for deep comparison

export const CippFormCondition = (props) => {
  let { field, compareType = "is", compareValue, children, formControl } = props;
  if (
    field === undefined ||
    compareValue === undefined ||
    children === undefined ||
    formControl === undefined
  ) {
    return null;
  }
  let watcher = useWatch({ control: formControl.control, name: field });
  if (watcher?.value !== undefined) {
    watcher = watcher.value;
  }

  if (compareValue?.value !== undefined) {
    compareValue = compareValue.value;
  }
  switch (compareType) {
    case "is":
      // Deep comparison for objects and arrays
      if (isEqual(watcher, compareValue)) {
        return children;
      }
      return null;

    case "isNot":
      // Deep comparison for objects and arrays (negation)
      if (!isEqual(watcher, compareValue)) {
        return children;
      }
      return null;

    case "contains":
      if (Array.isArray(watcher)) {
        if (watcher.includes(compareValue)) {
          return children;
        }
      } else if (typeof watcher === "string") {
        if (watcher.includes(compareValue)) {
          return children;
        }
      } else if (typeof watcher === "object" && compareValue in watcher) {
        // Check if object contains the key
        return children;
      }
      return null;

    case "doesNotContain":
      if (Array.isArray(watcher)) {
        if (!watcher.includes(compareValue)) {
          return children;
        }
      } else if (typeof watcher === "string") {
        if (!watcher.includes(compareValue)) {
          return children;
        }
      } else if (typeof watcher === "object" && !(compareValue in watcher)) {
        // Check if object does not contain the key
        return children;
      }
      return null;

    case "greaterThan":
      if (
        typeof watcher === "number" &&
        typeof compareValue === "number" &&
        watcher > compareValue
      ) {
        return children;
      }
      return null;

    case "lessThan":
      if (
        typeof watcher === "number" &&
        typeof compareValue === "number" &&
        watcher < compareValue
      ) {
        return children;
      }
      return null;

    case "arrayLength":
      if (
        Array.isArray(watcher) &&
        typeof compareValue === "number" &&
        watcher.length >= compareValue
      ) {
        return children;
      }
      return null;

    case "hasValue":
      if (watcher !== undefined && watcher !== null && watcher !== "") {
        return children;
      }
      return null;

    default:
      return null;
  }
};
