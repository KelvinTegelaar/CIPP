import React, { useState } from "react";
import {
  Grid,
  Button,
  Collapse,
  Switch,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import HelpIcon from "@mui/icons-material/Help";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { ApiGetCall } from "../../../../api/ApiCall";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import { Controller, useForm } from "react-hook-form";
import { CippCodeBlock } from "../../../../components/CippComponents/CippCodeBlock";

// Helper component for rendering validation results
const ResultList = ({ passes = [], warns = [], fails = [] }) => (
  <ul>
    {passes.map((pass, index) => (
      <Typography key={index} sx={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <CheckCircleIcon style={{ color: "green", marginRight: "4px" }} />
        {pass}
      </Typography>
    ))}
    {warns.map((warn, index) => (
      <Typography key={index} sx={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <WarningIcon style={{ color: "orange", marginRight: "4px" }} />
        {warn}
      </Typography>
    ))}
    {fails.map((fail, index) => (
      <Typography key={index} sx={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <ErrorIcon style={{ color: "red", marginRight: "4px" }} />
        {fail}
      </Typography>
    ))}
  </ul>
);

// Domain Check Page
const Page = () => {
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      domain: "",
      spfRecord: "",
      dkimSelector: "",
      subdomains: "",
      enableHttps: false,
    },
  });
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [domain, setDomain] = useState("");
  const enableHttps = watch("enableHttps");

  // API calls with dynamic queryKey using domain
  const { data: whoisData, isFetching: whoisLoading } = ApiGetCall({
    url: "/api/ListDomainHealth",
    queryKey: `whois-${domain}`,
    data: { Domain: domain, Action: "ReadWhoisRecord" },
    waiting: !!domain,
  });

  const { data: nsData, isFetching: nsLoading } = ApiGetCall({
    url: "/api/ListDomainHealth",
    queryKey: `ns-${domain}`,
    data: { Domain: domain, Action: "ReadNSRecord" },
    waiting: !!domain,
  });

  const { data: mxData, isFetching: mxLoading } = ApiGetCall({
    url: "/api/ListDomainHealth",
    queryKey: `mx-${domain}`,
    data: { Domain: domain, Action: "ReadMxRecord" },
    waiting: !!domain,
  });

  const { data: spfData, isFetching: spfLoading } = ApiGetCall({
    url: "/api/ListDomainHealth",
    queryKey: `spf-${domain}`,
    data: { Domain: domain, Action: "ReadSPFRecord" },
    waiting: !!domain,
  });

  const { data: dmarcData, isFetching: dmarcLoading } = ApiGetCall({
    url: "/api/ListDomainHealth",
    queryKey: `dmarc-${domain}`,
    data: { Domain: domain, Action: "ReadDmarcPolicy" },
    waiting: !!domain,
  });

  const { data: dkimData, isFetching: dkimLoading } = ApiGetCall({
    url: "/api/ListDomainHealth",
    queryKey: `dkim-${domain}`,
    data: { Domain: domain, Action: "ReadDkimRecord" },
    waiting: !!domain,
  });

  const { data: dnssecData, isFetching: dnssecLoading } = ApiGetCall({
    url: "/api/ListDomainHealth",
    queryKey: `dnssec-${domain}`,
    data: { Domain: domain, Action: "TestDNSSEC" },
    waiting: !!domain,
  });

  const { data: mtastsData, isFetching: mtastsLoading } = ApiGetCall({
    url: "/api/ListDomainHealth",
    queryKey: `mtasts-${domain}`,
    data: { Domain: domain, Action: "TestMtaSts" },
    waiting: !!domain,
  });

  // Submit handler
  const onSubmit = (values) => {
    setDomain(values.domain);
    console.log("Form submitted:", values);
  };

  const handleClear = () => {
    setValue("domain", "");
    setValue("spfRecord", "");
    setValue("dkimSelector", "");
    setValue("subdomains", "");
  };

  const pageTitle = "Individual Domain Check";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <CippButtonCard
              title="Domain Check"
              cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
              cardActions={
                <Tooltip title="Settings">
                  <IconButton onClick={() => setOptionsVisible(!optionsVisible)}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Controller
                    name="domain"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth placeholder="Domain Name" />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
                    Check
                  </Button>
                </Grid>
              </Grid>
              <Collapse in={optionsVisible}>
                <Controller
                  name="spfRecord"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="SPF Record" className="mt-2" />
                  )}
                />
                <Controller
                  name="dkimSelector"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="DKIM Selector" className="mt-2" />
                  )}
                />
                <Controller
                  name="enableHttps"
                  control={control}
                  render={({ field }) => (
                    <Switch {...field} checked={field.value} label="Enable HTTPS check" />
                  )}
                />
                {enableHttps && (
                  <Controller
                    name="subdomains"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label="HTTPS Subdomains" className="mt-2" />
                    )}
                  />
                )}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={handleClear}
                  className="mt-2"
                >
                  Clear
                </Button>
              </Collapse>
            </CippButtonCard>
          </Grid>

          {domain && (
            <>
              <Grid item xs={12} md={4}>
                <DomainResultCard
                  title="Whois Results"
                  data={whoisData}
                  isFetching={whoisLoading}
                  info={
                    <div>
                      <p>Registrar: {whoisData?.Registrar}</p>
                    </div>
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DomainResultCard
                  title="NS Records"
                  data={nsData}
                  isFetching={nsLoading}
                  info={
                    <div>
                      <p>Nameservers:</p>
                      <pre>{nsData?.Records.join("\n")}</pre>
                    </div>
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MXResultsCard domain={domain} mxData={mxData} isFetching={mxLoading} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DomainResultCard
                  title="SPF Record"
                  data={spfData}
                  isFetching={spfLoading}
                  info={
                    <>
                      <p>SPF Record:</p>
                      <CippCodeBlock code={spfData?.Record} />
                      <ResultList
                        passes={spfData?.ValidationPasses}
                        warns={spfData?.ValidationWarns}
                        fails={spfData?.ValidationFails}
                      />
                    </>
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DomainResultCard
                  title="DMARC Policy"
                  data={dmarcData}
                  isFetching={dmarcLoading}
                  info={
                    <div>
                      <p>DMARC Policy:</p>
                      <CippCodeBlock code={dmarcData?.Record} />
                      <ResultList
                        passes={dmarcData?.ValidationPasses}
                        warns={dmarcData?.ValidationWarns}
                        fails={dmarcData?.ValidationFails}
                      />
                    </div>
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DomainResultCard
                  title="DKIM Record"
                  data={dkimData}
                  isFetching={dkimLoading}
                  info={
                    <div>
                      <p>DKIM Record:</p>
                      <CippCodeBlock code={dkimData?.Records?.[0]?.Record} />
                      <ResultList
                        passes={dkimData?.ValidationPasses}
                        warns={dkimData?.ValidationWarns}
                        fails={dkimData?.ValidationFails}
                      />
                    </div>
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DomainResultCard
                  title="DNSSEC"
                  data={dnssecData}
                  isFetching={dnssecLoading}
                  info={
                    <div>
                      <ResultList
                        passes={dnssecData?.ValidationPasses}
                        warns={dnssecData?.ValidationWarns}
                        fails={dnssecData?.ValidationFails}
                      />
                    </div>
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DomainResultCard
                  title="MTA-STS"
                  data={mtastsData}
                  isFetching={mtastsLoading}
                  info={
                    <div>
                      <p>MTA-STS Mode:</p>
                      <CippCodeBlock code={mtastsData?.StsPolicy?.Mode || "No record found"} />
                      <ResultList
                        passes={mtastsData?.ValidationPasses}
                        warns={mtastsData?.ValidationWarns}
                        fails={mtastsData?.ValidationFails}
                      />
                    </div>
                  }
                />
              </Grid>
            </>
          )}
        </Grid>
      </form>
    </div>
  );
};

// Custom MX Results Card component
const MXResultsCard = ({ domain, mxData, isFetching }) => {
  const [visible, setVisible] = useState(false);

  const handleDetailsClick = () => {
    setVisible(true);
    console.log("MX Record Details clicked");
  };

  const providerName = mxData?.MailProvider?.Name || "Unknown";
  const validationPasses = mxData?.ValidationPasses || [];
  const validationWarns = mxData?.ValidationWarns || [];
  const validationFails = mxData?.ValidationFails || [];

  const allPassed = validationFails.length === 0 && validationWarns.length === 0;

  const helpUrl = mxData?.MailProvider?._MxComment || "";

  return (
    <CippButtonCard
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          {allPassed && <CheckCircleIcon style={{ color: "green", marginRight: "8px" }} />}
          MX Records
        </div>
      }
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      cardActions={
        <>
          {helpUrl && (
            <Tooltip title="Help">
              <IconButton href={helpUrl} target="_blank">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Details">
            <IconButton onClick={handleDetailsClick}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </>
      }
      isFetching={isFetching}
    >
      {!isFetching && (
        <>
          <Typography variant="h6" gutterBottom>
            Mail Provider:
          </Typography>
          <Chip color="info" className="mb-2" label={`${providerName}`} />
          <ResultList passes={validationPasses} warns={validationWarns} fails={validationFails} />
        </>
      )}
    </CippButtonCard>
  );
};

// DomainResultCard to reuse for other result types
function DomainResultCard({ title, data, isFetching, info }) {
  return (
    <CippButtonCard
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          {data?.ValidationFails?.length === 0 && data?.ValidationWarns?.length === 0 && (
            <CheckCircleIcon style={{ color: "green", marginRight: "8px" }} />
          )}
          {data?.ValidationFails?.length > 0 && (
            <ErrorIcon style={{ color: "red", marginRight: "8px" }} />
          )}
          {data?.ValidationWarns?.length > 0 && (
            <WarningIcon style={{ color: "orange", marginRight: "8px" }} />
          )}
          {title}
        </div>
      }
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      cardActions={
        <>
          {data?._Comment && (
            <Tooltip title="Help">
              <IconButton href={data?._Comment} target="_blank">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Details">
            <IconButton onClick={() => console.log(`${title} details clicked`)}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </>
      }
      isFetching={isFetching}
    >
      <Grid item xs={12}>
        {info}
      </Grid>
    </CippButtonCard>
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
