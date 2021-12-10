import { setModalContent, showModal } from './modal'
import React from 'react'

const initialState = {
  usage: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
  sites: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
}

const SHAREPOINT_LOAD = 'sharepoint/SHAREPOINT_LOAD'
const SHAREPOINT_LOAD_SUCCESS = 'sharepoint/SHAREPOINT_LOAD_SUCCESS'
const SHAREPOINT_LOAD_ERROR = 'sharepoint/SHAREPOINT_LOAD_ERROR'

const SHAREPOINT_SITES_LOAD = 'sharepoint/SHAREPOINT_SITES_LOAD'
const SHAREPOINT_SITES_LOAD_SUCCESS = 'sharepoint/SHAREPOINT_SITES_LOAD_SUCCESS'
const SHAREPOINT_SITES_LOAD_ERROR = 'sharepoint/SHAREPOINT_SITES_LOAD_ERROR'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SHAREPOINT_LOAD:
      return {
        ...state,
        usage: {
          ...state.usage,
          loading: true,
          loaded: false,
        },
      }
    case SHAREPOINT_LOAD_SUCCESS:
      return {
        ...state,
        usage: {
          ...state.usage,
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case SHAREPOINT_LOAD_ERROR:
      return {
        ...state,
        usage: {
          ...initialState.usage,
          error: action.error,
        },
      }
    case SHAREPOINT_SITES_LOAD:
      return {
        ...state,
        sites: {
          ...initialState.sites,
          loading: true,
        },
      }
    case SHAREPOINT_SITES_LOAD_SUCCESS:
      return {
        ...state,
        sites: {
          ...state.sites,
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case SHAREPOINT_SITES_LOAD_ERROR:
      return {
        ...state,
        sites: {
          ...initialState.sites,
          error: action.error,
        },
      }
    default:
      return state
  }
}

export function listSharepointSitesUsage({ tenantDomain }) {
  return {
    types: [SHAREPOINT_LOAD, SHAREPOINT_LOAD_SUCCESS, SHAREPOINT_LOAD_ERROR],
    promise: (client) =>
      client
        .get('/api/ListSites?type=SharePointSiteUsage&Tenantfilter=' + tenantDomain)
        .then((result) => result.data),
  }
}

export function listSharepointSites({ tenantDomain, groupId }) {
  return (dispatch) =>
    dispatch({
      types: [SHAREPOINT_SITES_LOAD, SHAREPOINT_SITES_LOAD_SUCCESS, SHAREPOINT_SITES_LOAD_ERROR],
      hideToastError: true,
      promise: async (client) => {
        try {
          const result = await client.get('/api/ListSites?type=SharepointSiteUsage', {
            params: { TenantFilter: tenantDomain, groupId },
          })

          if (result.data && result.data.length > 0) {
            return result.data[0]
          }

          dispatch(setModalContent({ body: 'Error loading group', title: 'Group not found' }))
          dispatch(showModal())
          dispatch({
            type: SHAREPOINT_SITES_LOAD_ERROR,
            hideToastError: true,
            error: new Error('Group not found'),
          })
          return {}
        } catch (error) {
          dispatch(
            setModalContent({
              body: (
                <div>
                  Error loading group
                  <br />
                  <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
              ),
              title: 'Group not found',
            }),
          )
          dispatch(showModal())
          return error
        }
      },
    })
}
