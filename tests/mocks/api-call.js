// shared mock for src/api/ApiCall. usage in a test file:
//   vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
//   import { api, getResult, paginatedResult } from '../../mocks/api-call'
// build results ONCE (module scope or per test) and assign to api.*, a fresh
// literal per mock call loops CippDataTable's data-sync effect and
// CippAutoComplete's mapping effect. assign a function to route by call opts
// (api.get = (opts) => opts.url === '/api/X' ? xResult : defaultResult), the
// routed results still need stable identity.
import { vi } from 'vitest'

export const getResult = (overrides = {}) => ({
  isSuccess: true,
  isFetching: false,
  isLoading: false,
  isError: false,
  data: undefined,
  refetch: vi.fn(),
  ...overrides,
})

export const paginatedResult = (rows = [], overrides = {}) => ({
  isSuccess: true,
  isFetching: false,
  isLoading: false,
  isError: false,
  data: { pages: [{ Results: rows }] },
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
  ...overrides,
})

export const postResult = (overrides = {}) => ({
  mutate: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  data: undefined,
  error: null,
  ...overrides,
})

// per-file live state (vitest isolates module registries per test file)
export const api = {
  get: getResult({ isSuccess: false }),
  paginated: paginatedResult(),
  post: postResult(),
}

export const apiCallMock = () => ({
  ApiGetCall: vi.fn((opts) => (typeof api.get === 'function' ? api.get(opts) : api.get)),
  ApiPostCall: vi.fn((opts) => (typeof api.post === 'function' ? api.post(opts) : api.post)),
  ApiGetCallWithPagination: vi.fn((opts) =>
    typeof api.paginated === 'function' ? api.paginated(opts) : api.paginated
  ),
})
