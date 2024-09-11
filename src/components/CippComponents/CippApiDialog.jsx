import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Stack } from "@mui/system";
import { CippApiResults } from "./CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CippAutoComplete } from "./CippAutocomplete";

export const CippApiDialog = (props) => {
  const { createDialog, title, fields, api, row, ...other } = props;
  const [addedFieldData, setAddedFieldData] = useState({});
  const [partialResults, setPartialResults] = useState([]);
  const [getRequestInfo, setGetRequestInfo] = useState({
    url: "",
    waiting: false,
    queryKey: "",
  });

  const actionPostRequest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => {
      setPartialResults((prevResults) => [...prevResults, result]);
    },
  });

  const actionGetRequest = ApiGetCall({
    ...getRequestInfo,
    onResult: (result) => {
      setPartialResults((prevResults) => [...prevResults, result]);
    },
  });

  const processActionData = (dataObject, row) => {
    const newData = {};
    Object.keys(dataObject).forEach((key) => {
      const value = dataObject[key];

      if (typeof value === "string" && row[value] !== undefined) {
        newData[key] = row[value];
      } else if (typeof value === "object" && value !== null) {
        newData[key] = processActionData(value, row);
      } else {
        newData[key] = value;
      }
    });
    return newData;
  };

  const handleActionClick = (row, action, formData) => {
    let data = { ...formData, ...addedFieldData };
    const processedActionData = processActionData(action.data, row);
    if (Array.isArray(row) && action.multiPost === false) {
      const bulkData = row.map((singleRow) => {
        const elementData = {};
        Object.keys(processedActionData).forEach((key) => {
          const value = singleRow[processedActionData[key]];
          elementData[key] = value !== undefined ? value : processedActionData[key];
        });
        return { ...elementData, ...formData };
      });

      if (action.type === "POST") {
        actionPostRequest.mutate({
          url: action.url,
          bulkRequest: true,
          data: bulkData,
        });
      } else if (action.type === "GET") {
        setGetRequestInfo({
          url: action.url,
          waiting: true,
          queryKey: Date.now(),
          data: bulkData,
          bulkRequest: true,
        });
      }
    } else {
      Object.keys(processedActionData).forEach((key) => {
        if (Array.isArray(row) && action.multiPost) {
          data[key] = row.map((singleRow) => {
            const value = singleRow[processedActionData[key]];
            return value !== undefined ? value : processedActionData[key];
          });
        } else {
          const value = row[processedActionData[key]];
          data[key] = value !== undefined ? value : processedActionData[key];
        }
      });

      if (action.type === "POST") {
        actionPostRequest.mutate({
          url: action.url,
          data: { ...data, ...formData },
        });
      } else if (action.type === "GET") {
        setGetRequestInfo({
          url: action.url,
          waiting: true,
          queryKey: Date.now(),
          data: { ...data, ...formData },
          bulkRequest: action.multiPost,
        });
      }
    }
  };

  const formHook = useForm();
  const onSubmit = (data) => handleActionClick(row, api, data);
  const selectedType = api.type === "POST" ? actionPostRequest : actionGetRequest;
  if (api.link) {
    window.open(api.link, "_blank");
    return null;
  }
  return (
    <Dialog fullWidth maxWidth="sm" onClose={createDialog.handleClose} open={createDialog.open}>
      <form onSubmit={formHook.handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>{api.confirmText}</Stack>
        </DialogContent>
        <DialogContent>
          {fields &&
            fields.map((fieldProps, index) => {
              switch (fieldProps.type) {
                case "autoComplete":
                  return (
                    <Controller
                      key={index}
                      name={fieldProps.name}
                      control={formHook.control}
                      render={({ field, formState }) => (
                        <CippAutoComplete
                          required
                          api={fieldProps.api}
                          creatable={false}
                          multiple={false}
                          placeholder={fieldProps.label}
                          options={fieldProps.options}
                          onChange={(value, addedFields) => {
                            field.onChange(value.value);
                            setAddedFieldData((prev) => ({ ...prev, ...addedFields }));
                          }}
                        />
                      )}
                    />
                  );
                case "textField":
                  return (
                    <TextField
                      key={index}
                      multiline={false}
                      fullWidth
                      name={field.name}
                      {...formHook.register(field.name)}
                    />
                  );
                case "textArea":
                  return (
                    <TextField
                      key={index}
                      multiline
                      fullWidth
                      rows={4}
                      {...field}
                      {...formHook.register(field.name)}
                    />
                  );
                default:
                  return null;
              }
            })}
        </DialogContent>
        <DialogContent>
          <>
            <CippApiResults apiObject={{ ...selectedType, data: partialResults }} />
          </>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={createDialog.handleClose}>
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
