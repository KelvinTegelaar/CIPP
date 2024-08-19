import NextLink from 'next/link';
import Head from 'next/head';
import { Box, Button, Container, Typography } from '@mui/material';
import { paths } from '../paths';

const Page = () => (
  <>
    <Head>
      <title>
        Error: Not Found | Material Kit Pro
      </title>
    </Head>
    <Box
      sx={{
        backgroundColor: 'background.paper',
        flexGrow: 1
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          px: 5,
          py: 14,
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            '& img': {
              maxWidth: '100%'
            }
          }}
        >
          <img src="/assets/illustration-not-found.svg" />
        </Box>
        <Typography
          align="center"
          sx={{ my: 2 }}
          variant="h3"
        >
          Nothing here!
        </Typography>
        <Typography
          align="center"
          color="text.secondary"
          variant="body2"
        >
          The page requested does not exist.
        </Typography>
        <Button
          href={paths.index}
          component={NextLink}
          sx={{ mt: 2 }}
        >
          Take me home
        </Button>
      </Container>
    </Box>
  </>
);

export default Page;
