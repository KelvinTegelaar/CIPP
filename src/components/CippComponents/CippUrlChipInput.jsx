import React, { useState } from "react";
import { 
  Box, 
  Chip, 
  TextField, 
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip
} from "@mui/material";
import { Controller, useFormState } from "react-hook-form";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import get from "lodash/get";

const CippUrlChipInput = ({ 
  formControl, 
  name, 
  label, 
  validators = {}, 
  helperText,
  tooltip,
  placeholder = "Type URL and press Enter",
  // Configuration options
  options = {
    enableValidation: true,
    // This pattern allows wildcards and standard URLs
    validationPattern: /^(\*\.)?([\da-z]([a-z\d-]*[a-z\d])?\.)+([\da-z]{2,})(\/\*|\/[\w.-]*\*?)?$|^(https?:\/\/)?([\da-z]([a-z\d-]*[a-z\d])?\.)+([\da-z]{2,})(\/[\w.-]*)*\/?$/i,
    validationErrorMessage: "Please enter a valid URL or wildcard pattern (e.g., example.com, *.example.com/*, https://example.com)",
    addHttps: false,
    preventDuplicates: true,
    duplicateErrorMessage: "This entry already exists in the list",
    allowBatchInput: true,
    chipColor: "primary",
    chipVariant: "outlined",
    chipSize: "medium",
    maxChips: null
  },
  ...other 
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Validation logic
  const validateUrl = (url) => {
    if (!url || url.trim() === "") return true;
    if (!options.enableValidation) return true;
    
    return options.validationPattern.test(url);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Validate as user types
    if (options.enableValidation) {
      const valid = validateUrl(value);
      setIsValid(valid);
      if (!valid) {
        setErrorMessage(options.validationErrorMessage);
      } else {
        setErrorMessage("");
      }
    }
  };

  // Format URL based on options and pattern
  const formatUrl = (url) => {
    let formattedUrl = url.trim();
    
    // Only add https:// if the option is enabled AND it's not a wildcard pattern
    if (options.addHttps && 
        !/^https?:\/\//i.test(formattedUrl) && 
        !/^\*\./.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    return formattedUrl;
  };

  // Process multiple URLs if batch input is enabled
  const processBatchInput = (input, currentValues, onChange) => {
    if (!options.allowBatchInput) {
      return addSingleUrl(input, currentValues, onChange);
    }
    
    // Split by line breaks and then process each line
    const urlsToAdd = input.split(/[\n\r]+/).filter(url => url.trim() !== '');
    let updatedValues = [...currentValues];
    let hasErrors = false;
    
    urlsToAdd.forEach(url => {
      const result = addSingleUrl(url, updatedValues, (newValues) => {
        updatedValues = newValues;
      }, true);
      
      if (!result.success) {
        hasErrors = true;
        setErrorMessage(result.error);
      }
    });
    
    if (updatedValues.length !== currentValues.length) {
      onChange(updatedValues);
      return { success: true };
    }
    
    return { 
      success: !hasErrors,
      error: errorMessage
    };
  };

  // Add a single URL to the list
  const addSingleUrl = (url, currentValues, onChange, silent = false) => {
    if (!url || url.trim() === "") {
      return { success: false, error: "URL cannot be empty" };
    }
    
    // Validate URL if validation is enabled
    if (options.enableValidation && !validateUrl(url)) {
      if (!silent) setErrorMessage(options.validationErrorMessage);
      return { success: false, error: options.validationErrorMessage };
    }
    
    // Format URL
    const formattedUrl = formatUrl(url);
    
    // Check for duplicates if prevention is enabled
    if (options.preventDuplicates && currentValues.includes(formattedUrl)) {
      if (!silent) setErrorMessage(options.duplicateErrorMessage);
      return { success: false, error: options.duplicateErrorMessage };
    }
    
    // Check for maximum chips if set
    if (options.maxChips && currentValues.length >= options.maxChips) {
      if (!silent) setErrorMessage(`Maximum of ${options.maxChips} entries allowed`);
      return { success: false, error: `Maximum of ${options.maxChips} entries allowed` };
    }
    
    // Add URL to the list
    const newValues = [...currentValues, formattedUrl];
    onChange(newValues);
    
    return { success: true };
  };

  const handleKeyDown = (e, onChange, currentValues = []) => {
    // Add URL when Enter is pressed
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      
      const result = options.allowBatchInput
        ? processBatchInput(inputValue, currentValues, onChange)
        : addSingleUrl(inputValue, currentValues, onChange);
      
      if (result.success) {
        setInputValue("");
      }
    }
  };

  const handlePaste = (e, onChange, currentValues = []) => {
    if (options.allowBatchInput) {
      // Get pasted text
      const pastedText = e.clipboardData.getData('text');
      
      // Check if it contains multiple lines
      if (pastedText.includes('\n')) {
        e.preventDefault();
        
        processBatchInput(pastedText, currentValues, onChange);
        setInputValue("");
      }
    }
  };

  const handleDelete = (urlToDelete, onChange, currentValues) => {
    const newValues = currentValues.filter(url => url !== urlToDelete);
    onChange(newValues);
  };

  const { errors } = useFormState({ control: formControl.control });
  const errorFromForm = get(errors, name, {})?.message;

  return (
    <Controller
      name={name}
      control={formControl.control}
      rules={validators}
      defaultValue={[]}
      render={({ field }) => (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" component="label" sx={{ display: "block" }}>
              {label}
            </Typography>
            {tooltip && (
              <Tooltip title={tooltip} arrow>
                <Box component="span" sx={{ ml: 1, display: 'inline-flex', alignItems: 'center' }}>
                  <InformationCircleIcon width={16} height={16} />
                </Box>
              </Tooltip>
            )}
          </Box>
          
          <TextField
            fullWidth
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => handleKeyDown(e, field.onChange, field.value)}
            onPaste={(e) => handlePaste(e, field.onChange, field.value)}
            placeholder={placeholder}
            error={!isValid || !!errorFromForm}
            helperText={errorMessage || errorFromForm || helperText}
            variant="filled"
            multiline={options.allowBatchInput}
            rows={options.allowBatchInput ? 3 : 1}
            InputProps={{
              endAdornment: inputValue ? (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setInputValue("")}
                    edge="end"
                  >
                    <XMarkIcon width={20} />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            {...other}
          />
          
          {field.value && field.value.length > 0 && (
            <Paper 
              variant="outlined" 
              sx={{ 
                mt: 1, 
                p: 1, 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                minHeight: '40px',
                backgroundColor: 'background.paper'
              }}
            >
              {field.value.map((url, index) => (
                <Chip
                  key={index}
                  label={url}
                  onDelete={() => handleDelete(url, field.onChange, field.value)}
                  color={options.chipColor}
                  variant={options.chipVariant}
                  size={options.chipSize}
                />
              ))}
            </Paper>
          )}
          
          {options.maxChips && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              {field.value ? field.value.length : 0} / {options.maxChips} entries
            </Typography>
          )}
        </>
      )}
    />
  );
};

export default CippUrlChipInput;