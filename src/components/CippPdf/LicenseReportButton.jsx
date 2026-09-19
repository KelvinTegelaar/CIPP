import { useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CippPdfPreview } from './CippPdfPreview'
import {
  AlertBox,
  Bold,
  Bullet,
  BulletList,
  ClearBox,
  ContentPage,
  CoverMeta,
  DataTable,
  DonutChart,
  InfoBox,
  Note,
  Paragraph,
  REPORT_COLOURS,
  ReportDocument,
  Section,
  StatRow,
  severityColour,
} from './index'
import { useReportVariables } from './useReportVariables'
import { useBrandingSettings } from './useBrandingSettings'

const nz = (value) => Number(value ?? 0)
const num = (value) => nz(value).toLocaleString()

// Currency formatting for the client: whole units for the big figures, cents for a per-seat price.
const makeMoney = (currency) => {
  const build = (fraction) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
      })
    } catch {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
      })
    }
  }
  const whole = build(0)
  const cents = build(2)
  return {
    whole: (value) => whole.format(nz(value)),
    cents: (value) => cents.format(nz(value)),
  }
}

// The waste tiers from Get-CIPPLicenseOptimization, in the words a client would use.
const TIER_TEXT = {
  UnassignedSeats: 'Paid for but not given to anyone',
  DisabledAccount: 'Given to an account that has been switched off',
  Inactive: 'Given to someone who has not signed in for a long time',
  Overlap: 'Duplicate: another plan already includes it',
}

// Which sections the report can carry. `overview` is the page that makes it a report, so it is
// always on.
export const LICENSE_REPORT_SECTIONS = [
  {
    key: 'spend',
    label: 'What you pay for',
    description: 'Every plan, seats owned versus in use, and monthly cost.',
  },
  {
    key: 'reclaim',
    label: 'Licenses you can remove',
    description: 'Unassigned, switched-off, inactive and duplicate licenses.',
  },
  {
    key: 'downgrades',
    label: 'Cheaper plans',
    description: 'People whose plan includes more than they use.',
  },
  {
    key: 'upgrades',
    label: 'Better plans',
    description:
      'Bundles that cost less, and people with no security protection.',
  },
  {
    key: 'terms',
    label: 'Yearly or monthly',
    description: 'How many seats are stable enough to commit to for a year.',
  },
  {
    key: 'method',
    label: 'How this was measured',
    description: 'Sources, time window and assumptions.',
  },
]

export const DEFAULT_LICENSE_REPORT_SECTIONS = Object.fromEntries(
  LICENSE_REPORT_SECTIONS.map((section) => [section.key, true])
)

/**
 * Grades the licensing from the share of monthly spend the report could recover.
 */
const assessSpend = (summary) => {
  const spend = nz(summary?.MonthlySpend)
  const potential = nz(summary?.TotalPotentialMonthly)
  if (spend <= 0) return { level: 'No priced spend', severity: 'low', share: 0 }
  const share = Math.round((potential / spend) * 100)
  if (share >= 15)
    return { level: 'Significant savings available', severity: 'high', share }
  if (share >= 5)
    return { level: 'Some savings available', severity: 'medium', share }
  return { level: 'Well matched', severity: 'low', share }
}

