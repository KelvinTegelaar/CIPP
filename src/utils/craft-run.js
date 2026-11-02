// Craft pushes run status app-neutrally; the queue trackers keep the CippQueue entry shape. Mirrors
// ConvertFrom-CIPPCraftRunStatus (backend), which shapes the same status for ListCippQueue: keep them in step.

const STATUS = {
  CompletedWithErrors: 'Completed (with errors)',
  NotFound: 'Not found',
}

const percent = (part, divisor) => Math.round((part / divisor) * 1000) / 10

export const fromCraftRun = (run) => {
  const Status = STATUS[run.status] ?? run.status
  // A status-only frame (a run that never appeared) must not blank the counts the tracker already shows.
  if (!run.runName) return { Status }
  const total = Number(run.total) || 0
  const failed = Number(run.failed) || 0
  const running = Number(run.running) || 0
  const done = (Number(run.completed) || 0) + failed
  const divisor = Math.max(total, 1)
  return {
    PartitionKey: 'CippQueue',
    RowKey: run.runName,
    Name: run.label || run.runName,
    Link: run.link ?? '',
    Reference: run.reference,
    TotalTasks: total,
    CompletedTasks: done,
    RunningTasks: running,
    FailedTasks: failed,
    PercentComplete: percent(done, divisor),
    PercentFailed: percent(failed, divisor),
    PercentRunning: percent(running, divisor),
    // Craft names a task by its job name; CIPP's are Function_Tenant and the tracker shows the tenant.
    Tasks: (run.tasks ?? []).map((task) => ({
      Timestamp: task.at,
      Name: String(task.name).replace(/^[^_]*_(?=.)/, ''),
      Status: task.status,
    })),
    Status,
    Timestamp: run.startedUtc,
  }
}
