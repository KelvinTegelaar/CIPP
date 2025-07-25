import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { 
  Stack, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  TextField,
  Checkbox,
  ListItemText,
  Button,
  Switch,
  FormControlLabel
} from "@mui/material";
import { Grid } from "@mui/system";
import { CippWizardStepButtons } from "/src/components/CippWizard/CippWizardStepButtons";
import { PropertyList } from "/src/components/property-list";
import { PropertyListItem } from "/src/components/property-list-item";
import { getCippTranslation } from "/src/utils/get-cipp-translation";
import { getCippFormatting } from "/src/utils/get-cipp-formatting";
import { ApiPostCall } from "/src/api/ApiCall";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";

// User properties that can be patched
const PATCHABLE_PROPERTIES = [
  {
    "property": "city",
    "label": "City",
    "type": "string"
  },
  {
    "property": "companyName",
    "label": "Company Name",
    "type": "string"
  },
  {
    "property": "country",
    "label": "Country",
    "type": "string"
  },
  {
    "property": "department",
    "label": "Department",
    "type": "string"
  },
  {
    "property": "employeeType",
    "label": "Employee Type",
    "type": "string"
  },
  {
    "property": "jobTitle",
    "label": "Job Title",
    "type": "string"
  },
  {
    "property": "officeLocation",
    "label": "Office Location",
    "type": "string"
  },
  {
    "property": "postalCode",
    "label": "Postal Code",
    "type": "string"
  },
  {
    "property": "preferredDataLocation",
    "label": "Preferred Data Location",
    "type": "string"
  },
  {
    "property": "preferredLanguage",
    "label": "Preferred Language",
    "type": "string"
  },
  {
    "property": "showInAddressList",
    "label": "Show in Address List",
    "type": "boolean"
  },
  {
    "property": "state",
    "label": "State/Province",
    "type": "string"
  },
  {
    "property": "streetAddress",
    "label": "Street Address",
    "type": "string"
  },
  {
    "property": "usageLocation",
    "label": "Usage Location",
    "type": "string"
  }
];

