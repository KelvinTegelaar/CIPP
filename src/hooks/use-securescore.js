import { useEffect, useState } from 'react'
import { ApiGetCall } from '../api/ApiCall'
import { useSettings } from './use-settings'
import { getStandards } from '../utils/standards-data'

export function useSecureScore({ waiting = true } = {}) {
  const currentTenant = useSettings().currentTenant
  const isAllTenants = currentTenant === 'AllTenants'

  const [translatedData, setTranslatedData] = useState([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const controlScore = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: 'security/secureScoreControlProfiles',
      tenantFilter: currentTenant,
      $count: true,
      $top: 999,
    },
    queryKey: `controlScore-${currentTenant}`,
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
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: 'security/secureScores',
      tenantFilter: currentTenant,
      $count: true,
      noPagination: true,
      $top: 7,
    },
    queryKey: `secureScore-${currentTenant}`,
    // Never fetch under AllTenants: these are live per-tenant Graph reads whose results the
    // effects below discard in that mode — the AllTenants view reads the nightly cache instead.
    waiting: waiting && !isAllTenants,
  })

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
    if (controlScore.isSuccess && secureScore.isSuccess) {
      const secureScoreData = secureScore.data.Results[0]
      const updatedControlScores = secureScoreData.controlScores.map((control) => {
        const translation = controlScore.data.Results?.find(
          (controlTranslation) => controlTranslation.id === control.controlName
        )
        const remediation = getStandards().find((standard) =>
          standard.tag?.includes(control.controlName)
        )
        return {
          ...control,
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
        percentageCurrent: Math.round(
          (secureScoreData.currentScore / secureScoreData.maxScore) * 100
        ),
        percentageVsAllTenants: Math.round(
          secureScoreData.averageComparativeScores?.[0]?.averageScore
        ),
        percentageVsSimilar: Math.round(
          secureScoreData.averageComparativeScores?.[1]?.averageScore
        ),
        controlScores: updatedControlScores,
      })
      setIsSuccess(true)
    }
  }, [
    controlScore.isSuccess,
    secureScore.isSuccess,
    controlScore.data,
    secureScore.data,
    isAllTenants,
    standardsPath,
  ])

  return {
    controlScore,
    secureScore,
    translatedData,
    isFetching,
    isSuccess,
  }
}
