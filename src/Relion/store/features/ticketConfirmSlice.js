import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  ticketConfirmId: '',
  setTimeEntryConfirmId: '',
}

// controls the 20 second submitted ticket display
export const ticketConfirmSlice = createSlice({
  name: 'ticketConfirm',
  initialState: initialState,
  reducers: {
    setTicketConfirmId: (state, action) => {
      state.ticketConfirmId = action.payload
    },
    setTimeEntryConfirmId: (state, action) => {
      state.timeEntryConfirmId = action.payload
    },
  },
})

export const { setTicketConfirmId, setTimeEntryConfirmId } = ticketConfirmSlice.actions

export default ticketConfirmSlice.reducer
