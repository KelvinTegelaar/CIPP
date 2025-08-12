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

  // Convert bracket notation to dot notation for array fields if needed
  const normalizedField = field.replace(/\[(\d+)\]/g, ".$1");

  // Watch the form field value
  const watcher = useWatch({
    control: formControl.control,
    name: normalizedField,
  });

  // Safer property access with get for nested paths
  let watchedValue = watcher;
  let compareTargetValue = compareValue;

  if (propertyName && propertyName !== "value") {
    watchedValue = get(watcher, propertyName);
    // Only extract from compareValue if it's an object, otherwise use as-is
    if (typeof compareValue === "object" && compareValue !== null) {
      compareTargetValue = get(compareValue, propertyName);
    } else {
      compareTargetValue = compareValue;
    }
  }

  /*console.log("CippFormCondition: ", {
    watcher,
    watchedValue,
    compareTargetValue,
    compareType,
    compareValue,
    action,
    field,
    propertyName,
  });*/

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
        return watcher?.match?.(new RegExp(compareValue));
      case "is":
        return isEqual(watchedValue, compareTargetValue);
      case "isNot":
        return !isEqual(watchedValue, compareTargetValue);
      case "contains":
        if (Array.isArray(watcher)) {
          return watcher.some((item) => isEqual(item, compareValue));
        } else if (typeof watcher === "string") {
          return watcher.includes(compareValue);
        } else if (typeof watcher === "object" && watcher !== null) {
          // Handle checking if object contains value or key
          if (typeof compareValue === "string") {
            // Check for "value" property containing the string
            if (watcher.value && typeof watcher.value === "string") {
              return watcher.value.includes(compareValue);
            }
            // Check for "label" property containing the string
            if (watcher.label && typeof watcher.label === "string") {
              return watcher.label.includes(compareValue);
            }
            // Check if object has the compareValue as a key
            return compareValue in watcher;
          } else {
            return Object.values(watcher).some((val) => isEqual(val, compareValue));
          }
        }
        return false;
      case "doesNotContain":
        if (watcher === undefined || watcher === null) {
          return true;
        } else if (Array.isArray(watcher)) {
          return !watcher.some((item) => isEqual(item, compareValue));
        } else if (typeof watcher === "string") {
          return !watcher.includes(compareValue);
        } else if (typeof watcher === "object") {
          if (typeof compareValue === "string") {
            return !(compareValue in watcher);
          } else {
            return !Object.values(watcher).some((val) => isEqual(val, compareValue));
          }
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
        if (Array.isArray(watcher)) {
          return watcher.some((item) => item?.value === compareValue);
        } else if (typeof watcher === "object" && watcher !== null) {
          return watcher?.value === compareValue;
        }
        return false;
      case "valueNotEq":
        if (Array.isArray(watcher)) {
          return watcher.some((item) => item?.value !== compareValue);
        } else if (typeof watcher === "object" && watcher !== null) {
          return watcher?.value !== compareValue;
        }
        return false;
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
