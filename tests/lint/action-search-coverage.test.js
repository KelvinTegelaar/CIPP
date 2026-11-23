import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// Universal search's Actions scope finds its sources itself: every components/**/*Actions.jsx
// exporting `actionSearch = { page, idParam, useActions }`. What nothing can find on its own is
// a new detail page whose actions module never declared it. This walks pages/ and fails on
// that, and on a declaration that names a page or switcher param that no longer exists.

const SRC = path.resolve(__dirname, '../../src')
const PAGES = path.join(SRC, 'pages')

// Detail pages that build their actions inside the page from the loaded record, so there is no
// module to declare from yet. Move the actions into a module and declare it to drop an entry.
const NOT_SEARCHABLE = {
  'identity/administration/groups/group/index.jsx':
    'actions built inline from the loaded group',
  'identity/administration/groups/group/channel.jsx':
    'actions built inline, and a channel needs both its team and channel id',
  'identity/administration/roles/role/index.jsx':
    'actions built inline from the loaded role',
  'identity/administration/roles/role/pim.jsx':
    'actions built inline from the loaded role',
  'identity/administration/users/user/onedrive-shortcuts.jsx':
    'actions built inline',
}

const walk = (dir, pattern) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full, pattern)
    return pattern.test(entry.name) ? [full] : []
  })

const read = (file) => fs.readFileSync(file, 'utf8')
const posix = (p) => p.split(path.sep).join('/')

const declarations = walk(
  path.join(SRC, 'components'),
  /Actions\.jsx$/
).flatMap((file) => {
  const source = read(file)
  const block = source.match(/export const actionSearch = \{[\s\S]*?\n\}/)
  if (!block) return []
  return [
    {
      module: path.basename(file, '.jsx'),
      page: block[0].match(/page:\s*['"]([^'"]+)['"]/)?.[1],
      idParam: block[0].match(/idParam:\s*['"]([^'"]+)['"]/)?.[1],
    },
  ]
})

const pageFileFor = (route) =>
  [`${route}.jsx`, `${route}/index.jsx`]
    .map((candidate) => path.join(PAGES, candidate))
    .find((candidate) => fs.existsSync(candidate))

// A detail page: the tabbed layout with a record switcher in the title and an Actions menu.
const detailPages = walk(PAGES, /\.jsx$/).filter((file) => {
  const source = read(file)
  return (
    source.includes('<HeaderedTabbedLayout') &&
    source.includes('titleControl') &&
    /\bactions=\{(?!\[\]\})/.test(source)
  )
})

const importsModule = (source, module) =>
  new RegExp(`from\\s+['"][^'"]*/${module}(\\.jsx)?['"]`).test(source)

describe('universal search action coverage', () => {
  it('finds declarations to check', () => {
    expect(declarations.length).toBeGreaterThan(0)
  })

  it.each(declarations.map((d) => [d.module, d]))(
    '%s declares a detail page that exists and switches on its idParam',
    (_module, declaration) => {
      expect(declaration.page, 'actionSearch.page').toBeTruthy()
      expect(declaration.idParam, 'actionSearch.idParam').toBeTruthy()

      const file = pageFileFor(declaration.page)
      expect(file, `no page file for ${declaration.page}`).toBeTruthy()
      const source = read(file)
      expect(source).toContain('<HeaderedTabbedLayout')
      expect(
        importsModule(source, declaration.module),
        `page does not import ${declaration.module}`
      ).toBe(true)

      // The switcher is either inline or a Cipp*Switcher preset imported from a component file.
      const switcherSources = [...source.matchAll(/<(Cipp\w+Switcher)\b/g)]
        .map(
          (match) =>
            source.match(
              new RegExp(
                `import\\s*\\{[^}]*\\b${match[1]}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`
              )
            )?.[1]
        )
        .filter(Boolean)
        .map((specifier) =>
          path.resolve(
            path.dirname(file),
            specifier.replace(/(\.jsx)?$/, '.jsx')
          )
        )
        .filter((switcherFile) => fs.existsSync(switcherFile))
        .map(read)
      const switches = [source, ...switcherSources].some((text) =>
        new RegExp(`queryParamKey=\\{?["']${declaration.idParam}["']`).test(
          text
        )
      )
      expect(
        switches,
        `no switcher sets ${declaration.idParam} on ${declaration.page}`
      ).toBe(true)
    }
  )

  it('covers every detail page with an Actions menu', () => {
    const uncovered = detailPages
      .map((file) => posix(path.relative(PAGES, file)))
      .filter((relative) => !NOT_SEARCHABLE[relative])
      .filter((relative) => {
        const source = read(path.join(PAGES, relative))
        const dir = path.posix.dirname(relative)
        // Covered by a declaration for this page or a sibling tab that shares its actions module.
        return !declarations.some((declaration) => {
          const declared = posix(
            path.relative(PAGES, pageFileFor(declaration.page) ?? '')
          )
          return (
            path.posix.dirname(declared) === dir &&
            importsModule(source, declaration.module)
          )
        })
      })
    expect(
      uncovered,
      "Add `export const actionSearch = { page, idParam, useActions }` to the page's actions module, " +
        'or list the page in NOT_SEARCHABLE with the reason'
    ).toEqual([])
  })

  it('only exempts pages that still exist', () => {
    const missing = Object.keys(NOT_SEARCHABLE).filter(
      (relative) => !fs.existsSync(path.join(PAGES, relative))
    )
    expect(missing).toEqual([])
  })
})
