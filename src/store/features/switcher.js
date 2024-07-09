import { createSlice } from '@reduxjs/toolkit'
import _nav from 'src/_nav'

export const mapNav = () => {
  return _nav
    .filter(({ section }) => section)
    .map(({ name, section, to, icon, items }) => {
      if (items) {
        return items.map((item) => ({
          name: item.name,
          to: item.to,
          icon,
          section: `${section}/${name}`,
        }))
      } else {
        return {
          name,
          section,
          to,
          icon,
        }
      }
    })
    .reduce((pv, cv) => pv.concat(cv), [])
}

const initialState = {
  visible: false,
}

export const switcherSlice = createSlice({
  name: 'switcher',
  initialState,
  reducers: {
    showSwitcher: (state) => {
      state.visible = true
    },
    hideSwitcher: (state) => {
      state.visible = false
    },
    toggleSwitcher: (state) => {
      state.visible = !state.visible
    },
    setItems: (state, action) => {
      state.items = action.payload.items
    },
  },
})

export const { showSwitcher, hideSwitcher, toggleSwitcher, setItems, initialize } =
  switcherSlice.actions
export default switcherSlice.reducer
