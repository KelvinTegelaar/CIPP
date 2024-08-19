import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  FormHelperText,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";

export const CippWizardOptionsList = (props) => {
  const { values: initialValues, onNextStep, options, title, subtext, valuesKey } = props;
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = useCallback((value) => {
    setValues((prevState) => ({
      ...prevState,
      [valuesKey]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!values[valuesKey]) {
        setError("Please select an option");
        return;
      }

      onNextStep?.(values);
    },
    [values, onNextStep]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h6">{title}</Typography>
          <Typography color="text.secondary" variant="body2">
            {subtext}
          </Typography>
        </Stack>
        <Stack spacing={2}>
          {options.map((option) => {
            const isSelected = values[valuesKey] === option.value;

            return (
              <Card
                key={option.value}
                onClick={() => handleChange(option.value)}
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
        {error && (
          <FormHelperText error sx={{ mt: 2 }}>
            {error}
          </FormHelperText>
        )}
        <Stack alignItems="center" direction="row" justifyContent="flex-end" spacing={2}>
          <Button size="large" type="submit" variant="contained">
            Next Step
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

CippWizardOptionsList.propTypes = {
  onNextStep: PropTypes.func,
  values: PropTypes.object.isRequired,
};
