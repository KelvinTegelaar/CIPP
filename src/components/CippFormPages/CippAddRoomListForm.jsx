import { InputAdornment, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { CippFormComponent } from "../CippComponents/CippFormComponent";
import { CippFormDomainSelector } from "../CippComponents/CippFormDomainSelector";

const CippAddRoomListForm = ({ formControl }) => {

  return (
    <Grid container spacing={2}>
      
      <Grid size={{ md: 12, xs: 12 }}>
        <CippFormComponent
          type="textField"
          formControl={formControl}
          name="displayName"
          label="Display Name"
          validators={{ required: "Display Name is required" }}
        />
      </Grid>

      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          formControl={formControl}
          name="username"
          label="Username"
          validators={{ 
            required: "Username is required",
            pattern: {
              value: /^[a-zA-Z0-9\-_\.]+$/,
              message: "Username can only contain letters, numbers, hyphens, underscores, and periods"
            }
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end">@</InputAdornment>,
          }}
        />
      </Grid>

      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormDomainSelector
          formControl={formControl}
          name="primDomain"
          label="Primary Domain"
          validators={{ required: "Domain is required" }}
        />
      </Grid>


    </Grid>
  );
};

export default CippAddRoomListForm; 