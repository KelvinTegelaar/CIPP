import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Breadcrumbs,
  Link,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Slide,
  Button,
} from "@mui/material";
import {
  Folder,
  InsertDriveFile,
  Search,
  Clear,
  NavigateNext,
  Home,
  Visibility,
  SubdirectoryArrowLeft,
} from "@mui/icons-material";
import { alpha, styled } from "@mui/material/styles";

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.25, 0),
  padding: theme.spacing(1, 2),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  },
}));

const FileListItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  border: `1px solid ${theme.palette.divider}`,
}));

const NavigationContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  height: "100%",
  minHeight: 400,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
}));

const SlideView = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  flexDirection: "column",
}));

export const CippFolderNavigation = ({
  data = [],
  onFileSelect,
  selectedFile = null,
  searchable = true,
  showFileInfo = true,
  onImportFile,
  onViewFile,
  isImporting = false,
}) => {
  const [currentPath, setCurrentPath] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [slideDirection, setSlideDirection] = useState("left");

  // Build folder structure from flat file list
  const folderStructure = useMemo(() => {
    const structure = { folders: {}, files: [] };

    data.forEach((file) => {
      const pathParts = file.path.split("/");
      let current = structure;

      // Build folder hierarchy
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        if (!current.folders[folderName]) {
          current.folders[folderName] = {
            folders: {},
            files: [],
            name: folderName,
            path: pathParts.slice(0, i + 1).join("/"),
          };
        }
        current = current.folders[folderName];
      }

      // Add file to the final folder
      current.files.push({
        ...file,
        name: pathParts[pathParts.length - 1],
      });
    });

    return structure;
  }, [data]);

  // Get current folder based on currentPath
  const getCurrentFolder = () => {
    let current = folderStructure;
    for (const pathPart of currentPath) {
      current = current.folders[pathPart];
      if (!current) break;
    }
    return current || { folders: {}, files: [] };
  };

  // Filter files based on search term (only when searching)
  const getFilteredContent = () => {
    if (!searchTerm) {
      return getCurrentFolder();
    }

    // When searching, show all matching files across all folders
    const allFiles = data.filter((file) =>
      file.path.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      folders: {},
      files: allFiles.map((file) => ({
        ...file,
        name: file.path.split("/").pop(),
      })),
    };
  };

  const currentFolder = getFilteredContent();

  const navigateToFolder = (folderName) => {
    setSlideDirection("left");
    setCurrentPath((prev) => [...prev, folderName]);
  };

  const navigateBack = () => {
    if (currentPath.length > 0) {
      setSlideDirection("right");
      setCurrentPath((prev) => prev.slice(0, -1));
    }
  };

  const navigateTo = (index) => {
    if (index < currentPath.length) {
      const direction = index < currentPath.length - 1 ? "right" : "left";
      setSlideDirection(direction);
      setCurrentPath((prev) => prev.slice(0, index + 1));
    } else if (index === -1) {
      setSlideDirection("right");
      setCurrentPath([]);
    }
  };

  const handleFileClick = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (fileName) => {
    return <InsertDriveFile sx={{ fontSize: 20 }} />;
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const folders = Object.values(currentFolder.folders || {});
  const files = currentFolder.files || [];

  return (
    <Box
      sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", flexGrow: 1 }}
    >
      {searchable && (
        <Box sx={{ mb: 2, flexShrink: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}>
                    <Clear sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      <NavigationContainer sx={{ flexGrow: 1 }}>
        <Slide direction={slideDirection} in={true} mountOnEnter unmountOnExit>
          <SlideView>
            {/* Header with navigation */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
              {searchTerm ? (
                <Typography variant="h6">Search Results ({files.length})</Typography>
              ) : (
                <Breadcrumbs
                  separator={<NavigateNext fontSize="small" />}
                  sx={{ fontSize: "0.875rem" }}
                >
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigateTo(-1)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    <Home sx={{ mr: 0.5, fontSize: 16 }} />
                  </Link>
                  {currentPath.map((folder, index) => (
                    <Link
                      key={index}
                      component="button"
                      variant="body2"
                      onClick={() => navigateTo(index)}
                      sx={{
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {folder}
                    </Link>
                  ))}
                </Breadcrumbs>
              )}
            </Box>

            {/* Content */}
            <Box sx={{ flexGrow: 1, overflow: "auto", minHeight: 0 }}>
              <List dense>
                {/* Show ".." folder for navigation back when not at root and not searching */}
                {!searchTerm && currentPath.length > 0 && (
                  <StyledListItem onClick={navigateBack}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Folder sx={{ fontSize: 20, color: "text.secondary" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <SubdirectoryArrowLeft sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                            Parent folder
                          </Typography>
                        </Box>
                      }
                    />
                    <NavigateNext sx={{ fontSize: 18, color: "text.secondary" }} />
                  </StyledListItem>
                )}

                {/* Show folders first (only when not searching) */}
                {!searchTerm &&
                  folders.map((folder) => (
                    <StyledListItem key={folder.name} onClick={() => navigateToFolder(folder.name)}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Folder sx={{ fontSize: 20, color: "primary.main" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2">{folder.name}</Typography>
                            {folder.files.length > 0 && (
                              <Chip
                                label={folder.files.length}
                                size="small"
                                sx={{ height: 18, fontSize: "0.75rem" }}
                              />
                            )}
                          </Box>
                        }
                      />
                      <NavigateNext sx={{ fontSize: 18, color: "text.secondary" }} />
                    </StyledListItem>
                  ))}

                {/* Show files */}
                {files.map((file) => (
                  <FileListItem
                    key={file.sha || file.path}
                    sx={{
                      borderColor: selectedFile?.sha === file.sha ? "primary.main" : "divider",
                      backgroundColor:
                        selectedFile?.sha === file.sha ? "primary.50" : "transparent",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* File Icon and Info */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexGrow: 1,
                          minWidth: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => handleFileClick(file)}
                      >
                        <Box sx={{ minWidth: 40, display: "flex", justifyContent: "flex-start" }}>
                          {getFileIcon(file.name)}
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {file.name}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {searchTerm && (
                              <>
                                <Typography variant="caption" color="text.secondary">
                                  {file.path.substring(0, file.path.lastIndexOf("/")) || "root"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  •
                                </Typography>
                              </>
                            )}
                            {showFileInfo && (
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(file.size)}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Box>

                      {/* Action Buttons */}
                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewFile?.(file);
                          }}
                          sx={{ minWidth: 100 }}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onImportFile?.(file);
                          }}
                          disabled={isImporting}
                          sx={{ minWidth: 80 }}
                        >
                          Import
                        </Button>
                      </Stack>
                    </Stack>
                  </FileListItem>
                ))}

                {/* Empty state */}
                {folders.length === 0 && files.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm
                        ? `No files found matching "${searchTerm}"`
                        : "This folder is empty"}
                    </Typography>
                  </Box>
                )}
              </List>
            </Box>
          </SlideView>
        </Slide>
      </NavigationContainer>

      {!searchTerm && data.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4, flexShrink: 0 }}>
          <Typography variant="body2" color="text.secondary">
            No files available
          </Typography>
        </Box>
      )}
    </Box>
  );
};
