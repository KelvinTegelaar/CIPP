import { useWatch } from "react-hook-form";
import isEqual from "lodash/isEqual"; // lodash for deep comparison
import React from "react";

export const CippFormCondition = (props) => {
  let {
    field,
    compareType = "is",
    compareValue,
    action = "hide",
    children,
    formControl,
    disabled = false,
  } = props;

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

  const disableChildren = (children) => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.props?.children) {
          return React.cloneElement(child, {
            children: disableChildren(child.props.children),
            disabled: true,
          });
        } else {
          return React.cloneElement(child, { disabled: true });
        }
      }
      return child;
    });
  };

  if (disabled) {
    return disableChildren(children);
  }

  switch (compareType) {
    case "regex":
      if (watcher?.match(new RegExp(compareValue))) {
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
      }
      return null;
    case "is":
      // Deep comparison for objects and arrays
      if (isEqual(watcher, compareValue)) {
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
      }
      return null;

    case "isNot":
      // Deep comparison for objects and arrays (negation)
      if (!isEqual(watcher, compareValue)) {
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
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
      } else if (typeof watcher === "object" && watcher !== null && compareValue in watcher) {
        // Check if object contains the key
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
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
        //extra elsseif; if the value is undefined or null, return children because it does not contain the compareValue
      } else if (watcher === undefined || watcher === null) {
        return children;
      } else if (typeof watcher === "object" && !(compareValue in watcher)) {
        // Check if object does not contain the key
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
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
      if (action === "disable") {
        return disableChildren(children);
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
      if (action === "disable") {
        return disableChildren(children);
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
      if (action === "disable") {
        return disableChildren(children);
      }
      return null;

    case "hasValue":
      if (watcher !== undefined && watcher !== null && watcher !== "") {
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
      }
      return null;

    /*
     * NEW CASES
     */
    case "labelEq":
      // Checks if any object in array has .label exactly equal to compareValue
      if (Array.isArray(watcher) && watcher.some((item) => item?.label === compareValue)) {
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
      }
      return null;

    case "labelContains":
      // Checks if any object in array has a .label that contains compareValue
      if (
        Array.isArray(watcher) &&
        watcher.some((item) => typeof item?.label === "string" && item.label.includes(compareValue))
      ) {
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
      }
      return null;

    case "valueEq":
      // Checks if any object in array has .value exactly equal to compareValue
      if (Array.isArray(watcher) && watcher.some((item) => item?.value === compareValue)) {
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
      }
      return null;

    case "valueContains":
      // Checks if any object in array has a .value that contains compareValue
      if (
        Array.isArray(watcher) &&
        watcher.some((item) => typeof item?.value === "string" && item.value.includes(compareValue))
      ) {
        return children;
      }
      if (action === "disable") {
        return disableChildren(children);
      }
      return null;

    default:
      if (action === "disable") {
        return disableChildren(children);
      }
      return null;
  }
};
