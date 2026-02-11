import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { Grid } from "@mui/system";
import CippPageCard from "../../../../components/CippCards/CippPageCard";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  CardActions,
  CardContent,
  CircularProgress,
  List,
  Link,
  ListItem,
  SvgIcon,
  Typography,
} from "@mui/material";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { CippPropertyList } from "../../../../components/CippComponents/CippPropertyList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NextLink from "next/link";

const Page = () => {
  const [inviteData, setInviteData] = useState([]);
  const [createDefaults, setCreateDefaults] = useState(false);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      inviteCount: 1,
    },
  });

  const createCippDefaults = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ListGDAPRoleTemplatesAutocomplete", "ListGDAPRoleTemplates"],
  });

  const templateList = ApiGetCall({
    url: "/api/ExecGDAPRoleTemplate",
    queryKey: "ListGDAPRoleTemplates-list",
  });
  const selectedTemplate = useWatch({ control: formControl.control, name: "roleMappings" });

  useEffect(() => {
    if (templateList?.data?.Results?.length === 0) {
      setCreateDefaults(true);
    } else {
      setCreateDefaults(false);
    }
  }, [templateList.isSuccess]);

  const addInvites = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["GDAPInvite"],
  });

  const handleSubmit = (values) => {
    formControl.trigger();
    if (!formControl.formState.isValid) return;
    const eachInvite = Array.from({ length: values.inviteCount }, (_, i) => ({
      roleMappings: values.roleMappings.value,
      Reference: values.Reference,
    }));

    addInvites.mutate({
      url: "/api/ExecGDAPInvite",
      bulkRequest: true,
      data: eachInvite,
    });
  };

  useEffect(() => {
    if (addInvites?.data?.length > 0) {
      setInviteData((prevData) => {
        const newData = addInvites.data.map((invite) => ({
          ...invite.Invite,
          Message: invite.Message,
        }));
        const mergedData = [...prevData, ...newData];
        const deduplicatedData = mergedData.filter(
          (item, index, self) => index === self.findIndex((t) => t.InviteUrl === item.InviteUrl)
        );
        return deduplicatedData;
      });
    }
  }, [addInvites?.data?.length]);

  return (
    <>
      <CippPageCard title="GDAP Invite" backButtonTitle="GDAP Invites">
        <CardContent sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  Use this form to generate invites for the selected GDAP Role Template. After
                  generating the invite, you will receive two URLs:
                </Typography>
                <List dense={true} sx={{ listStyleType: "disc", listStylePosition: "inside" }}>
                  <ListItem sx={{ display: "list-item" }}>
                    The Invite link is to send to a client or accept as a Global Administrator on
                    the customer tenant.
                  </ListItem>
                  <ListItem sx={{ display: "list-item" }}>
                    The Onboarding link is for a CIPP Administrator to complete the onboarding
                    process.
                  </ListItem>
                </List>
                <Typography variant="body2">
                  The onboarding process will also run on a nightly schedule. For automated
                  onboardings, please check out{" "}
                  <Link component={NextLink} href="/cipp/settings/partner-webhooks">
                    Automated Onboarding
                  </Link>{" "}
                  in Application Settings.
                </Typography>
              </Alert>
            </Grid>
            {createDefaults && (
              <>
                <Grid size={12}>
                  <Alert severity="warning">
                    The CIPP Defaults template is missing from the GDAP Role Templates. Create it
                    now?
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
                </Grid>
                <Grid size={12}>
                  <CippApiResults apiObject={createCippDefaults} />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                name="roleMappings"
                label="Select GDAP Role Template"
                type="autoComplete"
                api={{
                  url: "/api/ExecGDAPRoleTemplate",
                  queryKey: "ListGDAPRoleTemplatesAutocomplete",
                  dataKey: "Results",
                  labelField: (option) => option.TemplateId,
                  valueField: (option) => option.RoleMappings,
                }}
                multiple={false}
                creatable={false}
                required={true}
                validators={{
                  validate: (value) => {
                    if (!value) {
                      return "Please select a GDAP Role Template";
                    }
                    return true;
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <CippFormComponent
                type="number"
                name="inviteCount"
                label="Number of Invites to generate"
                formControl={formControl}
                required={true}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippFormComponent
                type="textField"
                name="Reference"
                label="Internal Reference Message"
                formControl={formControl}
                required={false}
              />
            </Grid>
            {selectedTemplate?.value && (
              <Grid size={12}>
                <Accordion variant="outlined">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Selected Role Mappings
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
              </Grid>
            )}
            {addInvites.isPending && (
              <Alert variant="outlined" severity="info">
                <Typography variant="body2">
                  <CircularProgress size={20} /> Generating invites...
                </Typography>
              </Alert>
            )}
            {inviteData?.length > 0 && (
              <>
                <Grid size={12}>
                  <CippDataTable
                    title="Invites"
                    data={inviteData}
                    noCard={true}
                    simpleColumns={["Message", "InviteUrl", "OnboardingUrl"]}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            disabled={!formControl.formState.isValid || addInvites.isPending}
            onClick={formControl.handleSubmit(handleSubmit)}
            startIcon={
              <SvgIcon fontSize="small">
                <PlusIcon />
              </SvgIcon>
            }
          >
            Add Invites
          </Button>
        </CardActions>
      </CippPageCard>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
