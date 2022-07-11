import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  contact: { id: 0, displayName: '', userPrincipalName: '' },
  firstName: '',
  lastName: '',
  username: '',
  password: '',
}

export const userAdminSlice = createSlice({
  name: 'userAdmin',
  initialState: initialState,
  reducers: {
    setContact: (state, action) => {
      state.contact = action.payload
    },
    setFirstName: (state, action) => {
      state.firstName = action.payload
    },
    setLastName: (state, action) => {
      state.lastName = action.payload
    },
    setPassword: (state, action) => {
      state.password = action.payload
    },
    setUsername: (state, action) => {
      state.username = action.payload
    },
  },
})

export const { setContact, setFirstName, setLastName, setPassword, setUsername } =
  userAdminSlice.actions

export default userAdminSlice.reducer
