import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, Divider, Stack, SvgIcon, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from "@mui/lab";
import { ActionList } from "/src/components/action-list";
import { ActionListItem } from "/src/components/action-list-item";
import CheckIcon from "@heroicons/react/24/outline/CheckIcon";
import { useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import _ from "lodash"; // For safely accessing dot notation
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";

const StyledTimelineDot = (props) => {
  const { complete } = props;

  return (
    <TimelineDot
      sx={{
        alignSelf: "center",
        boxShadow: "none",
        flexShrink: 0,
        height: 36,
        justifyContent: "center",
        width: 36,
        backgroundColor: (theme) => (theme.palette.mode === "dark" ? "neutral.800" : "neutral.200"),
        borderColor: (theme) => (theme.palette.mode === "dark" ? "neutral.800" : "neutral.200"),
        color: "text.secondary",
        ...(complete && {
          backgroundColor: "success.main",
          borderColor: "success.main",
          color: "success.contrastText",
        }),
      }}
    >
      <SvgIcon fontSize="small">
        <CheckIcon />
      </SvgIcon>
    </TimelineDot>
  );
};

const StyledTimelineConnector = styled(TimelineConnector)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.neutral[800] : theme.palette.neutral[200],
  height: 24,
}));

const StyledTimelineContent = styled(TimelineContent)(({ theme }) => ({
  padding: "14px 16px",
  ...theme.typography.overline,
}));

const CippStandardsSideBar = ({ title, subtitle, steps, actions, updatedAt, formControl }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Watch the template name and selected standards from the form
  const watchForm = useWatch({ control: formControl.control });
  const { templateName, selectedStandards = {} } = watchForm;

  // Monitor standards configuration state
  const allStandardsConfigured = Object.keys(selectedStandards).every((standardName) => {
    const standardValues = _.get(watchForm, `standards.${standardName}`, {});
    return standardValues.action && standardValues.configured;
  });

  useEffect(() => {
    let newStep = 0;

    // Step 1: Check if template name is filled
    if (templateName) {
      newStep = 1;
    }
    // Step 2: Check if any standard has been added
    if (watchForm.standards && Object.keys(watchForm.standards).length > 0) {
      newStep = 2;
    }

    // Step 3: Check if all standards are configured,
    if (
      watchForm.standards &&
      allStandardsConfigured &&
      Object.keys(watchForm.standards).length > 0
    ) {
      newStep = 3;
    }

    setCurrentStep(newStep);
  }, [templateName, selectedStandards, allStandardsConfigured, watchForm]);

  return (
    <Card>
      <CardHeader title={title} />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <CippFormComponent
            type="textField"
            name="templateName"
            label="Template Name"
            formControl={formControl}
            placeholder="Enter a name for the template"
            fullWidth
          />
          <Divider />
          <CippFormTenantSelector
            allTenants={true}
            label="Included Tenants"
            formControl={formControl}
          />
          {watchForm.tenantFilter?.some((tenant) => tenant.value === "AllTenants") && (
            <>
              <Divider />
              <CippFormTenantSelector
                label="Excluded Tenants"
                name="excludedTenants"
                allTenants={false}
                formControl={formControl}
              />
            </>
          )}
          {updatedAt && (
            <Typography
              sx={{
                color: "text.secondary",
                display: "block",
              }}
              variant="caption"
            >
              Updated {updatedAt}
            </Typography>
          )}
        </Stack>
      </CardContent>
      <Divider />
      <CardContent>
        <Timeline
          sx={{
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              p: 0,
            },
          }}
        >
          {steps.map((step, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <StyledTimelineDot complete={index < currentStep} />
                {index < steps.length - 1 && <StyledTimelineConnector />}
              </TimelineSeparator>
              <StyledTimelineContent>{step}</StyledTimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
      <Divider />
      <ActionList>
        {actions.map((action, index) => (
          <ActionListItem
            key={index}
            icon={<SvgIcon fontSize="small">{action.icon}</SvgIcon>}
            label={action.label}
            onClick={action.handler}
          />
        ))}
      </ActionList>
    </Card>
  );
};

CippStandardsSideBar.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      handler: PropTypes.func.isRequired,
      icon: PropTypes.element.isRequired,
    })
  ).isRequired,
  updatedAt: PropTypes.string,
  formControl: PropTypes.object.isRequired,
};

export default CippStandardsSideBar;
