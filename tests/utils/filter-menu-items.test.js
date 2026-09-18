import { describe, it, expect } from 'vitest'
import { filterMenuItems } from '../../src/utils/filter-menu-items'
import { nativeMenuItems } from '../../src/layouts/config'

// Flatten a menu tree into "Group > Sub > Page" strings so assertions read like the sidebar.
const pagePaths = (items, trail = []) =>
  items.flatMap((item) =>
    item.items
      ? pagePaths(item.items, [...trail, item.title])
      : [[...trail, item.title].join(' > ')]
  )

const leafPages = (items) =>
  items.flatMap((item) => (item.items ? leafPages(item.items) : [item]))

const menu = [
  {
    title: 'Email & Exchange',
    type: 'header',
    permissions: ['Exchange.Mailbox.*', 'Exchange.Contact.*'],
    items: [
      {
        title: 'Administration',
        permissions: ['Exchange.Mailbox.*'],
        items: [
          {
            title: 'Mailboxes',
            path: '/email/administration/mailboxes',
            permissions: ['Exchange.Mailbox.*'],
          },
          {
            title: 'Contacts',
            path: '/email/administration/contacts',
            permissions: ['Exchange.Contact.*'],
          },
        ],
      },
    ],
  },
  {
    title: 'Dashboard',
    path: '/',
    permissions: ['CIPP.Core.*'],
  },
]

describe('filterMenuItems', () => {
  it('shows a page when the user has a permission matching its wildcard', () => {
    const result = filterMenuItems(menu, { permissions: ['CIPP.Core.Read'] })
    expect(pagePaths(result)).toEqual(['Dashboard'])
  })

  it('matches exact permission strings', () => {
    const exactMenu = [
      { title: 'Logbook', path: '/cipp/logs', permissions: ['CIPP.Core.Read'] },
    ]
    expect(
      pagePaths(filterMenuItems(exactMenu, { permissions: ['CIPP.Core.Read'] }))
    ).toEqual(['Logbook'])
    expect(
      filterMenuItems(exactMenu, { permissions: ['CIPP.Core.ReadWrite'] })
    ).toEqual([])
  })

  it('shows a page inside a group even when the group permission does not match', () => {
    const result = filterMenuItems(menu, {
      permissions: ['Exchange.Contact.Read', 'Exchange.Contact.ReadWrite'],
    })
    expect(pagePaths(result)).toEqual([
      'Email & Exchange > Administration > Contacts',
    ])
  })

  it('removes a group when none of its pages are visible', () => {
    const result = filterMenuItems(menu, {
      permissions: ['Identity.User.Read'],
    })
    expect(result).toEqual([])
  })

  it('hides pages that declare no permissions', () => {
    const openMenu = [{ title: 'Open', path: '/open' }]
    expect(
      filterMenuItems(openMenu, { permissions: ['CIPP.Core.Read'] })
    ).toEqual([])
  })

  it('hides pages listed in hiddenPages', () => {
    const result = filterMenuItems(menu, {
      permissions: ['Exchange.Mailbox.Read', 'Exchange.Contact.Read'],
      hiddenPages: ['/email/administration/mailboxes'],
    })
    expect(pagePaths(result)).toEqual([
      'Email & Exchange > Administration > Contacts',
    ])
  })

  it('returns nothing when permissions are missing', () => {
    expect(filterMenuItems(menu, {})).toEqual([])
    expect(filterMenuItems(menu, { permissions: undefined })).toEqual([])
  })

  it('does not mutate the source menu', () => {
    const before = JSON.stringify(menu)
    filterMenuItems(menu, { permissions: ['Exchange.Contact.Read'] })
    expect(JSON.stringify(menu)).toEqual(before)
  })

  describe('against the real navigation config', () => {
    const pagesWithPermissions = leafPages(nativeMenuItems).filter(
      (page) => page.permissions?.length > 0
    )

    it('gives a user with every permission every page', () => {
      const allPermissions = [
        ...new Set(
          pagesWithPermissions.flatMap((page) =>
            page.permissions.flatMap((perm) => [
              perm.replace('*', 'Read'),
              perm.replace('*', 'ReadWrite'),
            ])
          )
        ),
      ]
      const visible = leafPages(
        filterMenuItems(nativeMenuItems, { permissions: allPermissions })
      )
      expect(visible.length).toEqual(pagesWithPermissions.length)
    })

    it.each(pagesWithPermissions.map((page) => [page.title, page]))(
      'shows %s to a role granted only that page permission',
      (_title, page) => {
        const permissions = page.permissions.map((perm) =>
          perm.replace('*', 'Read')
        )
        const visible = leafPages(
          filterMenuItems(nativeMenuItems, { permissions })
        )
        expect(visible).toContainEqual(page)
      }
    )

    it('shows only Contacts pages from Exchange for a contacts-only custom role', () => {
      const result = filterMenuItems(nativeMenuItems, {
        permissions: [
          'CIPP.Core.Read',
          'Exchange.Contact.Read',
          'Exchange.Contact.ReadWrite',
        ],
      })
      const exchangePages = pagePaths(result).filter((path) =>
        path.startsWith('Email & Exchange')
      )
      expect(exchangePages).toEqual([
        'Email & Exchange > Administration > Contacts',
        'Email & Exchange > Administration > Contact Templates',
      ])
    })
  })
})
