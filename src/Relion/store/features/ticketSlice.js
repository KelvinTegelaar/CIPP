import { createSlice } from '@reduxjs/toolkit'

export const ticketSlice = createSlice({
  name: 'ticket',
  initialState: {
    client: '',
    clientId: '',
    contact: '',
    contactEmail: '',
    contactAZId: '',
    contactId: '',
    contactList: [],
    issueType: '',
    issueTypeId: '',
    locationId: '',
    techId: '',
    title: '',
    notes: '',
    status: 36708,
    dueDate: '',
    queue: 27976,
    priority: 28791,
    selectedContact: [],
    ticketMyCount: 0,
    ticketNewCount: 0,
    ticketRespondedCount: 0,
    timeEntry: 15,
    timeEntryId: '',
    ticketId: '',
  },
  reducers: {
    setClient: (state, action) => {
      state.client = action.payload
    },
    setClientId: (state, action) => {
      state.clientId = action.payload
    },
    setConfirmedTicketId: (state, action) => {
      state.confirmedTicketId = action.payload
    },
    setContact: (state, action) => {
      state.contact = action.payload
    },
    setContactEmail: (state, action) => {
      state.contactEmail = action.payload
    },
    setContactAZId: (state, action) => {
      state.contactAZId = action.payload
    },
    setContactId: (state, action) => {
      state.contactId = action.payload
    },
    setContactList: (state, action) => {
      state.contactList = action.payload
    },
    setDueDate: (state, action) => {
      state.dueDate = action.payload
    },
    setDueDateISO: (state, action) => {
      state.dueDateISO = action.payload
    },
    setIssueType: (state, action) => {
      state.issueType = action.payload
    },
    setIssueTypeId: (state, action) => {
      state.issueTypeId = action.payload
    },
    setLocationId: (state, action) => {
      state.locationId = action.payload
    },
    setNotes: (state, action) => {
      state.notes = action.payload
    },
    setOpenDate: (state, action) => {
      state.openDate = action.payload
    },
    setPriority: (state, action) => {
      state.priority = action.payload
    },
    setQueue: (state, action) => {
      state.queue = action.payload
    },
    setSelectedContact: (state, action) => {
      state.selectedContact = action.payload
    },
    setSourceId: (state, action) => {
      state.sourceId = action.payload
    },
    setStatus: (state, action) => {
      state.status = action.payload
    },
    setStatusId: (state, action) => {
      state.statusId = action.payload
    },
    setTechId: (state, action) => {
      state.techId = action.payload
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
    setTimeEntryId: (state, action) => {
      state.timeEntryId = action.payload
    },
    setTimeEntry: (state, action) => {
      state.timeEntry = action.payload
    },
    setTicketId: (state, action) => {
      state.ticketId = action.payload
    },
    setTitle: (state, action) => {
      state.title = action.payload
    },
  },
})

export const {
  setClient,
  setClientId,
  setConfirmedTicketId,
  setContact,
  setContactAZId,
  setContactEmail,
  setContactId,
  setContactList,
  setDueDate,
  setDueDateISO,
  setIssueType,
  setIssueTypeId,
  setLocationId,
  setNotes,
  setOpenDate,
  setPriority,
  setQueue,
  setSelectedContact,
  setSourceId,
  setStatus,
  setStatusId,
  setTechId,
  setTicketId,
  setTicketMyCount,
  setTicketNewCount,
  setTicketRespondedCount,
  setTimeEntry,
  setTimeEntryId,
  setTitle,
} = ticketSlice.actions

export default ticketSlice.reducer
