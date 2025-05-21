import { useWatch } from "react-hook-form";
import isEqual from "lodash/isEqual"; // lodash for deep comparison
import get from "lodash/get"; // Add lodash get for safer property access
import React, { useEffect } from "react"; // Added useEffect

export const CippFormCondition = (props) => {
  let {
    field,
    compareType = "is",
    compareValue,
    propertyName = "value",
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
    console.warn("CippFormCondition: Missing required props", {
      field,
      compareValue,
      children,
      formControl,
    });
    return null;
  }

  // Watch the form field value
  const watcher = useWatch({
    control: formControl.control,
    name: field,
  });

  // Safer property access
  let watchedValue = watcher;
  let compareTargetValue = compareValue;

  if (propertyName && propertyName !== "value") {
    if (propertyName.includes(".")) {
      watchedValue = get(watcher, propertyName);
      compareTargetValue = get(compareValue, propertyName);
    } else {
      watchedValue = watcher?.[propertyName];
      compareTargetValue = compareValue?.[propertyName];
    }
  }

  // Function to recursively extract field names from child components
  const extractFieldNames = (children) => {
    const fieldNames = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;

      // Check if the child is a CippFormComponent with a name prop
      if (child.props?.name && child.type?.name === "CippFormComponent") {
        fieldNames.push(child.props.name);
      }

      // Check if child has nested children
      if (child.props?.children) {
        fieldNames.push(...extractFieldNames(child.props.children));
      }
    });

    return fieldNames;
  };

  // Function to check if the condition is met
  const isConditionMet = () => {
    switch (compareType) {
      case "regex":
        return watcher?.match(new RegExp(compareValue));
      case "is":
        return isEqual(watchedValue, compareTargetValue);
      case "isNot":
        return !isEqual(watchedValue, compareTargetValue);
      case "contains":
        if (Array.isArray(watcher)) {
          return watcher.includes(compareValue);
        } else if (typeof watcher === "string") {
          return watcher.includes(compareValue);
        } else if (typeof watcher === "object" && watcher !== null) {
          return compareValue in watcher;
        }
        return false;
      case "doesNotContain":
        if (watcher === undefined || watcher === null) {
          return true;
        } else if (Array.isArray(watcher)) {
          return !watcher.includes(compareValue);
        } else if (typeof watcher === "string") {
          return !watcher.includes(compareValue);
        } else if (typeof watcher === "object") {
          return !(compareValue in watcher);
        }
        return true;
      case "greaterThan":
        return (
          typeof watcher === "number" && typeof compareValue === "number" && watcher > compareValue
        );
      case "lessThan":
        return (
          typeof watcher === "number" && typeof compareValue === "number" && watcher < compareValue
        );
      case "arrayLength":
        return (
          Array.isArray(watcher) &&
          typeof compareValue === "number" &&
          watcher.length >= compareValue
        );
      case "hasValue":
        return (
          (watcher !== undefined && watcher !== null && watcher !== "") ||
          (watcher?.value !== undefined && watcher?.value !== null && watcher?.value !== "")
        );
      case "labelEq":
        return Array.isArray(watcher) && watcher.some((item) => item?.label === compareValue);
      case "labelContains":
        return (
          Array.isArray(watcher) &&
          watcher.some(
            (item) => typeof item?.label === "string" && item.label.includes(compareValue)
          )
        );
      case "valueEq":
        return Array.isArray(watcher) && watcher.some((item) => item?.value === compareValue);
      case "valueNotEq":
        return Array.isArray(watcher) && watcher.some((item) => item?.value !== compareValue);
      case "valueContains":
        return (
          Array.isArray(watcher) &&
          watcher.some(
            (item) => typeof item?.value === "string" && item.value.includes(compareValue)
          )
        );
      default:
        return false;
    }
  };

  // Reset field values when condition is not met and action is "hide"
  useEffect(() => {
    if (action === "hide" && !isConditionMet()) {
      const fieldNames = extractFieldNames(children);

      // Reset each field
      fieldNames.forEach((fieldName) => {
        // Don't reset if the field doesn't exist in the form
        if (formControl.getValues(fieldName) !== undefined) {
          formControl.setValue(fieldName, null, {
            shouldValidate: false,
            shouldDirty: false,
          });
        }
      });
    }
  }, [watcher, action]);

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

  // Return based on condition check
  const conditionMet = isConditionMet();

  if (conditionMet) {
    return children;
  } else if (action === "disable") {
    return disableChildren(children);
  } else {
    return null;
  }
};
