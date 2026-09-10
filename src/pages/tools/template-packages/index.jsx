import { Box, Container, Stack, Typography } from '@mui/material'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { CippTemplatePackageManager } from '../../../components/CippComponents/CippTemplatePackageManager'

const Page = () => {
  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <CippHead title="Template Package Manager" noTenant={true} />
      <Container maxWidth="xl">
        <Stack spacing={2}>
          <Typography variant="h4">Template Package Manager</Typography>
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>
            Rename, delete, and manage the members of Conditional Access and Policy (Intune)
            template packages.
          </Typography>
          <CippTemplatePackageManager />
        </Stack>
      </Container>
    </Box>
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
