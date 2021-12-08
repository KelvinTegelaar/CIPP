const initialState = {
  details: {
    report: {},
    loading: false,
    loaded: false,
    error: undefined,
  },
}

const USER_MAILBOX_DETAILS_LOAD = 'mailbox/USER_MAILBOX_DETAILS_LOAD'
const USER_MAILBOX_DETAILS_LOAD_SUCCESS = 'mailbox/USER_MAILBOX_DETAILS_LOAD_SUCCESS'
const USER_MAILBOX_DETAILS_LOAD_FAIL = 'mailbox/USER_MAILBOX_DETAILS_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case USER_MAILBOX_DETAILS_LOAD:
      return {
        ...state,
        details: {
          ...initialState.details,
          loading: true,
        },
      }
    case USER_MAILBOX_DETAILS_LOAD_SUCCESS:
      return {
        ...state,
        details: {
          loading: false,
          loaded: true,
          report: action.result,
        },
      }
    case USER_MAILBOX_DETAILS_LOAD_FAIL:
      return {
        ...state,
        details: {
          ...initialState.details,
          error: action.error,
        },
      }
    default:
      return state
  }
}

export function listUserMailboxDetails({ tenantDomain, userId }) {
  return {
    types: [
      USER_MAILBOX_DETAILS_LOAD,
      USER_MAILBOX_DETAILS_LOAD_SUCCESS,
      USER_MAILBOX_DETAILS_LOAD_FAIL,
    ],
    promise: (client) =>
      client
        .get('/api/ListUserMailboxDetails', { params: { userId, tenantFilter: tenantDomain } })
        .then((result) => {
          if (result.data && result.data.length > 0) {
            return result.data[0]
          }
          return {}
        }),
  }
}
