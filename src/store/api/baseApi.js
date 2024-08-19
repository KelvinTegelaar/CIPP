import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQuery(),
  keepUnusedDataFor: 0,
  endpoints: () => ({}),
});
