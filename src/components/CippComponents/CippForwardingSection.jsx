import { Stack, Button } from "@mui/material";
import CippFormComponent from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import { Grid } from "@mui/system";
import { CippApiResults } from "./CippApiResults";
import { getCippValidator } from "/src/utils/get-cipp-validator";

const CippForwardingSection = ({ formControl, usersList, contactsList, postRequest, handleSubmit }) => {

  const internalAddressOptions = [
    // Add users
    ...(usersList?.data?.Results?.map((user) => ({
      value: user.userPrincipalName,
      label: `${user.displayName} (${user.userPrincipalName}) - User`,
    })) || []),
    // Add contacts
    ...(contactsList?.data?.Results?.map((contact) => ({
      value: contact.mail || contact.emailAddress,
      label: `${contact.displayName} (${contact.mail || contact.emailAddress}) - Contact`,
    })) || [])
  ];

  return (
    <Stack spacing={2}>
      <CippFormComponent
        type="radio"
        name="forwarding.forwardOption"
        formControl={formControl}
        options={[
          { label: "Forward to Internal Address", value: "internalAddress" },
          {
            label: "Forward to External Address (Tenant must allow this)",
            value: "ExternalAddress",
          },
          { label: "Disable Email Forwarding", value: "disabled" },
        ]}
      />

      <CippFormCondition
        formControl={formControl}
        field="forwarding.forwardOption"
        compareType="is"
        compareValue="internalAddress"
      >
        <CippFormComponent
          type="autoComplete"
          label="Select User"
          name="forwarding.ForwardInternal"
          multiple={false}
          options={internalAddressOptions}
          formControl={formControl}
          creatable={false}
        />
      </CippFormCondition>

      <CippFormCondition
        formControl={formControl}
        field="forwarding.forwardOption"
        compareType="is"
        compareValue="ExternalAddress"
      >
        <CippFormComponent
          type="textField"
          label="External Email Address"
          name="forwarding.ForwardExternal"
          formControl={formControl}
          validators={{
            required: "Email is required",
            validate: (value) => getCippValidator(value, "email"),
          }}
        />
      </CippFormCondition>

      <CippFormComponent
        type="switch"
        label="Keep a Copy of the Forwarded Mail in the Source Mailbox"
        name="forwarding.KeepCopy"
        formControl={formControl}
      />
      
      <Grid size={12}>
        <CippApiResults apiObject={postRequest} />
      </Grid>
      
      <Grid>
        <Button
          onClick={() => handleSubmit("forwarding")}
          variant="contained"
          disabled={!formControl.formState.isValid || postRequest.isPending}
        >
          Submit
        </Button>
      </Grid>
    </Stack>
  );
};

export default CippForwardingSection;
