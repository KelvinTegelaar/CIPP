import { useMemo } from "react";
import { CippIcons } from "../../../utils/icon-registry";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../layouts/index";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { CippHead } from "../../../components/CippComponents/CippHead";
import { CippTemplateCatalog } from "../../../components/CippComponents/CippTemplateCatalog";

const Page = () => {
  const router = useRouter();

  // The selected repositories live in the URL (?Repo=owner/repo) so source cards can
  // link here and filtered views are shareable.
  const selectedSources = useMemo(() => {
    const repoParam = router.query.Repo;
    if (!repoParam) return [];
    return Array.isArray(repoParam) ? repoParam : [repoParam];
  }, [router.query.Repo]);

  const setSelectedSources = (sources) => {
    const query = { ...router.query };
    if (Array.isArray(sources) && sources.length > 0) {
      query.Repo = sources;
    } else {
      delete query.Repo;
    }
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <CippHead title="Template Catalog" noTenant={true} />
      <Container maxWidth="xl">
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center"
            }}>
            <Typography variant="h4">Template Catalog</Typography>
            <Button
              variant="outlined"
              startIcon={<CippIcons.ArrowBack />}
              component={Link}
              href="/tools/community-repos"
            >
              Back to Sources
            </Button>
          </Stack>

          <Box sx={{ height: "78vh", display: "flex", flexDirection: "column" }}>
            {router.isReady && (
              <CippTemplateCatalog
                variant="page"
                selectedSources={selectedSources}
                onSelectedSourcesChange={setSelectedSources}
              />
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
