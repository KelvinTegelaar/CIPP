import { useSettings } from "../../hooks/use-settings";

export const utilTableMode = (
  columnVisibility,
  mode,
  actions,
  simpleColumns,
  offCanvas,
  onChange,
  maxHeightOffset = "380px"
) => {
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
        sx: { maxHeight: `calc(100vh - ${maxHeightOffset})` },
      },
      initialState: {
        columnOrder: [...simpleColumns],
        columnVisibility: { ...columnVisibility },
        density: "compact",
        pagination: {
          pageSize: settings?.tablePageSize?.value
            ? parseInt(settings?.tablePageSize?.value, 10)
            : 25,
          pageIndex: 0,
        },
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
      enableRowSelection: actions || onChange ? true : false,
      enableRowActions: actions ? true : false,
      enableSelectAll: true,
      enableFacetedValues: true,
      enableColumnFilterModes: true,
      enableStickyHeader: true,
      selectAllMode: "all",
      enableColumnPinning: true,
      enableStickyHeader: true,
      muiPaginationProps: {
        rowsPerPageOptions: [25, 50, 100, 250, 500],
      },
      muiTableContainerProps: {
        sx: { maxHeight: `calc(100vh - ${maxHeightOffset})` },
      },
      displayColumnDefOptions: {
        "mrt-row-actions": {
          visibleInShowHideMenu: false,
        },
        "mrt-row-select": {
          visibleInShowHideMenu: false,
        },
      },
      initialState: {
        columnOrder: [...simpleColumns],
        columnVisibility: { ...columnVisibility },
        showGlobalFilter: true,
        density: "compact",
        pagination: {
          pageSize: settings?.tablePageSize?.value
            ? parseInt(settings?.tablePageSize?.value, 10)
            : 25,
          pageIndex: 0,
        },
        columnPinning: {
          left: ["mrt-row-select"],
          right: ["mrt-row-actions"],
        },
      },
    };
  }
};
