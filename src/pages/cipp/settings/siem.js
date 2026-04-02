import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import tabOptions from "./tabOptions";
import CippSiemSettings from "../../../components/CippSettings/CippSiemSettings";
import { CippCopyToClipBoard } from "../../../components/CippComponents/CippCopyToClipboard";

const filterExamples = [
  {
    label: "Specific day",
    filter: "PartitionKey eq 'YYYYMMDD'",
    note: "Replace YYYYMMDD with the current date, e.g. 20260312",
  },
  {
    label: "Date range (last 7 days)",
    filter: "PartitionKey ge '20260305' and PartitionKey le '20260312'",
    note: "Use ge/le to query a range of dates",
  },
];

const Page = () => {
  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
      <Grid container spacing={2}>
        <Grid size={{ lg: 6, md: 8, sm: 12, xs: 12 }}>
          <CippSiemSettings />
        </Grid>
        <Grid size={{ lg: 6, md: 8, sm: 12, xs: 12 }}>
          <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <CardHeader title="Querying CIPP Logs" />
            <Divider />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  How Logs are Stored
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  CIPP writes all log entries to an Azure Table Storage table called{" "}
                  <code>CippLogs</code>. Each row is partitioned by date using the format{" "}
                  <code>YYYYMMDD</code> as the <code>PartitionKey</code>, with a unique GUID as the{" "}
                  <code>RowKey</code>.
                </Typography>
              </div>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Always include a PartitionKey filter</strong> in your queries. Azure Table
                  Storage performs a full table scan without one, which is slow and expensive on
                  large tables. Use <code>eq</code> for a single day or <code>ge</code> /{" "}
                  <code>le</code> for a date range.{" "}
                  <strong>The date partition is in UTC time</strong>, so you may need to use a date
                  range to account for timezone differences.
                </Typography>
              </Alert>

              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Available Columns
                </Typography>
                <Typography variant="body2" component="div" color="text.secondary">
                  <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                    <li>
                      <code>PartitionKey</code> — Date in YYYYMMDD format
                    </li>
                    <li>
                      <code>RowKey</code> — Unique log entry ID (GUID)
                    </li>
                    <li>
                      <code>Timestamp</code> — When the entry was written
                    </li>
                    <li>
                      <code>Tenant</code> — Tenant domain name
                    </li>
                    <li>
                      <code>Username</code> — User who triggered the action
                    </li>
                    <li>
                      <code>API</code> — API endpoint or function name
                    </li>
                    <li>
                      <code>Message</code> — Log message text
                    </li>
                    <li>
                      <code>Severity</code> — Log level (Info, Warning, Error, Debug)
                    </li>
                    <li>
                      <code>LogData</code> — Additional JSON data (if any)
                    </li>
                    <li>
                      <code>TenantID</code> — Tenant GUID (when available)
                    </li>
                    <li>
                      <code>IP</code> — Source IP address (when available)
                    </li>
                  </ul>
                </Typography>
              </div>

              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Example $filter Queries
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Append <code>&$filter=</code> to your SAS URL to filter results. Use{" "}
                  <code>eq</code>, <code>ne</code>, <code>gt</code>, <code>lt</code>,{" "}
                  <code>ge</code>, <code>le</code>, and combine with <code>and</code> /{" "}
                  <code>or</code>.
                </Typography>
                {filterExamples.map((ex) => (
                  <div key={ex.label} style={{ marginBottom: "0.75rem" }}>
                    <Typography variant="body2" fontWeight={600}>
                      {ex.label}
                    </Typography>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.8rem",
                        padding: "4px 8px",
                        borderRadius: 4,
                        backgroundColor: "var(--mui-palette-action-hover)",
                      }}
                    >
                      <code style={{ flex: 1, overflowX: "auto" }}>$filter={ex.filter}</code>
                      <CippCopyToClipBoard text={`$filter=${ex.filter}`} />
                    </div>
                    {ex.note && (
                      <Typography variant="caption" color="text.secondary">
                        {ex.note}
                      </Typography>
                    )}
                  </div>
                ))}
              </div>

              <Divider />

              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Azure Tables Documentation
                </Typography>
                <Typography variant="body2" component="div" color="text.secondary">
                  <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                    <li>
                      <MuiLink
                        href="https://learn.microsoft.com/en-us/rest/api/storageservices/querying-tables-and-entities"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Querying Tables and Entities
                      </MuiLink>
                      {" — "}filter syntax, operators, and supported data types
                    </li>
                    <li>
                      <MuiLink
                        href="https://learn.microsoft.com/en-us/rest/api/storageservices/query-timeout-and-pagination"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Query Timeout and Pagination
                      </MuiLink>
                      {" — "}handling continuation tokens for large result sets
                    </li>
                  </ul>
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
