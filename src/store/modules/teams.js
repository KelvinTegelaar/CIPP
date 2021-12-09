const initialState = {
  activity: {
    list: [],
    loading: false,
    loaded: false,
  },
}

const TEAMS_ACTIVITY_LOAD = 'teams/TEAMS_ACTIVITY_LOAD'
const TEAMS_ACTIVITY_LOAD_SUCCESS = 'teams/TEAMS_ACTIVITY_LOAD_SUCCESS'
const TEAMS_ACTIVITY_LOAD_ERROR = 'teams/TEAMS_ACTIVITY_LOAD_ERROR'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TEAMS_ACTIVITY_LOAD:
      return {
        ...state,
        activity: {
          ...state.activity,
          loading: true,
          loaded: false,
        },
      }
    case TEAMS_ACTIVITY_LOAD_SUCCESS:
      return {
        ...state,
        activity: {
          ...state.activity,
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case TEAMS_ACTIVITY_LOAD_ERROR:
      return {
        ...state,
        activity: {
          ...initialState.activity,
          error: action.error,
        },
      }
    default:
      return state
  }
}

export function listTeamsActivity({ tenantDomain }) {
  return {
    types: [TEAMS_ACTIVITY_LOAD, TEAMS_ACTIVITY_LOAD_SUCCESS, TEAMS_ACTIVITY_LOAD_ERROR],
    promise: (client) =>
      client
        .get('/api/ListTeamsActivity?type=TeamsUserActivityUser&Tenantfilter=' + tenantDomain)
        .then((result) => result.data),
  }
}
