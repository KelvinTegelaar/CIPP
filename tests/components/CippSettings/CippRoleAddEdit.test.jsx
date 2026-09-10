import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../test-utils";

// Regression for a render loop: the permissions query returns data: undefined while
// pending, and every hook it feeds must stay referentially stable across re-renders.
const pendingPermissions = vi.hoisted(() => ({
  data: undefined,
  isFetching: true,
  isSuccess: false,
}));
const idlePagination = vi.hoisted(() => ({
  data: undefined,
  isFetching: false,
  isSuccess: false,
  fetchNextPage: () => {},
}));
const idleMutation = vi.hoisted(() => ({
  isPending: false,
  isSuccess: false,
  isError: false,
  isFetching: false,
  isIdle: true,
  data: undefined,
  error: undefined,
  mutate: () => {},
  reset: () => {},
}));

vi.mock("../../../src/api/ApiCall", () => ({
  ApiGetCall: () => pendingPermissions,
  ApiGetCallWithPagination: () => idlePagination,
  ApiPostCall: () => idleMutation,
}));

import { CippRoleAddEdit } from "../../../src/components/CippSettings/CippRoleAddEdit";

describe("CippRoleAddEdit render stability", () => {
  // Editing a built-in role while the API permissions list is still pending used to
  // set a fresh {} baseRolePermissions on every render, which fed a second effect and
  // looped until React threw "Maximum update depth exceeded".
  it("does not exceed React's update-depth limit while the permissions query is pending", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderWithProviders(<CippRoleAddEdit selectedRole="editor" />)).not.toThrow();

    const loggedMaxDepth = consoleError.mock.calls.some((args) =>
      args.some((arg) => typeof arg === "string" && arg.includes("Maximum update depth exceeded"))
    );
    expect(loggedMaxDepth).toBe(false);

    consoleError.mockRestore();
  });
});

// Regression: the "Set All Permissions" effect used to fire on mount with an undefined
// selection. With the permissions list already cached that overwrote the loaded role
// with "Cat.Obj.undefined" for every row.
const loadedPermissions = { CIPP: { Alert: { Read: [], ReadWrite: [] } } };
const technicianRole = {
  RowKey: "technician",
  Permissions: { CIPPAlert: "CIPP.Alert.Read" },
  PermissionRules: { Include: ["CIPP.Alert.Read"], Exclude: [] },
};

describe("CippRoleAddEdit custom role advanced view", () => {
  it("shows the saved permission levels instead of undefined", async () => {
    pendingPermissions.data = loadedPermissions;
    pendingPermissions.isFetching = false;
    pendingPermissions.isSuccess = true;
    idlePagination.data = { pages: [[technicianRole]] };
    idlePagination.isSuccess = true;

    const { findByText, queryByText } = renderWithProviders(
      <CippRoleAddEdit selectedRole="technician" />
    );

    expect(await findByText("CIPP.Alert.Read")).toBeTruthy();
    expect(queryByText(/\.undefined/)).toBeNull();
  });
});
