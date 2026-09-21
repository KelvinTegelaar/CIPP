import React, { useEffect } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippAddEditUser from '../../../src/components/CippFormPages/CippAddEditUser'
import { ApiGetCall } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
  })),
  ApiGetCallWithPagination: vi.fn(() => ({
    isSuccess: false,
    isFetching: false,
    isError: false,
    data: undefined,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  })),
}))

// The page also renders a license picker (which pulls in the 2.2 MB M365Licenses dataset), user
// and domain selectors, and the data-table stack. None of them take part in group handling, and
// loading them all is enough to exhaust the test worker, so they are stubbed out. The group field
// itself stays real - it is the thing under test.
vi.mock(
  '../../../src/components/CippComponents/CippFormLicenseSelector',
  () => ({
    CippFormLicenseSelector: () => (
      <div data-testid="CippFormLicenseSelector" />
    ),
    default: () => <div data-testid="CippFormLicenseSelector" />,
  })
)
vi.mock('../../../src/components/CippComponents/CippFormUserSelector', () => ({
  CippFormUserSelector: () => <div data-testid="CippFormUserSelector" />,
  default: () => <div data-testid="CippFormUserSelector" />,
}))
vi.mock(
  '../../../src/components/CippComponents/CippFormDomainSelector',
  () => ({
    CippFormDomainSelector: () => <div data-testid="CippFormDomainSelector" />,
    default: () => <div data-testid="CippFormDomainSelector" />,
  })
)
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => <div data-testid="CippDataTable" />,
  default: () => <div data-testid="CippDataTable" />,
}))

// Shape mirrors /api/ListGroups: groupType is the display string the backend derives from
// groupTypes/mailEnabled/securityEnabled, and it decides whether the add goes to Graph or Exchange.
const TENANT_GROUPS = [
  {
    id: 'group-all-users',
    displayName: 'All-Users',
    groupType: 'Security',
    calculatedGroupType: 'generic',
  },
  {
    id: 'group-ieq-all',
    displayName: 'IEQ - ALL',
    groupType: 'Microsoft 365',
    calculatedGroupType: 'm365',
  },
  {
    id: 'group-all-office',
    displayName: 'All Office',
    groupType: 'Distribution List',
    calculatedGroupType: 'distributionList',
  },
  {
    id: 'group-ieq-team',
    displayName: 'IEQ-Team',
    groupType: 'Distribution List',
    calculatedGroupType: 'distributionList',
  },
  {
    id: 'group-lax',
    displayName: 'SG-Office-LAX',
    groupType: 'Security',
    calculatedGroupType: 'generic',
  },
  {
    id: 'group-koyfin',
    displayName: 'SG-APP-Koyfin',
    groupType: 'Security',
    calculatedGroupType: 'generic',
  },
]

// A template as /api/ListNewUserDefaults returns it. addToGroups entries are stored the way the
// form posted them, so older templates hold bare Graph group objects and newer ones hold
// autocomplete options.
const makeTemplate = (overrides = {}) => ({
  GUID: 'template-guid',
  templateName: 'Standard Onboarding',
  defaultForTenant: false,
  ...overrides,
})

function mockApis({ templates = [], groups = TENANT_GROUPS } = {}) {
  ApiGetCall.mockImplementation(({ url }) => {
    if (url.startsWith('/api/ListNewUserDefaults')) {
      return {
        isSuccess: true,
        isFetching: false,
        data: templates,
        refetch: vi.fn(),
      }
    }
    if (url.startsWith('/api/ListGroups')) {
      return {
        isSuccess: true,
        isFetching: false,
        data: groups,
        refetch: vi.fn(),
      }
    }
    return { isSuccess: true, isFetching: false, data: [], refetch: vi.fn() }
  })
}

