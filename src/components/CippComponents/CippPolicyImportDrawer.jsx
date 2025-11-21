import { useState } from "react";
import {
  Button,
  Stack,
  TextField,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from "@mui/material";
import { CloudUpload, Search, Visibility } from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import { CippOffCanvas } from "./CippOffCanvas";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import CippFormComponent from "./CippFormComponent";
import CippJsonView from "../CippFormPages/CippJSONView";
import { CippApiResults } from "./CippApiResults";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippFolderNavigation } from "./CippFolderNavigation";

export const CippPolicyImportDrawer = ({
  buttonText = "Browse Catalog",
  requiredPermissions = [],
  PermissionButton = Button,
  mode = "Intune",
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const formControl = useForm();

  const selectedSource = useWatch({ control: formControl.control, name: "policySource" });
  const tenantFilter = useWatch({ control: formControl.control, name: "tenantFilter" });

  // API calls
  const communityRepos = ApiGetCall({
    url: "/api/ListCommunityRepos",
    queryKey: "CommunityRepos-List",
  });

  const tenantPolicies = ApiGetCall({
    url:
      mode === "ConditionalAccess"
        ? `/api/ListCATemplates?TenantFilter=${tenantFilter?.value || ""}`
        : mode === "Standards"
        ? `/api/listStandardTemplates?TenantFilter=${tenantFilter?.value || ""}`
        : `/api/ListIntunePolicy?type=ESP&TenantFilter=${tenantFilter?.value || ""}`,
    queryKey: `TenantPolicies-${mode}-${tenantFilter?.value || "none"}`,
    // Enable fetching only after a tenant is selected when source is tenant
    waiting: selectedSource?.value === "tenant" && !!tenantFilter?.value,
  });

  const repoPolicies = ApiGetCall({
    url: `/api/ExecGitHubAction?Action=GetFileTree&FullName=${
      selectedSource?.value || ""
    }&Branch=main`,
    queryKey: `RepoPolicies-${mode}-${selectedSource?.value || "none"}`,
    waiting: !!(selectedSource?.value && selectedSource?.value !== "tenant"),
  });

  const repositoryFiles = ApiGetCall({
    url: `/api/ExecGitHubAction?Action=GetFileTree&FullName=${
      selectedSource?.value || ""
    }&Branch=main`,
    queryKey: `RepositoryFiles-${selectedSource?.value || "none"}`,
    waiting: !!(selectedSource?.value && selectedSource?.value !== "tenant"),
  });

  const importPolicy = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys:
      mode === "ConditionalAccess"
        ? ["ListCATemplates-table"]
        : mode === "Standards"
        ? ["listStandardTemplates"]
        : ["ListIntuneTemplates-table", "ListIntuneTemplates-autcomplete"],
  });

  const viewPolicyQuery = ApiPostCall({
    onResult: (resp) => {
      let content = resp?.Results?.content?.trim() || "{}";
      content = content.replace(
        /^[\u0000-\u001F\u007F-\u009F]+|[\u0000-\u001F\u007F-\u009F]+$/g,
        ""
      );
      try {
        setViewingPolicy(JSON.parse(content));
      } catch (e) {
        console.error("Invalid JSON content:", e);
        setViewingPolicy({});
      }
    },
  });

  const handleImportPolicy = (policy) => {
    if (!policy) return;

    try {
      if (selectedSource?.value === "tenant") {
        // For tenant policies, use appropriate API based on mode
        if (mode === "ConditionalAccess") {
          // For Conditional Access, convert RawJSON to object and send the contents
          let policyData = policy;

          // If the policy has RawJSON, parse it and use that as the data
          if (policy.RawJSON) {
            try {
              policyData = JSON.parse(policy.RawJSON);
            } catch (e) {
              console.error("Failed to parse RawJSON:", e);
              policyData = policy;
            }
          }

          // Send the object contents directly with tenantFilter
          const caTemplateData = {
            tenantFilter: tenantFilter?.value,
            ...policyData,
          };

          importPolicy.mutate({
            url: "/api/AddCATemplate",
            data: caTemplateData,
          });
        } else if (mode === "Standards") {
          // For Standards templates, clone the template
          importPolicy.mutate({
            url: "/api/AddStandardTemplate",
            data: {
              tenantFilter: tenantFilter?.value,
              templateId: policy.GUID,
              clone: true,
            },
          });
        } else {
          // For Intune policies, use existing format
          importPolicy.mutate({
            url: "/api/AddIntuneTemplate",
            data: {
              tenantFilter: tenantFilter?.value,
              ID: policy.id,
              URLName: policy.URLName || "GroupPolicyConfigurations",
            },
          });
        }
      } else {
        // For community repository files, use ExecCommunityRepo
        importPolicy.mutate({
          url: "/api/ExecCommunityRepo",
          data: {
            tenantFilter: tenantFilter?.value || "AllTenants",
            Action: "ImportTemplate",
            FullName: selectedSource?.value,
            Path: policy.path,
            Branch: "main",
            Type: mode,
          },
        });
      }
    } catch (error) {
      console.error("Error importing policy:", error);
    }
  };

  const handleViewPolicy = (policy) => {
    if (!policy) return;

    try {
      if (selectedSource?.value !== "tenant" && selectedSource?.value) {
        // For community repository files, fetch the file content
        viewPolicyQuery.mutate({
          url: "/api/ExecGitHubAction",
          data: {
            Action: "GetFileContents",
            FullName: selectedSource.value,
            Path: policy.path || "",
            Branch: "main",
          },
        });
      } else {
        // For tenant policies, use the policy object directly
        setViewingPolicy(policy || {});
      }
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Error viewing policy:", error);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSearchQuery("");
    setViewingPolicy(null);
    setSelectedFile(null);
    // Don't reset form at all to avoid any potential issues
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewingPolicy(null);
  };

  const formatPolicyName = (policy) => {
    // Safety check
    if (!policy) return "Unnamed Policy";

    // For tenant policies, use displayName or name
    if (policy.displayName || policy.name) {
      return policy.displayName || policy.name;
    }

    // For repository files, format the path nicely
    if (policy.path) {
      try {
        // Remove file extension
        let name = policy.path.replace(/\.(json|yaml|yml)$/i, "");

        // Remove directory path, keep only filename
        name = name.split("/").pop();

        // Replace underscores with spaces and clean up
        name = name.replace(/_/g, " ");

        // Remove common prefixes like "CIPP_"
        name = name.replace(/^CIPP\s*/i, "");

        // Capitalize first letter of each word
        name = name.replace(/\b\w/g, (l) => l.toUpperCase());

        return name || "Unnamed Policy";
      } catch (error) {
        console.warn("Error formatting policy name:", error);
        return policy.path || "Unnamed Policy";
      }
    }

    return "Unnamed Policy";
  };

  // Get policies based on source
  let availablePolicies = [];
  if (selectedSource?.value === "tenant" && tenantPolicies.isSuccess && tenantFilter?.value) {
    const tpData = tenantPolicies.data;
    if (Array.isArray(tpData)) {
      availablePolicies = tpData;
    } else if (Array.isArray(tpData?.Results)) {
      availablePolicies = tpData.Results;
    } else if (tpData?.Results && typeof tpData.Results === "object") {
      // Handle edge case where Results might be an object of keyed items
      availablePolicies = Object.values(tpData.Results).filter(Boolean);
    } else {
      availablePolicies = [];
    }
  } else if (
    selectedSource?.value &&
    selectedSource?.value !== "tenant" &&
    repoPolicies.isSuccess
  ) {
    const repoData = repoPolicies.data?.Results || repoPolicies.data || [];
    availablePolicies = Array.isArray(repoData) ? repoData : [];
  }

  const filteredPolicies = (() => {
    if (!Array.isArray(availablePolicies)) return [];

    if (!searchQuery?.trim()) return availablePolicies;

    return availablePolicies.filter((policy) => {
      if (!policy) return false;
      const searchLower = searchQuery.toLowerCase();
      return (
        policy.displayName?.toLowerCase().includes(searchLower) ||
        policy.description?.toLowerCase().includes(searchLower) ||
        policy.name?.toLowerCase().includes(searchLower) ||
        policy.path?.toLowerCase().includes(searchLower)
      );
    });
  })();

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<CloudUpload />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title={`Browse ${mode} Policy Catalog`}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack direction="row" justifyContent="flex-start" spacing={2}>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </Stack>
        }
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Box sx={{ flexShrink: 0, mb: 3 }}>
            <CippFormComponent
              name="policySource"
              type="autoComplete"
              label="Select Policy Source"
              isFetching={communityRepos.isLoading}
              multiple={false}
              formControl={formControl}
              options={[
                ...(communityRepos.isSuccess &&
                communityRepos.data?.Results &&
                Array.isArray(communityRepos.data.Results)
                  ? communityRepos.data.Results.map((repo) => ({
                      label: `${repo?.Name || "Unknown"} (${repo?.URL || "Unknown"})`,
                      value: repo?.FullName || "",
                    })).filter((option) => option.value)
                  : []),
                { label: "Get template from existing tenant", value: "tenant" },
              ]}
            />

            {selectedSource?.value === "tenant" && (
              <Box sx={{ mt: 3 }}>
                <CippFormTenantSelector
                  formControl={formControl}
                  name="tenantFilter"
                  required={true}
                  disableClearable={false}
                  allTenants={false}
                  type="single"
                />
              </Box>
            )}
          </Box>

          {/* Content based on source */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {selectedSource?.value === "tenant" ? (
              // Tenant policies - show traditional list
              <>
                <TextField
                  fullWidth
                  label="Search Policies"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                  placeholder="Search by policy name or description..."
                />

                <Typography variant="h6">Available Policies ({filteredPolicies.length})</Typography>

                {tenantPolicies.isLoading ? (
                  <>
                    {[...Array(3)].map((_, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                          <Skeleton variant="rectangular" width={80} height={36} />
                          <Skeleton variant="rectangular" width={120} height={36} />
                          <Skeleton variant="text" width={300} height={32} />
                        </Stack>
                        <Skeleton variant="text" width={200} height={20} />
                      </Box>
                    ))}
                  </>
                ) : Array.isArray(filteredPolicies) && filteredPolicies.length > 0 ? (
                  filteredPolicies.map((policy, index) => {
                    if (!policy) return null;
                    return (
                      <Box key={policy.id || policy.path || index} sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleImportPolicy(policy)}
                            disabled={importPolicy.isLoading}
                            sx={{ minWidth: 80, flexShrink: 0 }}
                          >
                            Import
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewPolicy(policy)}
                            sx={{ minWidth: 120, flexShrink: 0 }}
                          >
                            View Policy
                          </Button>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
                              {formatPolicyName(policy)}
                            </Typography>
                            {policy?.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {policy.description}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No policies available.
                  </Typography>
                )}

                <CippApiResults apiObject={tenantPolicies} errorsOnly />
              </>
            ) : selectedSource?.value ? (
              // Repository source - show iOS-style folder navigation
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Browse Repository Files
                </Typography>
                {repositoryFiles.isLoading ? (
                  <Box sx={{ flexGrow: 1 }}>
                    {/* Navigation skeleton */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                      <Skeleton variant="text" width={200} height={24} />
                    </Box>

                    {/* File/folder list skeleton */}
                    <Box sx={{ p: 1 }}>
                      {[...Array(5)].map((_, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1 }}>
                            <Skeleton variant="circular" width={20} height={20} />
                            <Skeleton
                              variant="text"
                              width={Math.random() * 200 + 100}
                              height={20}
                            />
                            <Box sx={{ flexGrow: 1 }} />
                            <Skeleton variant="rectangular" width={16} height={16} />
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : repositoryFiles.isSuccess ? (
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                      height: "100%",
                    }}
                  >
                    <CippFolderNavigation
                      data={repositoryFiles.data?.Results || []}
                      onFileSelect={handleFileSelect}
                      selectedFile={selectedFile}
                      searchable={true}
                      showFileInfo={true}
                      onImportFile={handleImportPolicy}
                      onViewFile={handleViewPolicy}
                      isImporting={importPolicy.isLoading}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Unable to load repository files.
                  </Typography>
                )}

                <Box sx={{ flexShrink: 0 }}>
                  <CippApiResults apiObject={repositoryFiles} errorsOnly />
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Please select a policy source to continue.
              </Typography>
            )}

            <Box sx={{ flexShrink: 0 }}>
              <CippApiResults apiObject={importPolicy} />
            </Box>
          </Box>
        </Box>
      </CippOffCanvas>

      <Dialog fullWidth maxWidth="xl" open={viewDialogOpen} onClose={handleCloseViewDialog}>
        <DialogTitle>Policy Details</DialogTitle>
        <DialogContent>
          {viewPolicyQuery.isPending ? (
            <Box>
              <Skeleton height={300} variant="rectangular" />
            </Box>
          ) : (
            <CippJsonView
              object={viewingPolicy || {}}
              type={
                mode === "ConditionalAccess"
                  ? "conditionalaccess"
                  : mode === "Standards"
                  ? "standards"
                  : "intune"
              }
              defaultOpen={true}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseViewDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
