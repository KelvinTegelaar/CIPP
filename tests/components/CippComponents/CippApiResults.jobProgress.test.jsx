import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippApiResults } from '../../../src/components/CippComponents/CippApiResults'
import { ApiGetCall } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({ ApiGetCall: vi.fn() }))
vi.mock('../../../src/components/CippComponents/CippJobProgress', () => ({
  CippJobProgress: () => null,
  formatJobProgressText: () => '',
}))
vi.mock('../../../src/components/CippComponents/CippCopyToClipboard', () => ({
  CippCopyToClipBoard: () => null,
}))
vi.mock('../../../src/components/CippComponents/CippDocsLookup', () => ({
  CippDocsLookup: () => null,
}))
vi.mock('../../../src/components/CippComponents/CippTableDialog', () => ({
  CippTableDialog: () => null,
}))

const queued = {
  data: {
    data: {
      Results: [{ resultText: 'Queued', state: 'info' }],
      DeploymentId: 'job-1',
    },
  },
  isFetching: false,
  isPending: false,
  isSuccess: true,
  isError: false,
  error: null,
}

describe('CippApiResults jobProgress', () => {
  it('polls the returned job id and calls onComplete once when every row is terminal', async () => {
    const rows = [
      { Name: 'victim@contoso.com', Status: 'succeeded', Steps: [] },
    ]
    ApiGetCall.mockImplementation(({ url }) =>
      url
        ? { data: rows, dataUpdatedAt: 1 }
        : { data: undefined, dataUpdatedAt: 0 }
    )
    const onComplete = vi.fn()
    const jobProgress = {
      idField: 'DeploymentId',
      url: (id) => `/api/ListOffboardingProgress?DeploymentId=${id}`,
      onComplete,
    }
    // a parent re-render with the same (memoized) jobProgress must not re-arm the poll
    const Harness = () => {
      const [n, setN] = React.useState(0)
      return (
        <>
          <button onClick={() => setN(n + 1)}>bump {n}</button>
          <CippApiResults apiObject={queued} jobProgress={jobProgress} />
        </>
      )
    }
    renderWithProviders(<Harness />)
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1))
    expect(onComplete).toHaveBeenCalledWith(rows)
    expect(ApiGetCall).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/ListOffboardingProgress?DeploymentId=job-1',
      })
    )
    fireEvent.click(screen.getByRole('button', { name: /bump/ }))
    fireEvent.click(screen.getByRole('button', { name: /bump/ }))
    expect(screen.getByRole('button', { name: 'bump 2' })).toBeInTheDocument()
    await new Promise((r) => setTimeout(r, 50))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('does not complete while a row is still running', async () => {
    ApiGetCall.mockImplementation(({ url }) =>
      url
        ? {
            data: [{ Name: 'u', Status: 'running', Steps: [] }],
            dataUpdatedAt: 1,
          }
        : { data: undefined, dataUpdatedAt: 0 }
    )
    const onComplete = vi.fn()
    renderWithProviders(
      <CippApiResults
        apiObject={queued}
        jobProgress={{
          idField: 'DeploymentId',
          url: (id) => `/x?id=${id}`,
          onComplete,
        }}
      />
    )
    await new Promise((r) => setTimeout(r, 50))
    expect(onComplete).not.toHaveBeenCalled()
  })
})
