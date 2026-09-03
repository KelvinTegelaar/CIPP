import { useEffect, useState, useCallback } from "react";
import { CippIcons } from "../../../../utils/icon-registry";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControlLabel,
  Stack,
  SvgIcon,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { useRouter } from "next/router";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { CippHead } from "../../../../components/CippComponents/CippHead";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";

// Password configuration constants
const PASSWORD_TYPES = {
  CLASSIC: 'Classic',
  PASSPHRASE: 'Passphrase'
};

const DEFAULT_VALUES = {
  CHAR_COUNT: 14,
  WORD_COUNT: 4,
  SPECIAL_CHAR_SET: '$%&*#',
  SEPARATOR: '-'
};

function normalizeConfigForBackend(config) {
  return {
    passwordType: String(config.passwordType || PASSWORD_TYPES.CLASSIC),
    charCount: String(parseInt(config.charCount, 10) || DEFAULT_VALUES.CHAR_COUNT),
    includeUppercase: Boolean(config.includeUppercase),
    includeLowercase: Boolean(config.includeLowercase),
    includeDigits: Boolean(config.includeDigits),
    includeSpecialChars: Boolean(config.includeSpecialChars),
    specialCharSet: String(config.specialCharSet || DEFAULT_VALUES.SPECIAL_CHAR_SET),
    wordCount: String(parseInt(config.wordCount, 10) || DEFAULT_VALUES.WORD_COUNT),
    separator: config.separator !== undefined && config.separator !== null ? String(config.separator) : DEFAULT_VALUES.SEPARATOR,
    capitalizeWords: Boolean(config.capitalizeWords),
    appendNumber: Boolean(config.appendNumber),
    appendSpecialChar: Boolean(config.appendSpecialChar),
  };
}

const DEFAULT_CONFIG = {
  passwordType: PASSWORD_TYPES.CLASSIC,
  charCount: String(DEFAULT_VALUES.CHAR_COUNT),
  includeUppercase: true,
  includeLowercase: true,
  includeDigits: true,
  includeSpecialChars: true,
  specialCharSet: DEFAULT_VALUES.SPECIAL_CHAR_SET,
  wordCount: String(DEFAULT_VALUES.WORD_COUNT),
  separator: DEFAULT_VALUES.SEPARATOR,
  capitalizeWords: false,
  appendNumber: false,
  appendSpecialChar: false,
};

// ── Page ──────────────────────────────────────────────────────────────────────

