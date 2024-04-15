import React, { useState } from 'react'
import { CNav, CNavItem, CTabContent, CTabPane } from '@coreui/react'
import { CippPage } from 'src/components/layout'
import { CippLazy } from 'src/components/utilities'

import { SettingsGeneral } from './SettingsGeneral.jsx'
import { SettingsTenants } from 'src/views/cipp/app-settings/SettingsTenants.jsx'
import { SettingsBackend } from 'src/views/cipp/app-settings/SettingsBackend.jsx'
import { SettingsNotifications } from 'src/views/cipp/app-settings/SettingsNotifications.jsx'
import { SettingsLicenses } from 'src/views/cipp/app-settings/SettingsLicenses.jsx'
import { SettingsExtensions } from 'src/views/cipp/app-settings/SettingsExtensions.jsx'
import { SettingsMaintenance } from 'src/views/cipp/app-settings/SettingsMaintenance.jsx'
import { SettingsExtensionMappings } from 'src/views/cipp/app-settings/SettingsExtensionMappings.jsx'

/**
 * This function returns the settings page content for CIPP.
 *
 * @returns {JSX.Element} The settings page content.
 */
export default function CIPPSettings() {
  const [active, setActive] = useState(1)
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
          Licenses
        </CNavItem>
        <CNavItem active={active === 6} onClick={() => setActive(6)} href="#">
          Maintenance
        </CNavItem>
        <CNavItem active={active === 7} onClick={() => setActive(7)} href="#">
          Extensions
        </CNavItem>
        <CNavItem active={active === 8} onClick={() => setActive(8)} href="#">
          Extension Mappings
        </CNavItem>
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
          <CippLazy visible={active === 5}>
            <SettingsLicenses />
          </CippLazy>
        </CTabPane>
        <CTabPane visible={active === 6} className="mt-3">
          <CippLazy visible={active === 6}>
            <SettingsMaintenance />
          </CippLazy>
        </CTabPane>
        <CTabPane visible={active === 7} className="mt-3">
          <CippLazy visible={active === 7}>
            <SettingsExtensions />
          </CippLazy>
        </CTabPane>
        <CTabPane visible={active === 8} className="mt-3">
          <CippLazy visible={active === 8}>
            <SettingsExtensionMappings />
          </CippLazy>
        </CTabPane>
      </CTabContent>
    </CippPage>
  )
}
