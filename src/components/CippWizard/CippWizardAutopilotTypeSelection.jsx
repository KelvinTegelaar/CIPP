import {
  Avatar,
  Card,
  CardContent,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { CippWizardStepButtons } from './CippWizardStepButtons'
import {
  IdentificationIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'

export const CippWizardAutopilotTypeSelection = (props) => {
  const { onNextStep, formControl, currentStep, onPreviousStep } = props

  const [selectedOption, setSelectedOption] = useState(() =>
    formControl.getValues('deploymentType')
  )

  // Register the deploymentType field in react-hook-form
  formControl.register('deploymentType', {
    required: true,
  })

  useEffect(() => {
    if (formControl.getValues('deploymentType')) {
      formControl.trigger('deploymentType')
    }
  }, [formControl])

  const handleOptionClick = (value) => {
    setSelectedOption(value)
    formControl.setValue('deploymentType', value)

    // Clear the other path's fields so switching back and forth doesn't submit
    // stale device data or keep its validation rules active
    if (value === 'autopilot') {
      formControl.unregister('devicePrepData')
      formControl.unregister('overwriteExisting')
    } else if (value === 'devicePrep') {
      formControl.unregister('autopilotData')
      formControl.unregister('GroupName')
    }

    formControl.trigger()
  }

  const options = [
    {
      value: 'autopilot',
      label: 'Windows Autopilot',
      description:
        'Upload devices to Windows Autopilot using their serial number, product ID or hardware hash.',
      icon: <RocketLaunchIcon />,
    },
    {
      value: 'devicePrep',
      label: 'Device Preparation (Corporate Identifiers)',
      description:
        'Upload corporate device identifiers (manufacturer, model and serial number) so devices are recognized as corporate-owned and can enroll using Windows Autopilot device preparation.',
      icon: <IdentificationIcon />,
    },
  ]

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">Select Deployment Type</Typography>
        <Typography color="text.secondary" variant="body2">
          Choose how you want to register the devices for this tenant.
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {options.map((option) => {
          const isSelected = selectedOption === option.value

          return (
            <Card
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                ...(isSelected && {
                  boxShadow: (theme) =>
                    `0px 0px 0px 2px ${theme.palette.primary.main}`,
                }),
                '&:hover': {
                  ...(isSelected ? {} : { boxShadow: 8 }),
                },
              }}
            >
              <CardContent>
                <Stack alignItems="center" direction="row" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      backgroundColor: 'background.default',
                      borderColor: 'divider',
                      borderStyle: 'solid',
                      borderWidth: 1,
                    }}
                  >
                    <SvgIcon fontSize="small">{option.icon}</SvgIcon>
                  </Avatar>
                  <Stack spacing={1}>
                    <Typography variant="h6">{option.label}</Typography>
                    <Typography color="text.secondary">
                      {option.description}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Stack>
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  )
}

export default CippWizardAutopilotTypeSelection
