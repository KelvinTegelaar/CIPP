import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  AlertTitle,
  useTheme,
  Stack,
} from "@mui/material";
import { Groups, Business, Rule, Info } from "@mui/icons-material";
import { CippDataTable } from "../CippTable/CippDataTable";

export const CippTenantGroupOffCanvas = ({ data }) => {
  const theme = useTheme();

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No group data available</Typography>
      </Box>
    );
  }

  const isDynamic = data.GroupType === "dynamic";
  const hasMembers = data.Members && data.Members.length > 0;
  const hasDynamicRules =
    data.DynamicRules &&
    ((Array.isArray(data.DynamicRules) && data.DynamicRules.length > 0) ||
      (!Array.isArray(data.DynamicRules) && Object.keys(data.DynamicRules).length > 0));

  const renderDynamicRules = () => {
    if (!hasDynamicRules) {
      return (
        <Alert severity="info">
          <AlertTitle>No Dynamic Rules</AlertTitle>
          This dynamic group has no rules configured.
        </Alert>
      );
    }

    const operatorDisplay = {
      eq: "equals",
      ne: "not equals",
      in: "in",
      notIn: "not in",
      contains: "contains",
      startsWith: "starts with",
      endsWith: "ends with",
    };

    // Handle both single rule object and array of rules
    const rules = Array.isArray(data.DynamicRules) ? data.DynamicRules : [data.DynamicRules];

    const renderRule = (rule, index) => (
      <Box
        key={index}
        sx={{
          p: 2,
          bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.50",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Rule {rules.length > 1 ? `${index + 1}:` : "Configuration:"}
        </Typography>
        <Typography variant="body1">
          <strong>Property:</strong> {rule.property}
        </Typography>
        <Typography variant="body1">
          <strong>Operator:</strong> {operatorDisplay[rule.operator] || rule.operator}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Value(s):</strong>
        </Typography>
        {Array.isArray(rule.value) ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {rule.value.map((item, valueIndex) => (
              <Chip
                key={valueIndex}
                label={item.label || item.value || item}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        ) : (
          <Chip
            label={rule.value?.label || rule.value}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
      </Box>
    );

    const renderRulesWithLogic = () => {
      if (rules.length === 1) {
        return renderRule(rules[0], 0);
      }

      return rules.map((rule, index) => (
        <React.Fragment key={index}>
          {renderRule(rule, index)}
          {index < rules.length - 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
              <Chip
                label={data.RuleLogic?.toUpperCase() || "AND"}
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontWeight: "bold" }}
              />
            </Box>
          )}
        </React.Fragment>
      ));
    };

    return (
      <Card variant="outlined">
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Rule color="primary" />
            Dynamic Rules
            {rules.length > 1 && (
              <Chip
                label={`${rules.length} rules`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Typography>
          {renderRulesWithLogic()}
        </CardContent>
      </Card>
    );
  };

  const renderMembers = () => {
    if (!hasMembers) {
      return (
        <Alert severity={isDynamic ? "info" : "warning"}>
          <AlertTitle>No Members</AlertTitle>
          {isDynamic
            ? "This dynamic group has no members that match the current rules."
            : "This static group has no members assigned."}
        </Alert>
      );
    }

    const memberColumns = ["displayName", "defaultDomainName", "customerId"];

    return (
      <Box>
        <CippDataTable
          data={data.Members}
          simpleColumns={memberColumns}
          cardProps={{
            variant: "outlined",
          }}
          title={"Members"}
          cardHeaderProps={{
            avatar: <Business color="primary" />,
          }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ px: 1 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Groups color="primary" fontSize="large" />
          <Box>
            <Typography variant="h4" gutterBottom>
              {data.Name}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                label={data.GroupType?.toUpperCase() || "UNKNOWN"}
                color={isDynamic ? "primary" : "secondary"}
                variant="filled"
              />
              <Typography variant="body2" color="text.secondary">
                ID: {data.Id}
              </Typography>
            </Box>
          </Box>
        </Box>

        {data.Description && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Description</AlertTitle>
            {data.Description}
          </Alert>
        )}
      </Box>

      {/* Content Sections */}
      <Stack spacing={3}>
        {/* Dynamic Rules Section (only for dynamic groups) */}
        {isDynamic && <Box>{renderDynamicRules()}</Box>}

        {/* Members Section */}
        <Box>{renderMembers()}</Box>

        {/* Additional Info */}
        <Card variant="outlined">
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Info color="primary" />
              Additional Information
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Group Type
                </Typography>
                <Typography variant="body1">{isDynamic ? "Dynamic" : "Static"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Member Count
                </Typography>
                <Typography variant="body1">
                  {data.Members?.length || 0} tenant{(data.Members?.length || 0) !== 1 ? "s" : ""}
                </Typography>
              </Box>
              {isDynamic && (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Rule Logic
                    </Typography>
                    <Typography variant="body1">
                      {data.RuleLogic?.toUpperCase() || "AND"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Has Rules
                    </Typography>
                    <Typography variant="body1">{hasDynamicRules ? "Yes" : "No"}</Typography>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
