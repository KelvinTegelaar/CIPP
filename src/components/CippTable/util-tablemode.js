export const utilTableMode = (columnVisibility, mode, actions) => {
  if (mode === true) {
    return {
      enableRowSelection: false,
      enableRowActions: false,
      enableSelectAll: false,
      initialState: {
        columnVisibility: { ...columnVisibility },
        density: "compact",
      },
    };
  } else {
    return {
      enableRowSelection: true,
      enableRowActions: actions ? true : false,
      enableSelectAll: true,
      enableStickyHeader: true,
      selectAllMode: "all",
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
