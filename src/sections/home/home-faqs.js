import { Box, Container, Link, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { HomeFaqCard } from './home-faq-card';

export const HomeFaqs = () => (
  <Box sx={{ py: '120px' }}>
    <Container maxWidth="xl">
      <Typography
        align="center"
        sx={{ mb: 8 }}
        variant="h2"
      >
        Frequently asked questions
      </Typography>
      <Grid
        container
        spacing={3}
      >
        <Grid
          xs={12}
          md={4}
        >
          <Stack spacing={3}>
            <HomeFaqCard question="Do you have a free demo to review the code before purchasing?">
              Yes, you can check out our open source
              {' '}
              <Link
                href="https://github.com/devias-io/carpatin-dashboard-free"
                rel="nofollow noreferrer noopener"
                target="_blank"
                underline="none"
                variant="inherit"
              >
                dashboard template
              </Link>
              {' '}
              which should give you an overview of the code quality and folder structure.
              <br />
              <br />
              Keep in mind that some aspects may differ from the Carpatin
              - Admin Dashboard Paid version.
            </HomeFaqCard>
            <HomeFaqCard question="How many projects can I build with Carpatin - Admin Dashboard?">
              The license is per project (domain), but if you intend to develop an unknown number of
              projects feel free to
              {' '}
              <Link
                href="https://devias.io/contact"
                target="_blank"
                underline="none"
                variant="inherit"
              >
                contact us
              </Link>
              {' '}
              and we&apos;ll find a solution.
            </HomeFaqCard>
          </Stack>
        </Grid>
        <Grid
          xs={12}
          md={4}
        >
          <Stack spacing={3}>
            <HomeFaqCard question="Can I use this template in commercial projects like a SaaS?">
              Absolutely! If you intend to charge users for using your product Extended license is
              created specifically for this context.
            </HomeFaqCard>
            <HomeFaqCard question="What browsers does Carpatin - Admin Dashboard support?">
              The components in Material-UI are designed to work in the latest, stable releases of
              all major browsers, including Chrome, Firefox, Safari, and Edge.
              <br />
              <br />
              We don&apos;t support Internet Explorer 11.
            </HomeFaqCard>
          </Stack>
        </Grid>
        <Grid
          xs={12}
          md={4}
        >
          <Stack spacing={3}>
            <HomeFaqCard question="For what kind of projects is the Standard license intended?">
              The Standard license is designed for internal applications in which staff will access
              the application.
              <br />
              <br />
              An example could be the back-office dashboard of a public-facing e-commerce website in
              which staff would sign in and manage inventory, customers, etc.
            </HomeFaqCard>
            <HomeFaqCard question="Does Carpatin - Admin Dashboard include Figma, Sketch, or Adobe XD files?">
              The Standard Plus license includes an expertly designed complete Figma kit that takes
              advantage of modern Figma features like Variants and Auto Layout.
              <br />
              <br />
              Should you need a sample of the Figma file, you can
              <Link
                href="https://www.figma.com/file/4XoBSB4Sl2fSpD9OebSsr3/Carpatin---Admin-Dashboard-v2.0?node-id=7435%3A43141"
                rel="nofollow noreferrer noopener"
                target="_blank"
                underline="none"
                variant="inherit"
              >
                {' '}
                download a free preview
                {' '}
              </Link>
              from the Figma community.
              <br />
              <br />
              We don&apos;t include assets for other design tools such as Sketch or Adobe XD.
            </HomeFaqCard>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  </Box>
);
