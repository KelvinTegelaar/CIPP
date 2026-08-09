import { useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {
  Add,
  AddBox,
  Close,
  DeleteOutline,
  ForkLeft,
  MoreVert,
  OpenInNew,
  Search,
  Sell,
} from "@mui/icons-material";
import { useForm, FormProvider } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { CippHead } from "../../../components/CippComponents/CippHead";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { CippFormCondition } from "../../../components/CippComponents/CippFormCondition";
import { CippAutoComplete } from "../../../components/CippComponents/CippAutocomplete";
import { getTemplateTypeLabel } from "../../../components/CippComponents/CippTemplateCatalog";

const typeOptions = [
  { label: "Intune Policy", value: "IntuneTemplate" },
  { label: "Conditional Access", value: "CATemplate" },
  { label: "Standards", value: "StandardsTemplateV2" },
  { label: "Baseline", value: "BaselineTemplate" },
  { label: "Report Builder", value: "ReportBuilderTemplate" },
  { label: "Group", value: "GroupTemplate" },
  { label: "Custom Test", value: "CustomTest" },
];

const parseRepoInput = (input) => {
  let value = (input || "").trim();
  value = value.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
  value = value.replace(/\.git$/i, "");
  value = value.replace(/^\/+|\/+$/g, "");
  const parts = value.split("/").filter(Boolean);
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
};

const Page = () => {
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRepo, setMenuRepo] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addRepoInput, setAddRepoInput] = useState("");
  const [addRepoTypes, setAddRepoTypes] = useState([]);
  const [addRepoError, setAddRepoError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [branchDialogRepo, setBranchDialogRepo] = useState(null);
  const [branchValue, setBranchValue] = useState(null);
  const [typesDialogRepo, setTypesDialogRepo] = useState(null);
  const [typesValue, setTypesValue] = useState([]);
  const [deleteDialogRepo, setDeleteDialogRepo] = useState(null);

  const createForm = useForm({ mode: "onChange", defaultValues: { type: "user" } });

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const repos = ApiGetCall({
    url: "/api/ListCommunityRepos",
    queryKey: "CommunityRepos",
  });

  const catalog = ApiGetCall({
    url: "/api/ListCommunityRepoTemplates",
    queryKey: "CommunityRepoTemplates",
  });

  const addMutation = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["CommunityRepos", "CommunityRepoTemplates"],
  });

  const createMutation = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["CommunityRepos", "CommunityRepoTemplates"],
  });

  const branchMutation = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["CommunityRepos"],
  });

  const typesMutation = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["CommunityRepos", "CommunityRepoTemplates"],
  });

  const deleteMutation = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["CommunityRepos", "CommunityRepoTemplates"],
  });

  const branchQuery = ApiGetCall({
    url: "/api/ExecGitHubAction",
    data: { Action: "GetBranches", FullName: branchDialogRepo?.FullName },
    queryKey: `${branchDialogRepo?.FullName}-branches`,
    waiting: !!branchDialogRepo,
  });

  const repoList = Array.isArray(repos.data?.Results) ? repos.data.Results : [];
  const catalogItems = Array.isArray(catalog.data?.Results) ? catalog.data.Results : [];
  const countsBySource = catalogItems.reduce((acc, item) => {
    acc[item.Repository] = (acc[item.Repository] || 0) + 1;
    return acc;
  }, {});
  const repoMetadata = Array.isArray(catalog.data?.Metadata?.Repositories)
    ? catalog.data.Metadata.Repositories
    : [];
  const commitBySource = repoMetadata.reduce((acc, repo) => {
    if (repo?.FullName) acc[repo.FullName] = repo;
    return acc;
  }, {});

  const handleOpenMenu = (event, repo) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuRepo(repo);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleOpenRepo = (repo) => {
    router.push(`/tools/community-repos/catalog?Repo=${encodeURIComponent(repo.FullName)}`);
  };

  const handleAddRepo = () => {
    const fullName = parseRepoInput(addRepoInput);
    if (!fullName) {
      setAddRepoError("Enter a repository as 'owner/repo' or paste a GitHub URL.");
      return;
    }
    setAddRepoError(null);
    addMutation.mutate({
      url: "/api/ExecCommunityRepo",
      data: {
        Action: "Add",
        FullName: fullName,
        ...(addRepoTypes.length > 0
          ? { TemplateTypes: addRepoTypes.map((type) => type.value) }
          : {}),
      },
    });
  };

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

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <CippHead title="Catalog" noTenant={true} />
      <Container maxWidth="xl">
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Catalog</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Search />}
                component={NextLink}
                href="/tools/community-repos/catalog"
              >
                Browse All Templates
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddBox />}
                onClick={() => setCreateDialogOpen(true)}
                disabled={!integrations.isSuccess || !integrations?.data?.GitHub?.Enabled}
              >
                Create Repository
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Source
              </Button>
            </Stack>
          </Stack>

          {/* Source cards */}
          <Grid container spacing={3}>
            {repos.isLoading
          ? [...Array(5)].map((_, index) => (
              <Grid size={{ md: 6, sm: 12, xl: 3 }} key={index}>
                <Skeleton variant="rectangular" height={150} />
              </Grid>
            ))
          : repoList.map((repo) => {
              const count = countsBySource[repo.FullName];
              const latestCommit = commitBySource[repo.FullName];
              return (
                <Grid size={{ md: 6, sm: 12, xl: 3 }} key={repo.Id || repo.FullName}>
                  <Card
                    onClick={() => handleOpenRepo(repo)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
                            {repo.Name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {repo.FullName}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={(event) => handleOpenMenu(event, repo)}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Stack>
                      {repo.Description && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            mt: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {repo.Description}
                        </Typography>
                      )}
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1.5 }}>
                        {(() => {
                          // Distinct labels, capped: the official repo is tagged with every type
                          const typeLabels = [
                            ...new Set(
                              (Array.isArray(repo.TemplateTypes) ? repo.TemplateTypes : []).map(
                                (type) => getTemplateTypeLabel(type),
                              ),
                            ),
                          ];
                          const shown = typeLabels.slice(0, 4);
                          return (
                            <>
                              {shown.map((label) => (
                                <Chip
                                  key={label}
                                  label={label}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                              {typeLabels.length > shown.length && (
                                <Chip
                                  label={`+${typeLabels.length - shown.length} more`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </>
                          );
                        })()}
                        {repo.BuiltIn === true && (
                          <Chip label="Built-in" size="small" color="info" variant="outlined" />
                        )}
                        {repo.WriteAccess === true && (
                          <Chip label="Write Access" size="small" color="success" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                    <CardContent sx={{ pt: 0, pb: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {catalog.isSuccess ? (
                          <Box
                            sx={{
                              backgroundColor: count > 0 ? "success.main" : "warning.main",
                              borderRadius: "50%",
                              width: 8,
                              height: 8,
                            }}
                          />
                        ) : (
                          <Skeleton variant="circular" width={8} height={8} animation="pulse" />
                        )}
                        <Typography variant="body2">
                          {catalog.isSuccess ? `${count || 0} templates` : "Loading"}
                        </Typography>
                      </Stack>
                      {latestCommit?.LatestCommitMessage && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          Latest update: {latestCommit.LatestCommitMessage}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

      {/* Repo actions menu */}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            window.open(menuRepo?.URL, "_blank");
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <OpenInNew fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open on GitHub</ListItemText>
        </MenuItem>
        {menuRepo?.WriteAccess === true && (
          <MenuItem
            onClick={() => {
              setBranchDialogRepo(menuRepo);
              setBranchValue(
                menuRepo?.UploadBranch
                  ? { label: menuRepo.UploadBranch, value: menuRepo.UploadBranch }
                  : null,
              );
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <ForkLeft fontSize="small" />
            </ListItemIcon>
            <ListItemText>Set Upload Branch</ListItemText>
          </MenuItem>
        )}
        {menuRepo?.BuiltIn !== true && (
          <MenuItem
            onClick={() => {
              setTypesDialogRepo(menuRepo);
              setTypesValue(
                (Array.isArray(menuRepo?.TemplateTypes) ? menuRepo.TemplateTypes : []).map(
                  (type) => ({
                    label: getTemplateTypeLabel(type),
                    value: type,
                  }),
                ),
              );
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <Sell fontSize="small" />
            </ListItemIcon>
            <ListItemText>Set Template Type</ListItemText>
          </MenuItem>
        )}
        {menuRepo?.BuiltIn !== true && (
          <MenuItem
            onClick={() => {
              setDeleteDialogRepo(menuRepo);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <DeleteOutline fontSize="small" />
            </ListItemIcon>
            <ListItemText>Remove Source</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Add Source dialog */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      >
        <DialogTitle>Add Template Source</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="GitHub repository URL or owner/repo"
              placeholder="https://github.com/owner/repo or owner/repo"
              value={addRepoInput}
              onChange={(e) => setAddRepoInput(e.target.value)}
              error={!!addRepoError}
              helperText={addRepoError}
            />
            <CippAutoComplete
              fullWidth
              value={addRepoTypes}
              onChange={(newValue) => setAddRepoTypes(Array.isArray(newValue) ? newValue : [])}
              options={typeOptions}
              multiple={true}
              creatable={false}
              label="Template Types"
              placeholder="What kind of templates does this repository contain?"
            />
            <Typography variant="body2" color="text.secondary">
              The template type is used to show templates from this repository in the right
              catalogs. Repositories that use CIPP folder names are detected automatically.
            </Typography>
          </Stack>
          <CippApiResults apiObject={addMutation} />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setAddDialogOpen(false)}
            startIcon={<Close />}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleAddRepo}
            startIcon={<Add />}
            disabled={addMutation.isPending}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Repository dialog */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      >
        <DialogTitle>Create New Repository</DialogTitle>
        <DialogContent>
          <FormProvider {...createForm}>
            <RadioGroup
              row
              value={createForm.watch("type")}
              onChange={(e) => {
                createForm.setValue("type", e.target.value);
              }}
            >
              <FormControlLabel value="user" control={<Radio />} label="User" />
              <FormControlLabel value="org" control={<Radio />} label="Org" />
            </RadioGroup>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <CippFormCondition
                field="type"
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
          <Button
            variant="outlined"
            onClick={() => setCreateDialogOpen(false)}
            startIcon={<Close />}
          >
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

      {/* Set Upload Branch dialog */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={!!branchDialogRepo}
        onClose={() => setBranchDialogRepo(null)}
      >
        <DialogTitle>Set Upload Branch for {branchDialogRepo?.Name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <CippAutoComplete
              fullWidth
              value={branchValue}
              onChange={(newValue) => setBranchValue(newValue)}
              options={
                Array.isArray(branchQuery.data?.Results)
                  ? branchQuery.data.Results.map((branch) => ({
                      label: branch.name,
                      value: branch.name,
                    }))
                  : []
              }
              multiple={false}
              label="Branch"
              placeholder="Select a branch"
              isFetching={branchQuery.isFetching}
            />
          </Box>
          <CippApiResults apiObject={branchMutation} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setBranchDialogRepo(null)} startIcon={<Close />}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              branchMutation.mutate({
                url: "/api/ExecCommunityRepo",
                data: {
                  Action: "SetBranch",
                  Id: branchDialogRepo?.Id,
                  Branch: branchValue?.value,
                },
              })
            }
            disabled={!branchValue?.value || branchMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Set Template Type dialog */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={!!typesDialogRepo}
        onClose={() => setTypesDialogRepo(null)}
      >
        <DialogTitle>Set Template Type for {typesDialogRepo?.Name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <CippAutoComplete
              fullWidth
              value={typesValue}
              onChange={(newValue) => setTypesValue(Array.isArray(newValue) ? newValue : [])}
              options={typeOptions}
              multiple={true}
              label="Template Types"
              placeholder="Select the template types in this repository"
            />
          </Box>
          <CippApiResults apiObject={typesMutation} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setTypesDialogRepo(null)} startIcon={<Close />}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              typesMutation.mutate({
                url: "/api/ExecCommunityRepo",
                data: {
                  Action: "SetTemplateTypes",
                  Id: typesDialogRepo?.Id,
                  TemplateTypes: typesValue.map((type) => type.value),
                },
              })
            }
            disabled={typesMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Source dialog */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={!!deleteDialogRepo}
        onClose={() => setDeleteDialogRepo(null)}
      >
        <DialogTitle>Remove Source</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove '{deleteDialogRepo?.FullName}' as a template source?
            Templates you have already imported are not affected.
          </Typography>
          <CippApiResults apiObject={deleteMutation} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeleteDialogRepo(null)} startIcon={<Close />}>
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              deleteMutation.mutate({
                url: "/api/ExecCommunityRepo",
                data: { Action: "Delete", Id: deleteDialogRepo?.Id },
              })
            }
            disabled={deleteMutation.isPending}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
        </Stack>
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
