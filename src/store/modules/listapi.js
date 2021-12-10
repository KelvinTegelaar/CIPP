const initialState = {
  list: {
    list: [],
    loading: false,
    loaded: false,
  },
}

const API_LOAD = 'listapi/API_LOAD'
const API_LOAD_SUCCESS = 'listapi/API_LOAD_SUCCESS'
const API_LOAD_FAIL = 'listapi/API_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case API_LOAD:
      return {
        ...state,
        list: {
          ...initialState.list,
          loading: true,
        },
      }
    case API_LOAD_SUCCESS:
      return {
        ...state,
        list: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case API_LOAD_FAIL:
      return {
        ...state,
        list: {
          ...initialState.list,
          error: action.error,
        },
      }
    default:
      return state
  }
}

export function getListApi({ apiname }, { tenant }) {
  return {
    types: [API_LOAD, API_LOAD_SUCCESS, API_LOAD_FAIL],
    promise: (client) =>
      client
        .get(apiname + '?Tenantfilter=' + tenant.defaultDomainName)
        .then((result) => result.data),
  }
}
