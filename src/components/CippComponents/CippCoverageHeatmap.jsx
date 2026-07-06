import { useEffect, useMemo, useState } from "react";
import { Box, TablePagination, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { windowColumns, tenantWindowGrid, toMs, STATE_LABELS } from "../../utils/cipp-coverage";

// Per-tenant coverage heatmap: rows = tenants, columns = individual coverage windows (not bucketed),
// cell colour = state. Empty interior cells are coverage gaps. Tenant rows are paginated (MUI), and
// cells use native title tooltips + click-to-filter.
export const CippCoverageHeatmap = ({ rows = [], onCellClick }) => {
  const theme = useTheme();
  const columns = useMemo(() => windowColumns(rows), [rows]);
  const grid = useMemo(() => tenantWindowGrid(rows, columns), [rows, columns]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    setPage(0);
  }, [rowsPerPage, grid.length]);

  if (!columns.length || !grid.length) {
    return (
      <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: "center" }}>
        No coverage data in this period.
      </Typography>
    );
  }

  const colors = {
    Processed: theme.palette.success.main,
    InFlight: theme.palette.info?.main || theme.palette.primary.main,
    Retrying: theme.palette.warning.main,
    DeadLetter: theme.palette.error.main,
    Skipped: theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[400],
  };

  const fmtFull = (ms) =>
    new Date(ms).toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const fmtTime = (ms) => new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const headerStep = Math.max(1, Math.ceil(columns.length / 10));
  const colTemplate = `minmax(110px, 160px) repeat(${columns.length}, minmax(8px, 1fr))`;
  const innerMinWidth = columns.length > 40 ? columns.length * 14 + 170 : "auto";

  const pageRows =
    rowsPerPage === -1 ? grid : grid.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const tip = (tenant, colIdx, state, cellRows) => {
    const start = columns[colIdx];
    const end = cellRows.length ? toMs(cellRows[0].WindowEnd) : null;
    const range = end ? `${fmtFull(start)} - ${fmtFull(end)}` : fmtFull(start);
    const lines = [tenant, range, `Status: ${STATE_LABELS[state] || state}`];
    if (cellRows.length) {
      const searchStatus = cellRows.map((r) => r.SearchStatus).filter(Boolean).slice(-1)[0];
      if (searchStatus && (state === "InFlight" || state === "Retrying")) lines.push(`search: ${searchStatus}`);
      const recs = cellRows.reduce((a, r) => a + (Number(r.RecordCount) || 0), 0);
      const matched = cellRows.reduce((a, r) => a + (Number(r.MatchedCount) || 0), 0);
      const retries = cellRows.reduce((a, r) => a + (Number(r.RetryCount) || 0), 0);
      const throttles = cellRows.reduce((a, r) => a + (Number(r.ThrottleCount) || 0), 0);
      const lastErr = cellRows.map((r) => r.LastError).filter(Boolean).slice(-1)[0];
      lines.push(`${recs} records${matched ? ` - ${matched} matched` : ""}`);
      if (retries || throttles) lines.push(`retries ${retries} - throttles ${throttles}`);
      if (lastErr) lines.push(lastErr);
    } else if (state === "Gap") {
      lines.push("No window created (coverage gap)");
    }
    return lines.join("\n");
  };

  return (
    <Box>
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: innerMinWidth }}>
          <Box sx={{ display: "grid", gridTemplateColumns: colTemplate, gap: "3px", alignItems: "center", mb: "4px" }}>
            <Box />
            {columns.map((ms, i) => (
              <Typography
                key={i}
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: 10, whiteSpace: "nowrap", overflow: "visible" }}
              >
                {i % headerStep === 0 ? fmtTime(ms) : ""}
              </Typography>
            ))}
          </Box>
          {pageRows.map((t) => (
            <Box
              key={t.name}
              sx={{ display: "grid", gridTemplateColumns: colTemplate, gap: "3px", alignItems: "center", mb: "3px" }}
            >
              <Typography variant="caption" noWrap title={t.name} sx={{ pr: 1, color: "text.secondary" }}>
                {t.name.replace(/\.onmicrosoft\.com$/, "")}
              </Typography>
              {t.states.map((s, i) => {
                const empty = s === "Empty";
                const gap = s === "Gap";
                return (
                  <Box
                    key={i}
                    title={empty ? undefined : tip(t.name, i, s, t.cells[i])}
                    onClick={() =>
                      !empty &&
                      onCellClick &&
                      onCellClick({
                        tenant: t.name,
                        startMs: columns[i],
                        endMs: t.cells[i].length ? toMs(t.cells[i][0].WindowEnd) : null,
                      })
                    }
                    sx={{
                      height: 20,
                      borderRadius: "3px",
                      cursor: empty ? "default" : "pointer",
                      bgcolor: gap || empty ? "transparent" : colors[s],
                      border: gap
                        ? `1px dashed ${theme.palette.error.main}`
                        : empty
                          ? `1px solid ${theme.palette.divider}`
                          : "none",
                      opacity: empty ? 0.35 : 1,
                      transition: "transform .1s ease-in-out",
                      "&:hover": empty ? {} : { transform: "scale(1.18)", zIndex: 1 },
                    }}
                  />
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
      <TablePagination
        component="div"
        count={grid.length}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[25, 50, 100, 250, { label: "All", value: -1 }]}
        labelRowsPerPage="Tenants per page"
      />
    </Box>
  );
};

export default CippCoverageHeatmap;
