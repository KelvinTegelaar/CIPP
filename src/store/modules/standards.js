const initialState = {
  bpa: {
    report: [],
    loading: false,
    loaded: false,
    updateMessage: null,
  },
}

const BPA_LOAD = 'standards/BPA_LOAD'
const BPA_LOAD_ERROR = 'standards/BPA_LOAD_ERROR'
const BPA_LOAD_SUCCESS = 'standards/BPA_LOAD_SUCCESS'

const BPA_UPDATE = 'standards/BPA_UPDATE'
const BPA_UPDATE_ERROR = 'standards/BPA_UPDATE_ERROR'
const BPA_UPDATE_SUCCESS = 'standards/BPA_UPDATE_SUCCESS'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case BPA_LOAD:
      return {
        ...state,
        bpa: {
          ...state.bpa,
          loading: true,
          loaded: false,
        },
      }
    case BPA_LOAD_SUCCESS:
      return {
        ...state,
        bpa: {
          ...state.bpa,
          report: action.result,
          loading: false,
          loaded: true,
        },
      }
    case BPA_LOAD_ERROR:
      return {
        ...state,
        bpa: {
          ...state.bpa,
          loading: false,
          loaded: false,
        },
      }
    case BPA_UPDATE:
      return {
        ...state,
        bpa: {
          ...state.bpa,
          updateMessage: null,
        },
      }
    case BPA_UPDATE_SUCCESS:
      return {
        ...state,
        bpa: {
          ...state.bpa,
          updateMessage: action.result,
        },
      }
    case BPA_UPDATE_ERROR:
      return {
        ...state,
        bpa: {
          ...state.bpa,
          updateMessage: action.result,
        },
      }
    default:
      return state
  }
}

export function loadBestPracticeReport() {
  return {
    types: [BPA_LOAD, BPA_LOAD_SUCCESS, BPA_LOAD_ERROR],
    promise: (client) => client.get('/api/BestPracticeAnalyser_List').then((result) => result.data),
  }
}

export function forceRefreshBestPracticeReport() {
  return {
    types: [BPA_UPDATE, BPA_UPDATE_SUCCESS, BPA_UPDATE_ERROR],
    promise: (client) =>
      client.get('/api/BestPracticeAnalyser_OrchestrationStarter').then((result) => result.data),
  }
}
