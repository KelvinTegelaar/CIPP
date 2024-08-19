// this will catch all errors, or any actions with prop `error` set
// set action.hideToastError to `true` to ignore this middleware
import { isRejectedWithValue } from "@reduxjs/toolkit";
import { store } from "../index";
import { showToast } from "../toasts";

export const errorMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (
      isRejectedWithValue(action) &&
      !action.error?.hideToastError &&
      action.payload.message !== "canceled"
    ) {
      if (action.payload.data === "Backend call failure") {
        action.payload.data =
          "The Azure Function has taken too long to respond. Try selecting a different report or a single tenant instead";
      }
      //if the payload is a string, show the string, if the payload is an object, check if there is a 'Results or 'results' or 'result' property and show that, otherwise show the whole object
      let message = action.payload?.data || "A generic error has occurred.";
      if (typeof message === "string") {
        // Do nothing, message is already a string
      } else if (typeof message === "object") {
        if (message.Results) {
          message = message.Results;
        } else if (message.results) {
          message = message.results;
        } else if (message.result) {
          message = message.result;
        } else {
          message = JSON.stringify(message);
        }
      }
      if (message.length > 240) {
        message = message.substring(0, 240) + "...";
      }
      const toastError = action.payload;
      console.log("error message", message);
      dispatch(
        showToast({
          title: "An error has occurred",
          message: message,
          toastError,
        })
      );
    }

    return next(action);
  };
