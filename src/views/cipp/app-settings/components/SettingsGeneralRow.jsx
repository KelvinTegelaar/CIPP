import {
  useLazyExecClearCacheQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
  useLoadVersionsQuery,
} from 'src/store/api/app.js'
import React, { useRef } from 'react'
import useConfirmModal from 'src/hooks/useConfirmModal.jsx'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { StatusIcon } from 'src/components/utilities/index.js'
import { CippCallout } from 'src/components/layout/index.js'
import Skeleton from 'react-loading-skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { SettingsPassword } from 'src/views/cipp/app-settings/components/SettingsPassword.jsx'
import { SettingsDNSResolver } from 'src/views/cipp/app-settings/components/SettingsDNSResolver.jsx'

/**
 * Fetches and maintains DNS configuration settings for the application.
 *
 * @return {JSX.Element | void} The settings DNS component or nothing if data not ready.
 */
export function SettingsGeneralRow() {
  const [runBackup, RunBackupResult] = useLazyGenericGetRequestQuery()
  const [restoreBackup, restoreBackupResult] = useLazyGenericPostRequestQuery()

  const inputRef = useRef(null)
  const [clearCache, clearCacheResult] = useLazyExecClearCacheQuery()
  const { data: versions, isSuccess: isSuccessVersion } = useLoadVersionsQuery()

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

  return (
    <>
      <CCard className="h-100">
        <CCardHeader></CCardHeader>
        <CCardBody>
          <CRow>
            <CCol xl={4} md={12}>
              <SettingsPassword />
            </CCol>
            <CCol xl={4} md={12}>
              <SettingsDNSResolver />
            </CCol>
            <CCol xl={4} md={12}>
              <h3 className="underline mb-5">Frontend Version</h3>
              <StatusIcon
                type="negatedboolean"
                status={isSuccessVersion && versions.OutOfDateCIPP}
              />
              <div>Latest: {isSuccessVersion ? versions.RemoteCIPPVersion : <Skeleton />}</div>
              <div className="mb-3">
                Current: {isSuccessVersion ? versions.LocalCIPPVersion : <Skeleton />}
              </div>
            </CCol>
            <CCol xl={4} md={12} className="mb-3">
              <h3 className="underline mb-5">Clear Caches</h3>
              <CButton
                className="me-2 mb-2"
                onClick={() => handleClearCache()}
                disabled={clearCacheResult.isFetching}
              >
                {clearCacheResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Clear All Cache
              </CButton>
              <CButton
                className="me-2 mb-2"
                onClick={() => handleClearCacheTenant()}
                disabled={clearCacheResult.isFetching}
              >
                {clearCacheResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Clear Tenant Cache
              </CButton>
              {clearCacheResult.isSuccess && !clearCacheResult.isFetching && (
                <CippCallout
                  dismissible
                  color={clearCacheResult.isSuccess ? 'success' : 'danger'}
                  className="me-3"
                >
                  {clearCacheResult.data?.Results}
                </CippCallout>
              )}
            </CCol>
            <CCol xl={4} md={12} className="mb-3">
              <h3 className="underline mb-5">Settings Backup</h3>
              <CButton
                className="me-2 mb-2"
                onClick={() => runBackup({ path: '/api/ExecRunBackup' })}
                disabled={RunBackupResult.isFetching}
              >
                {RunBackupResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Run backup
              </CButton>
              <input
                ref={inputRef}
                type="file"
                accept="json/*"
                style={{ display: 'none' }}
                id="contained-button-file"
                onChange={(e) => handleChange(e)}
              />
              <CButton
                className="me-2 mb-2"
                name="file"
                onClick={() => inputRef.current.click()}
                disabled={restoreBackupResult.isFetching}
              >
                {restoreBackupResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Restore backup
              </CButton>
              {restoreBackupResult.isSuccess && !restoreBackupResult.isFetching && (
                <CippCallout color="success" dismissible>
                  {restoreBackupResult.data.Results}
                </CippCallout>
              )}
              {RunBackupResult.isSuccess && !restoreBackupResult.isFetching && (
                <CippCallout color="success" dismissible>
                  <CButton onClick={() => downloadTxtFile(RunBackupResult.data.backup)}>
                    Download Backup
                  </CButton>
                </CippCallout>
              )}
            </CCol>
            <CCol xl={4} md={12}>
              <h3 className="underline mb-5">Backend API Version</h3>
              <StatusIcon
                type="negatedboolean"
                status={isSuccessVersion && versions.OutOfDateCIPPAPI}
              />
              <div>Latest: {isSuccessVersion ? versions.RemoteCIPPAPIVersion : <Skeleton />}</div>
              <div className="mb-3">
                Current: {isSuccessVersion ? versions.LocalCIPPAPIVersion : <Skeleton />}
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </>
  )
}
