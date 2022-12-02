import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const initialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
  currentTenant: {},
  themes: ['default', 'cyberdrain', 'impact'],
  currentTheme: 'default',
  tablePageSize: 25,
  pageSizes: [25, 50, 100, 200, 500],
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleSidebarShow: (state) => {
      state.sidebarShow = !state.sidebarShow
    },
    toggleSidebarUnfoldable: (state, action) => {
      state.sidebarUnfoldable = action.payload?.unfoldable
    },
    setCurrentTenant: (state, action) => {
      state.currentTenant = action.payload?.tenant
    },
    setCurrentTheme: (state, action) => {
      state.currentTheme = action.payload?.theme
    },
    setCurrentPageSize: (state, action) => {
      state.tablePageSize = action.payload?.pageSize
    },
    setSidebarVisible: (state, action) => {
      state.sidebarShow = action.payload?.visible
    },
    setDefaultusageLocation: (state, action) => {
      state.usageLocation = action.payload?.usageLocation
    },
    setReportImage: (state, action) => {
      state.reportImage = action.payload?.reportImage
    },
  },
})

export const {
  toggleSidebarShow,
  toggleSidebarUnfoldable,
  setCurrentTenant,
  setCurrentPageSize,
  setCurrentTheme,
  setSidebarVisible,
  setDefaultusageLocation,
  setReportImage,
} = appSlice.actions

export default persistReducer(
  {
    key: 'rtk:app',
    storage,
  },
  appSlice.reducer,
)
