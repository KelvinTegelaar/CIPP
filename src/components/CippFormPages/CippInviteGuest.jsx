import "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
const CippInviteUser = (props) => {
  const { formControl, userSettingsDefaults } = props;

  return (
    <Grid container spacing={2}>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Display Name"
          name="displayName"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="E-mail Address"
          name="mail"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 12, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Redirect URL"
          name="redirectUri"
          placeholder="Optional Redirect URL defaults to https://myapps.microsoft.com if blank"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 12, xs: 12 }}>
        <CippFormComponent
          type="switch"
          fullWidth
          label="Send invite via e-mail"
          name="sendInvite"
          formControl={formControl}
        />
      </Grid>
    </Grid>
  );
};

export default CippInviteUser;
