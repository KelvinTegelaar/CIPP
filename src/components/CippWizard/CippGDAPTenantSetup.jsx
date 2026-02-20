import { useEffect, useState } from "react";
import {
  Stack,
  Box,
  Typography,
  Link,
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  SvgIcon,
} from "@mui/material";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiPostCall, ApiGetCall } from "../../api/ApiCall";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useWatch } from "react-hook-form";
import { CippPropertyList } from "../CippComponents/CippPropertyList";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PlusIcon } from "@heroicons/react/24/outline";

export const CippGDAPTenantSetup = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props;
  const [inviteGenerated, setInviteGenerated] = useState(false);
  const [inviteAccepted, setInviteAccepted] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [createDefaults, setCreateDefaults] = useState(false);

  formControl.register("GDAPInviteAccepted", {
    required: true,
  });

  formControl.register("GDAPRelationshipId", {
    required: true,
  });

  const createCippDefaults = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ListGDAPRoleTemplatesAutocomplete-wizard", "ListGDAPRoleTemplates-wizard"],
  });

  const selectedTemplate = useWatch({
    control: formControl.control,
    name: "gdapTemplate",
  });

  const templateList = ApiGetCall({
    url: "/api/ExecGDAPRoleTemplate",
    queryKey: "ListGDAPRoleTemplates-wizard",
  });

  const generateInvite = ApiPostCall({
    urlFromData: true,
  });

  useEffect(() => {
    if (templateList?.data?.Results?.length === 0) {
      setCreateDefaults(true);
    } else {
      setCreateDefaults(false);
    }
  }, [templateList.isSuccess, templateList.data]);

  const handleGenerateInvite = () => {
    if (!selectedTemplate) {
      return;
    }

    const inviteData = {
      roleMappings: selectedTemplate.value,
      Reference: "Created via Setup Wizard",
    };

    generateInvite.mutate({
      url: "/api/ExecGDAPInvite",
      data: inviteData,
    });
  };

  useEffect(() => {
    if (generateInvite.isSuccess && generateInvite.data) {
      const invite = generateInvite.data?.data?.Invite || generateInvite.data?.Invite;
      if (invite) {
        setInviteGenerated(true);
        setInviteData(invite);
        // Store the relationship ID for the next step
        formControl.setValue("GDAPRelationshipId", invite.RowKey);
      }
    }
  }, [generateInvite.isSuccess, generateInvite.data, formControl]);

  useEffect(() => {
    formControl.setValue("GDAPInviteAccepted", inviteAccepted);
    formControl.trigger("GDAPInviteAccepted");
  }, [inviteAccepted, formControl]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>
          GDAP Tenant Setup
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          This process will help you set up a new GDAP relationship with a customer tenant. You'll
          generate an invite that the customer needs to accept before completing onboarding. For
          more information about GDAP setup, visit the{" "}
          <Link href="https://docs.cipp.app/setup/gdap" target="_blank" rel="noopener noreferrer">
            GDAP documentation
          </Link>
          .
        </Typography>
      </Box>

      {!inviteGenerated && (
        <>
          {createDefaults && (
            <Box>
              <Alert severity="warning">
                The CIPP Defaults template is missing from the GDAP Role Templates. Create it now?
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    createCippDefaults.mutate({
                      url: "/api/ExecAddGDAPRole",
                      data: { TemplateId: "CIPP Defaults" },
                    })
                  }
                  sx={{ ml: 2 }}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }
                >
                  Create CIPP Defaults
                </Button>
              </Alert>
              <CippApiResults apiObject={createCippDefaults} />
            </Box>
          )}
          <Box>
            <CippFormComponent
              formControl={formControl}
              name="gdapTemplate"
              label="Select GDAP Role Template"
              type="autoComplete"
              api={{
                url: "/api/ExecGDAPRoleTemplate",
                queryKey: "ListGDAPRoleTemplatesAutocomplete-wizard",
                dataKey: "Results",
                labelField: (option) => option.TemplateId,
                valueField: (option) => option.RoleMappings,
              }}
              multiple={false}
              creatable={false}
              required={true}
            />
          </Box>

          {selectedTemplate?.value && (
            <Box>
              <Accordion variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Selected Role Mappings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <CippPropertyList
                    layout="double"
                    showDivider={false}
                    propertyItems={selectedTemplate.value.map((role) => {
                      return {
                        label: `${role.RoleName}`,
                        value: `Mapped to '${role.GroupName}'`,
                      };
                    })}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          )}

          <Box>
            <Button
              variant="contained"
              onClick={handleGenerateInvite}
              disabled={!selectedTemplate || generateInvite.isPending}
            >
              {generateInvite.isPending ? "Generating Invite..." : "Generate Invite URL"}
            </Button>
          </Box>

          <CippApiResults apiObject={generateInvite} />
        </>
      )}

      {inviteGenerated && inviteData && (
        <>
          <Alert severity="success">
            <Typography variant="body2">
              Invite generated successfully! Send the invite link below to your customer's Global
              Administrator to accept.
            </Typography>
          </Alert>

          <Box>
            <Accordion variant="outlined" defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Invite Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CippPropertyList
                  layout="single"
                  showDivider={true}
                  propertyItems={[
                    {
                      label: "Relationship ID",
                      value: inviteData.RowKey,
                    },
                    {
                      label: "Invite URL",
                      value: (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Link
                            href={inviteData.InviteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {inviteData.InviteUrl}
                          </Link>
                          <CippCopyToClipBoard text={inviteData.InviteUrl} type="button" />
                        </Box>
                      ),
                    },
                    {
                      label: "Reference",
                      value: inviteData.Reference || "N/A",
                    },
                  ]}
                />
              </AccordionDetails>
            </Accordion>
          </Box>

          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                The customer must accept this invite as a Global Administrator before you can
                proceed with onboarding.
              </Typography>
            </Alert>
            <FormControlLabel
              control={
                <Checkbox
                  checked={inviteAccepted}
                  onChange={(e) => setInviteAccepted(e.target.checked)}
                />
              }
              label="This invite has been accepted in the customer tenant, and we're ready to proceed with onboarding."
            />
          </Box>
        </>
      )}

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        noSubmitButton={true}
        nextButtonDisabled={!inviteAccepted}
      />
    </Stack>
  );
};

export default CippGDAPTenantSetup;
