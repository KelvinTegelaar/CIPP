import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activities: [],
  clientValue: '',
  clientId: '',
  contactValue: { id: 0, label: '', email: '' },
  contactEmail: '',
  contactId: '',
  contactList: [],
  details: '',
  defaultDomainName: '',
  domain: '',
  editMode: false,
  issueType: '',
  issueTypeId: '',
  label: '',
  locationId: '',
  techId: '',
  title: '',
  notes: '',
  statusId: 36708,
  dueDate: '',
  pax8: '',
  queue: 27976,
  priority: 28791,
  timeEntry: 15,
  ticketId: '',
}

export const ticketFormSlice = createSlice({
  name: 'ticketForm',
  initialState: initialState,
  reducers: {
    resetForm: () => initialState,
    setActivities: (state, action) => {
      state.activities = action.payload
    },
    setClientValue: (state, action) => {
      state.clientValue = action.payload
    },
    setClientId: (state, action) => {
      state.clientId = action.payload
    },
    setContactValue: (state, action) => {
      state.contactValue = action.payload
    },
    setContactEmail: (state, action) => {
      state.contactEmail = action.payload
    },
    setContactId: (state, action) => {
      state.contactId = action.payload
    },
    setContactList: (state, action) => {
      state.contactList = action.payload
    },
    setDefaultDomainName: (state, action) => {
      state.defaultDomainName = action.payload
    },
    setDomain: (state, action) => {
      state.domain = action.payload
    },
    setDueDate: (state, action) => {
      state.dueDate = action.payload
    },
    setDueDateISO: (state, action) => {
      state.dueDateISO = action.payload
    },
    setEditMode: (state, action) => {
      state.editMode = action.payload
    },
    setIssueType: (state, action) => {
      state.issueType = action.payload
    },
    setIssueTypeId: (state, action) => {
      state.issueTypeId = action.payload
    },
    setLabel: (state, action) => {
      state.label = action.payload
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
    setPax8: (state, action) => {
      state.pax8 = action.payload
    },
    setPriority: (state, action) => {
      state.priority = action.payload
    },
    setQueue: (state, action) => {
      state.queue = action.payload
    },
    setSourceId: (state, action) => {
      state.sourceId = action.payload
    },
    setStatusId: (state, action) => {
      state.statusId = action.payload
    },
    setTechId: (state, action) => {
      state.techId = action.payload
    },
    setDetails: (state, action) => {
      state.details = action.payload
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
  resetForm,
  setActivities,
  setClientValue,
  setClientId,
  setConfirmedTicketId,
  setContactValue,
  setContactEmail,
  setContactId,
  setContactList,
  setDefaultDomainName,
  setDetails,
  setDomain,
  setDueDate,
  setDueDateISO,
  setEditMode,
  setIssueType,
  setIssueTypeId,
  setLabel,
  setLocationId,
  setNotes,
  setOpenDate,
  setPax8,
  setPriority,
  setQueue,
  setSourceId,
  setStatusId,
  setTechId,
  setTicketId,
  setTimeEntry,
  setTitle,
} = ticketFormSlice.actions

export default ticketFormSlice.reducer