// Step 1: Display users to be patched
const UsersDisplayStep = (props) => {
  const { onNextStep, onPreviousStep, formControl, currentStep, users } = props;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">Users to be updated</Typography>
        <Typography color="text.secondary" variant="body2">
          The following users will be updated with the properties you select in the next step.
        </Typography>
      </Stack>
      
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Selected Users ({users?.length || 0})</Typography>
            <Grid container spacing={1}>
              {users?.map((user, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Chip 
                    label={user.displayName || user.userPrincipalName} 
                    variant="outlined" 
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};

// Step 2: Property selection and input
const PropertySelectionStep = (props) => {
  const { onNextStep, onPreviousStep, formControl, currentStep } = props;
  const [selectedProperties, setSelectedProperties] = useState([]);

  // Register form fields
  formControl.register("selectedProperties", { required: true });
  formControl.register("propertyValues", { required: false });

  const handlePropertyChange = (event) => {
    const value = event.target.value;
    setSelectedProperties(typeof value === 'string' ? value.split(',') : value);
    formControl.setValue("selectedProperties", value);
    
    // Reset property values when selection changes
    const currentValues = formControl.getValues("propertyValues") || {};
    const newValues = {};
    value.forEach(prop => {
      if (currentValues[prop]) {
        newValues[prop] = currentValues[prop];
      }
    });
    formControl.setValue("propertyValues", newValues);
    formControl.trigger();
  };

  const handleSelectAll = (event) => {
    // Prevent the Select component from treating this as a regular selection
    event.stopPropagation();
    
    const allSelected = selectedProperties.length === PATCHABLE_PROPERTIES.length;
    const newSelection = allSelected ? [] : PATCHABLE_PROPERTIES.map(p => p.property);
    setSelectedProperties(newSelection);
    formControl.setValue("selectedProperties", newSelection);
    
    // Reset property values when selection changes
    const currentValues = formControl.getValues("propertyValues") || {};
    const newValues = {};
    newSelection.forEach(prop => {
      if (currentValues[prop]) {
        newValues[prop] = currentValues[prop];
      }
    });
    formControl.setValue("propertyValues", newValues);
    formControl.trigger();
  };

  const handlePropertyValueChange = (property, value) => {
    const currentValues = formControl.getValues("propertyValues") || {};
    const newValues = { ...currentValues, [property]: value };
    formControl.setValue("propertyValues", newValues);
    formControl.trigger();
  };

  const renderPropertyInput = (propertyName) => {
    const property = PATCHABLE_PROPERTIES.find(p => p.property === propertyName);
    const currentValue = formControl.getValues("propertyValues")?.[propertyName];

    if (property?.type === "boolean") {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={currentValue === true}
              onChange={(e) => handlePropertyValueChange(propertyName, e.target.checked)}
            />
          }
          label={property.label}
          key={propertyName}
        />
      );
    }

    // Default to text input for string types
    return (
      <TextField
        key={propertyName}
        label={property?.label || propertyName}
        fullWidth
        value={currentValue || ''}
        onChange={(e) => handlePropertyValueChange(propertyName, e.target.value)}
        placeholder={`Enter new value for ${property?.label || propertyName}`}
        variant="filled"
      />
    );
  };

  const isAllSelected = selectedProperties.length === PATCHABLE_PROPERTIES.length;
  const isIndeterminate = selectedProperties.length > 0 && selectedProperties.length < PATCHABLE_PROPERTIES.length;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">Select Properties to update</Typography>
        <Typography color="text.secondary" variant="body2">
          Choose which user properties you want to modify and provide the new values.
        </Typography>
      </Stack>

      <FormControl fullWidth>
        <InputLabel>Properties to update</InputLabel>
        <Select
          multiple
          value={selectedProperties}
          onChange={handlePropertyChange}
          variant="filled"
          sx={{
            '& .MuiSelect-select': {
              minHeight: '40px', // Match theme standard
              display: 'flex',
              alignItems: 'center',
            }
          }}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.length === 0 ? (
                <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Select properties to update...
                </Typography>
              ) : (
                selected.map((value) => {
                  const prop = PATCHABLE_PROPERTIES.find(p => p.property === value);
                  return <Chip key={value} label={prop?.label || value} size="small" />;
                })
              )}
            </Box>
          )}
        >
          <MenuItem 
            onClick={handleSelectAll} 
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            value="" // Empty value to prevent it from being selected as a property
          >
            <Checkbox 
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onClick={handleSelectAll} // Also handle checkbox click
            />
            <ListItemText 
              primary={
                <Typography sx={{ fontWeight: 'bold' }}>
                  Select All ({PATCHABLE_PROPERTIES.length} properties)
                </Typography>
              }
            />
          </MenuItem>
          {PATCHABLE_PROPERTIES.map((property) => (
            <MenuItem key={property.property} value={property.property}>
              <Checkbox checked={selectedProperties.indexOf(property.property) > -1} />
              <ListItemText primary={property.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedProperties.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Property Values</Typography>
            <Stack spacing={2}>
              {selectedProperties.map(renderPropertyInput)}
            </Stack>
          </CardContent>
        </Card>
      )}

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};

// Step 3: Confirmation
const ConfirmationStep = (props) => {
  const { lastStep, formControl, onPreviousStep, currentStep, users } = props;
  const formValues = formControl.getValues();
  const { selectedProperties = [], propertyValues = {} } = formValues;

  // Create API call handler for bulk patch
  const patchUsersApi = ApiPostCall({
    relatedQueryKeys: ["ListUsers"],
  });

  const handleSubmit = () => {
    // Create bulk request data
    const patchData = users.map(user => {
      const userData = { 
        id: user.id,
        tenantFilter: user.Tenant || user.tenantFilter
      };
      selectedProperties.forEach(propName => {
        if (propertyValues[propName] !== undefined && propertyValues[propName] !== '') {
          userData[propName] = propertyValues[propName];
        }
      });
      return userData;
    });

    // Submit to API
    patchUsersApi.mutate({ 
      url: "/api/PatchUser", 
      data: patchData,
      bulkRequest: true
    });
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">Confirm Patch Operation</Typography>
        <Typography color="text.secondary" variant="body2">
          Review the users and properties that will be updated, then click Submit to apply the changes.
        </Typography>
      </Stack>

      <Card variant="outlined">
        <Grid container spacing={3}>
          <Grid size={{ md: 6, xs: 12 }}>
            <PropertyList>
              <PropertyListItem
                label="Users to Patch"
                value={`${users?.length || 0} users`}
              />
              <PropertyListItem
                label="Properties to Modify"
                value={`${selectedProperties.length} properties`}
              />
            </PropertyList>
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <PropertyList>
              {selectedProperties.map(propName => {
                const property = PATCHABLE_PROPERTIES.find(p => p.property === propName);
                return (
                  <PropertyListItem
                    key={propName}
                    label={property?.label || propName}
                    value={propertyValues[propName] || 'Not set'}
                  />
                );
              })}
            </PropertyList>
          </Grid>
        </Grid>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Users to be Modified</Typography>
          <Grid container spacing={1}>
            {users?.map((user, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <Chip 
                  label={user.displayName || user.userPrincipalName} 
                  variant="outlined" 
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <CippApiResults apiObject={patchUsersApi} />
      
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="flex-end"
        spacing={2}
        sx={{ mt: 3 }}
      >
        {currentStep > 0 && (
          <Button color="inherit" onClick={onPreviousStep} size="large" type="button">
            Back
          </Button>
        )}
        <Button 
          size="large" 
          type="button" 
          variant="contained" 
          disabled={patchUsersApi.isPending || selectedProperties.length === 0}
          onClick={handleSubmit}
        >
          {patchUsersApi.isSuccess ? "Resubmit" : "Submit"}
        </Button>
      </Stack>
    </Stack>
  );
};

const Page = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);

  // Get users from URL parameters or session storage
  useEffect(() => {
    try {
      if (router.query.users) {
        const parsedUsers = JSON.parse(decodeURIComponent(router.query.users));
        setUsers(Array.isArray(parsedUsers) ? parsedUsers : [parsedUsers]);
      } else {
        // Fallback to session storage
        const storedUsers = sessionStorage.getItem('patchWizardUsers');
        if (storedUsers) {
          const parsedUsers = JSON.parse(storedUsers);
          setUsers(Array.isArray(parsedUsers) ? parsedUsers : [parsedUsers]);
          // Clear session storage after use
          sessionStorage.removeItem('patchWizardUsers');
        }
      }
    } catch (error) {
      console.error('Error parsing users data:', error);
      setUsers([]);
    }
  }, [router.query.users]);

  const steps = [
    {
      title: "Step 1",
      description: "Review Users",
      component: UsersDisplayStep,
      componentProps: {
        users: users,
      },
    },
    {
      title: "Step 2", 
      description: "Select Properties",
      component: PropertySelectionStep,
    },
    {
      title: "Step 3",
      description: "Confirmation",
      component: ConfirmationStep,
      componentProps: {
        users: users,
      },
    },
  ];

  const initialState = {
    selectedProperties: [],
    propertyValues: {},
  };

  return (
    <CippWizardPage
      backButton={true}
      steps={steps}
      wizardTitle="Update Users Wizard"
      postUrl="" // Empty since we handle submission manually
      initialState={initialState}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
