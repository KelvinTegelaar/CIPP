import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { TextField } from "@mui/material";
import { CippVariableAutocomplete } from "./CippVariableAutocomplete";
import { useSettings } from "/src/hooks/use-settings.js";

/**
 * Enhanced TextField that supports custom variable autocomplete
 * Triggers when user types % character
 */
export const CippTextFieldWithVariables = ({
  value = "",
  onChange,
  includeSystemVariables = false,
  ...textFieldProps
}) => {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteAnchor, setAutocompleteAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textFieldRef = useRef(null);

  const settings = useSettings();
  // Memoize tenant filter to prevent unnecessary re-renders
  const tenantFilter = useMemo(() => settings?.currentTenant || null, [settings?.currentTenant]);

  // Safely close autocomplete
  const closeAutocomplete = useCallback(() => {
    setShowAutocomplete(false);
    setSearchQuery("");
    setAutocompleteAnchor(null);
  }, []);

  // Track cursor position
  const handleSelectionChange = () => {
    if (textFieldRef.current) {
      setCursorPosition(textFieldRef.current.selectionStart || 0);
    }
  };

  // Get cursor position for floating autocomplete
  const getCursorPosition = () => {
    if (!textFieldRef.current) return { top: 0, left: 0 };

    const rect = textFieldRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX + cursorPosition * 8, // Approximate character width
    };
  };

  // Handle input changes and detect % trigger
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    const cursorPos = event.target.selectionStart;

    // Update cursor position state immediately
    setCursorPosition(cursorPos);

    // Call parent onChange
    if (onChange) {
      onChange(event);
    }

    // Check if % was just typed
    if (newValue[cursorPos - 1] === "%") {
      // Position autocomplete near cursor
      setAutocompleteAnchor(textFieldRef.current);
      setSearchQuery("");
      setShowAutocomplete(true);
    } else if (showAutocomplete) {
      // Update search query if autocomplete is open
      const lastPercentIndex = newValue.lastIndexOf("%", cursorPos - 1);
      if (lastPercentIndex !== -1) {
        const query = newValue.substring(lastPercentIndex + 1, cursorPos);
        setSearchQuery(query);

        // Close autocomplete if user typed space or special characters (except %)
        if (query.includes(" ") || /[^a-zA-Z0-9_]/.test(query)) {
          closeAutocomplete();
        }
      } else {
        closeAutocomplete();
      }
    }
  };

  // Handle variable selection
  const handleVariableSelect = useCallback(
    (variableString) => {
      if (!onChange) {
        return;
      }

      // Use the value prop instead of DOM value since we're in a controlled component
      const currentValue = value || "";

      // Get fresh cursor position from the DOM
      let cursorPos = cursorPosition;
      if (textFieldRef.current) {
        const inputElement = textFieldRef.current.querySelector("input") || textFieldRef.current;
        if (inputElement && typeof inputElement.selectionStart === "number") {
          cursorPos = inputElement.selectionStart;
        }
      }

      // Find the % that triggered the autocomplete
      const lastPercentIndex = currentValue.lastIndexOf("%", cursorPos - 1);

      if (lastPercentIndex !== -1) {
        // Replace from % to cursor position with the selected variable
        const beforePercent = currentValue.substring(0, lastPercentIndex);
        const afterCursor = currentValue.substring(cursorPos);
        const newValue = beforePercent + variableString + afterCursor;

        // Create synthetic event for onChange
        const syntheticEvent = {
          target: {
            name: textFieldRef.current?.name || "",
            value: newValue,
          },
        };

        onChange(syntheticEvent);

        // Set cursor position after the inserted variable
        setTimeout(() => {
          if (textFieldRef.current) {
            const newCursorPos = lastPercentIndex + variableString.length;

            // Access the actual input element for Material-UI TextField
            const inputElement =
              textFieldRef.current.querySelector("input") || textFieldRef.current;
            if (inputElement && inputElement.setSelectionRange) {
              inputElement.setSelectionRange(newCursorPos, newCursorPos);
              inputElement.focus();
            }
            setCursorPosition(newCursorPos);
          }
        }, 0);
      }

      closeAutocomplete();
    },
    [value, cursorPosition, onChange, closeAutocomplete]
  );

  // Handle key events
  const handleKeyDown = (event) => {
    if (showAutocomplete) {
      // Let the autocomplete handle arrow keys and enter
      if (["ArrowDown", "ArrowUp", "Enter", "Tab"].includes(event.key)) {
        return; // Let autocomplete handle these
      }

      // Close autocomplete on Escape
      if (event.key === "Escape") {
        closeAutocomplete();
        event.preventDefault();
      }
    }

    // Call original onKeyDown if provided
    if (textFieldProps.onKeyDown) {
      textFieldProps.onKeyDown(event);
    }
  };

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAutocomplete &&
        textFieldRef.current &&
        !textFieldRef.current.contains(event.target)
      ) {
        // Check if click is on autocomplete dropdown
        const autocompleteElement = document.querySelector("[data-cipp-autocomplete]");
        if (autocompleteElement && autocompleteElement.contains(event.target)) {
          return; // Don't close if clicking inside autocomplete
        }

        closeAutocomplete();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAutocomplete]);

  return (
    <>
      <TextField
        {...textFieldProps}
        ref={textFieldRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelectionChange}
        onMouseUp={handleSelectionChange}
      />

      <CippVariableAutocomplete
        open={showAutocomplete}
        anchorEl={autocompleteAnchor}
        onClose={closeAutocomplete}
        onSelect={handleVariableSelect}
        searchQuery={searchQuery}
        tenantFilter={tenantFilter}
        includeSystemVariables={includeSystemVariables}
        position={getCursorPosition()}
      />
    </>
  );
};
