export const utilTableMode = (columnVisibility, mode, actions) => {
  if (mode === true) {
    return {
      enableRowSelection: false,
      enableRowActions: false,
      enableSelectAll: false,
      enableColumnPinning: false,
      enableStickyHeader: false,
      muiTableContainerProps: {
        sx: { maxHeight: `calc(100vh - 380px)` },
      },
      initialState: {
        columnVisibility: { ...columnVisibility },
        density: "compact",
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
      enableRowSelection: true,
      enableRowActions: actions ? true : false,
      enableSelectAll: true,
      enableStickyHeader: true,
      selectAllMode: "all",
      enableColumnPinning: true,
      enableStickyHeader: true,
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
      initialState: {
        columnVisibility: { ...columnVisibility },
        showGlobalFilter: true,
        density: "compact",
        columnPinning: {
          left: ["mrt-row-select"],
          right: ["mrt-row-actions"],
        },
      },
    };
  }
};
