import { createSlice } from '@reduxjs/toolkit'

export const ticketListSlice = createSlice({
  name: 'ticketList',
  initialState: {
    ticketMyCount: 0,
    ticketNewCount: 0,
    ticketRespondedCount: 0,
  },
  reducers: {
    setTicketMyCount: (state, action) => {
      state.ticketMyCount = action.payload
    },
    setTicketNewCount: (state, action) => {
      state.ticketNewCount = action.payload
    },
    setTicketRespondedCount: (state, action) => {
      state.ticketRespondedCount = action.payload
    },
  },
})

export const { setTicketMyCount, setTicketNewCount, setTicketRespondedCount } =
  ticketListSlice.actions

export default ticketListSlice.reducer
