import { createSlice } from '@reduxjs/toolkit'

export const ticketSlice = createSlice({
  name: 'ticket',
  initialState: {
    techId: '',
    client: '',
    clientId: '',
    contact: '',
    contactList: [],
    locationId: '',
    issueType: '',
    title: '',
    notes: '',
    status: 36708,
    dueDate: '',
    queue: 27976,
    priority: 28791,
    timeEntry: 15,
    ticketId: '',
  },
  reducers: {
    setTechId: (state, action) => {
      state.techId = action.payload
    },
    setClient: (state, action) => {
      state.client = action.payload
    },
    setClientId: (state, action) => {
      state.clientId = action.payload
    },
    setContact: (state, action) => {
      state.contact = action.payload
    },
    setContactList: (state, action) => {
      state.contactList = action.payload
    },
    setLocationId: (state, action) => {
      state.locationId = action.payload
    },
    setIssueType: (state, action) => {
      state.issueType = action.payload
    },
    setTitle: (state, action) => {
      state.title = action.payload
    },
    setNotes: (state, action) => {
      state.notes = action.payload
    },
    setStatus: (state, action) => {
      state.status = action.payload
    },
    setDueDate: (state, action) => {
      state.dueDate = action.payload
    },
    setDueDateISO: (state, action) => {
      state.dueDateISO = action.payload
    },
    setQueue: (state, action) => {
      state.queue = action.payload
    },
    setPriority: (state, action) => {
      state.priority = action.payload
    },
    setTimeEntry: (state, action) => {
      state.timeEntry = action.payload
    },
    setTicketId: (state, action) => {
      state.ticketId = action.payload
    },
  },
})

export const {
  setTechId,
  setClient,
  setClientId,
  setContact,
  setContactList,
  setLocationId,
  setIssueType,
  setTitle,
  setNotes,
  setStatus,
  setDueDate,
  setDueDateISO,
  setQueue,
  setPriority,
  setTimeEntry,
  setTicketId,
} = ticketSlice.actions

export default ticketSlice.reducer
