import { CAlert, CButton, CButtonGroup } from '@coreui/react'
import React, { useState } from 'react'
import { useLazyEditDnsConfigQuery, useLazyGetDnsConfigQuery } from 'src/store/api/domains.js'
import { CippCallout } from 'src/components/layout/index.js'

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

  return (
    <>
      {getDnsConfigResult.isUninitialized && getDnsConfig()}
      {getDnsConfigResult.isSuccess && (
        <>
          <h3 className="underline mb-5">DNS Resolver</h3>
          <CButtonGroup role="group" aria-label="Resolver" className="my-3">
            {resolvers.map((resolver, index) => (
              <CButton
                onClick={() => switchResolver(resolver)}
                color={resolver === getDnsConfigResult.data.Resolver ? 'primary' : 'secondary'}
                key={index}
              >
                {resolver}
              </CButton>
            ))}
          </CButtonGroup>
          {(editDnsConfigResult.isSuccess || editDnsConfigResult.isError) &&
            !editDnsConfigResult.isFetching && (
              <CippCallout dismissible color={editDnsConfigResult.isSuccess ? 'success' : 'danger'}>
                {editDnsConfigResult.isSuccess
                  ? editDnsConfigResult.data.Results
                  : 'Error setting resolver'}
              </CippCallout>
            )}
        </>
      )}
    </>
  )
}
