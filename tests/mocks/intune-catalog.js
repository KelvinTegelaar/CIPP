// The shipped Intune catalog bundles and the template corpus in backend/Tests/Fixtures/IntuneTemplates,
// read from disk: Captured/ holds sanitised templates from real tenants, Deployed/ holds policies built
// by the setting builder together with Intune's verdict and the template captured back from Intune.
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const FRONTEND = path.resolve(__dirname, '../..')
export const DEFINITION_ROOT = path.join(FRONTEND, 'public/intune-definitions')
const FIXTURE_ROOT = path.join(
  FRONTEND,
  '../backend/Tests/Fixtures/IntuneTemplates'
)

const bundles = new Map()
const bundle = (bucket) => {
  if (!bundles.has(bucket)) {
    const file = path.join(DEFINITION_ROOT, `${bucket}.json`)
    bundles.set(
      bucket,
      fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
    )
  }
  return bundles.get(bucket)
}

// Same addressing as src/hooks/use-intune-collection.js.
export const getCatalogDefinition = (id) => {
  if (!id) return undefined
  const hash = createHash('sha256').update(id).digest('hex').slice(0, 16)
  return bundle(hash.slice(0, 2))[hash]
}

// Serves /intune-definitions/* from disk, for code that fetches the catalog.
export const catalogFetch = async (url) => {
  const file = path.join(
    DEFINITION_ROOT,
    String(url).replace(/^\/intune-definitions\//, '')
  )
  if (!fs.existsSync(file)) return new Response(null, { status: 404 })
  return new Response(fs.readFileSync(file, 'utf8'), { status: 200 })
}

export const readSearchIndex = (platform) =>
  JSON.parse(
    fs.readFileSync(
      path.join(DEFINITION_ROOT, '_index', `${platform}.json`),
      'utf8'
    )
  )

const readFixtures = (folder) =>
  fs
    .readdirSync(path.join(FIXTURE_ROOT, folder))
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => ({
      name: file.replace(/\.json$/, ''),
      ...JSON.parse(
        fs.readFileSync(path.join(FIXTURE_ROOT, folder, file), 'utf8')
      ),
    }))

export const capturedTemplates = readFixtures('Captured')
export const deployedPolicies = readFixtures('Deployed')
