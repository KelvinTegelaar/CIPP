// Builds one correlated event stream from a completed BEC case — the same signals the PDF report's
// "Order of Events" folds together, shaped for the case-page views. Each event carries the attacker
// objective it serves, a severity, and structured correlation keys (source IP, app, location, external
// sender, and the other account it acted on) so a graph view can cluster events that share a source or
// a target, not just lay them out by time. The earliest access/foothold event is the likely start.
import { becWindowStart, isBecPartnerActor } from './bec-objectives'

const toDate = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
const shortUpn = (value) => {
  const text = String(value ?? '')
  return text.length > 34 && text.includes('@') ? text.split('@')[0] : text
}
const clean = (value) => {
  const text = String(value ?? '').trim()
  return text.length > 0 ? text : null
}
// One host is one source: audit-log addresses carry the client port ("203.0.113.10:51234",
// "[2001:db8::1]:443"), which differs per connection and would split a host into several graph hubs.
// Same normalisation as the backend's ConvertTo-CIPPBecHostAddress; cases collected before the
// backend applied it still hold ported addresses, so the client strips them too.
export const hostIp = (value) => {
  const text = clean(value)
  if (!text) return null
  return text
    .replace(
      /^(\d{1,3}(?:\.\d{1,3}){3}|\[[0-9a-fA-F:]+\]|[0-9a-fA-F:]+)(?::\d+)?$/,
      '$1'
    )
    .replace(/[[\]]/g, '')
}
const joinDetail = (...parts) => parts.filter(Boolean).join(' · ')
// One event per sent message reads well for a handful; a mass mailing (a thousand onward phishes)
// buries every other event, so past this many rows the sends fold into one event per hour and source.
const SENT_COMPACT_THRESHOLD = 25

export const BEC_OBJECTIVE_LABEL = {
  access: 'Access',
  persistence: 'Persistence',
  mailflow: 'Mail flow',
  exfil: 'Exfiltration',
  blast: 'Blast radius',
}

export const BEC_OBJECTIVE_COLOR = {
  access: '#3182CE',
  persistence: '#805AD5',
  mailflow: '#DD6B20',
  exfil: '#E53E3E',
  blast: '#718096',
}

const auditObjective = (activity) => {
  const text = String(activity || '').toLowerCase()
  if (
    text.includes('consent') ||
    text.includes('permission grant') ||
    text.includes('role assignment') ||
    text.includes('service principal') ||
    text.includes('application')
  ) {
    return 'persistence'
  }
  if (
    text.includes('security info') ||
    text.includes('strong authentication') ||
    text.includes('password') ||
    text.includes('device')
  ) {
    return 'access'
  }
  if (text.includes('role') || text.includes('member')) return 'blast'
  return 'persistence'
}

const signInIp = (s) => hostIp(s.IPAddress || s.ipAddress || s.ClientIP)
const signInApp = (s) =>
  clean(s.AppDisplayName || s.appDisplayName || s.ClientAppUsed)
const signInLocation = (s) =>
  clean([s.City, s.Country].filter(Boolean).join(', '))

/**
 * @param {object} becData a completed BEC case payload (execBECCheck result)
 * @param {number} windowDays analysis window, for the "recent" cutoff on state findings
 * @returns {{ events: object[], startOfCompromise: object|null }}
 *   events are sorted ascending; each carries { id, ts, date, category, objective, severity, label,
 *   detail, graphDetail, ip, app, location, sender, actor, affects }.
 */
