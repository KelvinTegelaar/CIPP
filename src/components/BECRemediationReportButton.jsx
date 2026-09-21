import { useState } from 'react'
import { CippIcons } from '../utils/icon-registry'
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
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CippPdfPreview } from './CippPdf/CippPdfPreview'
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
    permissionChangesTargetingUser: (becData?.MailboxPermissionChanges || []).filter(
      (change) => change?.TargetsSuspect === true
    ).length,
    mfaDevices: becData?.MFADevices?.length || 0,
    passwordChanges: becData?.ChangedPasswords?.length || 0,
    sentMessages: becData?.SentMessages?.length || 0,
    trustedSenders: becData?.TrustedSenders?.length || 0,
    blockedSenders: becData?.BlockedSenders?.length || 0,
    safelistChanges: becData?.SafelistChanges?.length || 0,
    sharingChanges: becData?.SharingChanges?.length || 0,
    anonymousLinks: (becData?.SharingChanges || []).filter((c) =>
      c?.Operation?.startsWith('AnonymousLink')
    ).length,
    intuneDevices: becData?.IntuneDevices?.length || 0,
    signIns: becData?.SuspectUserSignIns?.length || 0,
    sentTotalMessages: becData?.SentMessageAnalysis?.TotalMessages ?? 0,
    sentTotalRecipients: becData?.SentMessageAnalysis?.TotalRecipients ?? 0,
    repeatedSubjects: becData?.SentMessageAnalysis?.FlaggedSubjectCount || 0,
    sendBursts: becData?.SentMessageAnalysis?.Bursts?.length || 0,
    massMailFlagged: becData?.SentMessageAnalysis?.Flagged === true,
    maliciousApps:
      (becData?.AddedApps || []).filter((app) => app?.MaliciousMatch).length +
      (becData?.MaliciousSPs?.length || 0),
  }

  const locationAnalysis = becData?.LocationAnalysis
  stats.foreignSignIns = locationAnalysis?.ForeignSignInCount || 0
  stats.foreignSuccessfulSignIns = locationAnalysis?.ForeignSuccessfulSignInCount || 0
  stats.foreignSentMessages = locationAnalysis?.ForeignSentMessageCount || 0
  stats.foreignActivity =
    (locationAnalysis?.ForeignRuleChangeCount || 0) +
    (locationAnalysis?.ForeignSafelistChangeCount || 0) +
    (locationAnalysis?.ForeignSharingChangeCount || 0) +
    (locationAnalysis?.ForeignSentMessageCount || 0)

  // the analysis window: 7 days before the data was extracted
  const analysisWindowStart = (() => {
    const extractedAt = becData?.ExtractedAt ? new Date(becData.ExtractedAt) : new Date()
    if (Number.isNaN(extractedAt.getTime())) {
      return new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
    }
    return new Date(extractedAt.getTime() - 7 * 24 * 60 * 60 * 1000)
  })()

  const recentIntuneDevices = (becData?.IntuneDevices || []).filter((device) => {
    if (!device?.enrolledDateTime) return false
    const enrolled = new Date(device.enrolledDateTime)
    if (Number.isNaN(enrolled.getTime())) return false
    return enrolled >= analysisWindowStart
  })
  stats.recentIntuneDevices = recentIntuneDevices.length

  const isRecentMfaDevice = (method) => {
    if (!method?.createdDateTime) return false
    const created = new Date(method.createdDateTime)
    if (Number.isNaN(created.getTime())) return false
    return created >= analysisWindowStart
  }
  stats.recentMfaDevices = (becData?.MFADevices || []).filter(isRecentMfaDevice).length

  // successful foreign sign-ins first - they prove access, failed ones are mostly spray noise
  const foreignSignIns = (becData?.SuspectUserSignIns || [])
    .filter((signIn) => signIn?.ForeignLocation === true)
    .sort((a, b) => (b?.Status === 'Success') - (a?.Status === 'Success'))

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
    // A change to this mailbox's permissions outweighs unrelated tenant churn, which the
    // tenant-wide search also surfaces
    if (stats.permissionChangesTargetingUser > 0) threatScore += 2
    else if (stats.permissionChanges > 0) threatScore += 1
    // Generic new service principals appear constantly; the actually-bad ones score +5 below
    if (stats.newApps > 0) threatScore += 1
    if (stats.newUsers > 5) threatScore += 1
    if (stats.safelistChanges > 0) threatScore += 2

    // Check for suspicious rules (RSS folder moves)
    const hasSuspiciousRules = becData?.NewRules?.some((rule) => rule.MoveToFolder?.includes('RSS'))
    if (hasSuspiciousRules) threatScore += 5

    // A catalog-matched application is a confirmed bad indicator, not a heuristic
    if (stats.maliciousApps > 0) threatScore += 5
    // Only a successful foreign sign-in proves access - failed foreign attempts are
    // password-spray background noise present on almost every tenant
    if (stats.foreignSuccessfulSignIns > 0) threatScore += 3
    if (stats.foreignActivity > 0) threatScore += 3
    // An anonymous link exposes data to anyone holding the URL, past any later reset
    if (stats.anonymousLinks > 0) threatScore += 3
    // Repeated-subject campaigns and send bursts are how a compromised mailbox spreads
    if (stats.massMailFlagged) threatScore += 3
    // Persistence moves during the window: a fresh MFA method or device enrollment
    if (stats.recentMfaDevices > 0) threatScore += 2
    if (stats.recentIntuneDevices > 0) threatScore += 2

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
            applications, authentication patterns, and sign-in locations over a 7-day period.
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
              { value: stats.foreignSignIns, label: 'Foreign Sign-ins' },
              { value: stats.maliciousApps, label: 'Malicious Apps' },
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
          <InfoBox title="Assigned Usage Location">
              {locationAnalysis?.UsageLocation ||
                'Not assigned - sign-ins and activity could not be compared against an expected country'}
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
              <AlertBox title={`⚠️ ${stats.newRules} Mailbox Rule(s) Found`}>
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
              <AlertBox title={`⚠️ ${stats.ruleChanges} Rule Change(s) in the Last 7 Days`}>
                  The audit log recorded inbox rules being created, changed or removed on this
                  mailbox. Rules that were removed after use are a common way for attackers to cover
                  their tracks.
                </AlertBox>

              {becData.InboxRuleChanges.slice(0, 10).map((change, index) => (
                <InfoBox key={index} title={`${change.Operation || 'Rule Change'}: ${change.RuleName || 'Unnamed Rule'}`}>
                    Date: {change.Date || 'Unknown'}
                    {'\n'}
                    By: {change.UserKey || 'Unknown'}
                    {change.ClientIP &&
                      `\nFrom: ${change.ClientIP}${change.Country ? ` (${change.Country})` : ''}`}
                    {change.ForeignLocation === true &&
                      '\n⚠️ Originated outside the assigned usage location'}
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
            <ClearBox title="✔️ No Suspicious Rules Found">
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
              <AlertBox title={`ℹ️ ${stats.newUsers} New User(s) Found`}>
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
            <ClearBox title="✔️ No New Users Found">
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

          {stats.maliciousApps > 0 && (
            <AlertBox title={`⚠️ ${stats.maliciousApps} Known-Malicious Application(s) Detected`}>
                One or more applications in this tenant match the CIPP known-malicious application
                catalog. Consent-based access survives a password reset, so these applications
                should be removed unless their presence is explained.
              </AlertBox>
          )}

          {stats.newApps > 0 ? (
            <>
              <AlertBox title={`⚠️ ${stats.newApps} New Application(s) Found`}>
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
                    {app.MaliciousMatch &&
                      `\n⚠️ Matches known-malicious catalog entry "${app.MaliciousMatch.Name}"${
                        app.MaliciousMatch.Categories?.length
                          ? ` (${app.MaliciousMatch.Categories.join(', ')})`
                          : ''
                      }`}
                  </InfoBox>
              ))}
              {becData.AddedApps.length > 6 && (
                <Note>
                  ... and {becData.AddedApps.length - 6} more apps (see JSON export for full list)
                </Note>
              )}
            </>
          ) : (
            (becData?.MaliciousSPs?.length || 0) === 0 && (
              <ClearBox title="✔️ No New Applications Found">
                  No new applications were authorized during the analysis period, and no known
                  malicious applications are present in the tenant.
                </ClearBox>
            )
          )}

          {(becData?.MaliciousSPs?.length || 0) > 0 && (
            <>
              {becData.MaliciousSPs.slice(0, 6).map((app, index) => (
                <InfoBox key={`malsp-${index}`} title={`⚠️ ${app.displayName || 'Unknown'} (present in tenant)`}>
                    Catalog entry: {app.CatalogName || 'Unknown'}
                    {'\n'}
                    App ID: {app.appId || 'N/A'}
                    {'\n'}
                    Categories: {app.Categories?.length ? app.Categories.join(', ') : 'N/A'}
                    {'\n'}
                    Enabled: {String(app.accountEnabled ?? 'Unknown')}
                    {'\n'}
                    First seen: {formatDate(app.createdDateTime)}
                  </InfoBox>
              ))}
              {becData.MaliciousSPs.length > 6 && (
                <Note>
                  ... and {becData.MaliciousSPs.length - 6} more (see JSON export for full list)
                </Note>
              )}
            </>
          )}
        </Section>
      </ContentPage>

      {/* CHECK 4, 5, 6, 7: PERMISSIONS, SENT MAIL, MFA, PASSWORDS */}
      <ContentPage title="Additional Security Checks" subtitle="Permissions, outbound mail, authentication, and access patterns">

        {/* Check 4: Mailbox Permission Changes */}
        <Section title="Check 4: Mailbox Permission Changes">
          <InfoBox title="Why We Check This">
              Unauthorized changes to mailbox permissions can allow attackers to grant themselves or
              accomplices access to read, send, or manage emails. This is a common technique to
              maintain persistent access.
            </InfoBox>

          {stats.permissionChanges > 0 ? (
            <>
              <AlertBox title={`⚠️ ${stats.permissionChanges} Permission Change(s) Found`}>
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
                    {change.TargetsSuspect === true &&
                      '\n⚠️ Targets the investigated mailbox'}
                  </InfoBox>
              ))}
              {becData.MailboxPermissionChanges.length > 5 && (
                <Note>
                  ... and {becData.MailboxPermissionChanges.length - 5} more changes
                </Note>
              )}
            </>
          ) : (
            <ClearBox title="✔️ No Permission Changes Found">
                No mailbox permission changes were detected during the analysis period.
              </ClearBox>
          )}
        </Section>

        {/* Check 5: Sent Messages */}
        <Section title="Check 5: Sent Messages">
          <InfoBox title="Why We Check This">
              Attackers use a compromised mailbox to send fraudulent invoices, phishing, or
              internal impersonation mail. The message trace shows what actually left the mailbox
              during the analysis period, including the IP address it was sent from.
            </InfoBox>

          {stats.sentMessages > 0 ? (
            <>
              <Paragraph indent>
                ℹ️ {stats.sentTotalMessages || stats.sentMessages} message(s) to{' '}
                {stats.sentTotalRecipients || stats.sentMessages} recipient(s) were sent by this
                mailbox during the analysis period
                {stats.foreignSentMessages > 0
                  ? `, including ${stats.foreignSentMessages} from an IP outside the user's assigned usage location.`
                  : '.'}
              </Paragraph>

              {stats.massMailFlagged && (
                <AlertBox title="⚠️ Mass-Mail Pattern Detected">
                    {stats.repeatedSubjects > 0
                      ? `${stats.repeatedSubjects} subject(s) were sent as many separate messages or to many recipients. `
                      : ''}
                    {stats.sendBursts > 0
                      ? `${stats.sendBursts} short burst(s) of high-volume sending were detected. `
                      : ''}
                    Identical-subject mass mail and send bursts are how a compromised mailbox
                    spreads phishing or fraudulent invoices. Review the campaigns below and warn
                    the recipients if the content was malicious.
                  </AlertBox>
              )}

              {(becData?.SentMessageAnalysis?.RepeatedSubjects || [])
                .slice(0, 5)
                .map((group, index) => (
                  <InfoBox key={`subject-${index}`} title={`${group.Flagged ? '⚠️ ' : ''}Repeated subject: ${group.Subject || '(no subject)'}`}>
                      Messages: {group.MessageCount}
                      {'\n'}
                      Recipients: {group.RecipientCount}
                      {'\n'}
                      First sent: {group.FirstSent || 'N/A'}
                      {'\n'}
                      Last sent: {group.LastSent || 'N/A'}
                    </InfoBox>
                ))}
              {(becData?.SentMessageAnalysis?.RepeatedSubjects?.length || 0) > 5 && (
                <Note>
                  ... and {becData.SentMessageAnalysis.RepeatedSubjects.length - 5} more repeated
                  subjects (see JSON export for full list)
                </Note>
              )}

              {(becData?.SentMessageAnalysis?.Bursts || []).slice(0, 5).map((burst, index) => (
                <InfoBox key={`burst-${index}`} title={`⚠️ Send burst: ${burst.MessageCount} message(s) to ${burst.RecipientCount} recipient(s) in ${burst.WindowMinutes || 10} minutes`}>
                    Starting: {burst.WindowStart || 'N/A'}
                    {burst.TopSubject && `\nMost common subject: ${burst.TopSubject}`}
                  </InfoBox>
              ))}
              {(becData?.SentMessageAnalysis?.Bursts?.length || 0) > 5 && (
                <Note>
                  ... and {becData.SentMessageAnalysis.Bursts.length - 5} more bursts (see JSON
                  export for full list)
                </Note>
              )}

              {becData.SentMessages.slice(0, 10).map((msg, index) => (
                <InfoBox key={index} title={`${msg.Subject || '(no subject)'}`}>
                    To: {msg.RecipientAddress || 'N/A'}
                    {'\n'}
                    Status: {msg.Status || 'N/A'}
                    {'\n'}
                    Received: {msg.Received || 'N/A'}
                    {msg.FromIP &&
                      `\nFrom IP: ${msg.FromIP}${msg.Country ? ` (${msg.Country})` : ''}`}
                    {msg.ForeignLocation === true &&
                      '\n⚠️ Sent from outside the assigned usage location'}
                  </InfoBox>
              ))}
              {becData.SentMessages.length > 10 && (
                <Note>
                  ... and {becData.SentMessages.length - 10} more messages (see JSON export for
                  full list)
                </Note>
              )}
            </>
          ) : (
            <ClearBox title="✔️ No Sent Messages Found">
                No messages were sent by this mailbox during the analysis period.
              </ClearBox>
          )}
        </Section>

        {/* Check 6: MFA Devices */}
        <Section title="Check 6: MFA Devices">
          <InfoBox title="Why We Check This">
              Multi-factor authentication (MFA) devices provide an additional layer of security.
              Reviewing registered MFA methods helps identify if attackers have added unauthorized
              devices to bypass security controls.
            </InfoBox>

          {stats.mfaDevices > 0 ? (
            <>
              <Paragraph indent>
                ℹ️ {stats.mfaDevices} MFA device(s) registered
                {stats.recentMfaDevices > 0
                  ? `, including ${stats.recentMfaDevices} registered in the last 7 days. Verify the recent registrations were made by the user — attackers register their own method to keep access after a password reset.`
                  : '. Verify each device belongs to the user.'}
              </Paragraph>

              {[...becData.MFADevices]
                .sort(
                  (a, b) => new Date(b?.createdDateTime || 0) - new Date(a?.createdDateTime || 0)
                )
                .slice(0, 5)
                .map((device, index) => (
                  <InfoBox key={index} title={`${device['@odata.type'] ?.replace('#microsoft.graph.', '') .replace('AuthenticationMethod', '') || 'Unknown'}`}>
                      Display Name: {device.displayName || 'N/A'}
                      {'\n'}
                      Registered: {formatDate(device.createdDateTime)}
                      {isRecentMfaDevice(device) && '\n⚠️ Registered in the last 7 days'}
                    </InfoBox>
                ))}
              {becData.MFADevices.length > 5 && (
                <Note>
                  ... and {becData.MFADevices.length - 5} more methods (see JSON export for full
                  list)
                </Note>
              )}
            </>
          ) : (
            <InfoBox tone="warn" title="⚠️ No MFA Devices Found">
                No multi-factor authentication devices are registered. MFA is highly recommended to
                prevent unauthorized access.
              </InfoBox>
          )}
        </Section>

        {/* Check 7: Password Changes */}
        <Section title="Check 7: Recent Password Changes">
          <InfoBox title="Why We Check This">
              Attackers often change passwords to lock out legitimate users. Reviewing recent
              password changes in the tenant helps identify if the compromised account's password
              was changed or if other accounts were affected.
            </InfoBox>

          {stats.passwordChanges > 0 ? (
            <>
              <Paragraph indent>
                ℹ️ {stats.passwordChanges} password change(s) detected in the tenant during the
                analysis period.
              </Paragraph>

              {becData.ChangedPasswords.slice(0, 5).map((user, index) => (
                <InfoBox key={index} title={`${user.displayName || 'Unknown'}`}>
                    Email: {user.userPrincipalName || 'N/A'}
                    {'\n'}
                    Last Password Change: {formatDate(user.lastPasswordChangeDateTime)}
                  </InfoBox>
              ))}
              {becData.ChangedPasswords.length > 5 && (
                <Note>
                  ... and {becData.ChangedPasswords.length - 5} more (see JSON export for full
                  list)
                </Note>
              )}
            </>
          ) : (
            <Paragraph indent>
              ℹ️ No password changes detected during the analysis period.
            </Paragraph>
          )}
        </Section>
      </ContentPage>

      {/* CHECK 8, 9, 10: SENDER LISTS, DEVICES, LOCATIONS */}
      <ContentPage title="Mailbox Lists, Devices & Locations" subtitle="Sender lists, managed devices, and sign-in origins">

        {/* Check 8: Trusted & Blocked Senders */}
        <Section title="Check 8: Trusted &amp; Blocked Senders">
          <InfoBox title="Why We Check This">
              Attackers may add their own domain to the Trusted Senders list so their fraudulent
              messages bypass spam filtering, or add finance/security domains to the Blocked
              Senders list so warnings and alerts are hidden from the victim in the Junk Email
              folder.
            </InfoBox>

          {becData?.SafelistError && (
            <AlertBox title="⚠️ Could Not Retrieve Sender Lists">
                {becData.SafelistError}
                {'\n'}
                An empty list here does not mean the mailbox has no trusted or blocked senders.
              </AlertBox>
          )}

          {stats.safelistChanges > 0 && (
            <>
              <AlertBox title={`⚠️ ${stats.safelistChanges} Safelist Change(s) in the Last 7 Days`}>
                  The audit log recorded changes to the Trusted/Blocked Senders and Domains list on
                  this mailbox. Review each change carefully.
                </AlertBox>

              {becData.SafelistChanges.slice(0, 10).map((change, index) => (
                <InfoBox key={index} title={`${change.Operation || 'Safelist Change'} by ${change.UserKey || 'Unknown'}`}>
                    Date: {formatDate(change.Date)}
                    {change.ClientIP &&
                      `\nFrom: ${change.ClientIP}${change.Country ? ` (${change.Country})` : ''}`}
                    {change.ForeignLocation === true &&
                      '\n⚠️ Originated outside the assigned usage location'}
                    {'\n'}
                    Trusted: {formatSafelistValue(change.Trusted)}
                    {'\n'}
                    Blocked: {formatSafelistValue(change.Blocked)}
                  </InfoBox>
              ))}
              {becData.SafelistChanges.length > 10 && (
                <Note>
                  ... and {becData.SafelistChanges.length - 10} more changes (see JSON export for
                  full list)
                </Note>
              )}
            </>
          )}

          {stats.trustedSenders > 0 && (
            <InfoBox title={`Trusted Senders/Domains (${stats.trustedSenders})`}>{becData.TrustedSenders.slice(0, 15).join(', ')}</InfoBox>
          )}
          {stats.trustedSenders > 15 && (
            <Note>
              ... and {stats.trustedSenders - 15} more trusted entries (see JSON export for full
              list)
            </Note>
          )}

          {stats.blockedSenders > 0 && (
            <InfoBox title={`Blocked Senders/Domains (${stats.blockedSenders})`}>{becData.BlockedSenders.slice(0, 15).join(', ')}</InfoBox>
          )}
          {stats.blockedSenders > 15 && (
            <Note>
              ... and {stats.blockedSenders - 15} more blocked entries (see JSON export for full
              list)
            </Note>
          )}

          {!becData?.SafelistError &&
            stats.trustedSenders === 0 &&
            stats.blockedSenders === 0 &&
            stats.safelistChanges === 0 && (
              <ClearBox title="✔️ No Trusted or Blocked Senders Found">
                  No trusted or blocked sender/domain entries were found on this mailbox.
                </ClearBox>
            )}
        </Section>

        {/* Check 9: Intune Devices */}
        <Section title="Check 9: Intune Devices">
          <InfoBox title="Why We Check This">
              Newly enrolled Intune devices can indicate an attacker standing up a VM or BYOD
              endpoint under the compromised identity, including paths that re-register Windows
              Hello for Business. Review devices enrolled during the analysis window first.
            </InfoBox>

          {becData?.IntuneDevicesError ? (
            <AlertBox title="⚠️ Could Not Retrieve Intune Devices">
                {becData.IntuneDevicesError}
                {'\n'}
                An empty device list here does not mean the user has no Intune devices.
              </AlertBox>
          ) : stats.intuneDevices > 0 ? (
            <>
              <Paragraph indent>
                ℹ️ {stats.intuneDevices} Intune-managed device(s) associated with this user
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
              {sortedIntuneDevices.length > 5 && (
                <Note>
                  ... and {sortedIntuneDevices.length - 5} more devices (see JSON export for full
                  list)
                </Note>
              )}
            </>
          ) : (
            <ClearBox title="✔️ No Intune Devices Found">
                No Intune-managed devices were found for this user.
              </ClearBox>
          )}
        </Section>

        {/* Check 10: Sign-in Locations */}
        <Section title="Check 10: Sign-in Locations">
          <InfoBox title="Why We Check This">
              Sign-ins from countries the user does not work from are one of the strongest
              compromise indicators. Each sign-in is compared against the user's assigned usage
              location in Entra ID
              {locationAnalysis?.UsageLocation ? ` (${locationAnalysis.UsageLocation})` : ''}, and
              the client IPs behind rule changes, safelist changes, sharing changes, and sent mail
              are geo-located and compared the same way.
            </InfoBox>

          {becData?.SuspectUserSignInsError ? (
            <AlertBox title="⚠️ Could Not Retrieve Sign-in Logs">
                {becData.SuspectUserSignInsError}
                {'\n'}
                An empty list here does not mean the user has not signed in.
              </AlertBox>
          ) : (
            <>
              {!locationAnalysis?.UsageLocation && (
                <InfoBox tone="warn" title="⚠️ No Usage Location Assigned">
                    {locationAnalysis?.Note ||
                      'The user has no usage location assigned in Entra ID, so activity cannot be compared against an expected country.'}
                  </InfoBox>
              )}

              {(locationAnalysis?.SignInCountries?.length || 0) > 0 && (
                <InfoBox title={`Sign-in Countries Observed (last ${stats.signIns} sign-ins)`}>
                    {locationAnalysis.SignInCountries.map(
                      (c) => `${c.Country}: ${c.Count} sign-in(s)`
                    ).join('\n')}
                  </InfoBox>
              )}

              {stats.foreignSignIns > 0 || stats.foreignActivity > 0 ? (
                <>
                  <AlertBox title="⚠️ Activity Outside the Assigned Usage Location">
                      {stats.foreignSignIns} sign-in(s) (of which {stats.foreignSuccessfulSignIns}{' '}
                      succeeded), {locationAnalysis?.ForeignRuleChangeCount || 0} inbox rule
                      change(s), {locationAnalysis?.ForeignSafelistChangeCount || 0} safelist
                      change(s), {locationAnalysis?.ForeignSharingChangeCount || 0} sharing
                      change(s), and {locationAnalysis?.ForeignSentMessageCount || 0} sent
                      message(s) originated outside {locationAnalysis?.UsageLocation}. Failed
                      foreign sign-ins are mostly password-spray noise; the successful ones prove
                      access. Review each carefully — a single legitimate trip can explain some of
                      this, but rule, safelist, or sharing changes from a foreign IP rarely have an
                      innocent explanation.
                    </AlertBox>

                  {foreignSignIns.slice(0, 10).map((signIn, index) => (
                    <InfoBox key={index} title={`${formatDate(signIn.CreatedDateTime)} - ${signIn.Country || 'Unknown'}`}>
                        Application: {signIn.AppDisplayName || 'N/A'}
                        {'\n'}
                        IP Address: {signIn.IPAddress || 'N/A'}
                        {'\n'}
                        City: {signIn.City || 'N/A'}
                        {'\n'}
                        Result: {signIn.Status || 'N/A'}
                      </InfoBox>
                  ))}
                  {foreignSignIns.length > 10 && (
                    <Note>
                      ... and {foreignSignIns.length - 10} more foreign sign-ins (see JSON export
                      for full list)
                    </Note>
                  )}
                </>
              ) : locationAnalysis?.UsageLocation ? (
                <ClearBox title="✔️ No Foreign Activity Detected">
                    All located sign-ins and activity match the user's assigned usage location (
                    {locationAnalysis.UsageLocation}).
                  </ClearBox>
              ) : null}
            </>
          )}
        </Section>

        {/* Check 11: Sharing Links */}
        <Section title="Check 11: Sharing Links">
          <InfoBox title="Why We Check This">
              Attackers share OneDrive and SharePoint folders to give themselves a data feed that
              survives a password reset, and anonymous links expose the content to anyone holding
              the URL. This check lists every sharing link the account created or changed during
              the analysis period, including the IP address it was done from.
            </InfoBox>

          {stats.sharingChanges > 0 ? (
            <>
              <AlertBox title={`⚠️ ${stats.sharingChanges} Sharing Change(s) in the Last 7 Days`}>
                  {stats.anonymousLinks > 0
                    ? `${stats.anonymousLinks} of these involve anonymous links, which anyone with the URL can open. `
                    : ''}
                  Review each link and remove any that are not explained, even if the account has
                  since been remediated.
                </AlertBox>

              {becData.SharingChanges.slice(0, 10).map((change, index) => (
                <InfoBox key={index} title={`${change.Operation || 'Sharing Change'}: ${change.FileName || change.ItemUrl || 'Unknown item'}`}>
                    Date: {formatDate(change.Date)}
                    {'\n'}
                    Workload: {change.Workload || 'N/A'}
                    {change.Target && `\nShared with: ${change.Target}`}
                    {change.ClientIP &&
                      `\nFrom: ${change.ClientIP}${change.Country ? ` (${change.Country})` : ''}`}
                    {change.ForeignLocation === true &&
                      '\n⚠️ Originated outside the assigned usage location'}
                  </InfoBox>
              ))}
              {becData.SharingChanges.length > 10 && (
                <Note>
                  ... and {becData.SharingChanges.length - 10} more changes (see JSON export for
                  full list)
                </Note>
              )}
            </>
          ) : (
            <ClearBox title="✔️ No Sharing Changes Found">
                No sharing links were created or changed by this account during the analysis
                period.
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
              Assigned Usage Location: {locationAnalysis?.UsageLocation || 'Not assigned'}
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
              Permission Changes: {stats.permissionChanges} ({stats.permissionChangesTargetingUser}{' '}
              targeting this mailbox)
              {'\n'}
              New Applications: {stats.newApps}
              {'\n'}
              Known-Malicious Applications: {stats.maliciousApps}
              {'\n'}
              New Users: {stats.newUsers}
              {'\n'}
              Sent Messages: {stats.sentTotalMessages || stats.sentMessages}
              {'\n'}
              Repeated Subject Campaigns: {stats.repeatedSubjects}
              {'\n'}
              Send Bursts: {stats.sendBursts}
              {'\n'}
              MFA Devices: {stats.mfaDevices}
              {'\n'}
              Recent MFA Registrations (7d): {stats.recentMfaDevices}
              {'\n'}
              Password Changes: {stats.passwordChanges}
              {'\n'}
              Trusted Senders: {stats.trustedSenders}
              {'\n'}
              Blocked Senders: {stats.blockedSenders}
              {'\n'}
              Safelist Changes: {stats.safelistChanges}
              {'\n'}
              Sharing Changes: {stats.sharingChanges}
              {'\n'}
              Anonymous Links: {stats.anonymousLinks}
              {'\n'}
              Intune Devices: {stats.intuneDevices}
              {'\n'}
              Recent Intune Enrollments (7d): {stats.recentIntuneDevices}
              {'\n'}
              Foreign Sign-ins: {stats.foreignSignIns} ({stats.foreignSuccessfulSignIns} successful)
              {'\n'}
              Foreign Rule/Safelist/Sharing/Mail Activity: {stats.foreignActivity}
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
          startIcon={<CippIcons.PictureAsPdf />}
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
        slotProps={{
          paper: {
            sx: {
              height: '90vh',
            },
          }
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
            <Typography variant="h6" component="div">
              BEC Remediation Report Preview
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CippIcons.Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {hasData && (
            <CippPdfPreview
              width="100%"
              height="100%"
              title={`BEC Remediation Report - ${tenantName}`}
              fileName={`BEC_Remediation_Report_${tenantName}.pdf`}
            >
              <BECRemediationReportDocument
                userData={userData}
                becData={becData}
                brandingSettings={brandingSettings}
                tenantName={tenantName}
                variables={variables}
              />
            </CippPdfPreview>
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
                startIcon={loading ? <CircularProgress size={20} /> : <CippIcons.Download />}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogActions>
      </Dialog>
    </>
  );
}