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
        py: 4,
      }}
    >
      <Stack spacing={2}>
        <div>
          <Tabs onChange={handleTabsChange} value={currentTab?.path} variant="scrollable">
            {tabOptions.map((option) => (
              <Tab key={option.path} label={option.label} value={option.path} />
            ))}
          </Tabs>
          <Divider />
        </div>
      </Stack>
      {children}
    </Box>
  );
};
