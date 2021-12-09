const initialState = {
  voice: {
    list: [],
    loading: false,
    loaded: false,
  },
}

const VOICE_LOAD = 'voice/VOICE_LOAD'
const VOICE_LOAD_SUCCESS = 'voice/VOICE_LOAD_SUCCESS'
const VOICE_LOAD_FAIL = 'voice/VOICE_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case VOICE_LOAD:
      return {
        ...state,
        voice: {
          ...initialState.voice,
          loading: true,
        },
      }
    case VOICE_LOAD_SUCCESS:
      return {
        ...state,
        voice: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case VOICE_LOAD_FAIL:
      return {
        ...state,
        voice: {
          ...initialState.voice,
          error: action.error,
        },
      }
    default:
      return state
  }
}

export function listTeamsVoice({ tenant }) {
  return {
    types: [VOICE_LOAD, VOICE_LOAD_SUCCESS, VOICE_LOAD_FAIL],
    promise: (client) =>
      client
        .get('/api/ListTeamsVoice?Tenantfilter=' + tenant.defaultDomainName)
        .then((result) => result.data),
  }
}
