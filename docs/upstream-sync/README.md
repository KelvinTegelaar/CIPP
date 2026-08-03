# Upstream sync documentation

Manage365 tracks upstream CIPP changes here. **Start with [PROCESS.md](./PROCESS.md)** for the repeatable cadence and checklist.

## Active process

| Doc | Description |
|-----|-------------|
| [PROCESS.md](./PROCESS.md) | **Master workflow** — cadence, phases, triage, version bump, deploy |

## August 2026 cycles

| Doc | Repo | Description |
|-----|------|-------------|
| [SYNC_20260803.md](./SYNC_20260803.md) | Both | **Latest** — 10.7.5 light/medium delta: AzBobbyTables 3.6.2, Intune drift, groups/devices, audit V2 |
| [UPSTREAM_DELTA_CIPP_20260803.md](./UPSTREAM_DELTA_CIPP_20260803.md) | CIPP | Frontend triage for the 08-03 cycle |

## July 2026 cycles

| Doc | Repo | Description |
|-----|------|-------------|
| [SYNC_20260728.md](./SYNC_20260728.md) | Both | 10.7.3 hotfix: cross-tenant cache leak (`Select-CippAllowedTenantData`) |
| [SYNC_20260727.md](./SYNC_20260727.md) | Both | 10.7.2 major delta — SharePoint permissions reports, templated deployments, policy compare |
| [UPSTREAM_DELTA_CIPP_20260727.md](./UPSTREAM_DELTA_CIPP_20260727.md) | CIPP | Delta triage for the 07-27 cycle |
| [SYNC_20260713.md](./SYNC_20260713.md) | Both | 10.6.1 baseline + feature intake series |
| [SYNC_20260701.md](./SYNC_20260701.md) | Both | 10.5.5 baseline |

Individual feature-intake docs from the 07-15 series (`*_INTAKE_20260715.md`) are also in
this directory.

## June 2026 cycle (reference)

| Doc | Repo | Description |
|-----|------|-------------|
| [FIRST_PASS_REPORT_20260617.md](./FIRST_PASS_REPORT_20260617.md) | Both | Initial inspection |
| [CUSTOM_FEATURE_MAP_20260617.md](./CUSTOM_FEATURE_MAP_20260617.md) | Both | Protected fork areas |
| [UPSTREAM_SYNC_CIPP_20260617.md](./UPSTREAM_SYNC_CIPP_20260617.md) | CIPP | Full commit inventory |
| [UPSTREAM_DELTA_CIPP_20260617.md](./UPSTREAM_DELTA_CIPP_20260617.md) | CIPP | Delta since sync base |
| [CIPP_SYNC_CHECKPOINT_20260617.md](./CIPP_SYNC_CHECKPOINT_20260617.md) | CIPP | Cycle checkpoint |
| [APPLIED_COMMITS_CIPP_20260617.md](./APPLIED_COMMITS_CIPP_20260617.md) | CIPP | Applied tracker |
| [APPLIED_COMMITS_CIPP_CYCLE2_20260617.md](./APPLIED_COMMITS_CIPP_CYCLE2_20260617.md) | CIPP | Cycle 2 tracker |

CIPP-API cycle docs live in the **CIPP-API** repo under `docs/upstream-sync/`.

## Naming convention

New cycle files use `YYYYMMDD` suffix:

- `UPSTREAM_DELTA_CIPP_YYYYMMDD.md`
- `CIPP_SYNC_CHECKPOINT_YYYYMMDD.md`
- `APPLIED_COMMITS_CIPP_YYYYMMDD.md`
