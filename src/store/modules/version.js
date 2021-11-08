const initialState = {
  versions: {
    LocalCIPPVersion: '',
    RemoteCIPPVersion: '',
    LocalCIPPAPIVersion: '',
    RemoteCIPPAPIVersion: '',
    OutOfDateCIPP: false,
    OutOfDateCIPPAPI: false,
    loading: false,
    loaded: false,
  },
}

const VERSION_LOAD = 'version/VERSION_LOAD'
const VERSION_LOAD_ERROR = 'version/VERSION_LOAD_ERROR'
const VERSION_LOAD_SUCCESS = 'version/VERSION_LOAD_SUCCESS'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case VERSION_LOAD:
      return {
        ...state,
        versions: {
          ...state.versions,
          loading: true,
          loaded: false,
        },
      }
    case VERSION_LOAD_SUCCESS:
      return {
        ...state,
        versions: {
          ...action.result,
          loading: false,
          loaded: true,
        },
      }
    default:
      return state
  }
}

export function loadVersion() {
  return {
    types: [VERSION_LOAD, VERSION_LOAD_SUCCESS, VERSION_LOAD_ERROR],
    promise: (client) =>
      client.get('/version_latest.txt').then((result) => {
        return client
          .get('/api/GetVersion?localversion=' + result.data)
          .then((nextResult) => nextResult.data)
      }),
  }
}