const Page = () => {
  const router = useRouter();
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const passwordSetting = ApiGetCall({ url: "/api/ExecPasswordConfig?list=true", queryKey: "PasswordSettings" });
  const passwordSave = ApiPostCall({ datafromUrl: true, relatedQueryKeys: "PasswordSettings" });

  useEffect(() => {
    if (passwordSetting.isSuccess && passwordSetting.data) {
      const r = passwordSetting.data.Results;
      const toBool = (v, def) => {
        if (v === undefined || v === null) return def;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') return v.toLowerCase() === 'true';
        if (typeof v === 'number') return v === 1;
        return def;
      };

      setConfig({
        passwordType: r.passwordType || DEFAULT_CONFIG.passwordType,
        charCount: String(parseInt(r.charCount, 10) || DEFAULT_CONFIG.charCount),
        includeUppercase: toBool(r.includeUppercase, DEFAULT_CONFIG.includeUppercase),
        includeLowercase: toBool(r.includeLowercase, DEFAULT_CONFIG.includeLowercase),
        includeDigits: toBool(r.includeDigits, DEFAULT_CONFIG.includeDigits),
        includeSpecialChars: toBool(r.includeSpecialChars, DEFAULT_CONFIG.includeSpecialChars),
        specialCharSet: r.specialCharSet || DEFAULT_CONFIG.specialCharSet,
        wordCount: String(parseInt(r.wordCount, 10) || DEFAULT_CONFIG.wordCount),
        separator: r.separator !== undefined ? r.separator : DEFAULT_CONFIG.separator,
        capitalizeWords: toBool(r.capitalizeWords, DEFAULT_CONFIG.capitalizeWords),
        appendNumber: toBool(r.appendNumber, DEFAULT_CONFIG.appendNumber),
        appendSpecialChar: toBool(r.appendSpecialChar, DEFAULT_CONFIG.appendSpecialChar),
      });
    }
  }, [passwordSetting.isSuccess, passwordSetting.data]);

  const set = useCallback((field, value) => {
    setConfig((p) => ({ ...p, [field]: value }));
  }, []);

  const isClassic = config.passwordType === PASSWORD_TYPES.CLASSIC;

  const handleSave = () => {
    const normalizedConfig = normalizeConfigForBackend(config);

    passwordSave.mutate(
      {
        url: "/api/ExecPasswordConfig",
        data: normalizedConfig,
        queryKey: "PasswordSettingsPost",
      }
    );
  };

  const handleBackToSettings = () => {
    router.push("/cipp/settings");
  };

  return (
    <>
      <CippHead title="Password Configuration" noTenant />
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2}>
            <Stack spacing={2}>
              {/* wraps on narrow widths instead of clipping the title */}
              <Stack
                direction="row"
                spacing={2}
                useFlexGap
                sx={{ flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography variant="h4">Password Configuration</Typography>
                <Button
                  size="small"
                  startIcon={<SvgIcon fontSize="small"><CippIcons.ArrowLeftIcon /></SvgIcon>}
                  onClick={handleBackToSettings}
                >
                  Settings
                </Button>
              </Stack>
            </Stack>

            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                    <Typography variant="subtitle2">Type</Typography>
                    <Stack direction="row" spacing={2} sx={{
                      alignItems: "center"
                    }}>
                      <ToggleButtonGroup
                        value={config.passwordType}
                        exclusive
                        onChange={(e, v) => v && set("passwordType", v)}
                        size="small"
                        color="primary"
                      >
                        <ToggleButton value={PASSWORD_TYPES.CLASSIC}>Classic</ToggleButton>
                        <ToggleButton value={PASSWORD_TYPES.PASSPHRASE}>Passphrase</ToggleButton>
                      </ToggleButtonGroup>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={passwordSave.isPending}
                        startIcon={<SvgIcon fontSize="small"><CippIcons.CheckIcon /></SvgIcon>}
                      >
                        {passwordSave.isPending ? "Saving..." : "Save"}
                      </Button>
                    </Stack>
                  </Stack>
                  <Typography variant="caption" sx={{
                    color: "text.secondary"
                  }}>
                    {isClassic
                      ? "Random characters from the selected classes. Good for systems requiring specific character types. 16+ characters recommended for strong security."
                      : "Random dictionary words joined together. Easier to remember and typically stronger at equal length. 5+ words recommended for high security."}
                  </Typography>
                  <Divider />

                  {isClassic ? (
                    <>
                      <Box>
                        <TextField
                          label="Length"
                          value={config.charCount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d+$/.test(value)) {
                              set("charCount", value);
                            }
                          }}
                          size="small"
                          sx={{ width: 120 }}
                          error={config.charCount === ''}
                          helperText={config.charCount === '' ? "Length cannot be empty" : ""}
                          slotProps={{
                            htmlInput: {
                              style: { height: "40px" },
                              min: 8,
                              max: 256
                            }
                          }}
                        />
                      </Box>
                      <Grid container spacing={0}>
                        <Grid size={{ sm: 6, xs: 12 }}>
                          <FormControlLabel
                            control={<Switch size="small" checked={config.includeUppercase} onChange={(e) => set("includeUppercase", e.target.checked)} />}
                            label={<Typography variant="body2">Uppercase (A-Z)</Typography>}
                          />
                        </Grid>
                        <Grid size={{ sm: 6, xs: 12 }}>
                          <FormControlLabel
                            control={<Switch size="small" checked={config.includeLowercase} onChange={(e) => set("includeLowercase", e.target.checked)} />}
                            label={<Typography variant="body2">Lowercase (a-z)</Typography>}
                          />
                        </Grid>
                        <Grid size={{ sm: 6, xs: 12 }}>
                          <FormControlLabel
                            control={<Switch size="small" checked={config.includeDigits} onChange={(e) => set("includeDigits", e.target.checked)} />}
                            label={<Typography variant="body2">Digits (0-9)</Typography>}
                          />
                        </Grid>
                        <Grid size={{ sm: 6, xs: 12 }}>
                          <FormControlLabel
                            control={<Switch size="small" checked={config.includeSpecialChars} onChange={(e) => set("includeSpecialChars", e.target.checked)} />}
                            label={<Typography variant="body2">Special Characters</Typography>}
                          />
                        </Grid>
                      </Grid>
                      {config.includeSpecialChars && (
                        <TextField
                          label="Special Characters"
                          value={config.specialCharSet}
                          onChange={(e) => set("specialCharSet", e.target.value)}
                          size="small"
                          fullWidth
                          helperText="Allowed: !@#$%^&*()-_=+/"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {/* full width fields stacked on xs; helper text moves below instead of squeezing inline */}
                      <Stack spacing={1}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          useFlexGap
                          sx={{ alignItems: { xs: "stretch", sm: "center" }, flexWrap: "wrap" }}
                        >
                          <TextField
                            label="Words"
                            value={config.wordCount}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d+$/.test(value)) {
                                set("wordCount", value);
                              }
                            }}
                            size="small"
                            sx={{ width: { xs: "100%", sm: 120 }, maxWidth: { xs: "100%", sm: 160 } }}
                            error={config.wordCount === ''}
                            helperText={config.wordCount === '' ? "Word count cannot be empty" : ""}
                            slotProps={{
                              htmlInput: {
                                style: { height: "40px" },
                                min: 2,
                                max: 10
                              }
                            }}
                          />
                          <TextField
                            label="Separator"
                            value={config.separator}
                            onChange={(e) => set("separator", e.target.value)}
                            size="small"
                            sx={{ width: { xs: "100%", sm: "auto" }, maxWidth: { xs: "100%", sm: 120 } }}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.75rem'
                          }}>
                          Allowed: single space, empty, or !@#$%^&*()-_=+/
                        </Typography>
                      </Stack>
                      <Grid container spacing={0}>
                        <Grid size={{ sm: 6, xs: 12 }}>
                          <FormControlLabel
                            control={<Switch size="small" checked={config.capitalizeWords} onChange={(e) => set("capitalizeWords", e.target.checked)} />}
                            label={<Typography variant="body2">Capitalize words</Typography>}
                          />
                        </Grid>
                        <Grid size={{ sm: 6, xs: 12 }}>
                          <FormControlLabel
                            control={<Switch size="small" checked={config.appendNumber} onChange={(e) => set("appendNumber", e.target.checked)} />}
                            label={<Typography variant="body2">Append number</Typography>}
                          />
                        </Grid>
                        <Grid size={{ sm: 6, xs: 12 }}>
                          <FormControlLabel
                            control={<Switch size="small" checked={config.appendSpecialChar} onChange={(e) => set("appendSpecialChar", e.target.checked)} />}
                            label={<Typography variant="body2">Append Special Character</Typography>}
                          />
                        </Grid>
                      </Grid>
                      {config.appendSpecialChar && (
                        <TextField
                          label="Special Characters"
                          value={config.specialCharSet}
                          onChange={(e) => set("specialCharSet", e.target.value)}
                          size="small"
                          fullWidth
                          helperText="Allowed: !@#$%^&*()-_=+/"
                        />
                      )}
                    </>
                  )}
                </Stack>
                <CippApiResults apiObject={passwordSave} />
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
