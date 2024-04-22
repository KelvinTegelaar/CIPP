import { CAlert, CButton, CButtonGroup } from '@coreui/react'
import React, { useState } from 'react'
import { useLazyEditDnsConfigQuery, useLazyGetDnsConfigQuery } from 'src/store/api/domains.js'
import { CippCallout } from 'src/components/layout/index.js'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'

/**
 * Sets the DNS resolver based on user selection.
 *
 * @return {JSX.Element} - The component that renders the DNS resolver settings.
 */
export function SettingsDNSResolver() {
  const resolvers = ['Google', 'Cloudflare', 'Quad9']
  const [getDnsConfig, getDnsConfigResult] = useLazyGetDnsConfigQuery()
  const [editDnsConfig, editDnsConfigResult] = useLazyEditDnsConfigQuery()

  const switchResolver = async (resolver) => {
    await editDnsConfig({ resolver })
    await getDnsConfig()
  }
  const cardbuttonGroup = (
    <CButtonGroup role="group" aria-label="Resolver">
      {resolvers.map((resolver, index) => (
        <CButton
          onClick={() => switchResolver(resolver)}
          color={resolver === getDnsConfigResult.data?.Resolver ? 'primary' : 'secondary'}
          key={index}
        >
          {resolver}
        </CButton>
      ))}
    </CButtonGroup>
  )
  return (
    <>
      <CippButtonCard
        title="DNS Resolver"
        titleType="big"
        isFetching={getDnsConfigResult.isFetching}
        CardButton={cardbuttonGroup}
      >
        {getDnsConfigResult.isUninitialized && getDnsConfig()}
        {getDnsConfigResult.isSuccess && (
          <>
            <small>
              Select your DNS Resolver. The DNS resolve is used for the domain analyser only, and
              not for generic DNS resolution.
            </small>
            {(editDnsConfigResult.isSuccess || editDnsConfigResult.isError) &&
              !editDnsConfigResult.isFetching && (
                <CippCallout
                  dismissible
                  color={editDnsConfigResult.isSuccess ? 'success' : 'danger'}
                >
                  {editDnsConfigResult.isSuccess
                    ? editDnsConfigResult.data.Results
                    : 'Error setting resolver'}
                </CippCallout>
              )}
          </>
        )}
      </CippButtonCard>
    </>
  )
}
