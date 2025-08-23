import { useEffect, useState } from "react";
import { ApiGetCall } from "../api/ApiCall";
import { useSettings } from "./use-settings";
import standards from "/src/data/standards.json";

export function useSecureScore({ waiting = true } = {}) {
  const currentTenant = useSettings().currentTenant;
  if (currentTenant === "AllTenants") {
    return {
      controlScore: { isFetching: false, isSuccess: false, data: { Results: [] } },
      secureScore: { isFetching: false, isSuccess: false, data: { Results: [] } },
      translatedData: [],
      isFetching: true,
      isSuccess: false,
    };
  }

  const [translatedData, setTranslatedData] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const controlScore = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: "security/secureScoreControlProfiles",
      tenantFilter: currentTenant,
      $count: true,
      $top: 999,
    },
    queryKey: `controlScore-${currentTenant}`,
    waiting: waiting,
  });

  const secureScore = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: "security/secureScores",
      tenantFilter: currentTenant,
      $count: true,
      noPagination: true,
      $top: 7,
    },
    queryKey: `secureScore-${currentTenant}`,
    waiting: waiting,
  });

  useEffect(() => {
    if (controlScore.isFetching || secureScore.isFetching) {
      setIsFetching(true);
    } else {
      setIsFetching(false);
    }
  }, [controlScore.isFetching, secureScore.isFetching]);

  useEffect(() => {
    if (controlScore.isSuccess && secureScore.isSuccess) {
      const secureScoreData = secureScore.data.Results[0];
      const updatedControlScores = secureScoreData.controlScores.map((control) => {
        const translation = controlScore.data.Results?.find(
          (controlTranslation) => controlTranslation.id === control.controlName
        );
        const remediation = standards.find((standard) =>
          standard.tag?.includes(control.controlName)
        );
        return {
          ...control,
          title: translation?.title,
          threats: translation?.threats,
          complianceInformation: translation?.complianceInformation,
          actionUrl: remediation
            ? //this needs to be updated to be a direct url to apply this standard.
              "/tenant/standards/list-standards"
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
            ? translation.controlStateUpdates.filter((update) => update.state !== "Default")
            : [],
        };
      });
      updatedControlScores.sort((a, b) => b.scoreInPercentage - a.scoreInPercentage);
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
      });
      setIsSuccess(true);
    }
  }, [controlScore.isSuccess, secureScore.isSuccess, controlScore.data, secureScore.data]);

  return {
    controlScore,
    secureScore,
    translatedData,
    isFetching,
    isSuccess,
  };
}
