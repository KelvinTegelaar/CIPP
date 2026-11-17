import { useEffect, useMemo, useState } from 'react'
import { ApiGetCall } from '../api/ApiCall'
import { useSettings } from './use-settings'
import { getStandards } from '../utils/standards-data'
import { isMultiTenant } from '../utils/tenant-selection'
import { useCippReportDB } from '../components/CippComponents/CippReportDBControls'

export function useSecureScore({ waiting = true } = {}) {
  const currentTenant = useSettings().currentTenant
  const isAllTenants = isMultiTenant(currentTenant)

  // Live/Cached chip + Sync. Cached reads the raw Graph records the nightly SecureScore cache
  // stores, through ListDBCache, which answers in the same { Results } envelope as the live call.
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListDBCache',
    queryKey: 'secureScore',
    cacheName: 'SecureScore',
    syncTitle: 'Sync Secure Score',
    defaultCached: false,
  })
  const cached = reportDB.useReportDB

  const [translatedData, setTranslatedData] = useState([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const controlScore = ApiGetCall({
    url: cached ? '/api/ListDBCache' : '/api/ListGraphRequest',
    data: cached
      ? { tenantFilter: currentTenant, type: 'SecureScoreControlProfiles' }
      : {
          Endpoint: 'security/secureScoreControlProfiles',
          tenantFilter: currentTenant,
          $count: true,
          $top: 999,
        },
    // ponytail: a Sync only invalidates the scores query below (the one key the queue tracker
    // knows); cached profiles refresh on their 5 min staleTime. Give both one key if that bites.
    queryKey: `controlScore-${currentTenant}-${cached}`,
    // Never fetch under AllTenants: these are live per-tenant Graph reads whose results the
    // effects below discard in that mode — the AllTenants view reads the nightly cache instead.
    waiting: waiting && !isAllTenants,
  })

  // Same key and TTL as the layout's call so react-query serves one shared copy.
  const featureFlags = ApiGetCall({
    url: '/api/ListFeatureFlags',
    queryKey: 'featureFlags',
    staleTime: 600000,
  })
  const baselinesEnabled =
    Array.isArray(featureFlags.data) &&
    featureFlags.data.some((flag) => flag.Id === 'Baselines' && flag.Enabled === true)
  // The Baselines flag hides the classic standards pages, so the in-app remediation link
  // has to follow it or it lands on a page that no longer exists.
  const standardsPath = baselinesEnabled ? '/tenant/baselines' : '/tenant/standards/templates'

  const secureScore = ApiGetCall({
    url: cached ? '/api/ListDBCache' : '/api/ListGraphRequest',
    data: cached
      ? { tenantFilter: currentTenant, type: 'SecureScore' }
      : {
          Endpoint: 'security/secureScores',
          tenantFilter: currentTenant,
          $count: true,
          noPagination: true,
          $top: 7,
        },
    // The key the Sync queue tracker invalidates when the cache job finishes.
    queryKey: reportDB.resolvedQueryKey,
    // Never fetch under AllTenants: these are live per-tenant Graph reads whose results the
    // effects below discard in that mode — the AllTenants view reads the nightly cache instead.
    waiting: waiting && !isAllTenants,
  })

  // Newest first, 7 days: what the live call returns. The cache keeps 14 days oldest-first.
  const scores = useMemo(
    () =>
      [...(secureScore.data?.Results ?? [])]
        .sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime))
        .slice(0, 7),
    [secureScore.data]
  )
  // A tenant with no score records (or a cache that never synced) is a success with nothing in it.
  const noData = secureScore.isSuccess && scores.length === 0

  useEffect(() => {
    if (isAllTenants) {
      setIsFetching(false)
      setIsSuccess(false)
      setTranslatedData([])
      return
    }
    if (controlScore.isFetching || secureScore.isFetching) {
      setIsFetching(true)
    } else {
      setIsFetching(false)
    }
  }, [controlScore.isFetching, secureScore.isFetching, isAllTenants])

  useEffect(() => {
    if (isAllTenants) return
    if (controlScore.isSuccess && secureScore.isSuccess && scores.length > 0) {
      const secureScoreData = scores[0]
      const updatedControlScores = secureScoreData.controlScores.map((control) => {
        const translation = controlScore.data.Results?.find(
          (controlTranslation) => controlTranslation.id === control.controlName
        )
        const remediation = getStandards().find((standard) =>
          standard.tag?.includes(control.controlName)
        )
        // maxScore lives on the control profile, not on the per-tenant control score.
        const pointsToGain =
          translation?.maxScore != null
            ? Math.max(translation.maxScore - (control.score ?? 0), 0)
            : null
        return {
          ...control,
          pointsToGain,
          percentToGain:
            pointsToGain != null && secureScoreData.maxScore
              ? (pointsToGain / secureScoreData.maxScore) * 100
              : null,
          title: translation?.title,
          threats: translation?.threats,
          complianceInformation: translation?.complianceInformation,
          actionUrl: remediation
            ? `${standardsPath}?standard=${encodeURIComponent(remediation.name)}`
            : translation?.actionUrl,
          remediation: remediation
            ? `1. Enable the CIPP Standard: ${remediation.label}`
            : translation?.remediation,
          remediationImpact: translation?.remediationImpact,
          implementationCost: translation?.implementationCost,
          tier: translation?.tier,
          userImpact: translation?.userImpact,
          vendorInformation: translation?.vendorInformation,
          controlStateUpdates: translation?.controlStateUpdates //remove each controlStateUpdate that has the state 'default' as it is not relevant.
            ? translation.controlStateUpdates.filter((update) => update.state !== 'Default')
            : [],
        }
      })
      updatedControlScores.sort((a, b) => b.scoreInPercentage - a.scoreInPercentage)
      setTranslatedData({
        ...secureScoreData,
        //secureScoreData.currentscore is the current score, secureScoreData.maxscore is the max score. calculate % reached.
        percentageCurrent: (
          (secureScoreData.currentScore / secureScoreData.maxScore) *
          100
        ).toFixed(2),
        percentageVsAllTenants:
          secureScoreData.averageComparativeScores?.[0]?.averageScore?.toFixed(2),
        percentageVsSimilar:
          secureScoreData.averageComparativeScores?.[1]?.averageScore?.toFixed(2),
        controlScores: updatedControlScores,
      })
      setIsSuccess(true)
    }
  }, [
    controlScore.isSuccess,
    secureScore.isSuccess,
    controlScore.data,
    scores,
    isAllTenants,
    standardsPath,
  ])

  return {
    controlScore,
    secureScore,
    translatedData,
    isFetching,
    isSuccess,
    // A failed query never reaches the success effect above, so pages need this to tell
    // "failed" from "not loaded yet".
    isError: !isAllTenants && (controlScore.isError || secureScore.isError || noData),
    error:
      controlScore.error ??
      secureScore.error ??
      (noData
        ? {
            message: cached
              ? 'No cached data for this tenant yet. Run a Sync or switch to Live.'
              : 'Microsoft returned no Secure Score data for this tenant.',
          }
        : null),
    refetch: () => {
      if (controlScore.isError) controlScore.refetch()
      if (secureScore.isError || noData) secureScore.refetch()
    },
    scores,
    cached,
    controls: reportDB.controls,
    syncDialog: reportDB.syncDialog,
  }
}
