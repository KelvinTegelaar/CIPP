import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Avatar,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
} from "@mui/material";
import { PhotoCamera, Delete, AccountCircle } from "@mui/icons-material";
import { ApiPostCall } from "../../api/ApiCall";
import PropTypes from "prop-types";

export const CippUserPhotoManager = ({
  userId,
  tenantFilter,
  currentPhotoUrl,
  onPhotoChange,
  compact = false,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // API mutation for setting photo
  const setPhotoMutation = ApiPostCall({
    urlFromData: true,
  });

  // API mutation for removing photo
  const removePhotoMutation = ApiPostCall({
    urlFromData: true,
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG or PNG)");
      return;
    }

    // Validate file size (4MB max for Microsoft Graph)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      setUploadError(
        `File size exceeds 4MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      );
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setUploadError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;

        // Upload the photo
        await setPhotoMutation.mutateAsync({
          url: "/api/ExecSetUserPhoto",
          data: {
            userId: userId,
            tenantFilter: tenantFilter,
            action: "set",
            photoData: base64Data,
          },
        });

        // Clear the selection and preview
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Notify parent component
        if (onPhotoChange) {
          onPhotoChange();
        }
      };
      reader.onerror = () => {
        setUploadError("Failed to read file");
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setUploadError(error.message || "Failed to upload photo");
    }
  };

  const handleRemovePhoto = async () => {
    setUploadError(null);

    try {
      await removePhotoMutation.mutateAsync({
        url: "/api/ExecSetUserPhoto",
        data: {
          userId: userId,
          tenantFilter: tenantFilter,
          action: "remove",
        },
      });

      // Clear any preview
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Notify parent component
      if (onPhotoChange) {
        onPhotoChange();
      }
    } catch (error) {
      setUploadError(error.message || "Failed to remove photo");
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isLoading = setPhotoMutation.isPending || removePhotoMutation.isPending;

  // Compact mode - inline with form fields
  if (compact) {
    return (
      <FormControl fullWidth variant="filled">
        <FormLabel sx={{ mb: 1 }}>Profile Picture</FormLabel>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            backgroundColor: "action.hover",
            borderRadius: 1,
          }}
        >
          {/* Avatar */}
          <Avatar
            src={previewUrl || currentPhotoUrl}
            sx={{
              width: 56,
              height: 56,
              border: "2px solid",
              borderColor: "divider",
            }}
          >
            <AccountCircle sx={{ fontSize: 40 }} />
          </Avatar>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
          />

          {/* Action buttons */}
          <Stack direction="row" spacing={1} flexGrow={1}>
            {!selectedFile ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  Change Photo
                </Button>
                {currentPhotoUrl && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleRemovePhoto}
                    disabled={isLoading}
                  >
                    {isLoading && removePhotoMutation.isPending ? (
                      <CircularProgress size={16} />
                    ) : (
                      "Remove"
                    )}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleUpload}
                  disabled={isLoading}
                  startIcon={isLoading && <CircularProgress size={16} color="inherit" />}
                >
                  {isLoading ? "Uploading..." : "Save"}
                </Button>
                <Button size="small" variant="outlined" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
              </>
            )}
          </Stack>

          {/* Status indicator */}
          <Box sx={{ minWidth: 200 }}>
            {setPhotoMutation.isSuccess && (
              <Typography variant="caption" color="success.main">
                ✓ Photo updated
              </Typography>
            )}
            {removePhotoMutation.isSuccess && (
              <Typography variant="caption" color="success.main">
                ✓ Photo removed
              </Typography>
            )}
            {uploadError && (
              <Typography variant="caption" color="error">
                {uploadError}
              </Typography>
            )}
            {setPhotoMutation.isError && (
              <Typography variant="caption" color="error">
                {setPhotoMutation.error?.message || "Upload failed"}
              </Typography>
            )}
            {removePhotoMutation.isError && (
              <Typography variant="caption" color="error">
                {removePhotoMutation.error?.message || "Remove failed"}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
          Supported: JPEG, PNG (Max 4MB)
        </Typography>
      </FormControl>
    );
  }

  // Full mode - standalone card view
  return (
    <Box>
      <Stack spacing={2} alignItems="center">
        {/* Avatar Preview */}
        <Box position="relative">
          <Avatar
            src={previewUrl || currentPhotoUrl}
            sx={{
              width: 120,
              height: 120,
              border: "2px solid",
              borderColor: "divider",
            }}
          >
            <AccountCircle sx={{ fontSize: 80 }} />
          </Avatar>

          {/* Camera overlay button when not in upload mode */}
          {!selectedFile && (
            <Tooltip title="Change Photo">
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
        />

        {/* Action buttons */}
        {!selectedFile ? (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              Upload Photo
            </Button>
            {currentPhotoUrl && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleRemovePhoto}
                disabled={isLoading}
              >
                {isLoading && removePhotoMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  "Remove Photo"
                )}
              </Button>
            )}
          </Stack>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
            >
              {isLoading ? "Uploading..." : "Save Photo"}
            </Button>
            <Button variant="outlined" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
          </Stack>
        )}

        {/* Success/Error Messages */}
        {setPhotoMutation.isSuccess && (
          <Alert severity="success" sx={{ width: "100%" }}>
            Profile picture updated successfully!
          </Alert>
        )}
        {removePhotoMutation.isSuccess && (
          <Alert severity="success" sx={{ width: "100%" }}>
            Profile picture removed successfully!
          </Alert>
        )}
        {uploadError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {uploadError}
          </Alert>
        )}
        {setPhotoMutation.isError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {setPhotoMutation.error?.message || "Failed to upload photo"}
          </Alert>
        )}
        {removePhotoMutation.isError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {removePhotoMutation.error?.message || "Failed to remove photo"}
          </Alert>
        )}

        {/* Helper text */}
        <Typography variant="caption" color="text.secondary" textAlign="center">
          Supported formats: JPEG, PNG (Max size: 4MB)
        </Typography>
      </Stack>
    </Box>
  );
};

CippUserPhotoManager.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantFilter: PropTypes.string.isRequired,
  currentPhotoUrl: PropTypes.string,
  onPhotoChange: PropTypes.func,
  compact: PropTypes.bool,
};
