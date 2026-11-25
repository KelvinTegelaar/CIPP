import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grow,
  Stack,
  Step,
  StepLabel,
  Stepper,
  SvgIcon,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Grid } from '@mui/system'
import Link from 'next/link'
import { CippIcons } from '../../utils/icon-registry'
import { useSettings } from '../../hooks/use-settings'
import { useIsMobileLayout } from '../../hooks/use-breakpoint'
import extensions from '../../data/Extensions.json'

const benefits = [
  {
    icon: <CippIcons.Update />,
    title: 'We keep them up to date',
    text: 'Microsoft keeps changing settings and adding new ones. We keep track of that and update our baselines when something changes. You decide when to take an update.',
  },
  {
    icon: <CippIcons.Tune />,
    title: 'A custom baseline for your MSP',
    text: 'Want a baseline that fits the way your MSP works? Tell us what you expect and which exceptions you need. CIPP takes a snapshot of one of your tenants as a starting point, and one of our engineers builds a custom baseline you can use across your clients. It is delivered to your CIPP for you to review.',
  },
  {
    icon: <CippIcons.ManageSearch />,
    title: 'Recommendations for every tenant',
    text: 'Scan a tenant and see where it differs from what we recommend. Pick what you want and CIPP builds a baseline from it.',
  },
  {
    icon: <CippIcons.VerifiedUser />,
    title: 'Nothing changes without you',
    text: "A managed baseline does nothing until you have reviewed it and chosen the tenants. Domains, email addresses, IDs and the tenant's name are removed from the snapshot before it leaves your CIPP, and you can read exactly what was sent.",
  },
]

const steps = [
  'Turn on the integration and enter your key.',
  'Add one of our baselines, or request a custom baseline for your MSP.',
  'Review it in the baseline editor and choose the tenants.',
  'Use Align or Merge when you want our latest version.',
]

export const CippManagedBaselinesUpgrade = () => {
  const settings = useSettings()
  const isMobile = useIsMobileLayout()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const extension = extensions.find(
    (entry) => entry.id === 'CyberDrainManagedBaselines'
  )
  const upgradeUrl = extension?.upgradeUrl
  const logo =
    settings.currentTheme?.value === 'dark' && extension?.logoDark
      ? extension.logoDark
      : extension?.logo

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(
              theme.palette.primary.main,
              0.03
            )} 65%), ${theme.palette.background.paper}`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          <Stack spacing={3} sx={{ maxWidth: 760 }}>
            {logo && (
              <Box
                component="img"
                src={logo}
                alt="CyberDrain Managed Baselines"
                sx={{ height: 48, width: 'auto', alignSelf: 'flex-start' }}
              />
            )}
            <Typography variant="h3">
              Let CyberDrain manage your baselines
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Building and maintaining baselines for every client is a lot of
              work. With Managed Baselines our engineers do that work for you.
              Use the baselines we publish, or have us build a custom baseline
              for your MSP.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Tooltip title={upgradeUrl ? '' : 'Coming soon'}>
                <span>
                  <Button
                    variant="contained"
                    size="large"
                    href={upgradeUrl || undefined}
                    target="_blank"
                    rel="noreferrer"
                    disabled={!upgradeUrl}
                    startIcon={<CippIcons.RocketLaunch />}
                  >
                    Upgrade to Managed Baselines
                  </Button>
                </span>
              </Tooltip>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/cipp/integrations/configure?id=CyberDrainManagedBaselines"
                startIcon={<CippIcons.Key />}
              >
                I already have a key
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {benefits.map((benefit, index) => (
          <Grid key={benefit.title} size={{ xs: 12, md: 6 }}>
            <Grow
              in
              appear={!reduceMotion}
              timeout={reduceMotion ? 0 : 500 + index * 250}
            >
              <Card
                sx={{
                  height: '100%',
                  transition: reduceMotion
                    ? 'none'
                    : 'box-shadow 0.2s ease-in-out',
                  '&:hover': { boxShadow: 8 },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        backgroundColor: 'background.default',
                        borderColor: 'divider',
                        borderStyle: 'solid',
                        borderWidth: 1,
                      }}
                    >
                      <SvgIcon fontSize="small" color="primary">
                        {benefit.icon}
                      </SvgIcon>
                    </Avatar>
                    <Typography variant="h6">{benefit.title}</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {benefit.text}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardHeader title="How it works" />
        <Divider />
        <CardContent>
          <Stepper
            alternativeLabel={!isMobile}
            orientation={isMobile ? 'vertical' : 'horizontal'}
          >
            {steps.map((label) => (
              <Step key={label} active>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', textAlign: 'center' }}
      >
        Managed Baselines is a paid service from CyberDrain. Community baselines
        and the rest of CIPP stay free and open source.
      </Typography>
    </Stack>
  )
}

export default CippManagedBaselinesUpgrade
