import {
  Button,
  Grid,
  Link,
  Stack,
  Card,
  CardContent,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippDataTable } from "../CippTable/CippDataTable";
import { useWatch } from "react-hook-form";
import { Delete, FileDownload, Upload, Add } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import React from "react";

export const CippWizardAutopilotImport = (props) => {
  const {
    onNextStep,
    formControl,
    currentStep,
    onPreviousStep,
    fields,
    name,
    nameToCSVMapping,
    fileName = "template",
  } = props;
  const tableData = useWatch({ control: formControl.control, name: name });
  const [newTableData, setTableData] = useState([]);
  const fileInputRef = React.useRef(null);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualInputs, setManualInputs] = useState([{}]);
  const inputRefs = React.useRef([]);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleRemoveItem = (row) => {
    if (row === undefined) return false;
    const index = tableData?.findIndex((item) => item === row);
    const newTableData = [...tableData];
    newTableData.splice(index, 1);
    setTableData(newTableData);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const firstLine = lines[0].split(',').map(header => header.trim());
        
        // Check if this is a headerless CSV (no recognizable headers)
        const hasHeaders = firstLine.some(header => {
          // Check if any header matches our expected field names
          return fields.some(field => 
            header === field.propertyName || 
            header === field.friendlyName || 
            (field.alternativePropertyNames && field.alternativePropertyNames.includes(header))
          );
        });
        
        let headers, headerMapping;
        
        if (hasHeaders) {
          // Normal CSV with headers
          headers = firstLine;
          
          // Create mapping for property names and alternative property names
          headerMapping = {};
          fields.forEach(field => {
            // Map primary property name to itself
            headerMapping[field.propertyName] = field.propertyName;
            // Map friendly name to property name
            headerMapping[field.friendlyName] = field.propertyName;
            // Map alternative property names to the primary property name
            if (field.alternativePropertyNames) {
              field.alternativePropertyNames.forEach(altName => {
                headerMapping[altName] = field.propertyName;
              });
            }
          });
          
          // Check if all required columns are present (using any of the supported formats)
          const missingColumns = fields.filter(field => {
            // Only serial number is required
            if (field.propertyName !== 'SerialNumber') {
              return false; // Skip non-required fields
            }
            
            const hasPropertyName = headers.includes(field.propertyName);
            const hasFriendlyName = headers.includes(field.friendlyName);
            const hasAlternativeName = field.alternativePropertyNames ? 
              field.alternativePropertyNames.some(altName => headers.includes(altName)) : false;
            return !hasPropertyName && !hasFriendlyName && !hasAlternativeName;
          });
          
          if (missingColumns.length > 0) {
            const missingFormats = missingColumns.map(f => {
              const formats = [f.propertyName, f.friendlyName];
              if (f.alternativePropertyNames) {
                formats.push(...f.alternativePropertyNames);
              }
              return `"${formats.join('" or "')}"`;
            }).join(', ');
            console.error(`CSV is missing required columns: ${missingFormats}`);
            return;
          }
        } else {
          // Headerless CSV - assume order: serial, productid, hash
          headers = ['SerialNumber', 'productKey', 'hardwareHash'];
          headerMapping = {
            'SerialNumber': 'SerialNumber',
            'productKey': 'productKey', 
            'hardwareHash': 'hardwareHash'
          };
          
          // Check if we have at least 3 columns for the expected order
          if (firstLine.length < 3) {
            console.error('Headerless CSV must have at least 3 columns in order: Serial Number, Product ID, Hardware Hash');
            return;
          }
        }

        const data = lines.slice(hasHeaders ? 1 : 0) // Skip first line only if it has headers
          .filter(line => line.trim() !== '') // Remove empty lines
          .map(line => {
            const values = line.split(',');
            // Initialize with all fields as empty strings
            const row = fields.reduce((obj, field) => {
              obj[field.propertyName] = '';
              return obj;
            }, {});
            // Fill in the values from the CSV
            headers.forEach((header, i) => {
              const propertyName = headerMapping[header];
              if (propertyName) {
                row[propertyName] = values[i]?.trim() || '';
              }
            });
            return row;
          });
        
        setTableData(data);
        formControl.setValue(name, data, { shouldValidate: true });
      };
      reader.readAsText(file);
    }
  };

  const handleManualInputChange = (rowIndex, field, value) => {
    setManualInputs(prev => {
      const newInputs = [...prev];
      if (!newInputs[rowIndex]) {
        newInputs[rowIndex] = {};
      }
      newInputs[rowIndex][field] = value;
      return newInputs;
    });
  };

  const handleAddRow = () => {
    setManualInputs(prev => [...prev, {}]);
  };

  const validateRows = (rows) => {
    const errors = [];
    const seenSerials = new Set();
    const seenProductKeys = new Set();

    rows.forEach((row, index) => {
      const serialField = fields.find(f => f.propertyName === 'SerialNumber');
      const productKeyField = fields.find(f => f.propertyName === 'productKey');
      const manufacturerField = fields.find(f => f.propertyName === 'oemManufacturerName');
      const modelField = fields.find(f => f.propertyName === 'modelName');
      const hardwareHashField = fields.find(f => f.propertyName === 'hardwareHash');

      if (serialField && row[serialField.propertyName] && seenSerials.has(row[serialField.propertyName])) {
        errors.push(`Row ${index + 1}: Duplicate serial number "${row[serialField.propertyName]}"`);
      }
      if (serialField && row[serialField.propertyName]) {
        seenSerials.add(row[serialField.propertyName]);
      }

      if (productKeyField && row[productKeyField.propertyName] && seenProductKeys.has(row[productKeyField.propertyName])) {
        errors.push(`Row ${index + 1}: Duplicate product key "${row[productKeyField.propertyName]}"`);
      }
      if (productKeyField && row[productKeyField.propertyName]) {
        seenProductKeys.add(row[productKeyField.propertyName]);
      }

      // Validate Product ID length (must be exactly 13 characters)
      if (productKeyField && row[productKeyField.propertyName] && row[productKeyField.propertyName].length !== 13) {
        errors.push(`Row ${index + 1}: Product ID must be exactly 13 characters long`);
      }

      // Validate Serial Number requirements: must have either Manufacturer+Model OR Hardware Hash
      if (serialField && row[serialField.propertyName] && row[serialField.propertyName].trim() !== '') {
        const hasManufacturer = manufacturerField && row[manufacturerField.propertyName] && row[manufacturerField.propertyName].trim() !== '';
        const hasModel = modelField && row[modelField.propertyName] && row[modelField.propertyName].trim() !== '';
        const hasHardwareHash = hardwareHashField && row[hardwareHashField.propertyName] && row[hardwareHashField.propertyName].trim() !== '';
        
        const hasManufacturerAndModel = hasManufacturer && hasModel;
        const hasHash = hasHardwareHash;
        
        if (!hasManufacturerAndModel && !hasHash) {
          errors.push(`Row ${index + 1}: Serial Number must be accompanied by either both Manufacturer and Model, or Hardware Hash`);
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleManualAdd = () => {
    const newRows = manualInputs.filter(row => 
      Object.values(row).some(value => value && value.trim() !== '')
    ).map(row => {
      // Ensure all fields exist in the row
      return fields.reduce((obj, field) => {
        obj[field.propertyName] = row[field.propertyName] || '';
        return obj;
      }, {});
    });
    
    if (newRows.length === 0) {
      setManualDialogOpen(false);
      setManualInputs([{}]);
      return;
    }

    if (!validateRows(newRows)) {
      return;
    }

    const updatedData = [...tableData, ...newRows];
    setTableData(updatedData);
    formControl.setValue(name, updatedData, { shouldValidate: true });
    setManualInputs([{}]);
    setManualDialogOpen(false);
  };

  const handleDialogClose = () => {
    setManualDialogOpen(false);
    setManualInputs([{}]);
  };

  const handleKeyPress = (event, rowIndex) => {
    const productKeyField = fields.find(f => f.propertyName === 'productKey');
    if (event.key === 'Enter' && productKeyField && manualInputs[rowIndex]?.[productKeyField.propertyName]) {
      if (rowIndex === manualInputs.length - 1) {
        const newRowIndex = manualInputs.length;
        setManualInputs(prev => [...prev, {}]);
        // Wait for the next render cycle to set focus
        setTimeout(() => {
          const newInput = inputRefs.current[newRowIndex]?.[productKeyField.propertyName];
          if (newInput) {
            newInput.focus();
          }
        }, 0);
      }
    }
  };

  const handleRemoveRow = (rowIndex) => {
    setManualInputs(prev => prev.filter((_, index) => index !== rowIndex));
  };

  useEffect(() => {
    console.log('Table Data:', newTableData);
    formControl.setValue(name, newTableData, {
      shouldValidate: true,
    });
  }, [newTableData]);

  // Add effect to validate rows when manualInputs changes
  useEffect(() => {
    validateRows(manualInputs);
  }, [manualInputs]);

  const actions = [
    {
      icon: <Delete />,
      label: "Delete Row",
      confirmText: "Are you sure you want to delete this row?",
      customFunction: handleRemoveItem,
      noConfirm: true,
    },
  ];

  return (
    <Stack spacing={3}>
      <CippDataTable
        actions={actions}
        title={`Import Devices`}
        data={newTableData}
        simple={false}
        simpleColumns={fields.map(f => f.propertyName)}
        cardButton={
          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              href={`data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(fields.map(f => f.propertyName).join(",") + "\n")}`}
              download={`${fileName}.csv`}
              startIcon={<FileDownload />}
              size="small"
            >
              Download Template
            </Button>
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <Button
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              size="small"
            >
              Import from CSV
            </Button>
            <Button
              startIcon={<Add />}
              onClick={() => setManualDialogOpen(true)}
              size="small"
            >
              Manual Import
            </Button>
          </Stack>
        }
      />

      <Dialog open={manualDialogOpen} onClose={handleDialogClose} maxWidth="lg" fullWidth>
        <DialogTitle>Manual Import</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {validationErrors.length > 0 && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Please fix the following validation errors:
                </Typography>
                {validationErrors.map((error, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: index < validationErrors.length - 1 ? 0.5 : 0 }}>
                    • {error}
                  </Typography>
                ))}
              </Alert>
            )}
            {manualInputs.map((row, rowIndex) => (
              <Box key={rowIndex} sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: rowIndex === 0 ? 2 : 0, 
                flexWrap: 'nowrap', 
                overflowX: 'auto', 
                py: 0.75,
                alignItems: 'center',
                '& .MuiInputLabel-root': {
                  backgroundColor: 'background.paper',
                  px: 1,
                  transform: 'translate(14px, -9px) scale(0.75)',
                  '&.Mui-focused': {
                    backgroundColor: 'background.paper',
                  }
                }
              }}>
                {/* Row identifier */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    flexShrink: 0,
                    ml: 1
                  }}
                >
                  {rowIndex + 1}
                </Box>
                {fields.map((field) => (
                  <Box key={field.propertyName} sx={{ minWidth: 150, flex: 1 }}>
                    <TextField
                      inputRef={el => {
                        if (!inputRefs.current[rowIndex]) {
                          inputRefs.current[rowIndex] = {};
                        }
                        inputRefs.current[rowIndex][field.propertyName] = el;
                      }}
                      label={field.friendlyName}
                      value={row[field.propertyName] || ''}
                      onChange={(e) => handleManualInputChange(rowIndex, field.propertyName, e.target.value)}
                      onKeyDown={(e) => field.propertyName === 'productKey' && handleKeyPress(e, rowIndex)}
                      fullWidth
                      size="small"
                    />
                  </Box>
                ))}
                <Button
                  onClick={() => handleRemoveRow(rowIndex)}
                  disabled={manualInputs.length === 1}
                  sx={{ 
                    minWidth: '48px',
                    height: '40px',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    mr: 2
                  }}
                  color="error"
                >
                  ×
                </Button>
              </Box>
            ))}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              mt: 1
            }}>
              <Button
                onClick={handleAddRow}
                disabled={!Object.values(manualInputs[manualInputs.length - 1]).some(value => value && value.trim() !== '')}
                sx={{ 
                  minWidth: '48px',
                  height: '40px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  mr: 2
                }}
              >
                +
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleManualAdd} 
            variant="contained"
            disabled={validationErrors.length > 0 || !Object.values(manualInputs[manualInputs.length - 1]).some(value => value && value.trim() !== '')}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
