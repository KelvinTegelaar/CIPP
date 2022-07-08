import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activities: [],
  clientValue: '',
  clientId: '',
  contactValue: { id: 0, label: '', email: '' },
  contactEmail: '',
  contactAZId: '',
  contactId: '',
  contactList: [],
  details: '',
  editMode: false,
  issueType: '',
  issueTypeId: '',
  locationId: '',
  techId: '',
  title: '',
  notes: '',
  statusId: 36708,
  dueDate: '',
  queue: 27976,
  priority: 28791,
  selectedContact: [],
  timeEntry: 15,
  timeEntryId: '',
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
    setConfirmedTicketId: (state, action) => {
      state.confirmedTicketId = action.payload
    },
    setContactValue: (state, action) => {
      state.contactValue = action.payload
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
    setEditMode: (state, action) => {
      state.editMode = action.payload
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
    // setSelectedContact: (state, action) => {
    //   state.selectedContact = action.payload
    // },
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
  resetForm,
  setActivities,
  setClientValue,
  setClientId,
  setConfirmedTicketId,
  setContactValue,
  setContactAZId,
  setContactEmail,
  setContactId,
  setContactList,
  setDetails,
  setDueDate,
  setDueDateISO,
  setEditMode,
  setIssueType,
  setIssueTypeId,
  setLocationId,
  setNotes,
  setOpenDate,
  setPriority,
  setQueue,
  setSelectedContact,
  setSourceId,
  setStatusId,
  setTechId,
  setTicketId,
  setTimeEntry,
  setTimeEntryId,
  setTitle,
} = ticketFormSlice.actions

export default ticketFormSlice.reducer
