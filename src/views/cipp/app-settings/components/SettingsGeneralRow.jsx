import {
  useLazyExecClearCacheQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
  useLoadVersionsQuery,
} from 'src/store/api/app.js'
import React, { useRef } from 'react'
import useConfirmModal from 'src/hooks/useConfirmModal.jsx'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CFormCheck, CRow } from '@coreui/react'
import { StatusIcon } from 'src/components/utilities/index.js'
import { CippCallout } from 'src/components/layout/index.js'
import Skeleton from 'react-loading-skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { SettingsPassword } from 'src/views/cipp/app-settings/components/SettingsPassword.jsx'
import { SettingsDNSResolver } from 'src/views/cipp/app-settings/components/SettingsDNSResolver.jsx'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import { RFFCFormCheck } from 'src/components/forms'

/**
 * Fetches and maintains DNS configuration settings for the application.
 *
 * @return {JSX.Element | void} The settings DNS component or nothing if data not ready.
 */
export function SettingsGeneralRow() {
  const [setBackupSchedule, BackupScheduleResult] = useLazyGenericGetRequestQuery()
  const [runBackup, RunBackupResult] = useLazyGenericGetRequestQuery()
  const [restoreBackup, restoreBackupResult] = useLazyGenericPostRequestQuery()

  const inputRef = useRef(null)
  const [clearCache, clearCacheResult] = useLazyExecClearCacheQuery()
  const {
    data: versions,
    isSuccess: isSuccessVersion,
    refetch: RefechVersion,
  } = useLoadVersionsQuery()

  const downloadTxtFile = (data) => {
    const txtdata = [JSON.stringify(RunBackupResult.data.backup)]
    const file = new Blob(txtdata, { type: 'text/plain' })
    const element = document.createElement('a')
    element.href = URL.createObjectURL(file)
    element.download = 'CIPP-Backup' + Date.now() + '.json'
    document.body.appendChild(element)
    element.click()
  }
  const handleChange = (e) => {
    const fileReader = new FileReader()
    fileReader.readAsText(e.target.files[0], 'UTF-8')
    fileReader.onload = (e) => {
      restoreBackup({ path: '/api/ExecRestoreBackup', values: e.target.result })
    }
  }
  const handleBackupSchedule = () => {
    setBackupSchedule({ path: `/api/ExecSetCIPPAutoBackup?Enabled=true` })
  }

  const handleClearCache = useConfirmModal({
    body: <div>Are you sure you want to clear the cache?</div>,
    onConfirm: () => {
      clearCache({ tenantsOnly: false })
      localStorage.clear()
    },
  })

  const handleClearCacheTenant = useConfirmModal({
    body: <div>Are you sure you want to clear the cache?</div>,
    onConfirm: () => {
      clearCache({ tenantsOnly: true })
    },
  })
  const refreshVersionButton = (
    <CButton onClick={() => RefechVersion()}>Check version update</CButton>
  )

  const cacheButton = (
    <>
      <CButton
        className="me-2"
        onClick={() => handleClearCache()}
        disabled={clearCacheResult.isFetching}
      >
        {clearCacheResult.isFetching && (
          <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
        )}
        Clear All Cache
      </CButton>
      <CButton
        className="me-2"
        onClick={() => handleClearCacheTenant()}
        disabled={clearCacheResult.isFetching}
      >
        {clearCacheResult.isFetching && (
          <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
        )}
        Clear Tenant Cache
      </CButton>
    </>
  )
  const backupButton = (
    <>
      <CButton
        className="me-2"
        onClick={() => runBackup({ path: '/api/ExecRunBackup' })}
        disabled={RunBackupResult.isFetching}
      >
        {RunBackupResult.isFetching && (
          <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
        )}
        Run backup
      </CButton>
      <CButton
        className="me-2"
        name="file"
        onClick={() => inputRef.current.click()}
        disabled={restoreBackupResult.isFetching}
      >
        {restoreBackupResult.isFetching && (
          <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
        )}
        Restore backup
      </CButton>
      <CButton
        className="me-2"
        name="file"
        onClick={() => handleBackupSchedule()}
        disabled={BackupScheduleResult.isFetching}
      >
        {BackupScheduleResult.isFetching && (
          <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
        )}
        Create Automated Backup Task
      </CButton>
    </>
  )
  return (
    <>
      <CRow className="mb-3">
        <CCol classname="mb-3" xl={4} md={12}>
          <SettingsPassword />
        </CCol>
        <CCol classname="mb-3" xl={4} md={12}>
          <SettingsDNSResolver />
        </CCol>
        <CCol classname="mb-3" xl={4} md={12}>
          <CippButtonCard
            title="Frontend Version"
            titleType="big"
            isFetching={!isSuccessVersion}
            CardButton={refreshVersionButton}
          >
            <StatusIcon type="negatedboolean" status={isSuccessVersion && versions.OutOfDateCIPP} />
            <small>
              <div>Latest: {isSuccessVersion ? versions.RemoteCIPPVersion : <Skeleton />}</div>
              <div>Current: {isSuccessVersion ? versions.LocalCIPPVersion : <Skeleton />}</div>
            </small>
          </CippButtonCard>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol xl={4} md={12}>
          <CippButtonCard
            title="Cache"
            titleType="big"
            isFetching={clearCacheResult.isFetching}
            CardButton={cacheButton}
          >
            <small>
              Use this button to clear the caches used by CIPP. This will slow down some aspects of
              the application, and should only be used when instructed to do so by support.
            </small>
            {clearCacheResult.isSuccess && !clearCacheResult.isFetching && (
              <CippCallout
                dismissible
                color={clearCacheResult.isSuccess ? 'success' : 'danger'}
                className="me-3"
              >
                {clearCacheResult.data?.Results}
              </CippCallout>
            )}
          </CippButtonCard>
        </CCol>
        <CCol xl={4} md={12}>
          <CippButtonCard
            title="Backup"
            titleType="big"
            isFetching={clearCacheResult.isFetching}
            CardButton={backupButton}
          >
            <input
              ref={inputRef}
              type="file"
              accept="json/*"
              style={{ display: 'none' }}
              id="contained-button-file"
              onChange={(e) => handleChange(e)}
            />
            <CRow className="mb-3">
              <small>
                Use this button to backup the system configuration for CIPP. This will not include
                authentication information or extension configuration. You can also set an automated
                daily backup schedule by clicking the button below. This will create a scheduled
                task for you.
              </small>
            </CRow>
            {restoreBackupResult.isSuccess && !restoreBackupResult.isFetching && (
              <CippCallout color="success" dismissible>
                {restoreBackupResult.data.Results}
              </CippCallout>
            )}
            {BackupScheduleResult.isSuccess && !BackupScheduleResult.isFetching && (
              <CippCallout color="success" dismissible>
                {BackupScheduleResult.data.Results}
              </CippCallout>
            )}
            {RunBackupResult.isSuccess && !restoreBackupResult.isFetching && (
              <CippCallout color="success" dismissible>
                <CButton onClick={() => downloadTxtFile(RunBackupResult.data.backup)}>
                  Download Backup
                </CButton>
              </CippCallout>
            )}
          </CippButtonCard>
        </CCol>
        <CCol xl={4} md={12}>
          <CippButtonCard
            title="Backend Version"
            titleType="big"
            isFetching={!isSuccessVersion}
            CardButton={refreshVersionButton}
          >
            <StatusIcon
              type="negatedboolean"
              status={isSuccessVersion && versions.OutOfDateCIPPAPI}
            />
            <small>
              <div>Latest: {isSuccessVersion ? versions.RemoteCIPPAPIVersion : <Skeleton />}</div>
              <div>Current: {isSuccessVersion ? versions.LocalCIPPAPIVersion : <Skeleton />}</div>
            </small>
          </CippButtonCard>
        </CCol>
      </CRow>
    </>
  )
}
