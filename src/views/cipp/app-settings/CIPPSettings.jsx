import React, { useState } from 'react'
import { CNav, CNavItem, CTabContent, CTabPane } from '@coreui/react'
import { CippPage } from 'src/components/layout'
import { CippLazy } from 'src/components/utilities'
import { useNavigate } from 'react-router-dom'
import { SettingsGeneral } from './SettingsGeneral.jsx'
import { SettingsTenants } from 'src/views/cipp/app-settings/SettingsTenants.jsx'
import { SettingsBackend } from 'src/views/cipp/app-settings/SettingsBackend.jsx'
import { SettingsNotifications } from 'src/views/cipp/app-settings/SettingsNotifications.jsx'
import { SettingsLicenses } from 'src/views/cipp/app-settings/SettingsLicenses.jsx'
import { SettingsMaintenance } from 'src/views/cipp/app-settings/SettingsMaintenance.jsx'
import { SettingsPartner } from 'src/views/cipp/app-settings/SettingsPartner.jsx'
import useQuery from 'src/hooks/useQuery.jsx'
import { SettingsSuperAdmin } from './SettingsSuperAdmin.jsx'
import { useLoadClientPrincipalQuery } from 'src/store/api/auth.js'

/**
 * This function returns the settings page content for CIPP.
 *
 * @returns {JSX.Element} The settings page content.
 */
export default function CIPPSettings() {
  const queryString = useQuery()
  const navigate = useNavigate()

  const tab = queryString.get('tab')
  const [active, setActiveTab] = useState(tab ? parseInt(tab) : 1)
  const { data: profile, isFetching } = useLoadClientPrincipalQuery()
  const setActive = (tab) => {
    setActiveTab(tab)
    queryString.set('tab', tab.toString())
    navigate(`${location.pathname}?${queryString}`)
  }
  const superAdmin = profile?.clientPrincipal?.userRoles?.includes('superadmin')
  return (
    <CippPage title="Settings" tenantSelector={false}>
      <CNav variant="tabs" role="tablist">
        <CNavItem active={active === 1} onClick={() => setActive(1)} href="#">
          General
        </CNavItem>
        <CNavItem active={active === 2} onClick={() => setActive(2)} href="#">
          Tenants
        </CNavItem>
        <CNavItem active={active === 3} onClick={() => setActive(3)} href="#">
          Backend
        </CNavItem>
        <CNavItem active={active === 4} onClick={() => setActive(4)} href="#">
          Notifications
        </CNavItem>
        <CNavItem active={active === 5} onClick={() => setActive(5)} href="#">
          Partner Webhooks
        </CNavItem>
        <CNavItem active={active === 6} onClick={() => setActive(6)} href="#">
          Licenses
        </CNavItem>
        <CNavItem active={active === 7} onClick={() => setActive(7)} href="#">
          Maintenance
        </CNavItem>
        {superAdmin && (
          <CNavItem active={active === 8} onClick={() => setActive(8)} href="#">
            SuperAdmin Settings
          </CNavItem>
        )}
      </CNav>
      <CTabContent>
        <CTabPane visible={active === 1} className="mt-3">
          <CippLazy visible={active === 1}>
            <SettingsGeneral />
          </CippLazy>
        </CTabPane>
        <CTabPane visible={active === 2} className="mt-3">
          <CippLazy visible={active === 2}>
            <SettingsTenants />
          </CippLazy>
        </CTabPane>
        <CTabPane visible={active === 3} className="mt-3">
          <CippLazy visible={active === 3}>
            <SettingsBackend />
          </CippLazy>
        </CTabPane>
        <CTabPane visible={active === 4} className="mt-3">
          <CippLazy visible={active === 4}></CippLazy>
          <SettingsNotifications />
        </CTabPane>
        <CTabPane visible={active === 5} className="mt-3">
          <CippLazy visible={active === 5}></CippLazy>
          <SettingsPartner />
        </CTabPane>
        <CTabPane visible={active === 6} className="mt-3">
          <CippLazy visible={active === 6}>
            <SettingsLicenses />
          </CippLazy>
        </CTabPane>
        <CTabPane visible={active === 7} className="mt-3">
          <CippLazy visible={active === 7}>
            <SettingsMaintenance />
          </CippLazy>
        </CTabPane>
        <CTabPane visible={active === 8} className="mt-3">
          <CippLazy visible={active === 8}>
            <SettingsSuperAdmin />
          </CippLazy>
        </CTabPane>
      </CTabContent>
    </CippPage>
  )
}
