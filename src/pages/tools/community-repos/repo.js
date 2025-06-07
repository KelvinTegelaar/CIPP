import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { useState, useEffect } from "react";
import { ApiPostCall, ApiGetCall } from "/src/api/ApiCall";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Skeleton,
} from "@mui/material";
import { Grid } from "@mui/system";
import CippJSONView from "/src/components/CippFormPages/CippJSONView";
import { EyeIcon } from "@heroicons/react/24/outline";
import { CippAutoComplete } from "/src/components/CippComponents/CippAutocomplete";
import React from "react";
import { CloudDownload } from "@mui/icons-material";

const Page = () => {
  const router = useRouter();
  const { name, branch } = router.query;
  const [openJsonDialog, setOpenJsonDialog] = useState(false);
  const [fileResults, setFileResults] = useState([]);
  const [jsonContent, setJsonContent] = useState({});
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(branch);
  const [selectedRepo, setSelectedRepo] = useState(name);

  const fileQuery = ApiPostCall({
    onResult: (resp) => {
      let content = resp?.Results?.content?.trim() || "{}";
      // remove non-printable characters from the beginning and end
      content = content.replace(
        /^[\u0000-\u001F\u007F-\u009F]+|[\u0000-\u001F\u007F-\u009F]+$/g,
        ""
      );
      try {
        setJsonContent(JSON.parse(content));
      } catch (e) {
        console.error("Invalid JSON content:", e);
        setJsonContent({});
      }
    },
  });

  const branchQuery = ApiGetCall({
    url: "/api/ExecGitHubAction",
    data: {
      Action: "GetBranches",
      FullName: selectedRepo,
    },
    onResult: (resp) => {
      const branchList = resp?.Results || [];
      setBranches(branchList);
      if (branchList.length === 1) {
        setSelectedBranch(branchList[0].name);
        fetchFileTree(branchList[0].name);
      }
      const mainBranch = branchList.find((branch) => ["main", "master"].includes(branch.name));
      if (mainBranch) {
        setSelectedBranch(mainBranch.name);
        fetchFileTree(mainBranch.name);
      }
    },
    queryKey: `${selectedRepo}-branches`,
    waiting: selectedRepo !== "",
  });

  const fileTreeQuery = ApiGetCall({
    url: "/api/ExecGitHubAction",
    data: {
      Action: "GetFileTree",
      FullName: selectedRepo,
      Branch: selectedBranch,
    },
    onResult: (resp) => {
      setFileResults(resp?.Results || []);
    },
    queryKey: `${selectedRepo}-${selectedBranch}-filetree`,
    waiting: selectedRepo !== "" && selectedBranch !== "",
  });

  const fetchFileTree = (branch) => {
    if (selectedRepo !== "" && branch !== "") {
      if (!fileTreeQuery.waiting) {
        fileTreeQuery.waiting = true;
      }
      fileTreeQuery.refetch();
    }
  };

  const handleJsonView = (path) => {
    fileQuery.mutate({
      url: "/api/ExecGitHubAction",
      data: {
        Action: "GetFileContents",
        FullName: selectedRepo,
        Path: path,
        Branch: branch,
      },
    });
    setOpenJsonDialog(true);
  };

  useEffect(() => {
    if (selectedRepo) {
      branchQuery.refetch();
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (selectedBranch) {
      fetchFileTree(selectedBranch);
    }
  }, [selectedBranch]);

  const updateQueryParams = (prop, newValue) => {
    const query = { ...router.query };
    if (query[prop] !== newValue) {
      query[prop] = newValue;
      router.replace(
        {
          pathname: router.pathname,
          query: query,
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const MemoizedCippAutoComplete = React.memo((props) => {
    return <CippAutoComplete {...props} />;
  });

  return (
    <>
      <CippTablePage
        title={`Templates for ${selectedRepo}`}
        tenantInTitle={false}
        tableFilter={
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <MemoizedCippAutoComplete
                fullWidth
                value={{
                  label: selectedRepo,
                  value: selectedRepo,
                }}
                onChange={(newValue) => {
                  if (newValue.value === selectedRepo) return;
                  setSelectedRepo(newValue.value);
                  updateQueryParams(newValue.value);
                }}
                api={{
                  url: "/api/ListCommunityRepos",
                  queryKey: "CommunityRepos",
                  dataKey: "Results",
                  valueField: "FullName",
                  labelField: "FullName",
                }}
                multiple={false}
                label="Select Repository"
                placeholder="Select Repository"
                disableClearable
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <MemoizedCippAutoComplete
                fullWidth
                value={
                  selectedBranch
                    ? { label: selectedBranch, value: selectedBranch }
                    : { label: "Loading branches", value: "" }
                }
                onChange={(newValue) => {
                  if (newValue.value === selectedBranch) return;
                  setSelectedBranch(newValue.value);
                  updateQueryParams("branch", newValue.value);
                }}
                options={branches.map((branch) => ({ label: branch.name, value: branch.name }))}
                multiple={false}
                label="Select Branch"
                placeholder="Select Branch"
                disableClearable
                isFetching={branchQuery.isPending}
              />
            </Grid>
          </Grid>
        }
        data={fileResults}
        apiDataKey="Results"
        queryKey="JsonTemplates"
        simpleColumns={["path", "html_url"]}
        actions={[
          {
            label: "View Template",
            customFunction: (row) => handleJsonView(row.path),
            noConfirm: true,
            icon: <EyeIcon />,
            hideBulk: true,
          },
          {
            label: "Import Template",
            url: "/api/ExecCommunityRepo",
            icon: <CloudDownload />,
            type: "POST",
            data: {
              Action: "ImportTemplate",
              FullName: selectedRepo,
              Path: "path",
              Branch: selectedBranch,
            },
            confirmText: "Are you sure you want to import [path]?",
          },
        ]}
        isFetching={fileTreeQuery.isFetching}
        refreshFunction={() => fetchFileTree(selectedBranch)}
      />
      <Dialog
        fullWidth
        maxWidth="xl"
        open={openJsonDialog}
        onClose={() => setOpenJsonDialog(false)}
      >
        <DialogTitle>Template Details</DialogTitle>
        <DialogContent>
          {fileQuery.isPending ? (
            <Box>
              <Skeleton height={300} variant="rectangular" />
            </Box>
          ) : (
            <CippJSONView object={jsonContent} defaultOpen={true} />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenJsonDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
