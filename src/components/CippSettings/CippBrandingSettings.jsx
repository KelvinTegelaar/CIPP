import { useState } from "react";
import { Button, Typography, Box, Alert } from "@mui/material";
import { Palette, Upload } from "@mui/icons-material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { useSettings } from "/src/hooks/use-settings";
import { CippApiResults } from "../CippComponents/CippApiResults";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useForm } from "react-hook-form";

const CippBrandingSettings = () => {
  const settings = useSettings();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(settings?.customBranding?.logo || null);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      colour: settings?.customBranding?.colour || "#F77F00",
    },
  });

  const saveBrandingSettings = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: ["BrandingSettings", "userSettings"],
  });

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setLogoFile(base64String);
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const formData = formControl.getValues();
    const brandingData = {
      colour: formData.colour,
      logo: logoFile || settings?.customBranding?.logo || null,
    };

    // Update local settings immediately for UI responsiveness
    settings.handleUpdate({
      customBranding: brandingData,
    });

    // Save to backend
    saveBrandingSettings.mutate({
      url: "/api/ExecBrandingSettings",
      data: {
        Action: "Set",
        ...brandingData,
      },
      queryKey: "BrandingSettingsPost",
    });
  };

  const handleReset = () => {
    setLogoFile(null);
    setLogoPreview(null);
    formControl.reset({
      colour: "#F77F00",
    });

    // Reset local settings
    settings.handleUpdate({
      customBranding: {
        colour: "#F77F00",
        logo: null,
      },
    });

    // Save reset to backend
    saveBrandingSettings.mutate({
      url: "/api/ExecBrandingSettings",
      data: {
        Action: "Reset",
      },
      queryKey: "BrandingSettingsReset",
    });
  };

  return (
    <CippButtonCard
      title="Branding Settings"
      cardSx={{ display: "flex", flexDirection: "column" }}
      CardButton={
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={saveBrandingSettings.isPending}
            startIcon={<Palette />}
          >
            Save Branding
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleReset}
            disabled={saveBrandingSettings.isPending}
          >
            Reset
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Customize your organization's branding for reports and documents. Changes will be applied
          to all generated reports.
        </Typography>

        {/* Logo Upload Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            Logo
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="logo-upload"
              type="file"
              onChange={handleLogoUpload}
            />
            <label htmlFor="logo-upload">
              <Button
                variant="outlined"
                component="span"
                size="small"
                startIcon={<Upload />}
                sx={{ alignSelf: "flex-start" }}
              >
                Upload Logo
              </Button>
            </label>

            {logoPreview && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "50px",
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "4px",
                  }}
                />
              </Box>
            )}

            <Typography variant="caption" color="textSecondary">
              Recommended: PNG format, max 2MB, optimal size 200x100px
            </Typography>
          </Box>
        </Box>

        {/* Color Picker Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            Brand Color
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <input
              type="color"
              value={formControl.watch("colour") || "#F77F00"}
              onChange={(e) => formControl.setValue("colour", e.target.value)}
              style={{
                width: "50px",
                height: "40px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            />
            <CippFormComponent
              type="textField"
              name="colour"
              formControl={formControl}
              label="Hex Color"
              sx={{ width: "120px" }}
              validators={{
                pattern: {
                  value: /^#[0-9A-F]{6}$/i,
                  message: "Please enter a valid hex color (e.g., #F77F00)",
                },
              }}
            />
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: "block" }}>
            This color will be used for accents and highlights in reports
          </Typography>
        </Box>

        {/* Preview Section */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            Preview
          </Typography>
          <Box
            sx={{
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 1,
              backgroundColor: "#f9f9f9",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                }}
              />
            )}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: formControl.watch("colour") || "#F77F00",
                  fontWeight: "bold",
                }}
              >
                Your Organization
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Executive Report Preview
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* API Results inside the card */}
        <CippApiResults apiObject={saveBrandingSettings} />
      </Box>
    </CippButtonCard>
  );
};

export default CippBrandingSettings;
