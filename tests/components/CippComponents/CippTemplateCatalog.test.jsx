import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { api, getResult, postResult } from '../../mocks/api-call'
import { CippTemplateCatalog } from '../../../src/components/CippComponents/CippTemplateCatalog'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)

// jsdom has no layout, so the virtual list would render no rows
vi.mock('react-virtuoso', () => ({
  Virtuoso: ({ totalCount, itemContent }) => (
    <div>
      {Array.from({ length: totalCount }, (_, index) => (
        <div key={index}>{itemContent(index)}</div>
      ))}
    </div>
  ),
}))

const catalog = getResult({
  data: {
    Results: [
      {
        DisplayName: 'Sample Template',
        Type: 'Standards',
        Category: 'Standards',
        Repository: 'contoso/templates',
        Path: 'StandardsTemplateV2/Sample.json',
        Branch: 'main',
        Imported: true,
      },
    ],
  },
})

beforeEach(() => {
  api.get = () => catalog
  api.post = postResult()
})

describe('CippTemplateCatalog', () => {
  it('sends Force on the first import click after the switch is turned on', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippTemplateCatalog />)

    await user.click(screen.getByRole('switch', { name: /force re-import/i }))
    await user.click(screen.getByRole('button', { name: /^import$/i }))

    expect(api.post.mutate).toHaveBeenCalledTimes(1)
    expect(api.post.mutate.mock.calls[0][0].data[0]).toMatchObject({
      Action: 'ImportTemplate',
      Path: 'StandardsTemplateV2/Sample.json',
      Force: true,
    })
  })

  it('sends Force false while the switch is off', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippTemplateCatalog />)

    await user.click(screen.getByRole('button', { name: /^import$/i }))

    expect(api.post.mutate.mock.calls[0][0].data[0].Force).toBe(false)
  })
})
