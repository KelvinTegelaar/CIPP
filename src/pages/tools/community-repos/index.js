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
  Chip,
  SvgIcon,
} from "@mui/material";
import { MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ApiPostCall } from "/src/api/ApiCall";
import { useForm, FormProvider } from "react-hook-form";
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/system";
import { Add, AddBox, Close, ForkLeft, OpenInNew } from "@mui/icons-material";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../api/ApiCall";

const Page = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [results, setResults] = useState([]);
  const [repo, setRepo] = useState("");
  const [user, setUser] = useState("");
  const [org, setOrg] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const createForm = useForm({ mode: "onChange", defaultValues: { Type: "user" } });

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
  });

  const createMutation = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["CommunityRepos"],
  });

  const handleCreateRepo = (values) => {
    createMutation.mutate({
      url: "/api/ExecGitHubAction",
      data: {
        Action: "CreateRepo",
        Type: values.type,
        Name: values.repoName,
        Org: values.orgName?.value,
        Description: values.Description,
        Private: values.Private,
      },
    });
  };

  const actions = [
    {
      label: "View Templates",
      link: "/tools/community-repos/repo?name=[FullName]&branch=[DefaultBranch]",
      icon: <OpenInNew />,
    },
    {
      label: "Delete",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      data: { Action: "Delete", Id: "Id" },
      confirmText: "Are you sure you want to delete this repo?",
      icon: <TrashIcon />,
      multiPost: false,
      queryKey: "CommunityRepos",
    },
    {
      label: "Set Upload Branch",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      data: { Action: "SetBranch", Id: "Id" },
      icon: <ForkLeft />,
      fields: [
        {
          type: "select",
          name: "Branch",
          label: "Branch",
          api: {
            url: "/api/ExecGitHubAction",
            type: "GET",
            data: {
              Action: "GetBranches",
              FullName: "FullName",
            },
            dataKey: "Results",
            labelField: "name",
            valueField: "name",
            processFieldData: true,
          },
        },
      ],
      hideBulk: true,
      confirmText: "Are you sure you want to set the branch for this repository?",
      condition: (row) => row.WriteAccess === true,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "Owner",
      "Name",
      "Description",
      "URL",
      "Visibility",
      "DefaultBranch",
      "UploadBranch",
      "Permissions",
    ],
    actions: actions,
  };

  const searchMutation = ApiPostCall({
    urlFromData: true,
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
        Action: "Search",
        Repository: repo ? repo : "",
        User: user ? user : "",
        Org: org ? org : "",
        SearchTerm: searchTerms,
        Type: "repositories",
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
        apiUrl="/api/ListCommunityRepos"
        apiDataKey="Results"
        queryKey="CommunityRepos"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={["Name", "Owner", "URL", "Visibility", "WriteAccess", "UploadBranch"]}
        cardButton={
          <>
            <Button
              onClick={() => setOpenSearch(true)}
              startIcon={
                <SvgIcon>
                  <MagnifyingGlassIcon />
                </SvgIcon>
              }
            >
              Find a Repository
            </Button>
            <Button
              onClick={() => setOpenCreate(true)}
              startIcon={<AddBox />}
              disabled={!integrations.isSuccess || !integrations?.data?.GitHub?.Enabled}
            >
              Create Repository
            </Button>
          </>
        }
      />
      <Dialog fullWidth maxWidth="md" open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create New Repository</DialogTitle>
        <DialogContent>
          <FormProvider {...createForm}>
            <RadioGroup
              row
              value={createForm.watch("Type")}
              onChange={(e) => {
                createForm.setValue("Type", e.target.value);
              }}
            >
              <FormControlLabel value="user" control={<Radio />} label="User" />
              <FormControlLabel value="org" control={<Radio />} label="Org" />
            </RadioGroup>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <CippFormCondition
                field="Type"
                compareType="is"
                compareValue="org"
                formControl={createForm}
              >
                <CippFormComponent
                  type="autoComplete"
                  name="orgName"
                  formControl={createForm}
                  label="Organization"
                  api={{
                    url: "/api/ExecGitHubAction",
                    data: {
                      Action: "GetOrgs",
                    },
                    queryKey: "GitHubOrgs",
                    dataKey: "Results",
                    labelField: "login",
                    valueField: "login",
                  }}
                  multiple={false}
                  required={true}
                  validators={{
                    required: { value: true, message: "Organization is required" },
                  }}
                />
              </CippFormCondition>
              <CippFormComponent
                type="textField"
                name="repoName"
                label="Repository Name"
                formControl={createForm}
                required={true}
              />
              <CippFormComponent
                type="textField"
                name="Description"
                label="Description"
                formControl={createForm}
              />
              <CippFormComponent
                type="switch"
                name="Private"
                label="Private"
                formControl={createForm}
              />
            </Stack>
          </FormProvider>
          <CippApiResults apiObject={createMutation} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenCreate(false)} startIcon={<Close />}>
            Close
          </Button>
          <Button
            variant="contained"
            type="submit"
            onClick={createForm.handleSubmit(handleCreateRepo)}
            startIcon={<Add />}
            disabled={createMutation.isPending}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog fullWidth maxWidth="md" open={openSearch} onClose={() => setOpenSearch(false)}>
        <DialogTitle>Add Community Repositories from GitHub</DialogTitle>
        <DialogContent>
          <FormProvider {...searchForm}>
            <RadioGroup
              row
              value={searchForm.watch("searchType")}
              onChange={(e) => searchForm.setValue("searchType", e.target.value)}
            >
              <FormControlLabel value="user" control={<Radio />} label="User" />
              <FormControlLabel value="org" control={<Radio />} label="Org" />
              <FormControlLabel value="repository" control={<Radio />} label="Repository" />
            </RadioGroup>
            <Stack spacing={1.5} sx={{ mt: 2, mb: 2 }}>
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
                  required={true}
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
                  required={true}
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
              <CippFormCondition
                field="searchType"
                compareType="is"
                compareValue="org"
                formControl={searchForm}
              >
                <TextField
                  fullWidth
                  label="Organization"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  required={true}
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

          {searchMutation.isPending ||
            (searchMutation.isSuccess && (
              <Stack spacing={2}>
                <Divider />
                <Typography variant="h6">Search Results</Typography>
              </Stack>
            ))}
          {searchMutation.isPending ? (
            <>
              <Stack spacing={2}>
                <Divider />
                <Typography variant="h6">Searching...</Typography>
              </Stack>
              <Card variant="outlined" sx={{ p: 1, mt: 1.5 }}>
                <Skeleton height={80} variant="rectangular" />
              </Card>
              <Card variant="outlined" sx={{ p: 1, mt: 1.5 }}>
                <Skeleton height={80} variant="rectangular" />
              </Card>
              <Card variant="outlined" sx={{ p: 1, mt: 1.5 }}>
                <Skeleton height={80} variant="rectangular" />
              </Card>
            </>
          ) : (
            <>
              {(searchMutation.isSuccess && results.length === 0) ||
                (searchMutation.isError && (
                  <Alert severity="warning">
                    No search results found. Refine your query and try again.
                  </Alert>
                ))}
              <Box sx={{ overflowY: "scroll", maxHeight: 300, mb: 1.5 }}>
                {results.map((r) => (
                  <Card key={r.id} variant="outlined" sx={{ mt: 1.5, mr: 1 }}>
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
                        <Box sx={{ flexGrow: 1 }}>
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              flexGrow: 1,
                            }}
                          >
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                              {r.full_name}
                            </Typography>
                            <Chip
                              size="small"
                              color={
                                r.visibility === "private"
                                  ? "error"
                                  : r.visibility === "public"
                                  ? "success"
                                  : "primary"
                              }
                              variant="outlined"
                              label={r.visibility}
                              sx={{ textTransform: "capitalize" }}
                            />
                          </Box>
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
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenSearch(false)} startIcon={<Close />}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSearch()}
            startIcon={
              <SvgIcon>
                <MagnifyingGlassIcon />
              </SvgIcon>
            }
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
