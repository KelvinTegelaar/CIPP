import { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import {
  Box,
  Button,
  Container,
  Divider,
  Skeleton,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { productsApi } from '../../api/products';
import { ActionsMenu } from '../../components/actions-menu';
import { ConfirmationDialog } from '../../components/confirmation-dialog';
import { ResourceError } from '../../components/resource-error';
import { ResourceUnavailable } from '../../components/resource-unavailable';
import { useDialog } from '../../hooks/use-dialog';
import { useMounted } from '../../hooks/use-mounted';
import { paths } from '../../paths';

const tabOptions = [
  {
    label: 'Summary',
    path: paths.dashboard.products.details.index
  },
  {
    label: 'Inventory',
    path: paths.dashboard.products.details.inventory
  },
  {
    label: 'Insights',
    path: paths.dashboard.products.details.insights
  }
];

const useProductStore = () => {
  const isMounted = useMounted();
  const [state, setState] = useState({ isLoading: true });

  const handleProductGet = useCallback(async () => {
    setState({ isLoading: true });

    try {
      const response = await productsApi.getProduct();

      if (isMounted()) {
        setState({ data: response });
      }
    } catch (err) {
      console.error(err);

      if (isMounted()) {
        setState({ error: 'Something went wrong' });
      }
    }
  }, [isMounted]);

  useEffect(() => {
      handleProductGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return {
    state
  };
};

const getResourcesState = (storeState) => {
  if (storeState.isLoading) {
    return 'loading';
  }

  if (storeState.error) {
    return 'error';
  }

  return storeState.data ? 'available' : 'unavailable';
};

export const Layout = (props) => {
  const { children } = props;
  const router = useRouter();
  const pathname = usePathname();
  const productStore = useProductStore();
  const discontinueDialog = useDialog();
  const archiveDialog = useDialog();

  const handleInvoiceSend = useCallback(() => {
    toast.error('This action is not available on demo');
  }, []);

  const handleDiscontinue = useCallback(() => {
    discontinueDialog.handleClose();
    toast.error('This action is not available on demo');
  }, [discontinueDialog]);

  const handleArchive = useCallback(() => {
    archiveDialog.handleClose();
    toast.error('This action is not available on demo');
  }, [archiveDialog]);

  const handleTabsChange = useCallback((event, value) => {
    router.push(value);
  }, [router]);

  const currentTab = tabOptions.find((option) => option.path === pathname);

  const resourcesState = getResourcesState(productStore.state);

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          py: 4
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          {resourcesState === 'loading' && (
            <div>
              <Skeleton height={42} />
              <Skeleton />
              <Skeleton />
            </div>
          )}
          {resourcesState === 'error' && (
            <ResourceError message="Something went wrong" />
          )}
          {resourcesState === 'unavailable' && (
            <ResourceUnavailable message="Resources are not available" />
          )}
          {resourcesState === 'available' && (
            <Stack spacing={4}>
              <Stack spacing={2}>
                <div>
                  <Button
                    color="inherit"
                    component={NextLink}
                    href={paths.dashboard.products.index}
                    startIcon={(
                      <SvgIcon fontSize="small">
                        <ArrowLeftIcon />
                      </SvgIcon>
                    )}
                    variant="text"
                  >
                    Products
                  </Button>
                </div>
                <Stack
                  alignItems="flex-start"
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack spacing={1}>
                    <Typography variant="h4">
                      Product
                    </Typography>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <Box
                        sx={{
                          backgroundColor: 'success.main',
                          borderRadius: '50%',
                          height: 8,
                          width: 8
                        }}
                      />
                      <Typography
                        color="success.main"
                        variant="body2"
                      >
                        Published
                      </Typography>
                    </Stack>
                  </Stack>
                  <ActionsMenu
                    actions={[
                      {
                        label: 'Send Invoice to Customer',
                        handler: handleInvoiceSend
                      },
                      {
                        label: 'Discontinue Product',
                        handler: discontinueDialog.handleOpen
                      },
                      {
                        label: 'Archive Product',
                        handler: archiveDialog.handleOpen
                      }
                    ]}
                  />
                </Stack>
                <div>
                  <Tabs
                    onChange={handleTabsChange}
                    value={currentTab?.path}
                    variant="scrollable"
                  >
                    {tabOptions.map((option) => (
                      <Tab
                        key={option.path}
                        label={option.label}
                        value={option.path}
                      />
                    ))}
                  </Tabs>
                  <Divider />
                </div>
              </Stack>
              {children}
            </Stack>
          )}
        </Container>
      </Box>
      <ConfirmationDialog
        message="Are you sure you want to discontinue this product? This can't be undone."
        onCancel={discontinueDialog.handleClose}
        onConfirm={handleDiscontinue}
        open={discontinueDialog.open}
        title="Discontinue Product"
        variant="error"
      />
      <ConfirmationDialog
        message="Are you sure you want to archive this order? This can't be undone."
        onCancel={archiveDialog.handleClose}
        onConfirm={handleArchive}
        open={archiveDialog.open}
        title="Archive Product"
        variant="error"
      />
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node
};