// Exported so tests can render it to a real PDF against sample data.
export const LicenseReportDocument = ({
  report,
  brandingSettings,
  tenantName,
  generatedOn,
  variables,
  sections = DEFAULT_LICENSE_REPORT_SECTIONS,
}) => {
  const summary = report?.Summary ?? {}
  const products = report?.Products ?? []
  const opportunities = report?.Optimization?.Opportunities ?? []
  const downgrades = report?.Downgrades ?? []
  const upgrades = report?.Upgrades ?? []
  const terms = report?.Terms ?? []
  const capabilities = report?.Capabilities ?? []
  const money = makeMoney(summary.Currency)
  const show = (key) => sections?.[key] !== false

  const inactiveDays = nz(summary.InactiveDays) || 90
  const tenureMonths = nz(summary.TenureMonths) || 6
  const upliftPct = Math.round(
    (nz(summary.MonthlyCommitmentUplift) || 0.2) * 100
  )
  const monthlySpend = nz(summary.MonthlySpend)
  const potentialMonthly = nz(summary.TotalPotentialMonthly)
  const potentialAnnual = nz(summary.TotalPotentialAnnual)
  const assessment = assessSpend(summary)
  const assessmentColour = severityColour(assessment.severity)

  // Reclaim findings the client can act on. The mailbox-only review tier claims no saving and is
  // superseded by the evidence-based downgrade pass, so it stays on the admin page.
  const reclaimRows = opportunities
    .filter((row) => row.Tier !== 'Downgrade')
    .map((row) => ({
      plan: row.License,
      finding: TIER_TEXT[row.Tier] ?? row.FindingLabel,
      seats: num(row.Seats),
      saving: row.PriceKnown ? money.whole(row.MonthlySaving) : 'not priced',
      savingValue: nz(row.MonthlySaving),
    }))
    .sort((a, b) => b.savingValue - a.savingValue)

  const consolidations = upgrades.filter((row) => row.Type === 'Consolidate')
  const protections = upgrades.filter((row) => row.Type === 'Protect')

  const spendSeries = (() => {
    const priced = products.filter((row) => nz(row.MonthlySpend) > 0)
    const top = priced
      .slice(0, 6)
      .map((row) => ({ label: row.License, value: nz(row.MonthlySpend) }))
    const rest = priced
      .slice(6)
      .reduce((sum, row) => sum + nz(row.MonthlySpend), 0)
    if (rest > 0) top.push({ label: 'Other plans', value: rest })
    return top
  })()

  const sources = [
    nz(summary.ReclaimableMonthly) > 0 && {
      label: `${money.whole(summary.ReclaimableMonthly)} a month by removing licenses nobody uses.`,
      text: `${num(summary.ReclaimableSeats)} licenses are paid for but sit with nobody, with switched-off accounts, or with people who have not signed in for ${inactiveDays} days.`,
    },
    nz(summary.DowngradeMonthly) > 0 && {
      label: `${money.whole(summary.DowngradeMonthly)} a month by moving people to a cheaper plan.`,
      text: `${num(summary.DowngradeSeats)} people hold a plan that includes services they have not used in the last ${nz(summary.ReportPeriodDays) || 90} days.`,
    },
    nz(summary.ConsolidationMonthly) > 0 && {
      label: `${money.whole(summary.ConsolidationMonthly)} a month by combining separate plans into one bundle.`,
      text: 'Some people hold two or more plans that together cost more than a single bundle with the same features.',
    },
    nz(summary.TermMonthly) > 0 && {
      label: `${money.whole(summary.TermMonthly)} a month by paying yearly for stable seats.`,
      text: `Month-to-month licenses cost ${upliftPct}% more than a yearly commitment. Seats that have been with the same person for ${tenureMonths} months or longer are safe to commit to.`,
    },
  ].filter(Boolean)

  const generatedLabel =
    generatedOn ??
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <ReportDocument
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      reportName="Licensing Report"
      generatedOn={generatedLabel}
      variables={variables}
      coverLabel="Microsoft 365 Licensing Review"
      coverTitle="Licensing"
      coverAccent="Report"
      coverSubtitle={`What ${tenantName} pays Microsoft for each month, which of it is used, and where the same work could be done for less.`}
      coverFallbackImage="/reportImages/city.jpg"
      coverFooterNote="Confidential — Prepared for the leadership team"
      footerLabel={`${tenantName} — Licensing`}
      coverMeta={
        <CoverMeta
          lines={[
            `${num(summary.LicensedUsers)} people licensed · ${num(products.length)} plans · ${money.whole(monthlySpend)} per month`,
          ]}
          note={
            potentialAnnual > 0
              ? `Potential saving: ${money.whole(potentialAnnual)} per year`
              : 'No savings identified'
          }
        />
      }
    >
      {/* OVERVIEW */}
      <ContentPage title="Summary" subtitle="The numbers that matter">
        <Section>
          <Paragraph>
            Microsoft 365 is bought per person, per plan, per month. Every plan
            bundles a set of services, and each person is meant to hold the plan
            that matches what they do. Over time that drifts: people leave,
            roles change, and plans bought for one reason keep renewing. This
            report compares what <Bold>{tenantName}</Bold> pays for with what
            its people actually used over the last{' '}
            {nz(summary.ReportPeriodDays) || 90} days.
          </Paragraph>

          <StatRow
            stats={[
              { value: money.whole(monthlySpend), label: 'Spend per month' },
              {
                value: money.whole(potentialMonthly),
                label: 'Could be saved per month',
                colour:
                  potentialMonthly > 0 ? REPORT_COLOURS.success : undefined,
              },
              {
                value: money.whole(potentialAnnual),
                label: 'Could be saved per year',
                colour:
                  potentialAnnual > 0 ? REPORT_COLOURS.success : undefined,
              },
              {
                value: num(summary.ReclaimableSeats),
                label: 'Licenses nobody uses',
                colour:
                  nz(summary.ReclaimableSeats) > 0
                    ? REPORT_COLOURS.warning
                    : undefined,
              },
            ]}
          />

          <AlertBox
            title={`Licensing: ${assessment.level}`}
            colour={assessmentColour}
          >
            {assessment.severity === 'high' &&
              `About ${assessment.share}% of the monthly licensing bill could be recovered. That is well past what normal staff turnover explains, and it means plans are being paid for out of habit rather than need. The actions in this report are worth scheduling now.`}
            {assessment.severity === 'medium' &&
              `About ${assessment.share}% of the monthly licensing bill could be recovered. Licensing is broadly right; the savings are in a handful of licenses and plans that no longer match how people work.`}
            {assessment.severity === 'low' &&
              (monthlySpend > 0
                ? 'What is paid for closely matches what is used. Nothing here needs action beyond repeating this review as people join and leave.'
                : 'No list price is known for the plans in this tenant, so no spend or savings could be calculated. Prices can be added on the License Pricing page.')}
          </AlertBox>
        </Section>

        {sources.length > 0 ? (
          <Section title="Where the savings come from">
            <BulletList items={sources} />
          </Section>
        ) : null}

        <Section title="How to read this report">
          <InfoBox title="What was measured">
            Microsoft records, per person, the last day each service was used:
            email, Teams, files, the installed Office apps, and Copilot. Those
            dates were compared with what each plan includes. A recommendation
            is only made where that evidence exists.
          </InfoBox>
          <InfoBox title="What was not measured">
            Security and management features such as device management, sign-in
            protection and threat protection have no per-person usage record.{' '}
            {summary.ProtectSecurityFeatures === false
              ? 'This report was configured to treat them as optional, so a cheaper plan may drop them; each such case lists exactly what would be lost.'
              : 'This report keeps every one of them: nobody is moved to a plan that removes a security feature they hold today.'}
          </InfoBox>
        </Section>
      </ContentPage>

      {/* SPEND */}
      {show('spend') ? (
        <ContentPage
          title="What you pay for"
          subtitle="Every plan, seats owned versus in use"
        >
          <Section>
            <Paragraph>
              Each row is one plan. <Bold>Owned</Bold> is how many seats are
              bought; <Bold>in use</Bold> is how many are given to a person; the
              difference is paid for and unused. Prices are Microsoft public
              list prices unless a price has been set specifically for this
              organisation.
            </Paragraph>
            {spendSeries.length > 0 ? (
              <DonutChart
                data={spendSeries}
                title="Monthly spend by plan"
                centreLabel="per month"
                emptyText="No priced plans to chart."
              />
            ) : null}
            <DataTable
              columns={[
                { header: 'Plan', key: 'plan', width: 3, bold: true },
                { header: 'Owned', key: 'owned', width: 0.8, align: 'right' },
                { header: 'In use', key: 'used', width: 0.8, align: 'right' },
                {
                  header: 'Unused',
                  key: 'unused',
                  width: 0.8,
                  align: 'right',
                  colour: (row) =>
                    row.unusedValue > 0 ? REPORT_COLOURS.warning : undefined,
                },
                { header: 'Per seat', key: 'unit', width: 1, align: 'right' },
                {
                  header: 'Per month',
                  key: 'monthly',
                  width: 1.1,
                  align: 'right',
                },
              ]}
              rows={products.map((row) => ({
                plan: row.License,
                owned: num(row.TotalSeats),
                used: num(row.AssignedSeats),
                unused: num(row.UnusedSeats),
                unusedValue: nz(row.UnusedSeats),
                unit: row.PriceKnown ? money.cents(row.UnitCost) : '—',
                monthly: row.PriceKnown
                  ? money.whole(row.MonthlySpend)
                  : 'not priced',
              }))}
              limit={30}
              emptyText="No licenses were found for this organisation."
            />
          </Section>
        </ContentPage>
      ) : null}

      {/* RECLAIM */}
      {show('reclaim') ? (
        <ContentPage
          title="Licenses you can remove"
          subtitle="Paid for, used by nobody"
        >
          <Section>
            <Paragraph>
              These licenses cost money every month and do no work. Removing
              them changes nothing for anyone who is actually working. Seats
              bought on a yearly term cannot be reduced until the term renews,
              but can be reassigned to new starters instead of buying more.
            </Paragraph>
            {reclaimRows.length > 0 ? (
              <DataTable
                columns={[
                  { header: 'Plan', key: 'plan', width: 2.2, bold: true },
                  { header: 'Why it can go', key: 'finding', width: 3 },
                  { header: 'Seats', key: 'seats', width: 0.7, align: 'right' },
                  {
                    header: 'Saving per month',
                    key: 'saving',
                    width: 1.3,
                    align: 'right',
                  },
                ]}
                rows={reclaimRows}
                limit={30}
              />
            ) : (
              <ClearBox title="✔️ Nothing to remove">
                Every license is assigned to an active person. Turnover is being
                handled well.
              </ClearBox>
            )}
          </Section>
        </ContentPage>
      ) : null}

      {/* DOWNGRADES */}
      {show('downgrades') ? (
        <ContentPage
          title="Cheaper plans"
          subtitle="People whose plan includes more than they use"
        >
          <Section>
            <Paragraph>
              Each line groups people on the same plan who used the same subset
              of it. The suggested plan is the cheapest one that still includes
              everything they used in the last{' '}
              {nz(summary.ReportPeriodDays) || 90} days. What they would lose is
              listed so the decision is an informed one; a person who needs one
              of those services in the coming months should stay where they are.
            </Paragraph>
            {summary.AnonymizedReports ? (
              <AlertBox
                title="Usage reports are anonymised"
                colour={REPORT_COLOURS.warning}
              >
                Microsoft is configured to hide names in this
                organisation&apos;s usage reports, so activity could not be
                matched to people and no plan changes are suggested. The setting
                can be switched off in the Microsoft 365 admin centre.
              </AlertBox>
            ) : downgrades.length > 0 ? (
              <>
                <DataTable
                  columns={[
                    {
                      header: 'Current plan',
                      key: 'from',
                      width: 2,
                      bold: true,
                    },
                    { header: 'Suggested', key: 'to', width: 2 },
                    {
                      header: 'People',
                      key: 'seats',
                      width: 0.7,
                      align: 'right',
                    },
                    { header: 'Each', key: 'unit', width: 1, align: 'right' },
                    {
                      header: 'Saving per month',
                      key: 'saving',
                      width: 1.3,
                      align: 'right',
                    },
                  ]}
                  rows={downgrades.map((row) => ({
                    from: row.FromLicense,
                    to:
                      row.Action === 'Remove'
                        ? 'Remove the plan'
                        : row.ToLicense,
                    seats: num(row.Seats),
                    unit: money.cents(row.UnitSaving),
                    saving: money.whole(row.MonthlySaving),
                  }))}
                  limit={20}
                />
                <BulletList>
                  {downgrades.slice(0, 8).map((row, index) => (
                    <Bullet
                      key={`${row.FromSkuId}-${row.ToSkuId ?? 'none'}-${index}`}
                      label={`${row.FromLicense} → ${row.Action === 'Remove' ? 'no plan' : row.ToLicense}:`}
                    >
                      {row.Keeps?.length
                        ? `keeps ${row.Keeps.join(', ')}. `
                        : ''}
                      {row.Loses?.length
                        ? `Loses ${row.Loses.join(', ')}.`
                        : 'Loses nothing that was used.'}
                    </Bullet>
                  ))}
                </BulletList>
                {downgrades.length > 8 ? (
                  <Note>
                    … and {downgrades.length - 8} more groups, listed in full on
                    the admin page.
                  </Note>
                ) : null}
              </>
            ) : (
              <ClearBox title="✔️ Plans match usage">
                Nobody holds a plan whose measured services they left unused. No
                cheaper plan is suggested.
              </ClearBox>
            )}
          </Section>
        </ContentPage>
      ) : null}

      {/* UPGRADES */}
      {show('upgrades') ? (
        <ContentPage
          title="Better plans"
          subtitle="Where a different plan pays off"
        >
          <Section title="Combine separate plans">
            <Paragraph>
              Some people hold two or more plans bought at different times. When
              one bundle includes the same features for less, the bundle is the
              better buy.
            </Paragraph>
            {consolidations.length > 0 ? (
              <DataTable
                columns={[
                  {
                    header: 'Current plans',
                    key: 'from',
                    width: 2.6,
                    bold: true,
                  },
                  { header: 'Suggested bundle', key: 'to', width: 2 },
                  {
                    header: 'People',
                    key: 'seats',
                    width: 0.7,
                    align: 'right',
                  },
                  { header: 'Now', key: 'now', width: 0.9, align: 'right' },
                  {
                    header: 'Bundle',
                    key: 'bundle',
                    width: 0.9,
                    align: 'right',
                  },
                  {
                    header: 'Saving per month',
                    key: 'saving',
                    width: 1.3,
                    align: 'right',
                  },
                ]}
                rows={consolidations.map((row) => ({
                  from: (row.FromLicenses ?? []).join(' + '),
                  to: row.ToLicense,
                  seats: num(row.Seats),
                  now: money.cents(row.UnitCost),
                  bundle: money.cents(row.TargetCost),
                  saving: money.whole(-1 * nz(row.MonthlyDelta)),
                }))}
                limit={15}
              />
            ) : (
              <ClearBox title="✔️ No cheaper bundles">
                Nobody&apos;s combination of plans costs more than a single
                bundle would.
              </ClearBox>
            )}
          </Section>

          <Section title="People with no security protection">
            <Paragraph>
              These people hold plans that include no device management, no
              advanced sign-in protection and no device threat protection. That
              is a business risk rather than a saving, so the figure below is an
              added cost. It is the cheapest plan that gives them all three.
            </Paragraph>
            {protections.length > 0 ? (
              <DataTable
                columns={[
                  {
                    header: 'Current plans',
                    key: 'from',
                    width: 2.4,
                    bold: true,
                  },
                  { header: 'Suggested', key: 'to', width: 2 },
                  {
                    header: 'People',
                    key: 'seats',
                    width: 0.7,
                    align: 'right',
                  },
                  {
                    header: 'Extra per person',
                    key: 'unit',
                    width: 1.2,
                    align: 'right',
                  },
                  {
                    header: 'Extra per month',
                    key: 'delta',
                    width: 1.3,
                    align: 'right',
                  },
                ]}
                rows={protections.map((row) => ({
                  from: (row.FromLicenses ?? []).join(' + '),
                  to: row.ToLicense,
                  seats: num(row.Seats),
                  unit: money.cents(row.UnitDelta),
                  delta: money.whole(row.MonthlyDelta),
                }))}
                limit={15}
              />
            ) : (
              <ClearBox title="✔️ Everyone is covered">
                Every licensed person holds a plan with device management,
                sign-in protection and device threat protection.
              </ClearBox>
            )}
          </Section>
        </ContentPage>
      ) : null}

      {/* TERMS */}
      {show('terms') ? (
        <ContentPage
          title="Yearly or monthly"
          subtitle="Committing to the seats that will stay"
        >
          <Section>
            <Paragraph>
              Microsoft sells the same plan two ways. A <Bold>yearly</Bold>{' '}
              commitment is cheaper but cannot be reduced until it renews. A{' '}
              <Bold>monthly</Bold> commitment costs about {upliftPct}% more but
              can be dropped at any time. The right mix is to commit yearly to
              the seats that will still be there in a year and keep the rest
              monthly. A seat that has been with the same person for{' '}
              {tenureMonths} months or more is treated as one that will stay.
            </Paragraph>
            {terms.length > 0 ? (
              <DataTable
                columns={[
                  { header: 'Plan', key: 'plan', width: 2.4, bold: true },
                  { header: 'In use', key: 'used', width: 0.7, align: 'right' },
                  {
                    header: `Held ${tenureMonths}+ mo`,
                    key: 'stable',
                    width: 0.9,
                    align: 'right',
                  },
                  {
                    header: 'Yearly now',
                    key: 'yearlyNow',
                    width: 0.9,
                    align: 'right',
                  },
                  {
                    header: 'Suggested yearly',
                    key: 'yearly',
                    width: 1.1,
                    align: 'right',
                  },
                  {
                    header: 'Suggested monthly',
                    key: 'monthly',
                    width: 1.1,
                    align: 'right',
                  },
                  {
                    header: 'Saving per month',
                    key: 'saving',
                    width: 1.2,
                    align: 'right',
                  },
                ]}
                rows={terms.map((row) => ({
                  plan: row.License,
                  used: num(row.AssignedSeats),
                  stable: num(row.StableSeats),
                  yearlyNow: row.TermKnown ? num(row.YearlySeats) : 'unknown',
                  yearly: num(row.RecommendedAnnual),
                  monthly: num(row.RecommendedMonthly),
                  saving:
                    row.TermKnown && row.PriceKnown
                      ? money.whole(row.MonthlySaving)
                      : '—',
                }))}
                limit={30}
              />
            ) : (
              <ClearBox title="No plans to assess">
                No assigned plans were found.
              </ClearBox>
            )}
            {terms.some((row) => nz(row.LockedUnusedSeats) > 0) ? (
              <InfoBox title="Yearly seats that nobody holds">
                {terms
                  .filter((row) => nz(row.LockedUnusedSeats) > 0)
                  .map(
                    (row) =>
                      `${row.License}: ${num(row.LockedUnusedSeats)} yearly seat${nz(row.LockedUnusedSeats) === 1 ? '' : 's'} unassigned${row.NextRenewalDays != null ? `, renews in ${num(row.NextRenewalDays)} days` : ''}`
                  )
                  .join('. ')}
                . These are paid for until renewal; reduce the count before that
                date.
              </InfoBox>
            ) : null}
            {terms.some((row) => !row.TermKnown) ? (
              <Note>
                &ldquo;Unknown&rdquo; means Microsoft did not report the
                commitment term for that plan, so the current yearly/monthly
                split could not be read and no saving is claimed.
              </Note>
            ) : null}
          </Section>
        </ContentPage>
      ) : null}

      {/* METHOD */}
      {show('method') ? (
        <ContentPage
          title="How this was measured"
          subtitle="Sources, window and assumptions"
        >
          <Section>
            <BulletList
              items={[
                {
                  label: 'Prices.',
                  text: `Microsoft public list prices per user per month on a yearly commitment, in ${summary.Currency || 'USD'}, unless a specific price was entered for this organisation. Real invoices may differ from list price.`,
                },
                {
                  label: 'Usage window.',
                  text: `The last ${nz(summary.ReportPeriodDays) || 90} days of Microsoft usage reports for email, Teams, OneDrive and SharePoint, the installed Office apps, and Copilot. A person counts as inactive after ${inactiveDays} days without a sign-in.`,
                },
                {
                  label: 'Measured services.',
                  text: capabilities
                    .filter((cap) => cap.measurable)
                    .map((cap) => cap.label)
                    .join(', '),
                },
                {
                  label: 'Services with no usage record.',
                  text: `${capabilities
                    .filter((cap) => !cap.measurable)
                    .map((cap) => cap.label)
                    .join(', ')}. ${
                    summary.ProtectSecurityFeatures === false
                      ? 'Treated as optional in this report.'
                      : 'Always kept in this report.'
                  }`,
                },
                {
                  label: 'Plan comparison.',
                  text: 'Plans are compared by the services Microsoft lists for each one. Business plans are only suggested where the organisation is within their 300-user limit; frontline plans only to people already on one.',
                },
                {
                  label: 'Yearly versus monthly.',
                  text: `Microsoft records when each person's license was last changed. A seat unchanged for ${tenureMonths} months or more is treated as stable. The saving is the ${upliftPct}% premium on monthly-commitment seats that could move to a yearly term.`,
                },
                {
                  label: 'Report generated.',
                  text: `${generatedLabel}, from data collected by the management platform.`,
                },
              ]}
            />
          </Section>
        </ContentPage>
      ) : null}
    </ReportDocument>
  )
}

