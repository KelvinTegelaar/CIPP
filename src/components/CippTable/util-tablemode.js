import { useSettings } from "../../hooks/use-settings";

export const utilTableMode = (columnVisibility, mode, actions, simpleColumns) => {
  const settings = useSettings();
  if (mode === true) {
    return {
      enableRowSelection: false,
      enableRowActions: false,
      enableSelectAll: false,
      enableColumnPinning: false,
      enableStickyHeader: false,
      muiPaginationProps: {
        rowsPerPageOptions: [25, 50, 100, 250, 500],
      },
      muiTableContainerProps: {
        sx: { maxHeight: `calc(100vh - 380px)` },
      },
      initialState: {
        columnOrder: [...simpleColumns],
        columnVisibility: { ...columnVisibility },
        density: "compact",
        pagination: { pageSize: settings?.tablePageSize?.value || 25 },
      },
      displayColumnDefOptions: {
        "mrt-row-actions": {
          visibleInShowHideMenu: false,
        },
        "mrt-row-select": {
          visibleInShowHideMenu: false,
        },
      },
    };
  } else {
    return {
      enableRowSelection: actions ? true : false,
      enableRowActions: actions ? true : false,
      enableSelectAll: true,
      enableFacetedValues: true,
      enableStickyHeader: true,
      selectAllMode: "all",
      enableColumnPinning: true,
      enableStickyHeader: true,
      muiPaginationProps: {
        rowsPerPageOptions: [25, 50, 100, 250, 500],
      },
      muiTableContainerProps: {
        sx: { maxHeight: `calc(100vh - 380px)` },
      },
      displayColumnDefOptions: {
        "mrt-row-actions": {
          visibleInShowHideMenu: false,
        },
        "mrt-row-select": {
          visibleInShowHideMenu: false,
        },
      },
      //TODO: page size should come from user settings state in the future.
      initialState: {
        columnOrder: [...simpleColumns],
        columnVisibility: { ...columnVisibility },
        showGlobalFilter: true,
        density: "compact",
        pagination: { pageSize: settings?.tablePageSize?.value || 25 },
        columnPinning: {
          left: ["mrt-row-select"],
          right: ["mrt-row-actions"],
        },
      },
    };
  }
};
