import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippWizardPage from "../../../../components/CippWizard/CippWizardPage.jsx";
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  TextField,
  Checkbox,
  Button,
  Switch,
  FormControlLabel,
  Autocomplete,
} from "@mui/material";
import { CippWizardStepButtons } from "../../../../components/CippWizard/CippWizardStepButtons";
import { ApiPostCall, ApiGetCall } from "../../../../api/ApiCall";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { Delete } from "@mui/icons-material";

// User properties that can be patched
const PATCHABLE_PROPERTIES = [
  {
    property: "city",
    label: "City",
    type: "string",
  },
  {
    property: "companyName",
    label: "Company Name",
    type: "string",
  },
  {
    property: "country",
    label: "Country",
    type: "string",
  },
  {
    property: "department",
    label: "Department",
    type: "string",
  },
  {
    property: "employeeType",
    label: "Employee Type",
    type: "string",
  },
  {
    property: "jobTitle",
    label: "Job Title",
    type: "string",
  },
  {
    property: "officeLocation",
    label: "Office Location",
    type: "string",
  },
  {
    property: "postalCode",
    label: "Postal Code",
    type: "string",
  },
  {
    property: "preferredDataLocation",
    label: "Preferred Data Location",
    type: "string",
  },
  {
    property: "preferredLanguage",
    label: "Preferred Language",
    type: "string",
  },
  {
    property: "showInAddressList",
    label: "Show in Address List",
    type: "boolean",
  },
  {
    property: "state",
    label: "State/Province",
    type: "string",
  },
  {
    property: "streetAddress",
    label: "Street Address",
    type: "string",
  },
  {
    property: "usageLocation",
    label: "Usage Location",
    type: "string",
  },
];

// Step 1: Display users to be updated
const UsersDisplayStep = (props) => {
  const { onNextStep, onPreviousStep, formControl, currentStep, users, onUsersChange } = props;

  const handleRemoveUser = (userToRemove) => {
    const updatedUsers = users.filter((user) => user.id !== userToRemove.id);
    onUsersChange(updatedUsers);
  };

  // Clean user data without circular references
  const tableData =
    users?.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      userPrincipalName: user.userPrincipalName,
      jobTitle: user.jobTitle,
      department: user.department,
      // Only include serializable properties
    })) || [];

  const columns = ["displayName", "userPrincipalName", "jobTitle", "department"];

  // Define actions separately to avoid circular references
  const rowActions = [
    {
      label: "Remove from List",
      icon: <Delete />,
      color: "error",
      customFunction: (user) => handleRemoveUser(user),
      noConfirm: true,
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">Users to be updated</Typography>
        <Typography color="text.secondary" variant="body2">
          The following users will be updated with the properties you select in the next step. You
          can remove users from this list if needed.
        </Typography>
      </Stack>

      {users && users.length > 0 ? (
        <CippDataTable
          title={`Selected Users (${users.length})`}
          data={tableData}
          simpleColumns={columns}
          actions={rowActions}
          disableFullScreenToggle={true}
          disableColumnFilters={true}
          disableColumnActions={true}
          disablePagination={true}
          disableRowSelection={true}
          disableExport={true}
          disableTopToolbar={users.length <= 5} // Hide toolbar for small lists
        />
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" variant="body2" sx={{ textAlign: "center", py: 2 }}>
              No users selected. Please go back and select users from the main table.
            </Typography>
          </CardContent>
        </Card>
      )}

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={users && users.length > 0 ? onNextStep : undefined}
        formControl={formControl}
        noNextButton={!users || users.length === 0}
      />
    </Stack>
  );
};

