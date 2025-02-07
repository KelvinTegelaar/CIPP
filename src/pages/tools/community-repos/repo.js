import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { useState, useEffect } from "react";
import { ApiPostCall } from "/src/api/ApiCall";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Skeleton,
  Alert,
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import CippJSONView from "/src/components/CippFormPages/CippJSONView";
import { EyeIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const router = useRouter();
  const { name } = router.query;
  const [openJsonDialog, setOpenJsonDialog] = useState(false);
  const [fileResults, setFileResults] = useState([]);
  const [jsonContent, setJsonContent] = useState({});

  const searchMutation = ApiPostCall({
    onResult: (resp) => {
      setFileResults(resp?.Results || []);
    },
  });

  const fileMutation = ApiPostCall({
    onResult: (resp) => {
      setJsonContent(JSON.parse(resp?.Results?.content || "{}"));
    },
  });

  const handleJsonView = (url) => {
    fileMutation.mutate({
      url: "/api/ExecGitHubAction",
      data: {
        GetFileContents: {
          Url: url,
        },
      },
    });
    setOpenJsonDialog(true);
  };

  useEffect(() => {
    if (name) {
      searchMutation.mutate({
        url: "/api/ExecGitHubAction",
        data: {
          Search: {
            Repository: [name],
            Type: "code",
            Language: "json",
          },
        },
      });
    }
  }, [name]);

  return (
    <>
      <CippTablePage
        title={`Templates for ${name}`}
        tenantInTitle={false}
        backButtonTitle="Back to Repos"
        data={fileResults}
        apiDataKey="Results"
        queryKey="JsonTemplates"
        simpleColumns={["name", "html_url"]}
        actions={[
          {
            label: "View Template",
            customFunction: (row) => handleJsonView(row.url),
            noConfirm: true,
            icon: <EyeIcon />,
          },
        ]}
      />
      <Dialog
        fullWidth
        maxWidth="xl"
        open={openJsonDialog}
        onClose={() => setOpenJsonDialog(false)}
      >
        <DialogTitle>Template Details</DialogTitle>
        <DialogContent>
          {fileMutation.isPending ? (
            <Box>
              <Skeleton height={200} />
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
