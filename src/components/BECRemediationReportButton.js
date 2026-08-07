import { useState } from 'react'
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { PictureAsPdf, Download, Close } from '@mui/icons-material'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { useReportVariables } from './CippPdf/useReportVariables'
import { useBrandingSettings } from './CippPdf/useBrandingSettings'
import {
  AlertBox,
  Bold,
  Bullet,
  BulletList,
  ClearBox,
  ContentPage,
  CoverMeta,
  InfoBox,
  Note,
  Paragraph,
  ReportDocument,
  Section,
  StatRow,
} from './CippPdf'

// BEC Remediation PDF Document Component
// Exported so the branding preview can render this report against sample data, and so tests can
// render it to a real PDF.
export const BECRemediationReportDocument = ({
  userData,
  becData,
  brandingSettings,
  tenantName,
  remediationData,
  variables,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })


  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const formatSafelistValue = (value) => {
    if (!value) return 'unchanged'
    return Array.isArray(value) ? value.join(', ') || 'unchanged' : String(value)
  }

  // Calculate statistics
  const stats = {
    newRules: becData?.NewRules?.length || 0,
    ruleChanges: becData?.InboxRuleChanges?.length || 0,
    newUsers: becData?.NewUsers?.length || 0,
    newApps: becData?.AddedApps?.length || 0,
    permissionChanges: becData?.MailboxPermissionChanges?.length || 0,
    mfaDevices: becData?.MFADevices?.length || 0,
    passwordChanges: becData?.ChangedPasswords?.length || 0,
    trustedSenders: becData?.TrustedSenders?.length || 0,
    blockedSenders: becData?.BlockedSenders?.length || 0,
    safelistChanges: becData?.SafelistChanges?.length || 0,
    intuneDevices: becData?.IntuneDevices?.length || 0,
  }

  const intuneWindowStart = (() => {
    const extractedAt = becData?.ExtractedAt ? new Date(becData.ExtractedAt) : new Date()
    if (Number.isNaN(extractedAt.getTime())) {
      return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
    return new Date(extractedAt.getTime() - 7 * 24 * 60 * 60 * 1000)
  })()

  const recentIntuneDevices = (becData?.IntuneDevices || []).filter((device) => {
    if (!device?.enrolledDateTime) return false
    const enrolled = new Date(device.enrolledDateTime)
    if (Number.isNaN(enrolled.getTime())) return false
    return enrolled >= intuneWindowStart
  })
  stats.recentIntuneDevices = recentIntuneDevices.length

  const sortedIntuneDevices = [...(becData?.IntuneDevices || [])].sort((a, b) => {
    const aTime = a?.enrolledDateTime ? new Date(a.enrolledDateTime).getTime() : 0
    const bTime = b?.enrolledDateTime ? new Date(b.enrolledDateTime).getTime() : 0
    return bTime - aTime
  })

  // Determine threat level
  const calculateThreatLevel = () => {
    let threatScore = 0
    if (stats.newRules > 0) threatScore += 3
    if (stats.ruleChanges > 0) threatScore += 3
    if (stats.permissionChanges > 0) threatScore += 2
    if (stats.newApps > 0) threatScore += 2
    if (stats.newUsers > 5) threatScore += 1
    if (stats.safelistChanges > 0) threatScore += 2

    // Check for suspicious rules (RSS folder moves)
    const hasSuspiciousRules = becData?.NewRules?.some((rule) => rule.MoveToFolder?.includes('RSS'))
    if (hasSuspiciousRules) threatScore += 5

    if (threatScore >= 7) return { level: 'High', color: '#742A2A' }
    if (threatScore >= 4) return { level: 'Medium', color: '#744210' }
    return { level: 'Low', color: '#22543D' }
  }

  const threatLevel = calculateThreatLevel()

  return (
    <ReportDocument
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      reportName="BEC Analysis Report"
      generatedOn={currentDate}
      variables={variables}
      coverLabel="SECURITY INCIDENT REPORT"
      coverTitle="BEC Compromise"
      coverAccent="Analysis"
      coverSubtitle={`Business Email Compromise Investigation Report for ${
        tenantName || 'your organization'
      }`}
      // The one report whose subject is a person rather than the tenant, so the cover names the
      // compromised account.
      coverTenant={userData?.displayName || 'Unknown User'}
      coverFallbackImage="/reportImages/soc.jpg"
      coverFooterNote="Confidential & Proprietary - For Internal Use Only"
      footerLabel={`${tenantName} - BEC Analysis Report for ${userData?.displayName}`}
      coverMeta={
        <CoverMeta
          lines={[userData?.userPrincipalName || 'user@domain.com']}
          note={`Analysis Date: ${becData?.ExtractedAt ? formatDate(becData.ExtractedAt) : 'N/A'}`}
        />
      }
    >
      {/* EXECUTIVE SUMMARY PAGE */}
      <ContentPage title="Executive Summary" subtitle="Overview of Business Email Compromise investigation findings">

        <Section>
          <Paragraph>
            This report documents the findings of a Business Email Compromise (BEC) investigation
            performed for the user account{' '}
            <Bold>{userData?.userPrincipalName}</Bold> within{' '}
            <Bold>{tenantName}</Bold>. The investigation analyzed
            suspicious activity indicators including mailbox rules, permission changes, new
            applications, and authentication patterns over a 7-day period.
          </Paragraph>

          <Paragraph>
            Business Email Compromise is a sophisticated scam targeting organizations that regularly
            perform wire transfers or have established relationships with foreign suppliers.
            Attackers compromise legitimate email accounts through social engineering or computer
            intrusion techniques to conduct unauthorized fund transfers, steal sensitive
            information, or impersonate executives.
          </Paragraph>
        </Section>

        <Section title="Investigation Overview">

          <StatRow
            stats={[
              { value: stats.newRules, label: 'Mailbox Rules' },
              { value: stats.permissionChanges, label: 'Permission Changes' },
              { value: stats.newApps, label: 'New Applications' },
              { value: stats.newUsers, label: 'New Users' },
            ]}
          />

          <AlertBox colour={threatLevel.color} title={`Threat Assessment: ${threatLevel.level}`}>
              {threatLevel.level === 'High' &&
                'HIGH RISK: Multiple indicators of compromise detected. Immediate remediation actions are strongly recommended. This account shows patterns consistent with active Business Email Compromise attacks.'}
              {threatLevel.level === 'Medium' &&
                'MEDIUM RISK: Suspicious activity patterns detected. Review findings and consider implementing recommended security measures. Some indicators suggest potential unauthorized access.'}
              {threatLevel.level === 'Low' &&
                'LOW RISK: Minimal suspicious activity detected. The findings show standard user behavior with no significant indicators of compromise. Continue monitoring as a precautionary measure.'}
            </AlertBox>
        </Section>

        <Section title="Data Source Information">
          <InfoBox title="Audit Log Status">{becData?.ExtractResult || 'Unknown'}</InfoBox>
          <InfoBox title="Analysis Period">
              Last 7 days ending {becData?.ExtractedAt ? formatDate(becData.ExtractedAt) : 'N/A'}
            </InfoBox>
        </Section>
      </ContentPage>

      {/* UNDERSTANDING BEC PAGE */}
      <ContentPage title="Understanding Business Email Compromise" subtitle="What is BEC and why does it matter?">

        <Section title="What is Business Email Compromise?">
          <Paragraph>
            Business Email Compromise (BEC) is a type of cyberattack where criminals gain
            unauthorized access to a business email account. Once inside, attackers can:
          </Paragraph>

          <BulletList>
            <Bullet label="Monitor communications:"> Read sensitive
                emails to learn about business operations, financial processes, and key
                relationships.
              </Bullet>
            <Bullet label="Impersonate executives:"> Send fraudulent
                emails appearing to come from company leadership requesting wire transfers or
                sensitive data.
              </Bullet>
            <Bullet label="Manipulate transactions:"> Intercept
                legitimate invoices and alter payment information to redirect funds to
                attacker-controlled accounts.
              </Bullet>
            <Bullet label="Hide their tracks:"> Create email rules to
                automatically delete or hide messages, preventing detection.
              </Bullet>
          </BulletList>
        </Section>

        <Section title="Common Attack Methods">
          <Paragraph>
            Attackers typically gain access to email accounts through:
          </Paragraph>

          <BulletList>
            <Bullet label="Phishing:"> Deceptive emails that trick
                users into providing their login credentials on fake websites.
              </Bullet>
            <Bullet label="Password Spraying:"> Automated attempts to
                log in using common passwords across many accounts.
              </Bullet>
            <Bullet label="Credential Stuffing:"> Using usernames and
                passwords leaked from other breached websites.
              </Bullet>
            <Bullet label="Malware:"> Software that captures
                keystrokes or steals stored passwords from compromised devices.
              </Bullet>
          </BulletList>
        </Section>

        <Section title="Why This Investigation Was Performed">
          <Paragraph>
            This analysis was initiated because suspicious activity was detected or reported for
            this user account. The investigation examines multiple indicators that might suggest
            account compromise, including unusual mailbox rules, unexpected permission changes, new
            application authorizations, and abnormal sign-in patterns. Early detection is critical
            to minimize potential damage and prevent financial loss or data theft.
          </Paragraph>
        </Section>
      </ContentPage>

      {/* DETAILED FINDINGS PAGE */}
      <ContentPage title="Detailed Findings" subtitle="Investigation results and analysis">

        {/* Check 1: Mailbox Rules */}
        <Section title="Check 1: Mailbox Rules">
          <InfoBox title="Why We Check This">
              Attackers often create email rules to automatically forward, delete, or hide messages.
              This prevents victims from seeing evidence of fraudulent activity. Suspicious rules
              may move emails to obscure folders like "RSS Subscriptions" or forward them to
              external addresses.
            </InfoBox>

          {stats.newRules > 0 && (
            <>
              <AlertBox title={`⚠ ${stats.newRules} Mailbox Rule(s) Found`}>
                  The following mailbox rules were detected. Review each rule carefully to determine
                  if it was created by the user or by an attacker. Rules that forward emails or move
                  them to unusual folders are particularly suspicious.
                </AlertBox>

              {becData.NewRules.slice(0, 10).map((rule, index) => (
                <InfoBox key={index} title={`Rule: ${rule.Name || 'Unnamed Rule'}`}>
                    Description: {rule.Description || 'No description available'}
                    {'\n'}
                    {rule.MoveToFolder && `Moves to: ${rule.MoveToFolder}`}
                    {rule.ForwardTo && `\nForwards to: ${rule.ForwardTo}`}
                    {rule.DeleteMessage && '\nDeletes messages'}
                    {rule.RecentlyChanged && '\nCreated or changed in the last 7 days'}
                  </InfoBox>
              ))}
              {becData.NewRules.length > 10 && (
                <Note>
                  ... and {becData.NewRules.length - 10} more rules (see JSON export for full list)
                </Note>
              )}
            </>
          )}
          {stats.ruleChanges > 0 && (
            <>
              <AlertBox title={`⚠ ${stats.ruleChanges} Rule Change(s) in the Last 7 Days`}>
                  The audit log recorded inbox rules being created, changed or removed on this
                  mailbox. Rules that were removed after use are a common way for attackers to cover
                  their tracks.
                </AlertBox>

              {becData.InboxRuleChanges.slice(0, 10).map((change, index) => (
                <InfoBox key={index} title={`${change.Operation || 'Rule Change'}: ${change.RuleName || 'Unnamed Rule'}`}>
                    Date: {change.Date || 'Unknown'}
                    {'\n'}
                    By: {change.UserKey || 'Unknown'}
                    {change.Parameters && `\nParameters: ${change.Parameters}`}
                  </InfoBox>
              ))}
              {becData.InboxRuleChanges.length > 10 && (
                <Note>
                  ... and {becData.InboxRuleChanges.length - 10} more changes (see JSON export for
                  full list)
                </Note>
              )}
            </>
          )}
          {stats.newRules === 0 && stats.ruleChanges === 0 && (
            <ClearBox title="✓ No Suspicious Rules Found">
                No mailbox rules were detected that match suspicious patterns. This is a positive
                indicator.
              </ClearBox>
          )}
        </Section>
      </ContentPage>

      {/* CHECK 2: NEW USERS */}
      <ContentPage title="Detailed Findings (Continued)" subtitle="Investigation results and analysis">

        <Section title="Check 2: Recently Created Users">
          <InfoBox title="Why We Check This">
              Attackers sometimes create new user accounts to maintain persistent access or to use
              as staging accounts for fraudulent activities. Reviewing recently created users helps
              identify unauthorized account creation.
            </InfoBox>

          {stats.newUsers > 0 ? (
            <>
              <AlertBox title={`ℹ ${stats.newUsers} New User(s) Found`}>
                  The following users were created in the last 7 days. Verify that each account
                  creation was authorized and legitimate.
                </AlertBox>

              {becData.NewUsers.slice(0, 8).map((user, index) => (
                <InfoBox key={index} title={`${user.displayName || 'Unknown'}`}>
                    Email: {user.userPrincipalName || 'N/A'}
                    {'\n'}
                    Created: {formatDate(user.createdDateTime)}
                  </InfoBox>
              ))}
              {becData.NewUsers.length > 8 && (
                <Note>
                  ... and {becData.NewUsers.length - 8} more users (see JSON export for full list)
                </Note>
              )}
            </>
          ) : (
            <ClearBox title="✓ No New Users Found">
                No new user accounts were created during the analysis period.
              </ClearBox>
          )}
        </Section>

        {/* Check 3: New Applications */}
        <Section title="Check 3: New Applications">
          <InfoBox title="Why We Check This">
              Attackers may authorize malicious or suspicious third-party applications to access
              your email and data. These applications can read emails, send messages, and access
              files without the user's explicit knowledge.
            </InfoBox>

          {stats.newApps > 0 ? (
            <>
              <AlertBox title={`⚠ ${stats.newApps} New Application(s) Found`}>
                  New applications were granted access during the analysis period. Review each
                  application to ensure it was authorized and is from a trusted publisher.
                </AlertBox>

              {becData.AddedApps.slice(0, 6).map((app, index) => (
                <InfoBox key={index} title={`${app.displayName || app.appDisplayName || 'Unknown'}`}>
                    Publisher: {app.publisher || 'Unknown'}
                    {'\n'}
                    App ID: {app.appId || 'N/A'}
                    {'\n'}
                    Created: {formatDate(app.createdDateTime)}
                  </InfoBox>
              ))}
              {becData.AddedApps.length > 6 && (
                <Note>
                  ... and {becData.AddedApps.length - 6} more apps (see JSON export for full list)
                </Note>
              )}
            </>
          ) : (
            <ClearBox title="✓ No New Applications Found">
                No new applications were authorized during the analysis period.
              </ClearBox>
          )}
        </Section>
      </ContentPage>

      {/* CHECK 4, 5, 6: PERMISSIONS, MFA, PASSWORDS */}
      <ContentPage title="Additional Security Checks" subtitle="Permissions, authentication, and access patterns">

        {/* Check 4: Mailbox Permission Changes */}
        <Section title="Check 4: Mailbox Permission Changes">
          <InfoBox title="Why We Check This">
              Unauthorized changes to mailbox permissions can allow attackers to grant themselves or
              accomplices access to read, send, or manage emails. This is a common technique to
              maintain persistent access.
            </InfoBox>

          {stats.permissionChanges > 0 ? (
            <>
              <AlertBox title={`⚠ ${stats.permissionChanges} Permission Change(s) Found`}>
                  Mailbox permission changes were detected. Verify that each change was authorized
                  and necessary for legitimate business purposes.
                </AlertBox>

              {becData.MailboxPermissionChanges.slice(0, 5).map((change, index) => (
                <InfoBox key={index} title={`${change.Operation || 'Permission Change'}`}>
                    User: {change.UserKey || 'Unknown'}
                    {'\n'}
                    Target: {change.ObjectId || 'N/A'}
                    {'\n'}
                    Permissions: {change.Permissions || 'Unknown'}
                  </InfoBox>
              ))}
              {becData.MailboxPermissionChanges.length > 5 && (
                <Note>
                  ... and {becData.MailboxPermissionChanges.length - 5} more changes
                </Note>
              )}
            </>
          ) : (
            <ClearBox title="✓ No Permission Changes Found">
                No mailbox permission changes were detected during the analysis period.
              </ClearBox>
          )}
        </Section>

        {/* Check 5: MFA Devices */}
        <Section title="Check 5: MFA Devices">
          <InfoBox title="Why We Check This">
              Multi-factor authentication (MFA) devices provide an additional layer of security.
              Reviewing registered MFA methods helps identify if attackers have added unauthorized
              devices to bypass security controls.
            </InfoBox>

          {stats.mfaDevices > 0 ? (
            <>
              <Paragraph indent>
                ℹ {stats.mfaDevices} MFA device(s) registered. Verify each device belongs to the
                user.
              </Paragraph>

              {becData.MFADevices.slice(0, 5).map((device, index) => (
                <InfoBox key={index} title={`${device['@odata.type'] ?.replace('#microsoft.graph.', '') .replace('AuthenticationMethod', '') || 'Unknown'}`}>
                    Display Name: {device.displayName || 'N/A'}
                    {'\n'}
                    Registered: {formatDate(device.createdDateTime)}
                  </InfoBox>
              ))}
            </>
          ) : (
            <InfoBox tone="warn" title="⚠ No MFA Devices Found">
                No multi-factor authentication devices are registered. MFA is highly recommended to
                prevent unauthorized access.
              </InfoBox>
          )}
        </Section>

        {/* Check 6: Password Changes */}
        <Section title="Check 6: Recent Password Changes">
          <InfoBox title="Why We Check This">
              Attackers often change passwords to lock out legitimate users. Reviewing recent
              password changes in the tenant helps identify if the compromised account's password
              was changed or if other accounts were affected.
            </InfoBox>

          {stats.passwordChanges > 0 ? (
            <>
              <Paragraph indent>
                ℹ {stats.passwordChanges} password change(s) detected in the tenant during the
                analysis period.
              </Paragraph>

              {becData.ChangedPasswords.slice(0, 5).map((user, index) => (
                <InfoBox key={index} title={`${user.displayName || 'Unknown'}`}>
                    Email: {user.userPrincipalName || 'N/A'}
                    {'\n'}
                    Last Password Change: {formatDate(user.lastPasswordChangeDateTime)}
                  </InfoBox>
              ))}
            </>
          ) : (
            <Paragraph indent>
              ℹ No password changes detected during the analysis period.
            </Paragraph>
          )}
        </Section>

        {/* Check 7: Trusted & Blocked Senders */}
        <Section title="Check 7: Trusted &amp; Blocked Senders">
          <InfoBox title="Why We Check This">
              Attackers may add their own domain to the Trusted Senders list so their fraudulent
              messages bypass spam filtering, or add finance/security domains to the Blocked
              Senders list so warnings and alerts are hidden from the victim in the Junk Email
              folder.
            </InfoBox>

          {stats.safelistChanges > 0 && (
            <>
              <AlertBox title={`⚠ ${stats.safelistChanges} Safelist Change(s) in the Last 7 Days`}>
                  The audit log recorded changes to the Trusted/Blocked Senders and Domains list on
                  this mailbox. Review each change carefully.
                </AlertBox>

              {becData.SafelistChanges.slice(0, 10).map((change, index) => (
                <InfoBox key={index} title={`${change.Operation || 'Safelist Change'} by ${change.UserKey || 'Unknown'}`}>
                    Date: {formatDate(change.Date)}
                    {'\n'}
                    Trusted: {formatSafelistValue(change.Trusted)}
                    {'\n'}
                    Blocked: {formatSafelistValue(change.Blocked)}
                  </InfoBox>
              ))}
            </>
          )}

          {stats.trustedSenders > 0 && (
            <InfoBox title={`Trusted Senders/Domains (${stats.trustedSenders})`}>{becData.TrustedSenders.slice(0, 15).join(', ')}</InfoBox>
          )}

          {stats.blockedSenders > 0 && (
            <InfoBox title={`Blocked Senders/Domains (${stats.blockedSenders})`}>{becData.BlockedSenders.slice(0, 15).join(', ')}</InfoBox>
          )}

          {stats.trustedSenders === 0 && stats.blockedSenders === 0 && stats.safelistChanges === 0 && (
            <ClearBox title="✓ No Trusted or Blocked Senders Found">
                No trusted or blocked sender/domain entries were found on this mailbox.
              </ClearBox>
          )}
        </Section>

        {/* Check 8: Intune Devices */}
        <Section title="Check 8: Intune Devices">
          <InfoBox title="Why We Check This">
              Newly enrolled Intune devices can indicate an attacker standing up a VM or BYOD
              endpoint under the compromised identity, including paths that re-register Windows
              Hello for Business. Review devices enrolled during the analysis window first.
            </InfoBox>

          {becData?.IntuneDevicesError ? (
            <AlertBox title="⚠ Could Not Retrieve Intune Devices">
                {becData.IntuneDevicesError}
                {'\n'}
                An empty device list here does not mean the user has no Intune devices.
              </AlertBox>
          ) : stats.intuneDevices > 0 ? (
            <>
              <Paragraph indent>
                ℹ {stats.intuneDevices} Intune-managed device(s) associated with this user
                {stats.recentIntuneDevices > 0
                  ? `, including ${stats.recentIntuneDevices} enrolled in the last 7 days.`
                  : '. None were enrolled in the last 7 days.'}
              </Paragraph>

              {sortedIntuneDevices.slice(0, 5).map((device, index) => (
                <InfoBox key={index} title={`${device.deviceName || 'Unknown device'}`}>
                    OS: {device.operatingSystem || 'N/A'}
                    {device.osVersion ? ` ${device.osVersion}` : ''}
                    {'\n'}
                    Enrolled: {formatDate(device.enrolledDateTime)}
                    {'\n'}
                    Compliance: {device.complianceState || 'N/A'}
                    {'\n'}
                    Enrollment Type: {device.deviceEnrollmentType || 'N/A'}
                    {device.serialNumber ? `\nSerial: ${device.serialNumber}` : ''}
                  </InfoBox>
              ))}
            </>
          ) : (
            <ClearBox title="✓ No Intune Devices Found">
                No Intune-managed devices were found for this user.
              </ClearBox>
          )}
        </Section>
      </ContentPage>

      {/* RECOMMENDATIONS PAGE */}
      <ContentPage title="Recommendations" subtitle="Actions to take and prevention best practices">

        <Section title="Immediate Actions Required">
          <Paragraph>
            Based on the investigation findings, the following actions should be taken immediately:
          </Paragraph>

          <BulletList>
            <Bullet marker="1." label="Reset Password:"> Change the user's
                password immediately to prevent further unauthorized access.
              </Bullet>
            <Bullet marker="2." label="Revoke Sessions:"> Sign out the user from
                all active sessions to terminate any attacker access.
              </Bullet>
            <Bullet marker="3." label="Remove Suspicious Rules:"> Delete any
                mailbox rules that forward, redirect, or hide emails, especially those moving
                messages to unusual folders.
              </Bullet>
            <Bullet marker="4." label="Review MFA Devices:"> Remove any MFA
                devices that the user doesn't recognize and re-register legitimate devices.
              </Bullet>
            <Bullet marker="5." label="Audit Permissions:"> Review and revoke any
                unauthorized mailbox permissions or application consents.
              </Bullet>
            <Bullet marker="6." label="Monitor Account:"> Continue monitoring the
                account for suspicious activity for at least 30 days.
              </Bullet>
          </BulletList>
        </Section>

        <Section title="Long-Term Prevention Strategies">
          <Paragraph>
            To prevent future Business Email Compromise attacks, implement these security best
            practices:
          </Paragraph>

          <BulletList>
            <Bullet label="Enforce Multi-Factor Authentication (MFA):">{' '}
                Require MFA for all users, especially those with administrative privileges or access
                to financial systems.
              </Bullet>
            <Bullet label="Implement Security Awareness Training:">{' '}
                Educate employees about phishing, social engineering, and how to identify suspicious
                emails. Regular training significantly reduces successful attacks.
              </Bullet>
            <Bullet label="Enable Advanced Threat Protection:"> Use
                email security solutions that detect and block phishing, malware, and suspicious
                attachments.
              </Bullet>
            <Bullet label="Configure Conditional Access Policies:">{' '}
                Restrict access based on location, device compliance, and risk level to prevent
                unauthorized sign-ins.
              </Bullet>
            <Bullet label="Monitor Audit Logs:"> Regularly review
                audit logs for suspicious activities such as unusual sign-in patterns, rule
                creation, or permission changes.
              </Bullet>
            <Bullet label="Establish Financial Controls:"> Implement
                multi-person approval processes for wire transfers and payment changes to prevent
                fraudulent transactions.
              </Bullet>
          </BulletList>
        </Section>

        <Section title="User Education Points">
          <Paragraph>
            Share these key points with the affected user to help prevent future compromises:
          </Paragraph>

          <BulletList>
            <Bullet>
                Never click on links or open attachments in unexpected emails, even if they appear
                to come from known contacts.
              </Bullet>
            <Bullet>
                Always verify unusual requests for money transfers or sensitive information through
                a separate communication channel (phone call, in person).
              </Bullet>
            <Bullet>
                Use strong, unique passwords for each account and consider using a password manager.
              </Bullet>
            <Bullet>
                Be cautious when authorizing new applications or granting permissions to third-party
                services.
              </Bullet>
            <Bullet>
                Report suspicious emails or activities to your IT security team immediately.
              </Bullet>
          </BulletList>
        </Section>
      </ContentPage>

      {/* COMPLIANCE & DOCUMENTATION PAGE */}
      <ContentPage title="Compliance & Documentation" subtitle="Meeting regulatory and audit requirements">

        <Section title="Compliance Considerations">
          <Paragraph>
            This report supports compliance and documentation requirements for various security
            frameworks and regulatory standards:
          </Paragraph>

          <BulletList>
            <Bullet label="ISO 27001:"> Demonstrates incident
                detection, analysis, and response procedures (Controls A.16.1.1 - A.16.1.7).
              </Bullet>
            <Bullet label="CMMC Level 2:"> Provides evidence of
                security incident monitoring, analysis, and documentation (AC.L2-3.1.12,
                AU.L2-3.3.1).
              </Bullet>
            <Bullet label="SOC 2 Type II:"> Documents detective and
                responsive controls for security incidents (CC7.3, CC7.4).
              </Bullet>
            <Bullet label="NIST CSF:"> Aligns with Detect (DE.AE,
                DE.CM) and Respond (RS.AN, RS.MI) functions.
              </Bullet>
            <Bullet label="GDPR:"> Demonstrates security breach
                detection and potential data breach assessment (Articles 32, 33).
              </Bullet>
          </BulletList>
        </Section>

        <Section title="Audit Trail">
          <Paragraph>
            This investigation and resulting documentation provide an audit trail for security
            incident response:
          </Paragraph>

          <InfoBox title="Investigation Details">
              Investigation Date: {formatDate(becData?.ExtractedAt)}
              {'\n'}
              Analyzed User: {userData?.userPrincipalName}
              {'\n'}
              Organization: {tenantName}
              {'\n'}
              Analysis Period: 7 days
              {'\n'}
              Audit Log Status: {becData?.ExtractResult || 'Unknown'}
            </InfoBox>

          <InfoBox title="Findings Summary">
              Threat Level: {threatLevel.level}
              {'\n'}
              Mailbox Rules Found: {stats.newRules}
              {'\n'}
              Rule Changes: {stats.ruleChanges}
              {'\n'}
              Permission Changes: {stats.permissionChanges}
              {'\n'}
              New Applications: {stats.newApps}
              {'\n'}
              New Users: {stats.newUsers}
              {'\n'}
              MFA Devices: {stats.mfaDevices}
              {'\n'}
              Password Changes: {stats.passwordChanges}
              {'\n'}
              Trusted Senders: {stats.trustedSenders}
              {'\n'}
              Blocked Senders: {stats.blockedSenders}
              {'\n'}
              Safelist Changes: {stats.safelistChanges}
              {'\n'}
              Intune Devices: {stats.intuneDevices}
              {'\n'}
              Recent Intune Enrollments (7d): {stats.recentIntuneDevices}
            </InfoBox>
        </Section>

        <Section title="Document Retention">
          <Paragraph>
            This report should be retained according to your organization's document retention
            policy and regulatory requirements. Typical retention periods range from 3-7 years
            depending on applicable compliance frameworks. Store this document securely with
            restricted access as it contains sensitive security information.
          </Paragraph>
        </Section>

        <Section title="Additional Resources">
          <Paragraph>
            For more information about Business Email Compromise and cybersecurity best practices:
          </Paragraph>

          <BulletList>
            <Bullet>
                FBI IC3: Internet Crime Complaint Center (ic3.gov)
              </Bullet>
            <Bullet>
                CISA: Cybersecurity & Infrastructure Security Agency (cisa.gov)
              </Bullet>
            <Bullet>
                Microsoft Security: Business Email Compromise resources
              </Bullet>
          </BulletList>
        </Section>
      </ContentPage>
    </ReportDocument>
  )
}

// Main Button Component
export const BECRemediationReportButton = ({ userData, becData, tenantName }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Check if we have the necessary data
  const hasData = userData && becData && !becData.Waiting

  const brandingSettings = useBrandingSettings()
  const variables = useReportVariables()

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  if (!hasData) {
    return null // Don't show button if data isn't ready
  }

  return (
    <>
      <Tooltip title="Generate BEC Remediation Report PDF">
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={handleOpenDialog}
          disabled={!hasData}
          color="primary"
        >
          Generate PDF Report
        </Button>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div">
              BEC Remediation Report Preview
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {hasData && (
            <PDFViewer width="100%" height="100%">
              <BECRemediationReportDocument
                userData={userData}
                becData={becData}
                brandingSettings={brandingSettings}
                tenantName={tenantName}
                variables={variables}
              />
            </PDFViewer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <PDFDownloadLink
            document={
              <BECRemediationReportDocument
                userData={userData}
                becData={becData}
                brandingSettings={brandingSettings}
                tenantName={tenantName}
                variables={variables}
              />
            }
            fileName={`BEC_Report_${userData?.userPrincipalName}_${new Date().toISOString().split('T')[0]}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Download />}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogActions>
      </Dialog>
    </>
  )
}