export function buildBecTimeline(becData, windowDays = 7, accountUpn = null) {
  if (!becData) return { events: [], startOfCompromise: null }
  const arr = (value) => (Array.isArray(value) ? value : [])

  // The investigated mailbox. Used to tell an action ON another account apart from one on this one:
  // `affects` is the *other* party, so the graph can draw the victim reaching out to colleagues,
  // recipients and mailboxes — never a self-referential edge back to the victim. The caller may pass
  // the UPN explicitly (the case page has it); production runs also store it on becData.
  const victimUpn = clean(
    accountUpn ||
      becData.UserPrincipalName ||
      becData?.userData?.userPrincipalName
  )
  const isVictim = (value) => {
    const cleaned = clean(value)
    return (
      !!victimUpn &&
      !!cleaned &&
      cleaned.toLowerCase() === victimUpn.toLowerCase()
    )
  }
  // First candidate that is a real, non-victim account — the other party an action touched.
  const otherAccount = (...candidates) => {
    for (const candidate of candidates) {
      const cleaned = clean(candidate)
      if (cleaned && !isVictim(cleaned)) return cleaned
    }
    return null
  }

  const analysisStart = becWindowStart(becData, windowDays)
  const isRecent = (value) => {
    const parsed = toDate(value)
    return parsed && parsed >= analysisStart
  }

  // The verdict behind each address (IP analysis), so every event says whose it was and the graph can
  // mark an attacker source even when it is in the user's own country.
  const verdictByIp = new Map(
    arr(becData.IPVerdicts)
      .filter((row) => row && row.IP)
      .map((row) => [hostIp(row.IP), row.Verdict])
  )
  const isAttackerVerdict = (verdict) =>
    verdict === 'Compromised' || verdict === 'LikelyAttacker'

  // What the attacker-side addresses did, folded to one event per hour, address and kind of action -
  // a mailbox sync or a scripted download is hundreds of rows that would bury everything else.
  const MAIL_ACTION = {
    MailItemsAccessed: { objective: 'exfil', verb: 'message(s) opened' },
    AttachmentAccess: { objective: 'exfil', verb: 'attachment(s) read' },
    SoftDelete: { objective: 'persistence', verb: 'item(s) deleted' },
    HardDelete: { objective: 'persistence', verb: 'item(s) purged' },
    MoveToDeletedItems: { objective: 'persistence', verb: 'item(s) deleted' },
    Move: { objective: 'persistence', verb: 'item(s) moved' },
    Send: { objective: 'exfil', verb: 'message(s) sent' },
    SendAs: { objective: 'exfil', verb: 'message(s) sent as another mailbox' },
    SendOnBehalf: { objective: 'exfil', verb: 'message(s) sent on behalf' },
    SearchQueryInitiatedExchange: {
      objective: 'exfil',
      verb: 'mailbox search(es)',
    },
  }
  const FILE_ACTION = {
    FileDownloaded: 'file(s) downloaded',
    FileSyncDownloadedFull: 'file(s) synced down',
    FileAccessed: 'file(s) opened',
    FilePreviewed: 'file(s) previewed',
    FileUploaded: 'file(s) uploaded',
    FileDeleted: 'file(s) deleted',
    FileRecycled: 'file(s) deleted',
    SearchQueryPerformed: 'SharePoint search(es)',
  }
  const foldActivity = (rows, keyOf, build) => {
    const buckets = new Map()
    rows.forEach((row) => {
      const date = toDate(row.When)
      if (!date) return
      const hour = new Date(date)
      hour.setUTCMinutes(0, 0, 0)
      const ip = hostIp(row.IP)
      const key = `${hour.getTime()}|${ip || ''}|${keyOf(row)}`
      if (!buckets.has(key)) buckets.set(key, { date, ip, rows: [] })
      buckets.get(key).rows.push(row)
    })
    return [...buckets.values()].map(build)
  }
  const topOf = (rows, field) => {
    const counts = new Map()
    rows.forEach((row) => {
      const value = clean(row[field])
      if (value) counts.set(value, (counts.get(value) || 0) + 1)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null
  }
  const attackerMailEvents = foldActivity(
    arr(becData.AttackerMailActivity),
    (row) => `${row.Operation}|${row.AccessType === 'Sync' ? 'sync' : ''}`,
    ({ date, ip, rows }) => {
      const first = rows[0]
      const sync = first.AccessType === 'Sync'
      const action = MAIL_ACTION[first.Operation] || {
        objective: 'persistence',
        verb: `${first.Operation} event(s)`,
      }
      const verdict = first.IPVerdict || verdictByIp.get(ip) || null
      return {
        key: 'attackermail',
        date,
        category: 'attackermail',
        objective: sync ? 'exfil' : action.objective,
        severity: isAttackerVerdict(verdict) ? 'high' : 'medium',
        label: sync
          ? `${rows.length} folder(s) synced to a desktop client`
          : `${rows.length} ${action.verb}`,
        ip,
        verdict,
        target: sync
          ? topOf(rows, 'Folder')
          : topOf(rows, 'Subject') || topOf(rows, 'Folder'),
        affects: otherAccount(first.MailboxOwner),
        count: rows.length,
      }
    }
  )
  const attackerFileEvents = foldActivity(
    arr(becData.AttackerFileActivity),
    (row) => row.Operation,
    ({ date, ip, rows }) => {
      const first = rows[0]
      const verdict = first.IPVerdict || verdictByIp.get(ip) || null
      return {
        key: 'attackerfile',
        date,
        category: 'attackerfile',
        objective: 'exfil',
        severity: isAttackerVerdict(verdict) ? 'high' : 'medium',
        label: `${rows.length} ${FILE_ACTION[first.Operation] || `${first.Operation} event(s)`}`,
        ip,
        verdict,
        target: topOf(rows, 'File'),
        count: rows.length,
      }
    }
  )
  const formsEvents = arr(becData.FormsActivity)
    .filter((row) => row.Flagged === true)
    .map((row) => ({
      key: 'forms',
      date: toDate(row.When),
      category: 'forms',
      objective: 'blast',
      severity: isAttackerVerdict(row.IPVerdict) ? 'high' : 'medium',
      label: `Form: ${row.Operation}`,
      ip: hostIp(row.IP),
      verdict: row.IPVerdict,
      target: clean(row.FormName),
    }))

  // Foreign sign-ins, and sign-ins from an address judged the attacker's even when it is at home.
  const foreignSignIns = arr(becData.SuspectUserSignIns).filter(
    (signIn) =>
      signIn.ForeignLocation === true ||
      isAttackerVerdict(verdictByIp.get(signInIp(signIn)))
  )

  const sentEvents = (messages) => {
    const single = (message) => ({
      key: 'sent',
      date: toDate(message.Received),
      category: 'sent',
      objective: 'exfil',
      severity: 'info',
      label: 'Sent mail',
      ip: hostIp(message.FromIP),
      target: clean(message.Subject),
      recipient: clean(message.RecipientAddress),
      // The recipient is an account the compromised mailbox reached — onward/lateral phishing.
      affects: otherAccount(message.RecipientAddress),
    })
    if (messages.length <= SENT_COMPACT_THRESHOLD) return messages.map(single)
    const buckets = new Map()
    messages.forEach((message) => {
      const date = toDate(message.Received)
      if (!date) return
      const hour = new Date(date)
      hour.setUTCMinutes(0, 0, 0)
      const ip = hostIp(message.FromIP)
      const key = `${hour.getTime()}|${ip || ''}`
      if (!buckets.has(key)) buckets.set(key, { date: hour, ip, rows: [] })
      buckets.get(key).rows.push(message)
    })
    return [...buckets.values()].map(({ date, ip, rows }) => {
      // trace rows are per recipient: count distinct messages and distinct recipients separately
      const emails =
        new Set(rows.map((m) => m.MessageTraceId).filter(Boolean)).size ||
        rows.length
      const recipients = new Set(
        rows.map((m) => clean(m.RecipientAddress)).filter(Boolean)
      ).size
      const subjects = new Map()
      rows.forEach((m) => {
        const subject = clean(m.Subject) || '(no subject)'
        subjects.set(subject, (subjects.get(subject) || 0) + 1)
      })
      const topSubject = [...subjects.entries()].sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0]
      return {
        key: 'sent',
        date,
        category: 'sent',
        objective: 'exfil',
        severity: 'info',
        label: `${emails} email${emails === 1 ? '' : 's'} sent`,
        ip,
        target: joinDetail(
          `to ${recipients} recipient${recipients === 1 ? '' : 's'}`,
          topSubject ? `"${topSubject}"` : null
        ),
        count: emails,
      }
    })
  }

  const raw = [
    ...foreignSignIns.map((signIn) => ({
      key: 'signin',
      date: toDate(
        signIn.CreatedDateTime || signIn.createdDateTime || signIn.Timestamp
      ),
      category: 'signin',
      objective: 'access',
      severity: signIn.Status === 'Success' ? 'high' : 'medium',
      label: `Sign-in ${signIn.Status === 'Success' ? 'success' : `(${signIn.Status || 'attempt'})`}`,
      ip: signInIp(signIn),
      app: signInApp(signIn),
      location: signInLocation(signIn),
    })),
    ...arr(becData.DirectoryAudits)
      .filter((audit) => audit.Flagged)
      .map((audit) => ({
        key: 'audit',
        date: toDate(audit.ActivityDateTime),
        category: 'audit',
        objective: auditObjective(audit.Activity),
        severity: 'medium',
        label: audit.Activity || 'Directory change',
        ip: hostIp(audit.ClientIP),
        actor: shortUpn(audit.ActorResolved || audit.InitiatedBy),
        partner: isBecPartnerActor(audit),
      })),
    ...arr(becData.InboxRuleChanges).map((change) => ({
      key: 'rule',
      date: toDate(change.Date),
      category: 'rule',
      objective: 'persistence',
      severity: 'high',
      label: change.Operation || 'Inbox rule change',
      ip: hostIp(change.ClientIP),
      target: clean(change.RuleName),
      foreign: change.ForeignLocation === true,
      partner: isBecPartnerActor(change),
    })),
    ...arr(becData.MailboxPermissionChanges).map((change) => ({
      key: 'permission',
      date: toDate(change.Date),
      category: 'permission',
      objective: 'mailflow',
      severity: change.TargetsSuspect ? 'high' : 'medium',
      label: change.Operation || 'Mailbox permission change',
      ip: hostIp(change.ClientIP),
      targetsSuspect: !!change.TargetsSuspect,
      partner: isBecPartnerActor(change),
      // The counterparty, whichever isn't the victim: the grantee (Trustee) of a delegation first, then
      // the mailbox acted on. So a FullAccess/SendAs grant to a colleague ties that colleague in.
      affects: otherAccount(
        change.Trustee,
        change.ObjectId,
        change.User,
        change.UserKey
      ),
    })),
    ...arr(becData.SafelistChanges).map((change) => ({
      key: 'safelist',
      date: toDate(change.Date),
      category: 'safelist',
      objective: 'mailflow',
      severity: 'medium',
      label: change.Operation || 'Safelist change',
      partner: isBecPartnerActor(change),
      ip: hostIp(change.ClientIP),
    })),
    ...arr(becData.SharingChanges).map((change) => ({
      key: 'sharing',
      date: toDate(change.Date),
      category: 'sharing',
      objective: 'exfil',
      severity: String(change.Operation || '').startsWith('AnonymousLink')
        ? 'high'
        : 'medium',
      label: change.Operation || 'Sharing change',
      partner: isBecPartnerActor(change),
      ip: hostIp(change.ClientIP),
      target: clean(change.FileName),
      affects: otherAccount(
        change.SharedWith,
        change.TargetUserOrGroupName,
        change.Target
      ),
    })),
    ...sentEvents(arr(becData.SentMessages)),
    ...arr(becData.ReceivedMailFindings).map((finding) => ({
      key: 'received',
      date: toDate(finding.Received),
      category: 'received',
      objective: 'exfil',
      severity: finding.Severity === 'high' ? 'high' : 'medium',
      label: `Received: ${finding.FindingType || 'finding'}`,
      target: clean(finding.Subject),
      sender: clean(finding.SenderAddress),
    })),
    ...arr(becData.DefenderDetections)
      .filter((threat) => threat.Delivered)
      .map((threat) => ({
        key: 'threat',
        date: toDate(threat.ReceivedDateTime),
        category: 'threat',
        objective: 'exfil',
        severity: 'high',
        label: 'Threat delivered',
        target: clean(threat.Subject),
        sender: clean(threat.SenderAddress),
      })),
    ...arr(becData.NewUsers).map((user) => ({
      key: 'user',
      date: toDate(user.createdDateTime),
      category: 'user',
      objective: 'blast',
      severity: 'medium',
      label: 'User created',
      target: clean(user.displayName),
      // A brand-new account is itself the other party — attacker-provisioned persistence.
      affects: otherAccount(user.userPrincipalName, user.displayName),
    })),
    ...arr(becData.MFADevices)
      .filter((method) => isRecent(method.createdDateTime))
      .map((method) => ({
        key: 'mfa',
        date: toDate(method.createdDateTime),
        category: 'mfa',
        objective: 'access',
        severity: 'high',
        label: 'MFA method registered',
        target: String(method['@odata.type'] || '').replace(
          '#microsoft.graph.',
          ''
        ),
      })),
    ...arr(becData.RegisteredDevices)
      .filter((device) => device.RegisteredInWindow)
      .map((device) => ({
        key: 'device',
        date: toDate(device.registrationDateTime || device.createdDateTime),
        category: 'device',
        objective: 'access',
        severity: 'medium',
        label: 'Device registered',
        target: clean(device.displayName || device.deviceId),
      })),
    ...arr(becData.IntuneDevices)
      .filter((device) => isRecent(device.enrolledDateTime))
      .map((device) => ({
        key: 'intune',
        date: toDate(device.enrolledDateTime),
        category: 'device',
        objective: 'access',
        severity: 'medium',
        label: 'Intune device enrolled',
        target: clean(device.deviceName || device.model),
      })),
    ...arr(becData.ChangedPasswords).map((user) => ({
      key: 'password',
      date: toDate(user.lastPasswordChangeDateTime),
      category: 'password',
      objective: 'access',
      severity: 'medium',
      label: 'Password changed',
      target: clean(user.displayName || user.userPrincipalName),
    })),
    ...attackerMailEvents,
    ...attackerFileEvents,
    ...formsEvents,
  ].filter((event) => event.date)

  const events = raw
    .sort((a, b) => a.date - b.date)
    .map((event, index) => ({
      ...event,
      verdict:
        event.verdict || (event.ip ? verdictByIp.get(event.ip) : null) || null,
      id: `${event.key}-${index}`,
      ts: event.date.getTime(),
      // A single human-readable line for the timeline view, from whatever this event carries.
      detail: joinDetail(
        event.location,
        event.app,
        event.actor,
        event.target,
        event.recipient ? `to ${event.recipient}` : null,
        event.sender,
        event.foreign ? 'foreign' : null,
        event.partner ? 'partner action' : null,
        event.targetsSuspect ? 'targets this mailbox' : null,
        event.ip
      ),
      // The graph shows the source IP/location on the hub and the affected account as its own node, so
      // the event body drops both to avoid repeating what its edges already say.
      graphDetail: joinDetail(
        event.app,
        event.actor,
        event.target,
        event.sender,
        event.foreign ? 'foreign' : null,
        event.partner ? 'partner action' : null,
        event.targetsSuspect ? 'targets this mailbox' : null
      ),
    }))

  // Start of compromise: the earliest event evidencing unauthorised access or a foothold — a
  // successful foreign sign-in first, then an attacker-registered method / consent / rule, then the
  // earliest high-severity event, then simply the earliest event.
  // Start of compromise: the first thing that shows someone else in THIS account - never a
  // tenant-wide event (users created or passwords changed elsewhere in the tenant), and never simply
  // the earliest event: with no evidence there is no marker rather than a wrong one.
  //  1. the first successful sign-in from an address judged the attacker's, then anything else it did;
  //  2. the first successful foreign sign-in;
  //  3. the first high-severity foothold on the account (method, consent, rule, device).
  const TENANT_WIDE = new Set(['user', 'password'])
  const onAccount = events.filter((event) => !TENANT_WIDE.has(event.category))
  const startOfCompromise =
    onAccount.find(
      (event) =>
        event.category === 'signin' &&
        event.severity === 'high' &&
        isAttackerVerdict(event.verdict)
    ) ||
    onAccount.find((event) => isAttackerVerdict(event.verdict)) ||
    onAccount.find(
      (event) => event.category === 'signin' && event.severity === 'high'
    ) ||
    onAccount.find(
      (event) =>
        event.severity === 'high' &&
        (event.objective === 'access' || event.objective === 'persistence')
    ) ||
    null

  return { events, startOfCompromise }
}

/**
 * Reshapes the timeline into a correlation graph: the account fans out to each distinct source IP it
 * acted from (a hub), the events from that source hang off it, and events that touched another account
 * fan back out to that account (a target). This is the non-linear view — it groups what an attacker did
 * by where it came from and who it reached, rather than laying everything out by time.
 *
 * @returns {{ account, hubs, orphans, targets, startOfCompromise }}
 *   hubs = [{ ip, location, foreign, events }]; orphans = events with no source IP;
 *   targets = [{ account, events }] the other accounts the victim's events acted on.
 */
export function buildBecCorrelationGraph(
  becData,
  windowDays = 7,
  accountUpn = null
) {
  const { events, startOfCompromise } = buildBecTimeline(
    becData,
    windowDays,
    accountUpn
  )
  const resolvedAccount = clean(
    accountUpn ||
      becData?.UserPrincipalName ||
      becData?.userData?.userPrincipalName
  )
  const byIp = new Map()
  const orphans = []

  const attackerVerdict = (verdict) =>
    verdict === 'Compromised' || verdict === 'LikelyAttacker'
  events.forEach((event) => {
    if (event.ip) {
      if (!byIp.has(event.ip)) {
        byIp.set(event.ip, {
          ip: event.ip,
          location: event.location || null,
          foreign: event.category === 'signin' || event.foreign || false,
          verdict: event.verdict || null,
          attacker: attackerVerdict(event.verdict),
          events: [],
        })
      }
      const hub = byIp.get(event.ip)
      hub.events.push(event)
      if (event.location && !hub.location) hub.location = event.location
      if (event.verdict && !hub.verdict) hub.verdict = event.verdict
      if (attackerVerdict(event.verdict)) hub.attacker = true
      if (event.foreign || event.category === 'signin') hub.foreign = true
    } else {
      orphans.push(event)
    }
  })

  // Busiest sources first — the IP an attacker did the most from reads as the primary source.
  const hubs = [...byIp.values()].sort(
    (a, b) => b.events.length - a.events.length
  )

  // The other accounts the victim's activity acted on, each with the events that reached it. Most-hit
  // first so the biggest blast radius sits at the top of the column.
  const byTarget = new Map()
  events.forEach((event) => {
    if (!event.affects) return
    if (!byTarget.has(event.affects)) {
      byTarget.set(event.affects, { account: event.affects, events: [] })
    }
    byTarget.get(event.affects).events.push(event)
  })
  const targets = [...byTarget.values()]
    .filter(
      (target) =>
        !resolvedAccount ||
        target.account.toLowerCase() !== resolvedAccount.toLowerCase()
    )
    .sort((a, b) => b.events.length - a.events.length)

  return {
    account:
      resolvedAccount ||
      becData?.userData?.userPrincipalName ||
      becData?.UserPrincipalName ||
      'Account',
    hubs,
    orphans,
    targets,
    startOfCompromise,
  }
}
