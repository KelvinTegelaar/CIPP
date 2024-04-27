import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import React, { useState } from 'react'
import { CButton, CButtonGroup, CCallout, CCardText } from '@coreui/react'
import { CippCallout } from 'src/components/layout/index.js'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'

/**
 * This method is responsible for handling password settings in the application.
 * It uses two custom hooks, `useLazyGenericGetRequestQuery()` and `useLazyGenericPostRequestQuery()`,
 * to fetch and update password configuration data respectively.
 *
 * The method maintains the state of a password alert visibility using the `useState()` hook.
 *
 * It also provides a switchResolver function that updates the password configuration using the editPasswordConfig function.
 * After updating the configuration, it fetches the updated configuration using getPasswordConfig to reflect the changes.
 * Finally, it sets the password alert visibility to true.
 *
 * The method renders a password style section in the UI which displays a list of resolvers.
 * The resolver that matches the current password configuration is highlighted with a primary color button.
 * By clicking on a resolver button, the switchResolver function is called to update the password configuration and show the password alert.
 *
 * @returns {JSXElement} The rendered password settings component with the password style section and password alert section.
 */
export function SettingsPassword() {
  const [getPasswordConfig, getPasswordConfigResult] = useLazyGenericGetRequestQuery()
  const [editPasswordConfig, editPasswordConfigResult] = useLazyGenericPostRequestQuery()

  const switchResolver = async (resolver) => {
    await editPasswordConfig({
      path: '/api/ExecPasswordConfig',
      values: { passwordType: resolver },
    })
    await getPasswordConfig({ path: '/api/ExecPasswordConfig', params: { list: true } })
  }

  const resolvers = ['Classic', 'Correct-Battery-Horse']
  const cardbuttonGroup = (
    <CButtonGroup role="group" aria-label="Resolver">
      {resolvers.map((r, index) => (
        <CButton
          onClick={() => switchResolver(r)}
          color={
            r === getPasswordConfigResult.data?.Results?.passwordType ? 'primary' : 'secondary'
          }
          key={index}
        >
          {r}
        </CButton>
      ))}
    </CButtonGroup>
  )
  return (
    <>
      <CippButtonCard
        title="Password Style"
        titleType="big"
        isFetching={getPasswordConfigResult.isFetching}
        CardButton={cardbuttonGroup}
      >
        {getPasswordConfigResult.isUninitialized &&
          getPasswordConfig({ path: '/api/ExecPasswordConfig?list=true' })}
        <CCardText>
          <small>
            Choose your password style. Classic passwords are a combination of letters and symbols.
            Correct-Battery-Horse style is a passphrase, which is easier to remember and more secure
            than classic passwords.
          </small>
        </CCardText>
        {(editPasswordConfigResult.isSuccess || editPasswordConfigResult.isError) &&
          !editPasswordConfigResult.isFetching && (
            <CippCallout
              color={editPasswordConfigResult.isSuccess ? 'success' : 'danger'}
              dismissible
            >
              {editPasswordConfigResult.isSuccess
                ? editPasswordConfigResult.data.Results
                : 'Error setting password style'}
            </CippCallout>
          )}
      </CippButtonCard>
    </>
  )
}
