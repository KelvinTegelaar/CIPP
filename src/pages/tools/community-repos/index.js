import { useState } from "react";
import { Layout as DashboardLayout } from "/src/layouts";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Card,
  CardContent,
  Divider,
  Skeleton,
  IconButton,
  Tooltip,
  Typography,
  Alert,
  Link,
} from "@mui/material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ApiPostCall } from "/src/api/ApiCall";
import { useForm, FormProvider } from "react-hook-form";
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/system";
import { Add, OpenInNew } from "@mui/icons-material";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import { ApiGetCall } from "../../../api/ApiCall";
import NextLink from "next/link";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";

const Page = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [results, setResults] = useState([]);
  const [repo, setRepo] = useState("");
  const [user, setUser] = useState("");

  const actions = [
    {
      label: "View Templates",
      link: "/tools/community-repos/repo?name=[FullName]",
      icon: <OpenInNew />,
    },
    {
      label: "Delete",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      data: { Action: "Delete", Id: "Id" },
      confirmText: "Are you sure you want to delete this repo?",
      icon: <TrashIcon />,
      queryKey: "CommunityRepos",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["Owner", "Name", "Description", "URL", "Visibility", "Permissions"],
    actions: actions,
  };

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
  });

  const searchMutation = ApiPostCall({
    onResult: (resp) => {
      setResults(resp?.Results || []);
    },
  });

  const searchForm = useForm({ defaultValues: { searchType: "user", searchTerm: [] } });
  const watchSearchTerm = searchForm.watch("searchTerm");

  const handleSearch = () => {
    const searchTerms = watchSearchTerm.map((t) => t.value) ?? [];
    searchMutation.mutate({
      url: "/api/ExecGitHubAction",
      data: {
        Search: {
          Repository: repo ? [repo] : [],
          User: user ? [user] : [],
          SearchTerm: searchTerms,
          Type: "repositories",
        },
      },
    });
  };

  const addMutation = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["CommunityRepos"],
  });

  const handleAdd = (repoId) => {
    addMutation.mutate({
      url: "/api/ExecCommunityRepo",
      data: { Action: "Add", Id: repoId },
    });
  };

  return (
    <>
      <CippTablePage
        title="Community Repositories"
        tenantInTitle={false}
        tableFilter={
          <>
            {integrations.isSuccess && !integrations.data?.GitHub?.Enabled && (
              <Alert severity="info">
                The community repositories feature requires the GitHub Integration to be enabled. Go
                to the{" "}
                <Link component={NextLink} href={"/cipp/integrations/configure?id=GitHub"}>
                  GitHub Integration
                </Link>{" "}
                page to enable it.
              </Alert>
            )}
          </>
        }
        apiUrl="/api/ListCommunityRepos"
        apiDataKey="Results"
        queryKey="CommunityRepos"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={["Name", "Owner", "URL", "Visibility", "WriteAccess"]}
        cardButton={
          <Button onClick={() => setOpenSearch(true)} startIcon={<Add />}>
            Add Repo
          </Button>
        }
      />
      <Dialog fullWidth maxWidth="md" open={openSearch} onClose={() => setOpenSearch(false)}>
        <DialogTitle>Add Community Repositories from GitHub</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <FormProvider {...searchForm}>
              <RadioGroup
                row
                value={searchForm.watch("searchType")}
                onChange={(e) => searchForm.setValue("searchType", e.target.value)}
              >
                <FormControlLabel value="user" control={<Radio />} label="User" />
                <FormControlLabel value="repository" control={<Radio />} label="Repository" />
              </RadioGroup>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <CippFormCondition
                  field="searchType"
                  compareType="is"
                  compareValue="repository"
                  formControl={searchForm}
                >
                  <TextField
                    fullWidth
                    label="Repository in 'owner/repo' format (e.g. KelvinTegelaar/CIPP)"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                  />
                </CippFormCondition>
                <CippFormCondition
                  field="searchType"
                  compareType="is"
                  compareValue="user"
                  formControl={searchForm}
                >
                  <TextField
                    fullWidth
                    label="User"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                  />

                  <CippFormComponent
                    type="autoComplete"
                    name="searchTerm"
                    formControl={searchForm}
                    freeSolo
                    fullWidth
                    options={[]}
                    label="Search Terms"
                  />
                </CippFormCondition>
              </Stack>
            </FormProvider>

            <Divider />
            {searchMutation.isPending ||
              (searchMutation.isSuccess && <Typography variant="h6">Search Results</Typography>)}
            {searchMutation.isPending ? (
              <Box>
                <Skeleton height={200} />
              </Box>
            ) : (
              <>
                {searchMutation.isSuccess && results.length === 0 && (
                  <Alert severity="warning">
                    No search results found. Refine your query and try again.
                  </Alert>
                )}
                <Box sx={{ overflowY: "scroll", maxHeight: 300 }}>
                  {results.map((r) => (
                    <Card key={r.id} variant="outlined" sx={{ mt: 1, mr: 1 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Tooltip title="Add Repository">
                            <IconButton size="small" onClick={() => handleAdd(r.id)}>
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Open GitHub">
                            <IconButton
                              size="small"
                              onClick={() => window.open(r.html_url, "_blank")}
                            >
                              <OpenInNew />
                            </IconButton>
                          </Tooltip>
                          <Box>
                            <Typography variant="h6">{r.full_name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {r.html_url}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </>
            )}
            <Box>
              <CippApiResults apiObject={addMutation} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenSearch(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={() => handleSearch()}>
            Search
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
