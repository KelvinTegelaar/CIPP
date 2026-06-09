export const utilTableMode = (
  columnVisibility,
  mode,
  actions,
  simpleColumns,
  offCanvas,
  onChange,
  maxHeightOffset = '380px',
  settings = {}
) => {
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
        density: 'compact',
        pagination: {
          pageSize: settings?.tablePageSize?.value
            ? parseInt(settings?.tablePageSize?.value, 10)
            : 25,
          pageIndex: 0,
        },
      },
      displayColumnDefOptions: {
        'mrt-row-actions': {
          visibleInShowHideMenu: false,
        },
        'mrt-row-select': {
          visibleInShowHideMenu: false,
        },
      },
    }
  } else {
    return {
      enableRowSelection: actions || onChange ? true : false,
      enableRowActions: actions ? true : false,
      enableSelectAll: true,
      enableFacetedValues: true,
      enableColumnFilterModes: true,
      enableStickyHeader: true,
      selectAllMode: 'all',
      enableColumnPinning: true,
      muiPaginationProps: {
        rowsPerPageOptions: [25, 50, 100, 250, 500],
      },
      muiTableContainerProps: {
        sx: { maxHeight: `calc(100vh - ${maxHeightOffset})` },
      },
      displayColumnDefOptions: {
        'mrt-row-actions': {
          visibleInShowHideMenu: false,
        },
        'mrt-row-select': {
          visibleInShowHideMenu: false,
        },
      },
      initialState: {
        // Include the leading/trailing display columns (selection checkbox + row actions)
        // around the data columns. MRT's column-drag handler re-derives columnPinning by
        // filtering it against columnOrder, dropping any pinned id not present — so an
        // order missing these (e.g. the post-reset fallback) would unpin the checkbox
        // column and let it drift right. The ids are harmless when those columns are off.
        columnOrder: ['mrt-row-select', ...simpleColumns, 'mrt-row-actions'],
        columnVisibility: { ...columnVisibility },
        showGlobalFilter: true,
        density: 'compact',
        pagination: {
          pageSize: settings?.tablePageSize?.value
            ? parseInt(settings?.tablePageSize?.value, 10)
            : 25,
          pageIndex: 0,
        },
        columnPinning: {
          left: ['mrt-row-select'],
          right: ['mrt-row-actions'],
        },
      },
    }
  }
}