// Step 2: Property selection and input
const PropertySelectionStep = (props) => {
  const { onNextStep, onPreviousStep, formControl, currentStep, users } = props;
  const [selectedProperties, setSelectedProperties] = useState([]);

  // Get unique tenant domains from users
  const tenantDomains =
    [...new Set(users?.map((user) => user.Tenant || user.tenantFilter).filter(Boolean))] || [];

  // Fetch custom data mappings for all tenants
  const customDataMappings = ApiGetCall({
    url:
      tenantDomains.length > 0
        ? `/api/ListCustomDataMappings?sourceType=Manual Entry&directoryObject=User&tenantFilter=${tenantDomains[0]}`
        : null,
    queryKey: `ManualEntryMappings-${tenantDomains.join(",")}`,
    enabled: tenantDomains.length > 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Process custom data mappings into property format
  const customDataProperties = useMemo(() => {
    if (customDataMappings.isSuccess && customDataMappings.data?.Results) {
      return customDataMappings.data.Results.filter((mapping) => {
        // Only include single-value properties, filter out multivalue ones
        const dataType = mapping.customDataAttribute.addedFields.dataType?.toLowerCase();
        const isMultiValue = mapping.customDataAttribute.addedFields.isMultiValue;
        return !isMultiValue && dataType !== "collection";
      }).map((mapping) => ({
        property: mapping.customDataAttribute.value, // Use the actual attribute name, not nested under customData
        label: `${mapping.manualEntryFieldLabel} (Custom)`,
        type: mapping.customDataAttribute.addedFields.dataType?.toLowerCase() || "string",
        isCustomData: true,
      }));
    }
    return [];
  }, [customDataMappings.isSuccess, customDataMappings.data]);

  // Combine standard properties with custom data properties
  const allProperties = useMemo(() => {
    return [...PATCHABLE_PROPERTIES, ...customDataProperties];
  }, [customDataProperties]);

  // Register form fields
  formControl.register("selectedProperties", { required: true });
  formControl.register("propertyValues", { required: false });

  const handlePropertyValueChange = (property, value) => {
    const currentValues = formControl.getValues("propertyValues") || {};
    const newValues = { ...currentValues, [property]: value };
    formControl.setValue("propertyValues", newValues);
    formControl.trigger();
  };

  const renderPropertyInput = (propertyName) => {
    const property = allProperties.find((p) => p.property === propertyName);
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

    // Default to text input for string types with consistent styling
    return (
      <TextField
        key={propertyName}
        label={property?.label || propertyName}
        fullWidth
        value={currentValue || ""}
        onChange={(e) => handlePropertyValueChange(propertyName, e.target.value)}
        placeholder={`Enter new value for ${property?.label || propertyName}`}
        variant="filled"
        size="small"
        slotProps={{
          inputLabel: {
            shrink: true,
            sx: { transition: "none" },
          },
          input: {
            notched: true,
            sx: {
              transition: "none",
              "& .MuiOutlinedInput-notchedOutline": {
                transition: "none",
              },
            },
          },
        }}
      />
    );
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">Select Properties to update</Typography>
        <Typography color="text.secondary" variant="body2">
          Choose which user properties you want to modify and provide the new values.
          {customDataProperties.length > 0 && (
            <> Custom data fields are available based on your tenant's manual entry mappings.</>
          )}
        </Typography>
        {customDataMappings.isLoading && (
          <Typography color="text.secondary" variant="body2" sx={{ fontStyle: "italic" }}>
            Loading custom data mappings...
          </Typography>
        )}
      </Stack>

      <Autocomplete
        multiple
        disableCloseOnSelect
        options={[
          {
            property: "select-all",
            label: `Select All (${allProperties.length} properties)`,
            isSelectAll: true,
          },
          ...allProperties,
        ]}
        value={allProperties.filter((prop) => selectedProperties.includes(prop.property))}
        onChange={(event, newValue) => {
          // Check if "Select All" was clicked
          const selectAllOption = newValue.find((option) => option.isSelectAll);

          if (selectAllOption) {
            // If Select All is in the new value, select all properties
            const allSelected = selectedProperties.length === allProperties.length;
            const newProperties = allSelected ? [] : allProperties.map((p) => p.property);
            setSelectedProperties(newProperties);
            formControl.setValue("selectedProperties", newProperties);

            // Reset property values when selection changes
            const currentValues = formControl.getValues("propertyValues") || {};
            const newValues = {};
            newProperties.forEach((prop) => {
              if (currentValues[prop]) {
                newValues[prop] = currentValues[prop];
              }
            });
            formControl.setValue("propertyValues", newValues);
            formControl.trigger();
          } else {
            // Normal property selection
            const newProperties = newValue
              .filter((prop) => !prop.isSelectAll)
              .map((prop) => prop.property);
            setSelectedProperties(newProperties);
            formControl.setValue("selectedProperties", newProperties);

            // Reset property values when selection changes
            const currentValues = formControl.getValues("propertyValues") || {};
            const newValues = {};
            newProperties.forEach((prop) => {
              if (currentValues[prop]) {
                newValues[prop] = currentValues[prop];
              }
            });
            formControl.setValue("propertyValues", newValues);
            formControl.trigger();
          }
        }}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.property === value.property}
        size="small"
        renderOption={(props, option, { selected }) => {
          const isAllSelected = selectedProperties.length === allProperties.length;
          const isIndeterminate =
            selectedProperties.length > 0 && selectedProperties.length < allProperties.length;

          if (option.isSelectAll) {
            return (
              <li {...props} style={{ borderBottom: "1px solid #e0e0e0" }}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  style={{ marginRight: 8 }}
                />
                <Typography sx={{ fontWeight: "bold" }}>{option.label}</Typography>
              </li>
            );
          }

          return (
            <li {...props}>
              <Checkbox checked={selected} style={{ marginRight: 8 }} />
              {option.label}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Properties to update"
            placeholder="Select properties to update..."
            slotProps={{
              inputLabel: {
                shrink: true,
                sx: { transition: "none" },
              },
              input: {
                ...params.InputProps,
                notched: true,
                sx: {
                  transition: "none",
                  "& .MuiOutlinedInput-notchedOutline": {
                    transition: "none",
                  },
                },
              },
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value
            .filter((option) => !option.isSelectAll)
            .map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.property}
                label={option.label}
                size="small"
              />
            ))
        }
      />

      {selectedProperties.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Properties to update
            </Typography>
            <Stack spacing={2}>{selectedProperties.map(renderPropertyInput)}</Stack>
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
  const { lastStep, formControl, onPreviousStep, currentStep, users, allProperties } = props;
  const formValues = formControl.getValues();
  const { selectedProperties = [], propertyValues = {} } = formValues;

  // Create API call handler for bulk patch
  const patchUsersApi = ApiPostCall({
    relatedQueryKeys: ["ListUsers"],
  });

  const handleSubmit = () => {
    // Validate that we still have users to patch
    if (!users || users.length === 0) {
      console.error("No users to patch");
      return;
    }

    // Create bulk request data
    const patchData = users.map((user) => {
      const userData = {
        id: user.id,
        tenantFilter: user.Tenant || user.tenantFilter,
      };

      selectedProperties.forEach((propName) => {
        if (propertyValues[propName] !== undefined && propertyValues[propName] !== "") {
          // Handle dot notation properties (e.g., "extension_abc123.customField")
          if (propName.includes(".")) {
            const parts = propName.split(".");
            let current = userData;

            // Navigate to the nested object, creating it if it doesn't exist
            for (let i = 0; i < parts.length - 1; i++) {
              if (!current[parts[i]]) {
                current[parts[i]] = {};
              }
              current = current[parts[i]];
            }

            // Set the final property value
            current[parts[parts.length - 1]] = propertyValues[propName];
          } else {
            // Handle regular properties
            userData[propName] = propertyValues[propName];
          }
        }
      });

      return userData;
    });

    // Submit to API
    patchUsersApi.mutate({
      url: "/api/PatchUser",
      data: patchData,
    });
  };

  // Clean user data for table display
  const tableData =
    users?.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      userPrincipalName: user.userPrincipalName,
      jobTitle: user.jobTitle,
      department: user.department,
    })) || [];

  const columns = ["displayName", "userPrincipalName", "jobTitle", "department"];

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">Confirm User Updates</Typography>
        <Typography color="text.secondary" variant="body2">
          Review the users that will be updated with {selectedProperties.length} selected{" "}
          {selectedProperties.length === 1 ? "property" : "properties"}, then click Submit to apply
          the changes.
        </Typography>
      </Stack>

      {/* Properties to be updated */}
      {selectedProperties.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Properties to Update
            </Typography>
            <Stack spacing={1}>
              {selectedProperties.map((propName) => {
                const property = allProperties.find((p) => p.property === propName);
                const value = propertyValues[propName];
                const displayValue =
                  property?.type === "boolean" ? (value ? "Yes" : "No") : value || "Not set";

                return (
                  <Box key={propName} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "fit-content" }}
                    >
                      {property?.label || propName}:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {displayValue}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {users && users.length > 0 ? (
        <CippDataTable
          title={`Users to Update (${users.length})`}
          data={tableData}
          simpleColumns={columns}
          disableFullScreenToggle={true}
          disableColumnFilters={true}
          disableColumnActions={true}
          disablePagination={true}
          disableRowSelection={true}
          disableExport={true}
          disableTopToolbar={users.length <= 5}
        />
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" variant="body2" sx={{ textAlign: "center", py: 2 }}>
              No users to update. Please go back and select users.
            </Typography>
          </CardContent>
        </Card>
      )}

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
          disabled={
            patchUsersApi.isPending ||
            selectedProperties.length === 0 ||
            !users ||
            users.length === 0
          }
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
        const storedUsers = sessionStorage.getItem("patchWizardUsers");
        if (storedUsers) {
          const parsedUsers = JSON.parse(storedUsers);
          setUsers(Array.isArray(parsedUsers) ? parsedUsers : [parsedUsers]);
          // Clear session storage after use
          sessionStorage.removeItem("patchWizardUsers");
        }
      }
    } catch (error) {
      console.error("Error parsing users data:", error);
      setUsers([]);
    }
  }, [router.query.users]);

  // Get unique tenant domains from users
  const tenantDomains = useMemo(() => {
    return (
      [...new Set(users?.map((user) => user.Tenant || user.tenantFilter).filter(Boolean))] || []
    );
  }, [users]);

  // Fetch custom data mappings for all tenants
  const customDataMappings = ApiGetCall({
    url:
      tenantDomains.length > 0
        ? `/api/ListCustomDataMappings?sourceType=Manual Entry&directoryObject=User&tenantFilter=${tenantDomains[0]}`
        : null,
    queryKey: `ManualEntryMappings-${tenantDomains.join(",")}`,
    enabled: tenantDomains.length > 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Process custom data mappings into property format
  const customDataProperties = useMemo(() => {
    if (customDataMappings.isSuccess && customDataMappings.data?.Results) {
      return customDataMappings.data.Results.filter((mapping) => {
        // Only include single-value properties, filter out multivalue ones
        const dataType = mapping.customDataAttribute.addedFields.dataType?.toLowerCase();
        const isMultiValue = mapping.customDataAttribute.addedFields.isMultiValue;
        return !isMultiValue && dataType !== "collection";
      }).map((mapping) => ({
        property: mapping.customDataAttribute.value, // Use the actual attribute name, not nested under customData
        label: `${mapping.manualEntryFieldLabel} (Custom)`,
        type: mapping.customDataAttribute.addedFields.dataType?.toLowerCase() || "string",
        isCustomData: true,
      }));
    }
    return [];
  }, [customDataMappings.isSuccess, customDataMappings.data]);

  // Combine standard properties with custom data properties
  const allProperties = useMemo(() => {
    return [...PATCHABLE_PROPERTIES, ...customDataProperties];
  }, [customDataProperties]);

  const steps = [
    {
      title: "Step 1",
      description: "Review Users",
      component: UsersDisplayStep,
      componentProps: {
        users: users,
        onUsersChange: setUsers,
      },
    },
    {
      title: "Step 2",
      description: "Select Properties",
      component: PropertySelectionStep,
      componentProps: {
        users: users,
        allProperties: allProperties,
        customDataMappings: customDataMappings,
        customDataProperties: customDataProperties,
      },
    },
    {
      title: "Step 3",
      description: "Confirmation",
      component: ConfirmationStep,
      componentProps: {
        users: users,
        allProperties: allProperties,
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
