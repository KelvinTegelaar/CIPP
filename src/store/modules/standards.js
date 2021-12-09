const initialState = {
  bpa: {
    report: [],
    loading: false,
    loaded: false,
    updateMessage: null,
  },
  domains: {
    report: [],
    loading: false,
    loaded: false,
    updateMessage: null,
  },
  list: {
    list: [],
    loading: false,
    loaded: false,
    updateMessage: null,
  },
  deploy: {
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

const DOMAINS_LOAD = 'standards/DOMAINS_LOAD'
const DOMAINS_LOAD_ERROR = 'standards/DOMAINS_LOAD_ERROR'
const DOMAINS_LOAD_SUCCESS = 'standards/DOMAINS_LOAD_SUCCESS'

const DOMAINS_UPDATE = 'standards/DOMAINS_UPDATE'
const DOMAINS_UPDATE_ERROR = 'standards/DOMAINS_UPDATE_ERROR'
const DOMAINS_UPDATE_SUCCESS = 'standards/DOMAINS_UPDATE_SUCCESS'

const APPLY_STANDARDS = 'standards/APPLY_STANDARDS'
const APPLY_STANDARDS_ERROR = 'standards/APPLY_STANDARDS_ERROR'
const APPLY_STANDARDS_SUCCESS = 'standards/APPLY_STANDARDS_SUCCESS'

const LIST_STANDARDS = 'standards/LIST_STANDARDS'
const LIST_STANDARDS_ERROR = 'standards/LIST_STANDARDS_ERROR'
const LIST_STANDARDS_SUCCESS = 'standards/LIST_STANDARDS_SUCCESS'

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
    case LIST_STANDARDS:
      return {
        ...state,
        list: {
          ...state.list,
          loading: true,
          loaded: false,
        },
      }
    case LIST_STANDARDS_SUCCESS:
      return {
        ...state,
        list: {
          ...state.list,
          list: action.result,
          loading: false,
          loaded: true,
        },
      }
    case LIST_STANDARDS_ERROR:
      return {
        ...state,
        list: {
          ...state.list,
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
    case DOMAINS_LOAD:
      return {
        ...state,
        domains: {
          ...state.domains,
          loading: true,
          loaded: false,
        },
      }
    case DOMAINS_LOAD_SUCCESS:
      return {
        ...state,
        domains: {
          ...state.domains,
          loading: false,
          loaded: true,
          report: action.result,
        },
      }
    case DOMAINS_LOAD_ERROR:
      return {
        ...state,
        domains: {
          ...state.domains,
          loading: false,
          loaded: false,
        },
      }
    case APPLY_STANDARDS:
      return {
        ...state,
        deploy: {
          ...state.deploy,
          loading: true,
          loaded: false,
        },
      }
    case APPLY_STANDARDS_SUCCESS:
      return {
        ...state,
        deploy: {
          ...state,
          loading: false,
          loaded: true,
          updateMessage: action.result,
        },
      }
    default:
      return state
  }
}

export function listAppliedStandards() {
  return {
    types: [LIST_STANDARDS, LIST_STANDARDS_ERROR, LIST_STANDARDS_SUCCESS],
    promise: (client) => client.get('/api/ListStandards').then((result) => result.data),
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

export function loadDomainsAnalyserReport() {
  return {
    types: [DOMAINS_LOAD, DOMAINS_LOAD_SUCCESS, DOMAINS_LOAD_ERROR],
    promise: (client) => client.get('/api/DomainAnalyser_List').then((result) => result.data),
  }
}

export function forceRefreshDomainAnalyserReport() {
  return {
    // @TODO not bound to store
    types: [DOMAINS_UPDATE, DOMAINS_UPDATE_SUCCESS, DOMAINS_UPDATE_ERROR],
    promise: (client) =>
      client.get('/api/DomainAnalyser_OrchestrationStarter').then((result) => result.data),
  }
}

export function applyStandards({ tenants = [], standards = {} }) {
  return {
    types: [APPLY_STANDARDS, APPLY_STANDARDS_SUCCESS, APPLY_STANDARDS_ERROR],
    promise: (client) =>
      client.post('/api/AddStandardsDeploy', {
        data: {
          tenants: tenants.map((tenant) => tenant.defaultDomainName),
          standards,
        },
      }),
  }
}
