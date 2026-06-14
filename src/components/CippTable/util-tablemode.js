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
        // Seed the order with the leading/trailing display columns (selection checkbox + row
        // actions) ONLY when they actually exist (same conditions as enableRowSelection /
        // enableRowActions below). They keep MRT's column-drag handler from dropping the
        // checkbox column's pin (it re-derives columnPinning by filtering against columnOrder).
        // But seeding ids for columns that DON'T exist poisons the order: MRT only rebuilds
        // columnOrder when its length differs from the data-column count, so a 2-id seed
        // (['mrt-row-select','mrt-row-actions']) against a 2-column table — e.g. a read-only
        // dialog popout with no selection/actions — compares equal, never rebuilds, and renders
        // two phantom ids with the real columns unplaced (the "breaks with exactly 2 properties"
        // popout bug).
        columnOrder: [
          ...(actions || onChange ? ['mrt-row-select'] : []),
          ...simpleColumns,
          ...(actions ? ['mrt-row-actions'] : []),
        ],
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
