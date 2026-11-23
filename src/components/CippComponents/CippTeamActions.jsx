import { CippIcons } from '../../utils/icon-registry'
import { useSettings } from '../../hooks/use-settings'
import { TEAM_SETTING_GROUPS, teamQueryKey } from './CippTeamHeader'

const GIPHY_RATINGS = [
  { label: 'Strict', value: 'strict' },
  { label: 'Moderate', value: 'moderate' },
]

export const getTeamHeaderActions = ({ team, teamId, tenantFilter }) => [
  {
    label: 'Edit team settings',
    type: 'POST',
    url: '/api/EditTeam',
    icon: <CippIcons.Settings />,
    condition: () => !team?.isArchived,
    fields: TEAM_SETTING_GROUPS.flatMap(({ title, section, settings }) => [
      { type: 'heading', label: title },
      ...settings.map(([name, label]) => ({
        type: 'switch',
        name: `${section}.${name}`,
        label,
      })),
      ...(section === 'funSettings'
        ? [
            {
              type: 'autoComplete',
              name: 'funSettings.giphyContentRating',
              label: 'Giphy content rating',
              multiple: false,
              creatable: false,
              options: GIPHY_RATINGS,
            },
          ]
        : []),
    ]),
    defaultvalues: () => {
      const values = {}
      for (const { section, settings } of TEAM_SETTING_GROUPS) {
        values[section] = Object.fromEntries(
          settings.map(([name]) => [name, Boolean(team?.[section]?.[name])])
        )
      }
      values.funSettings.giphyContentRating =
        GIPHY_RATINGS.find(
          (rating) => rating.value === team?.funSettings?.giphyContentRating
        ) ?? GIPHY_RATINGS[1]
      return values
    },
    customDataformatter: (_row, _action, formData) => ({
      ...formData,
      tenantFilter,
      TeamID: teamId,
    }),
    confirmText: 'Change what members and guests can do in this team.',
    relatedQueryKeys: [teamQueryKey(tenantFilter, teamId)],
  },
  {
    label: 'Archive Team',
    type: 'POST',
    url: '/api/ExecTeamAction',
    icon: <CippIcons.Archive />,
    hideCondition: () => Boolean(team?.isArchived),
    customDataformatter: () => ({
      tenantFilter,
      TeamID: teamId,
      Action: 'Archive',
    }),
    confirmText:
      'Archive this team? Members can still read it, but nobody can post or change it until it is unarchived.',
    relatedQueryKeys: [teamQueryKey(tenantFilter, teamId)],
  },
  {
    label: 'Unarchive Team',
    type: 'POST',
    url: '/api/ExecTeamAction',
    icon: <CippIcons.Unarchive />,
    hideCondition: () => !team?.isArchived,
    customDataformatter: () => ({
      tenantFilter,
      TeamID: teamId,
      Action: 'Unarchive',
    }),
    confirmText: 'Unarchive this team so members can use it again?',
    relatedQueryKeys: [teamQueryKey(tenantFilter, teamId)],
  },
]

export const actionSearch = {
  page: '/identity/administration/groups/group/team',
  idParam: 'groupId',
  useActions: () =>
    getTeamHeaderActions({ tenantFilter: useSettings().currentTenant }),
}
