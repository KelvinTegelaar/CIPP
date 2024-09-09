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

  const handleActionClick = (row, action, formData) => {
    const data = {};

    if (Array.isArray(row) && action.multiPost === false) {
      // Handle bulk requests when row is an array and multiPost is false
      const bulkData = row.map((singleRow) => {
        const elementData = {};
        Object.keys(action.data).forEach((key) => {
          const value = singleRow[action.data[key]];
          elementData[key] = value !== undefined ? value : action.data[key];
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
      // Original handling for single request or when multiPost is true
      Object.keys(action.data).forEach((key) => {
        if (Array.isArray(row) && action.multiPost) {
          data[key] = row.map((singleRow) => {
            const value = singleRow[action.data[key]];
            return value !== undefined ? value : action.data[key];
          });
        } else {
          const value = row[action.data[key]];
          data[key] = value !== undefined ? value : action.data[key];
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
  return (
    <Dialog fullWidth maxWidth="sm" onClose={createDialog.handleClose} open={createDialog.open}>
      <form onSubmit={formHook.handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>{api.confirmText}</Stack>
        </DialogContent>
        <DialogContent>
          {fields &&
            fields.map((field, index) => {
              switch (field.type) {
                case "autoComplete":
                  return (
                    <Controller
                      key={index}
                      name={field.name}
                      control={formHook.control}
                      render={({ field }) => (
                        <CippAutoComplete
                          required
                          creatable={false}
                          multiple={false}
                          defaultValue={"Select a bla"}
                          options={["one", "two", "three"]}
                          onChange={(e, nv) => field.onChange(nv)}
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
