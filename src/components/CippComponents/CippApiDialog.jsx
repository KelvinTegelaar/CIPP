import { useRouter } from "next/router"; // Import Next.js router
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material";
import { Stack } from "@mui/system";
import { CippApiResults } from "./CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";
import CippFormComponent from "./CippFormComponent";

export const CippApiDialog = (props) => {
  const {
    createDialog,
    title,
    fields,
    api,
    row = {},
    relatedQueryKeys,
    dialogAfterEffect,
    ...other
  } = props;
  const router = useRouter();
  const [addedFieldData, setAddedFieldData] = useState({});
  const [partialResults, setPartialResults] = useState([]);
  const [getRequestInfo, setGetRequestInfo] = useState({
    url: "",
    waiting: false,
    queryKey: "",
    relatedQueryKeys: relatedQueryKeys
      ? relatedQueryKeys
      : api.relatedQueryKeys
      ? api.relatedQueryKeys
      : title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => {
      setPartialResults((prevResults) => [...prevResults, result]);
    },
  });

  const actionPostRequest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: relatedQueryKeys
      ? relatedQueryKeys
      : api.relatedQueryKeys
      ? api.relatedQueryKeys
      : title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => {
      setPartialResults((prevResults) => [...prevResults, result]);
      if (api?.onSuccess) {
        api.onSuccess(result);
      }
    },
  });
  const actionGetRequest = ApiGetCall({
    ...getRequestInfo,
    relatedQueryKeys: relatedQueryKeys
      ? relatedQueryKeys
      : api.relatedQueryKeys
      ? api.relatedQueryKeys
      : title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => {
      setPartialResults((prevResults) => [...prevResults, result]);
      if (api?.onSuccess) {
        api.onSuccess(result);
      }
    },
  });

  const processActionData = (dataObject, row, replacementBehaviour) => {
    if (typeof api?.dataFunction === "function") {
      return api.dataFunction(row);
    }
    var newData = {};

    if (api?.postEntireRow) {
      newData = row;
    } else {
      Object.keys(dataObject).forEach((key) => {
        const value = dataObject[key];

        if (typeof value === "string" && value.startsWith("!")) {
          newData[key] = value.slice(1);
        } else if (typeof value === "string") {
          if (row[value] !== undefined) {
            newData[key] = row[value];
          } else {
            newData[key] = value;
          }
        } else if (typeof value === "object" && value !== null) {
          const processedValue = processActionData(value, row, replacementBehaviour);
          if (replacementBehaviour !== "removeNulls" || Object.keys(processedValue).length > 0) {
            newData[key] = processedValue;
          }
        } else if (replacementBehaviour !== "removeNulls") {
          newData[key] = value;
        } else if (row[value] !== undefined) {
          newData[key] = row[value];
        }
      });
    }
    return newData;
  };
  const tenantFilter = useSettings().currentTenant;
  const handleActionClick = (row, action, formData) => {
    if (action.multiPost === undefined) {
      action.multiPost = false;
    }
    if (api.customFunction) {
      action.customFunction(row, action, formData);
      createDialog.handleClose();
      return;
    }

    const commonData = {
      tenantFilter: tenantFilter,
      ...formData,
      ...addedFieldData,
    };
    const processedActionData = processActionData(action.data, row, action.replacementBehaviour);

    if (Array.isArray(row) && action.multiPost === false) {
      const arrayOfObjects = row.map((singleRow) => {
        const itemData = { ...commonData };
        Object.keys(processedActionData).forEach((key) => {
          const rowValue = singleRow[processedActionData[key]];
          itemData[key] = rowValue !== undefined ? rowValue : processedActionData[key];
        });
        return itemData;
      });
      if (action.type === "POST") {
        actionPostRequest.mutate({
          url: action.url,
          bulkRequest: true,
          data: arrayOfObjects,
        });
      } else if (action.type === "GET") {
        setGetRequestInfo({
          url: action.url,
          waiting: true,
          queryKey: Date.now(),
          bulkRequest: true,
          data: arrayOfObjects,
        });
      }

      return;
    }

    if (Array.isArray(row) && action.multiPost === true) {
      const singleArrayData = row.map((singleRow) => {
        const itemData = { ...commonData };
        Object.keys(processedActionData).forEach((key) => {
          const rowValue = singleRow[processedActionData[key]];
          itemData[key] = rowValue !== undefined ? rowValue : processedActionData[key];
        });
        return itemData;
      });

      if (action.type === "POST") {
        actionPostRequest.mutate({
          url: action.url,
          bulkRequest: false,
          data: singleArrayData,
        });
      } else if (action.type === "GET") {
        setGetRequestInfo({
          url: action.url,
          waiting: true,
          queryKey: Date.now(),
          bulkRequest: false,
          data: singleArrayData,
        });
      }
      return;
    }

    const finalData = { ...commonData };
    Object.keys(processedActionData).forEach((key) => {
      const rowValue = row[processedActionData[key]];
      finalData[key] = rowValue !== undefined ? rowValue : processedActionData[key];
    });

    if (action.type === "POST") {
      actionPostRequest.mutate({
        url: action.url,
        bulkRequest: false,
        data: finalData,
      });
    } else if (action.type === "GET") {
      setGetRequestInfo({
        url: action.url,
        waiting: true,
        queryKey: Date.now(),
        bulkRequest: false,
        data: finalData,
      });
    }
  };
  //add a useEffect, when dialogAfterEffect exists, and the post or get request is successful, run the dialogAfterEffect function
  useEffect(() => {
    if (dialogAfterEffect && (actionPostRequest.isSuccess || actionGetRequest.isSuccess)) {
      dialogAfterEffect(actionPostRequest.data.data || actionGetRequest.data);
    }
  }, [actionPostRequest.isSuccess, actionGetRequest.isSuccess]);
  const formHook = useForm();
  const onSubmit = (data) => handleActionClick(row, api, data);
  const selectedType = api.type === "POST" ? actionPostRequest : actionGetRequest;

  // Handling link navigation
  if (api.link) {
    const getNestedValue = (obj, path) => {
      return path
        .split(".")
        .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    };

    const linkWithRowData = api.link.replace(/\[([^\]]+)\]/g, (_, key) => {
      return getNestedValue(row, key) || `[${key}]`;
    });

    if (linkWithRowData.startsWith("/")) {
      router.push(linkWithRowData, undefined, { shallow: true });
    } else {
      window.open(linkWithRowData, api.target || "_blank");
    }

    return null;
  }
  useEffect(() => {
    if (api.noConfirm) {
      formHook.handleSubmit(onSubmit)(); // Submits the form on mount
      createDialog.handleClose(); // Closes the dialog after submitting
    }
  }, [api.noConfirm]); // Run effect only when api.noConfirm changes

  const handleClose = () => {
    createDialog.handleClose();
    setPartialResults([]);
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={createDialog.open}>
      <form onSubmit={formHook.handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>{api.confirmText}</Stack>
        </DialogContent>
        <DialogContent>
          <Grid container spacing={2}>
            {fields &&
              fields.map((fieldProps, index) => {
                return (
                  <Grid item xs={12} key={index}>
                    <CippFormComponent
                      formControl={formHook}
                      addedFieldData={addedFieldData}
                      setAddedFieldData={setAddedFieldData}
                      {...fieldProps}
                    />
                  </Grid>
                );
              })}
          </Grid>
        </DialogContent>
        <DialogContent>
          <CippApiResults apiObject={{ ...selectedType, data: partialResults }} />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => handleClose()}>
            Close
          </Button>
          <Button variant="contained" type="submit">
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
