import { Button, ButtonGroup, SvgIcon, Typography } from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { KeyIcon } from "@heroicons/react/24/outline";

const CippPasswordSettings = () => {
  const passwordSetting = ApiGetCall({
    url: "/api/ExecPasswordConfig?list=true",
    queryKey: "PasswordSettings",
  });

  const passwordChange = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: "PasswordSettings",
  });

  const handlePasswordTypeChange = (type) => {
    passwordChange.mutate({
      url: "/api/ExecPasswordConfig",
      data: { passwordType: type },
      queryKey: "PasswordSettingsPost",
    });
  };

  const PasswordTypeButtons = () => {
    const passwordTypes = ["Classic", "Correct-Battery-Horse"];
    return passwordTypes.map((type) => (
      <Button
        variant={passwordSetting?.data?.Results?.passwordType === type ? "contained" : "outlined"}
        color="primary"
        size="small"
        disabled={passwordChange.isPending || passwordSetting.isLoading}
        onClick={() => handlePasswordTypeChange(type)}
      >
        {type}
      </Button>
    ));
  };
  return (
    <CippButtonCard
      title="Password Style"
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      CardButton={
        <>
          <ButtonGroup disableElevation={true}>
            <Button disabled={true} color="primary">
              <SvgIcon fontSize="small">
                <KeyIcon />
              </SvgIcon>
            </Button>
            <PasswordTypeButtons />
          </ButtonGroup>
        </>
      }
    >
      <Typography variant="body2">
        Choose your password style. Classic passwords are a combination of letters and symbols.
        Correct-Battery-Horse style is a passphrase, which is easier to remember and more secure
        than classic passwords.
      </Typography>
    </CippButtonCard>
  );
};

export default CippPasswordSettings;
