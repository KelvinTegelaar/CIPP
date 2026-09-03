// Card mode renders its own list, so a huge desktop tablePageSize preference must not
// become that many unvirtualized cards. CippMobileCardList grows pageSize from here.
const MOBILE_PAGE_SIZE_CAP = 50

export const utilTableMode = (
  columnVisibility,
  mode,
  actions,
  simpleColumns,
  offCanvas,
  onChange,
  maxHeightOffset = '380px',
  settings = {},
  viewMode = 'table',
  narrowTable = false,
  exportEnabled = true
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
    const configuredPageSize = settings?.tablePageSize?.value
      ? parseInt(settings?.tablePageSize?.value, 10)
      : 25
    const isCards = viewMode === 'cards'

    return {
      // Row checkboxes drive both bulk actions and Export Selected. Report-style pages have
      // no actions but still export, so gate selection on export too — otherwise it is the
      // whole table or nothing (no way to export a chosen subset).
      enableRowSelection: actions || onChange || exportEnabled ? true : false,
      // offCanvas alone still needs the actions column: it carries the More Info entry
      // (renderRowActionMenuItems falls back to just that when there are no actions).
      enableRowActions: actions || offCanvas ? true : false,
      enableSelectAll: true,
      enableFacetedValues: true,
      enableColumnFilterModes: true,
      enableStickyHeader: !isCards,
      selectAllMode: 'all',
      enableColumnPinning: !isCards,
      muiPaginationProps: {
        rowsPerPageOptions: [25, 50, 100, 250, 500],
        // a full footer wraps below MRT's 720px pivot, the extra row scrolls the page chrome
        ...(narrowTable && {
          showRowsPerPage: false,
          showFirstButton: false,
          showLastButton: false,
        }),
      },
      muiTableContainerProps: {
        // offset numbers are tuned against desktop chrome, narrow viewports page-scroll
        sx: {
          maxHeight: narrowTable ? 'none' : `calc(100vh - ${maxHeightOffset})`,
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
      initialState: {
        columnOrder: [...simpleColumns],
        columnVisibility: { ...columnVisibility },
        showGlobalFilter: true,
        density: 'compact',
        pagination: {
          pageSize: isCards
            ? Math.min(configuredPageSize, MOBILE_PAGE_SIZE_CAP)
            : configuredPageSize,
          pageIndex: 0,
        },
        ...(!isCards && {
          columnPinning: {
            left: ['mrt-row-select'],
            right: ['mrt-row-actions'],
          },
        }),
      },
    }
  }
}
