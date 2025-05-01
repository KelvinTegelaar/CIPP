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
import CloseIcon from "@mui/icons-material/Close";
import { useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import _ from "lodash";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import ReactTimeAgo from "react-time-ago";

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
        backgroundColor: complete ? "success.main" : "error.main",
        borderColor: complete ? "success.main" : "error.main",
        color: complete ? "success.contrastText" : "error.contrastText",
      }}
    >
      <SvgIcon fontSize="small">{complete ? <CheckIcon /> : <CloseIcon />}</SvgIcon>
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

const CippStandardsSideBar = ({
  title,
  selectedStandards,
  steps,
  actions,
  updatedAt,
  formControl,
  createDialog,
  edit,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [savedItem, setSavedItem] = useState(null);
  const dialogAfterEffect = (id) => {
    setSavedItem(id);
  };

  const watchForm = useWatch({ control: formControl.control });

  useEffect(() => {
    const stepsStatus = {
      step1: !!watchForm.templateName,
      step2: watchForm.tenantFilter && watchForm.tenantFilter.length > 0,
      step3: Object.keys(selectedStandards).length > 0,
      step4:
        watchForm.standards &&
        Object.keys(selectedStandards).length > 0 &&
        Object.keys(selectedStandards).every((standardName) => {
          const standardValues = _.get(watchForm, `${standardName}`, {}) ?? {};
          return standardValues?.action;
        }),
    };

    const completedSteps = Object.values(stepsStatus).filter(Boolean).length;
    setCurrentStep(completedSteps);
  }, [selectedStandards, watchForm]);

  const stepsStatus = {
    step1: !!watchForm.templateName,
    step2: watchForm.tenantFilter && watchForm.tenantFilter.length > 0,
    step3: Object.keys(selectedStandards).length > 0,
    step4:
      watchForm.standards &&
      Object.keys(selectedStandards).length > 0 &&
      Object.keys(selectedStandards).every((standardName) => {
        const standardValues = _.get(watchForm, `${standardName}`, {});
        return standardValues?.action;
      }),
  };
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
          <CippFormComponent
            type="richText"
            name="description"
            label="Description"
            formControl={formControl}
            placeholder="Enter a description for the template"
            fullWidth
          />
          <Divider />
          <CippFormTenantSelector
            allTenants={true}
            label="Included Tenants"
            formControl={formControl}
            required={true}
            includeGroups={true}
          />
          {watchForm.tenantFilter?.some((tenant) => tenant.value === "AllTenants") && (
            <>
              <Divider />
              <CippFormTenantSelector
                label="Excluded Tenants"
                name="excludedTenants"
                allTenants={false}
                formControl={formControl}
                includeGroups={true}
              />
            </>
          )}
          {updatedAt.date && (
            <>
              <Typography
                sx={{
                  color: "text.secondary",
                  display: "block",
                }}
                variant="caption"
              >
                Last Updated <ReactTimeAgo date={updatedAt?.date} /> by {updatedAt?.user}
              </Typography>
            </>
          )}
          <CippFormComponent
            type="switch"
            name="runManually"
            label="Do not run on schedule"
            formControl={formControl}
            placeholder="Enter a name for the template"
            fullWidth
          />
          <Typography
            sx={{
              color: "text.secondary",
            }}
            variant="caption"
          >
            This setting allows you to create this template and run it only by using "Run Now".
          </Typography>
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
                <StyledTimelineDot complete={stepsStatus[`step${index + 1}`]} />
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
            disabled={
              !(watchForm.tenantFilter && watchForm.tenantFilter.length > 0) || currentStep < 3
            }
          />
        ))}
      </ActionList>
      <Divider />
      <CippApiDialog
        dialogAfterEffect={(data) => dialogAfterEffect(data.id)}
        createDialog={createDialog}
        title="Add Standard"
        api={{
          confirmText: watchForm.runManually
            ? "Are you sure you want to apply this standard? This template has been set to never run on a schedule. After saving the template you will have to run it manually."
            : "Are you sure you want to apply this standard? This will apply the template and run every 3 hours.",
          url: "/api/AddStandardsTemplate",
          type: "POST",
          replacementBehaviour: "removeNulls",
          data: {
            tenantFilter: "tenantFilter",
            excludedTenants: "excludedTenants",
            description: "description",
            templateName: "templateName",
            standards: "standards",
            ...(edit ? { GUID: "GUID" } : {}),
            ...(savedItem ? { GUID: savedItem } : {}),
            runManually: "runManually",
          },
        }}
        row={formControl.getValues()}
        formControl={formControl}
        relatedQueryKeys={[
          "listStandardTemplates",
          "listStandards",
          `listStandardTemplates-${watchForm.GUID}`,
        ]}
      />
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
