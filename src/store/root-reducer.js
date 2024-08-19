import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import { toastsSlice } from "./toasts";

export const apiMiddleware = [baseApi.middleware];

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  [toastsSlice.name]: toastsSlice.reducer,
});
