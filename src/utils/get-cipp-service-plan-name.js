import { getM365Licenses } from './m365-licenses-data'

// Service plan names Microsoft's license export doesn't map to a friendly name,
// or maps inconsistently. Keyed lowercase.
const overrides = {
  exchange_lite: 'Exchange Online Kiosk',
  atp_enabled: 'Microsoft Defender for Office 365 (Plan 1)',
  customerlockbox: 'Customer Lockbox',
  microsoftintuneplan1: 'Microsoft Intune Plan 1',
  ems: 'Enterprise Mobility + Security',
  sccm: 'Configuration Manager',
  mdm_services: 'Mobile Device Management Services',
}

// Lazy map of Service_Plan_Name (lowercased) -> best friendly name, built once
// from the license catalog. The catalog repeats each plan across many SKUs with
// mixed-case and ALL-CAPS variants; prefer the mixed-case spelling and the most
// common name, and ignore rows whose "friendly" name is just the plan name again.
let planNameCache = null

const buildPlanNameMap = () => {
  const counts = new Map()
  for (const row of getM365Licenses()) {
    const plan = (row.Service_Plan_Name || '').toLowerCase()
    const friendly = row.Service_Plans_Included_Friendly_Names
    if (!plan || !friendly || friendly.toLowerCase() === plan) continue
    let entry = counts.get(plan)
    if (!entry) {
      entry = new Map()
      counts.set(plan, entry)
    }
    entry.set(friendly, (entry.get(friendly) || 0) + 1)
  }
  const map = new Map()
  for (const [plan, names] of counts) {
    let best = null
    let bestScore = -1
    for (const [name, count] of names) {
      const score = count + (name !== name.toUpperCase() ? 1000 : 0)
      if (score > bestScore) {
        bestScore = score
        best = name
      }
    }
    if (best) map.set(plan, best)
  }
  return map
}

/**
 * Translate a service plan capability name (e.g. EXCHANGE_S_STANDARD) to its
 * friendly product name (e.g. "Exchange Online (Plan 1)"). Falls back to the
 * raw name when nothing matches. The license catalog loads as an async chunk;
 * pair with useM365Licenses() in components so the lookup re-runs once loaded.
 */
export const getServicePlanFriendlyName = (planName) => {
  if (!planName) return planName
  const key = String(planName).toLowerCase()
  if (overrides[key]) return overrides[key]
  if (!planNameCache && getM365Licenses().length)
    planNameCache = buildPlanNameMap()
  return planNameCache?.get(key) ?? planName
}
