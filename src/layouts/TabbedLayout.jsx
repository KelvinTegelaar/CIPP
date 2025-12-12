import { usePathname, useRouter } from "next/navigation";
import { Box, Divider, Stack, Tab, Tabs } from "@mui/material";

export const TabbedLayout = (props) => {
  const { tabOptions, children } = props;
  const router = useRouter();
  const pathname = usePathname();

  const handleTabsChange = (event, value) => {
    router.push(value);
  };

  const currentTab = tabOptions.find((option) => option.path === pathname);

  return (
    <Box
      sx={{
        flexGrow: 1,
        pb: 4,
        mt: -1,
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ ml: 3 }}>
          <Tabs
            onChange={handleTabsChange}
            value={currentTab?.path}
            variant="scrollable"
            sx={{
              "& .MuiTab-root:first-of-type": {
                ml: 1,
              },
            }}
          >
            {tabOptions.map((option) => (
              <Tab key={option.path} label={option.label} value={option.path} />
            ))}
          </Tabs>
          <Divider />
        </Box>
        {children}
      </Stack>
    </Box>
  );
};