export const LicenseReportButton = ({
  report,
  tenantName,
  disabled = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generatedOn, setGeneratedOn] = useState('')
  const [sections, setSections] = useState(DEFAULT_LICENSE_REPORT_SECTIONS)
  const brandingSettings = useBrandingSettings()
  const variables = useReportVariables()
  const hasData = !!report?.Summary && report.Summary.DataAvailable !== false

  const handleOpen = () => {
    setGeneratedOn(
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    )
    setDialogOpen(true)
  }

  const toggleSection = (key) =>
    setSections((current) => ({ ...current, [key]: !current[key] }))

  const documentNode = useMemo(
    () => (
      <LicenseReportDocument
        report={report}
        brandingSettings={brandingSettings}
        tenantName={tenantName}
        generatedOn={generatedOn}
        variables={variables}
        sections={sections}
      />
    ),
    [report, brandingSettings, tenantName, generatedOn, variables, sections]
  )

  const safeTenant = (tenantName || 'tenant').replace(/[^a-z0-9.-]/gi, '_')

  return (
    <>
      <Tooltip title="Generate a client-ready PDF of the licensing figures">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CippIcons.PictureAsPdf />}
            onClick={handleOpen}
            disabled={disabled || !hasData}
          >
            Client Report
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        slotProps={{
          paper: { sx: { height: '90vh' } },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" component="div">
              Licensing Report - {tenantName}
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <CippIcons.Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: 'flex', minHeight: 0 }}>
          <Paper
            sx={{
              width: 300,
              flexShrink: 0,
              borderRadius: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              overflow: 'auto',
              p: 2,
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Report Sections
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              The summary page is always included. Recommendation sections
              follow the switches on the page; a section switched off there has
              nothing to show here.
            </Typography>
            <Stack spacing={1.5}>
              {LICENSE_REPORT_SECTIONS.map((option) => (
                <Paper
                  key={option.key}
                  onClick={() => toggleSection(option.key)}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: sections[option.key]
                      ? 'primary.main'
                      : 'divider',
                    bgcolor: sections[option.key]
                      ? 'primary.50'
                      : 'background.paper',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Switch
                    checked={!!sections[option.key]}
                    onChange={(event) => {
                      event.stopPropagation()
                      toggleSection(option.key)
                    }}
                    onClick={(event) => event.stopPropagation()}
                    color="primary"
                    size="small"
                  />
                  <Box sx={{ ml: 1, flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                    >
                      {option.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      {option.description}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>
          <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            {dialogOpen && (
              <CippPdfPreview
                width="100%"
                height="100%"
                title={`Licensing Report - ${tenantName}`}
                fileName={`Licensing_Report_${safeTenant}.pdf`}
              >
                {documentNode}
              </CippPdfPreview>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <PDFDownloadLink
            document={documentNode}
            fileName={`Licensing_Report_${safeTenant}_${new Date().toISOString().split('T')[0]}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CippIcons.Download />
                  )
                }
                disabled={loading}
              >
                {loading ? 'Generating…' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default LicenseReportButton
