import { createSlice } from '@reduxjs/toolkit'

export const ticketListSlice = createSlice({
  name: 'ticketList',
  initialState: {
    issueTypeCount: [],
    ticketMyCount: 0,
    ticketNewCount: 0,
    ticketRespondedCount: 0,
  },
  reducers: {
    setIssueTypeCount: (state, action) => {
      state.issueTypeCount = action.payload
    },
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

export const { setIssueTypeCount, setTicketMyCount, setTicketNewCount, setTicketRespondedCount } =
  ticketListSlice.actions

export default ticketListSlice.reducer
