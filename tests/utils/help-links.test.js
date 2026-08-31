import fs from 'node:fs'
import path from 'node:path'
import { getHelpLinks } from '../../src/utils/help-links'
import { nativeMenuItems } from '../../src/layouts/config'

const DOCS_ROOT = path.resolve(__dirname, '../../../docs/user-documentation')
const docsRootExists = fs.existsSync(DOCS_ROOT)

// Pages with no docs page yet - fix the nav entry (docsPath override) instead of growing
// this list. Confirm the real docs location is still missing before adding to it.
const NO_DOCS_YET = new Set([
  '/tenant/baselines',
  '/tenant/conditional/deploy-vacation',
  '/endpoint/reports/workfromanywhere',
  '/onboardingv2',
  '/identity/reports/group-usage',
  '/email/reports/mail-flow-statistics',
])

// Same resolution getHelpLinks uses: a nav item's docsPath overrides the pathname-derived
// docs location.
const resolveDocsTarget = (item) => item.docsPath ?? item.path.slice(1)

const docsTargetExists = (target) => {
  const base = path.join(DOCS_ROOT, target)
  return (
    fs.existsSync(`${base}.md`) ||
    fs.existsSync(path.join(base, 'README.md')) ||
    (fs.existsSync(base) && fs.statSync(base).isDirectory())
  )
}

const walkNavPaths = (items = [], out = []) => {
  items.forEach((item) => {
    if (item?.path?.startsWith('/')) {
      out.push(item)
    }
    if (Array.isArray(item?.items)) {
      walkNavPaths(item.items, out)
    }
  })
  return out
}

describe.skipIf(!docsRootExists)(
  'nav entries resolve to real docs pages',
  () => {
    const navEntries = walkNavPaths(nativeMenuItems)

    it('found nav entries to check', () => {
      expect(navEntries.length).toBeGreaterThan(0)
    })

    navEntries
      .filter((item) => !NO_DOCS_YET.has(item.path))
      .forEach((item) => {
        it(`${item.path} -> ${resolveDocsTarget(item)}`, () => {
          expect(docsTargetExists(resolveDocsTarget(item))).toBe(true)
        })
      })
  }
)

describe('getHelpLinks documentation link', () => {
  it('uses the pathname-derived URL when the nav item has no docsPath', () => {
    const links = getHelpLinks('/identity/administration/users')
    const docs = links.find((link) => link.id === 'documentation')
    expect(docs.href).toBe(
      'https://docs.cipp.app/user-documentation/identity/administration/users'
    )
  })

  it('uses the docsPath override when the nav item has one', () => {
    const links = getHelpLinks('/tenant/tools/graph-explorer')
    const docs = links.find((link) => link.id === 'documentation')
    expect(docs.href).toBe(
      'https://docs.cipp.app/user-documentation/tools/tenant-tools/graph-explorer'
    )
  })
})