// Exposes the live form state to assertions without reaching into the component.
let formApi = null
function Harness({ defaultValues = {}, formType = 'add' }) {
  const formControl = useForm({ mode: 'onChange', defaultValues })
  // Published from an effect rather than during render so the harness stays side-effect free.
  useEffect(() => {
    formApi = formControl
  }, [formControl])
  return (
    <CippAddEditUser
      formControl={formControl}
      formType={formType}
      userSettingsDefaults={{ userAttributes: [] }}
    />
  )
}

const selectTemplate = (template) =>
  act(() => {
    formApi.setValue('userTemplate', {
      label: template.templateName,
      value: template.GUID,
      addedFields: template,
    })
  })

const groupNames = () =>
  (formApi.getValues('AddToGroups') || []).map((g) => g.label)

describe('CippAddEditUser - Add to Groups', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    formApi = null
    mockApis()
  })

  describe('applying groups from a template', () => {
    it('carries the group type through so distribution lists are routed to Exchange', async () => {
      const template = makeTemplate({
        addToGroups: [
          {
            label: 'All Office',
            value: 'group-all-office',
            addedFields: { groupType: 'Distribution List' },
          },
          {
            label: 'All-Users',
            value: 'group-all-users',
            addedFields: { groupType: 'Security' },
          },
        ],
      })
      mockApis({ templates: [template] })
      renderWithProviders(<Harness />)

      await selectTemplate(template)

      await waitFor(() =>
        expect(groupNames()).toEqual(['All Office', 'All-Users'])
      )
      const groups = formApi.getValues('AddToGroups')
      expect(groups[0].addedFields.groupType).toBe('Distribution List')
      expect(groups[1].addedFields.groupType).toBe('Security')
    })

    it('derives the group type when the template stored raw Graph group objects', async () => {
      // Older templates were saved straight from Graph, before the form wrapped selections in
      // autocomplete options. The type has to be reconstructed from the Graph flags.
      const template = makeTemplate({
        addToGroups: [
          {
            id: 'group-ieq-all',
            displayName: 'IEQ - ALL',
            groupTypes: ['Unified'],
            mailEnabled: true,
            securityEnabled: false,
          },
          {
            id: 'group-all-office',
            displayName: 'All Office',
            groupTypes: [],
            mailEnabled: true,
            securityEnabled: false,
          },
          {
            id: 'group-lic',
            displayName: 'SG-LIC-M365',
            groupTypes: [],
            mailEnabled: true,
            securityEnabled: true,
          },
          {
            id: 'group-all-users',
            displayName: 'All-Users',
            groupTypes: [],
            mailEnabled: false,
            securityEnabled: true,
          },
        ],
      })
      mockApis({ templates: [template] })
      renderWithProviders(<Harness />)

      await selectTemplate(template)

      await waitFor(() => expect(groupNames()).toHaveLength(4))
      expect(
        formApi.getValues('AddToGroups').map((g) => g.addedFields.groupType)
      ).toEqual([
        'Microsoft 365',
        'Distribution list',
        'Mail-Enabled Security',
        'Security',
      ])
    })

    it('reads the legacy groupMemberships key as well as addToGroups', async () => {
      const template = makeTemplate({
        groupMemberships: [
          {
            id: 'group-all-users',
            displayName: 'All-Users',
            groupTypes: [],
            mailEnabled: false,
            securityEnabled: true,
          },
        ],
      })
      mockApis({ templates: [template] })
      renderWithProviders(<Harness />)

      await selectTemplate(template)

      await waitFor(() => expect(groupNames()).toEqual(['All-Users']))
      expect(formApi.getValues('AddToGroups')[0].value).toBe('group-all-users')
    })

    it('accepts a template that stores a single group outside an array', async () => {
      const template = makeTemplate({
        addToGroups: {
          label: 'All-Users',
          value: 'group-all-users',
          addedFields: { groupType: 'Security' },
        },
      })
      mockApis({ templates: [template] })
      renderWithProviders(<Harness />)

      await selectTemplate(template)

      await waitFor(() => expect(groupNames()).toEqual(['All-Users']))
    })

    it('replaces the previous template groups when the operator switches template', async () => {
      const first = makeTemplate({
        GUID: 'template-a',
        templateName: 'Template A',
        addToGroups: [
          {
            label: 'All-Users',
            value: 'group-all-users',
            addedFields: { groupType: 'Security' },
          },
        ],
      })
      const second = makeTemplate({
        GUID: 'template-b',
        templateName: 'Template B',
        addToGroups: [
          {
            label: 'IEQ-Team',
            value: 'group-ieq-team',
            addedFields: { groupType: 'Distribution List' },
          },
        ],
      })
      mockApis({ templates: [first, second] })
      renderWithProviders(<Harness />)

      await selectTemplate(first)
      await waitFor(() => expect(groupNames()).toEqual(['All-Users']))

      await selectTemplate(second)
      await waitFor(() => expect(groupNames()).toEqual(['IEQ-Team']))
    })

    it('clears template groups when switching to a template that defines none', async () => {
      const withGroups = makeTemplate({
        GUID: 'template-a',
        templateName: 'Template A',
        addToGroups: [
          {
            label: 'All-Users',
            value: 'group-all-users',
            addedFields: { groupType: 'Security' },
          },
        ],
      })
      const withoutGroups = makeTemplate({
        GUID: 'template-b',
        templateName: 'Template B',
      })
      mockApis({ templates: [withGroups, withoutGroups] })
      renderWithProviders(<Harness />)

      await selectTemplate(withGroups)
      await waitFor(() => expect(groupNames()).toEqual(['All-Users']))

      await selectTemplate(withoutGroups)
      await waitFor(() => expect(groupNames()).toEqual([]))
    })
  })

  describe('groups added manually on top of a template', () => {
    // The reported symptom: the template groups apply, the operator appends a few more, and the
    // extras either disappear from the field or stay on screen but never reach the API. Both come
    // from the template-apply effect running again and overwriting the field.
    it('keeps a manually appended group', async () => {
      const template = makeTemplate({
        addToGroups: [
          {
            label: 'All-Users',
            value: 'group-all-users',
            addedFields: { groupType: 'Security' },
          },
        ],
      })
      mockApis({ templates: [template] })
      renderWithProviders(<Harness />)

      await selectTemplate(template)
      await waitFor(() => expect(groupNames()).toEqual(['All-Users']))

      // What the autocomplete's onChange does when the operator picks another group.
      await act(() => {
        formApi.setValue('AddToGroups', [
          ...formApi.getValues('AddToGroups'),
          {
            label: 'SG-Office-LAX',
            value: 'group-lax',
            addedFields: { groupType: 'Security' },
          },
        ])
      })

      await waitFor(() =>
        expect(groupNames()).toEqual(['All-Users', 'SG-Office-LAX'])
      )
    })

    it('keeps several manually appended groups', async () => {
      const template = makeTemplate({
        addToGroups: [
          {
            label: 'All-Users',
            value: 'group-all-users',
            addedFields: { groupType: 'Security' },
          },
          {
            label: 'IEQ - ALL',
            value: 'group-ieq-all',
            addedFields: { groupType: 'Microsoft 365' },
          },
        ],
      })
      mockApis({ templates: [template] })
      renderWithProviders(<Harness />)

      await selectTemplate(template)
      await waitFor(() => expect(groupNames()).toHaveLength(2))

      const extras = [
        {
          label: 'SG-Office-LAX',
          value: 'group-lax',
          addedFields: { groupType: 'Security' },
        },
        {
          label: 'SG-APP-Koyfin',
          value: 'group-koyfin',
          addedFields: { groupType: 'Security' },
        },
        {
          label: 'All Office',
          value: 'group-all-office',
          addedFields: { groupType: 'Distribution List' },
        },
      ]
      // Appended one at a time, the way the field is actually filled in.
      for (const extra of extras) {
        await act(() => {
          formApi.setValue('AddToGroups', [
            ...formApi.getValues('AddToGroups'),
            extra,
          ])
        })
      }

      await waitFor(() =>
        expect(groupNames()).toEqual([
          'All-Users',
          'IEQ - ALL',
          'SG-Office-LAX',
          'SG-APP-Koyfin',
          'All Office',
        ])
      )
    })

    it('keeps a manual removal of a template group', async () => {
      const template = makeTemplate({
        addToGroups: [
          {
            label: 'All-Users',
            value: 'group-all-users',
            addedFields: { groupType: 'Security' },
          },
          {
            label: 'IEQ-Team',
            value: 'group-ieq-team',
            addedFields: { groupType: 'Distribution List' },
          },
        ],
      })
      mockApis({ templates: [template] })
      renderWithProviders(<Harness />)

      await selectTemplate(template)
      await waitFor(() => expect(groupNames()).toHaveLength(2))

      await act(() => {
        formApi.setValue(
          'AddToGroups',
          formApi
            .getValues('AddToGroups')
            .filter((g) => g.value !== 'group-ieq-team')
        )
      })

      await waitFor(() => expect(groupNames()).toEqual(['All-Users']))
    })

    it('keeps manual groups while unrelated fields are still being typed', async () => {
      // givenName/surname are watched alongside AddToGroups; editing them must not re-apply
      // the template over the operator's group selection.
      const template = makeTemplate({
        addToGroups: [
          {
            label: 'All-Users',
            value: 'group-all-users',
            addedFields: { groupType: 'Security' },
          },
        ],
      })
      mockApis({ templates: [template] })
      renderWithProviders(<Harness />)

      await selectTemplate(template)
      await waitFor(() => expect(groupNames()).toEqual(['All-Users']))

      await act(() => {
        formApi.setValue('AddToGroups', [
          ...formApi.getValues('AddToGroups'),
          {
            label: 'SG-Office-LAX',
            value: 'group-lax',
            addedFields: { groupType: 'Security' },
          },
        ])
      })
      await act(() => {
        formApi.setValue('givenName', 'Safiyah')
        formApi.setValue('surname', 'Seck')
      })

      await waitFor(() =>
        expect(groupNames()).toEqual(['All-Users', 'SG-Office-LAX'])
      )
    })

    it('keeps a group picked through the autocomplete itself', async () => {
      // End-to-end through the real MUI field rather than a direct setValue, so the rendered
      // chips and the form value are proven to agree.
      const user = userEvent.setup()
      const template = makeTemplate({
        addToGroups: [
          {
            label: 'All-Users',
            value: 'group-all-users',
            addedFields: { groupType: 'Security' },
          },
        ],
      })
      mockApis({ templates: [template] })
      renderWithProviders(<Harness />)

      await selectTemplate(template)
      await waitFor(() => expect(groupNames()).toEqual(['All-Users']))

      const field = screen.getByRole('combobox', { name: /Add to Groups/i })
      await user.click(field)
      await user.type(field, 'SG-Office-LAX')
      const option = await screen.findByRole('option', {
        name: 'SG-Office-LAX',
      })
      await user.click(option)

      await waitFor(() =>
        expect(groupNames()).toEqual(['All-Users', 'SG-Office-LAX'])
      )
      expect(screen.getByText('SG-Office-LAX')).toBeInTheDocument()
    })
  })

  describe('groups offered by the field', () => {
    it('offers the tenant groups with their type attached', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Harness />)

      const field = screen.getByRole('combobox', { name: /Add to Groups/i })
      await user.click(field)
      await user.type(field, 'All Office')

      const option = await screen.findByRole('option', { name: 'All Office' })
      await user.click(option)

      await waitFor(() =>
        expect(formApi.getValues('AddToGroups')[0]).toMatchObject({
          label: 'All Office',
          value: 'group-all-office',
          addedFields: { groupType: 'Distribution List' },
        })
      )
    })
  })
})
