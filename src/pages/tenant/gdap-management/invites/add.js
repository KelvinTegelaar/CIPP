import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import Grid from "@mui/material/Grid2";
import CippPageCard from "../../../../components/CippCards/CippPageCard";
import { ApiPostCall } from "../../../../api/ApiCall";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  CardActions,
  CardContent,
  CircularProgress,
  SvgIcon,
  Typography,
} from "@mui/material";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { CippPropertyList } from "../../../../components/CippComponents/CippPropertyList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Page = () => {
  const [inviteData, setInviteData] = useState([]);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      inviteCount: 1,
    },
  });

  const selectedTemplate = useWatch({ control: formControl.control, name: "roleMappings" });

  const addInvites = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["GDAPInvite"],
  });

  const handleSubmit = (values) => {
    const eachInvite = Array.from({ length: values.inviteCount }, (_, i) => ({
      roleMappings: values.roleMappings.value,
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
          ...invite.data.Invite,
          Message: invite.data.Message,
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
        <CardContent sx={{ my: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                name="roleMappings"
                label="Select GDAP Role Template"
                type="autoComplete"
                api={{
                  url: "/api/ExecGDAPRoleTemplate",
                  queryKey: "ListGDAPRoleTemplates",
                  dataKey: "Results",
                  labelField: (option) => option.TemplateId,
                  valueField: (option) => option.RoleMappings,
                }}
                multiple={false}
                creatable={false}
                required={true}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="number"
                name="inviteCount"
                label="Number of Invites to generate"
                formControl={formControl}
                required={true}
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
                          label: `Role: ${role.RoleName}`,
                          value: `Group: ${role.GroupName}`,
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
