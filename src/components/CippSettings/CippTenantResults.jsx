import { CippDataTable } from "../CippTable/CippDataTable";
import { Sync } from "@mui/icons-material";

export const CippTenantResults = (props) => {
  const { importReport = false } = props;
  return (
    <>
      {importReport?.Results?.length > 0 && (
        <>
          <CippDataTable
            title="Imported Report"
            noCard={true}
            data={importReport.Results}
            actions={[]}
            simpleColumns={[
              "TenantName",
              "LastRun",
              "GraphStatus",
              "ExchangeStatus",
              "MissingRoles",
              "GDAPRoles",
            ]}
            offCanvas={{
              extendedInfoFields: [
                "TenantName",
                "TenantId",
                "DefaultDomainName",
                "LastRun",
                "GraphTest",
                "ExchangeTest",
              ],
            }}
          />
        </>
      )}
      {!importReport && (
        <CippDataTable
          title="Tenant Results"
          noCard={true}
          api={{
            url: "/api/ExecAccessChecks",
            data: { Type: "Tenants" },
            dataKey: "Results",
            queryKey: "ExecAccessChecks-Tenants",
          }}
          actions={[
            {
              label: "Check Tenant",
              type: "POST",
              url: "/api/ExecAccessChecks?Type=Tenants",
              data: { TenantId: "TenantId" },
              icon: <Sync />,
              confirmText: "Execute the access check for the selected tenant(s)?",
              relatedQueryKeys: "ExecAccessChecks-Tenants",
              multiPost: false,
            },
          ]}
          simpleColumns={[
            "TenantName",
            "LastRun",
            "GraphStatus",
            "ExchangeStatus",
            "MissingRoles",
            "GDAPRoles",
          ]}
          offCanvas={{
            extendedInfoFields: [
              "TenantName",
              "TenantId",
              "DefaultDomainName",
              "LastRun",
              "GraphTest",
              "ExchangeTest",
            ],
          }}
        />
      )}
    </>
  );
};
