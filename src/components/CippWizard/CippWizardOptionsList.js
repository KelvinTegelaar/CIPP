import PropTypes from "prop-types";
import { Avatar, Button, Card, CardContent, Stack, SvgIcon, Typography } from "@mui/material";
import { useState } from "react";

export const CippWizardOptionsList = (props) => {
  const { onNextStep, options, title, subtext, valuesKey, formControl } = props;
  const [selectedOption, setSelectedOption] = useState(null);
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary" variant="body2">
          {subtext}
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {options.map((option) => {
          const isSelected = selectedOption === option.value;
          return (
            <Card
              key={option.value}
              onClick={() => {
                setSelectedOption(option.value);
                formControl.setValue("selectedOption", option.value);
              }}
              variant="outlined"
              sx={{
                cursor: "pointer",
                ...(isSelected && {
                  boxShadow: (theme) => `0px 0px 0px 2px ${theme.palette.primary.main}`,
                }),
                "&:hover": {
                  ...(!isSelected && {
                    boxShadow: 8,
                  }),
                },
              }}
            >
              <CardContent>
                <Stack alignItems="center" direction="row" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      backgroundColor: "background.default",
                      borderColor: "divider",
                      borderStyle: "solid",
                      borderWidth: 1,
                    }}
                  >
                    <SvgIcon fontSize="small">{option.icon}</SvgIcon>
                  </Avatar>
                  <Stack spacing={1}>
                    <Typography variant="h6">{option.label}</Typography>
                    <Typography color="text.secondary">{option.description}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
      <Stack alignItems="center" direction="row" justifyContent="flex-end" spacing={2}>
        <Button onClick={onNextStep} size="large" type="submit" variant="contained">
          Next Step
        </Button>
      </Stack>
    </Stack>
  );
};

CippWizardOptionsList.propTypes = {
  onNextStep: PropTypes.func,
  values: PropTypes.object.isRequired,
};
