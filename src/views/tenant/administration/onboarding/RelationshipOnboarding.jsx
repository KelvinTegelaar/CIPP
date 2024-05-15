import React, { useState, useRef, useEffect } from 'react'
import {
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CButton,
  CCallout,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import { Field } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import { CippCodeBlock, TenantSelector } from 'src/components/utilities'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { CellDate } from 'src/components/tables'
import ReactTimeAgo from 'react-time-ago'
import { TableModalButton, TitleButton } from 'src/components/buttons'

function useInterval(callback, delay, state) {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  })

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }

    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay, state])
}

const RelationshipOnboarding = ({
  relationship,
  gdapRoles,
  autoMapRoles,
  addMissingGroups,
  standardsExcludeAllTenants,
}) => {
  const [getOnboardingStatus, onboardingStatus] = useLazyGenericPostRequestQuery()

  useInterval(
    async () => {
      if (onboardingStatus.data?.Status == 'running' || onboardingStatus.data?.Status == 'queued') {
        getOnboardingStatus({
          path: `/api/ExecOnboardTenant`,
          values: { id: relationship.id },
        })
      }
    },
    5000,
    onboardingStatus.data,
  )
  console.log(standardsExcludeAllTenants)

  return (
    <CAccordionItem>
      <CAccordionHeader>
        {onboardingStatus?.data?.Status == 'running' ? (
          <CSpinner color="orange" size="sm" className="me-2" />
        ) : (
          <FontAwesomeIcon
            icon={
              (onboardingStatus?.data?.Status == 'succeeded' && 'check-circle') ||
              (onboardingStatus?.data?.Status == 'failed' && 'times-circle') ||
              'question-circle'
            }
            color={
              (onboardingStatus?.data?.Status == 'succeeded' && 'green') ||
              (onboardingStatus?.data?.Status == 'failed' && 'red') ||
              'orange'
            }
            className="me-2"
          />
        )}
        Onboarding Relationship: {}
        {relationship.displayName}
      </CAccordionHeader>
      <CAccordionBody>
        <CRow>
          {(relationship?.customer?.displayName ||
            onboardingStatus?.data?.Relationship?.customer?.displayName) && (
            <CCol sm={12} md={6} className="mb-3">
              <p className="fw-lighter">Customer</p>
              {onboardingStatus?.data?.Relationship?.customer?.displayName
                ? onboardingStatus?.data?.Relationship?.customer?.displayName
                : relationship.customer.displayName}
            </CCol>
          )}
          {onboardingStatus?.data?.Timestamp && (
            <CCol sm={12} md={6} className="mb-3">
              <p className="fw-lighter">Last Updated</p>
              <ReactTimeAgo date={onboardingStatus?.data?.Timestamp} />
            </CCol>
          )}
          <CCol sm={12} md={6} className="mb-3">
            <p className="fw-lighter">Relationship Status</p>
            {relationship.status}
          </CCol>
          <CCol sm={12} md={6} className="mb-3">
            <p className="fw-lighter">Creation Date</p>
            <CellDate cell={relationship.createdDateTime} format="short" />
          </CCol>
          {relationship.status == 'approvalPending' &&
            onboardingStatus?.data?.Relationship?.status != 'active' && (
              <CCol sm={12} md={6} className="mb-3">
                <p className="fw-lighter">Invite URL</p>
                <CippCodeBlock
                  code={
                    'https://admin.microsoft.com/AdminPortal/Home#/partners/invitation/granularAdminRelationships/' +
                    relationship.id
                  }
                  language="text"
                  showLineNumbers={false}
                />
              </CCol>
            )}
        </CRow>
        {onboardingStatus.isUninitialized &&
          getOnboardingStatus({
            path: '/api/ExecOnboardTenant',
            values: {
              id: relationship.id,
              gdapRoles,
              autoMapRoles,
              addMissingGroups,
              standardsExcludeAllTenants,
            },
          })}
        {onboardingStatus.isSuccess && (
          <>
            {onboardingStatus.data?.Status != 'queued' && (
              <CButton
                onClick={() =>
                  getOnboardingStatus({
                    path: '/api/ExecOnboardTenant?Retry=True',
                    values: {
                      id: relationship.id,
                      gdapRoles,
                      autoMapRoles,
                      addMissingGroups,
                      standardsExcludeAllTenants,
                    },
                  })
                }
                className="mb-3 me-2"
              >
                <FontAwesomeIcon icon="sync" /> Retry
              </CButton>
            )}
            {onboardingStatus.data?.Logs && (
              <TableModalButton
                title="Logs"
                icon="book"
                data={onboardingStatus.data?.Logs}
                className="mb-3"
              />
            )}
            <hr className="mb-3" />
            {onboardingStatus.data?.OnboardingSteps?.map((step, idx) => (
              <CRow key={idx}>
                <CCol xs={12} md={4}>
                  {step.Status == 'running' ? (
                    <CSpinner size="sm" className="me-2" />
                  ) : (
                    <FontAwesomeIcon
                      icon={
                        (step.Status == 'succeeded' && 'check-circle') ||
                        (step.Status == 'pending' && 'question-circle') ||
                        (step.Status == 'failed' && 'times-circle')
                      }
                      color={
                        (step.Status == 'succeeded' && 'green') ||
                        (step.Status == 'pending' && 'white') ||
                        (step.Status == 'failed' && 'red')
                      }
                      className="me-2"
                    />
                  )}{' '}
                  {step.Title}
                </CCol>
                <CCol xs={12} md={8}>
                  {step.Message}
                </CCol>
              </CRow>
            ))}
          </>
        )}
      </CAccordionBody>
    </CAccordionItem>
  )
}
RelationshipOnboarding.propTypes = {
  relationship: PropTypes.object.isRequired,
  gdapRoles: PropTypes.array,
  autoMapRoles: PropTypes.bool,
  addMissingGroups: PropTypes.bool,
  statusOnly: PropTypes.bool,
  standardsExcludeAllTenants: PropTypes.bool,
}

export default RelationshipOnboarding
