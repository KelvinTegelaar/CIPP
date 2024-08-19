import { useState } from 'react';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import { Box, Divider, Drawer, IconButton, Stack, SvgIcon } from '@mui/material';
import { Scrollbar } from '../../components/scrollbar';
import { items } from './config';
import { SideNavItem } from './side-nav-item';

const SIDE_NAV_WIDTH = 270;
const SIDE_NAV_COLLAPSED_WIDTH = 73; // icon size + padding + border right
const TOP_NAV_HEIGHT = 64;

const renderItems = ({ collapse = false, depth = 0, items, pathname }) => items.reduce((acc,
  item) => reduceChildRoutes({
  acc,
  collapse,
  depth,
  item,
  pathname
}), []);

const reduceChildRoutes = ({ acc, collapse, depth, item, pathname }) => {
  const checkPath = !!(item.path && pathname);
  const partialMatch = checkPath ? pathname.includes(item.path) : false;
  const exactMatch = checkPath ? pathname === item.path : false;

  if (item.items) {
    acc.push(
      <SideNavItem
        active={partialMatch}
        collapse={collapse}
        depth={depth}
        external={item.external}
        icon={item.icon}
        key={item.title}
        openImmediately={partialMatch}
        path={item.path}
        title={item.title}
      >
        <Stack
          component="ul"
          spacing={0.5}
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0
          }}
        >
          {renderItems({
            collapse,
            depth: depth + 1,
            items: item.items,
            pathname
          })}
        </Stack>
      </SideNavItem>
    );
  } else {
    acc.push(
      <SideNavItem
        active={exactMatch}
        collapse={collapse}
        depth={depth}
        external={item.external}
        icon={item.icon}
        key={item.title}
        path={item.path}
        title={item.title}
      />
    );
  }

  return acc;
};

export const SideNav = (props) => {
  const { onPin, pinned = false } = props;
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  const collapse = !(pinned || hovered);

  return (
    <Drawer
      open
      variant="permanent"
      PaperProps={{
        onMouseEnter: () => { setHovered(true); },
        onMouseLeave: () => { setHovered(false); },
        sx: {
          backgroundColor: 'background.default',
          height: `calc(100% - ${TOP_NAV_HEIGHT}px)`,
          overflowX: 'hidden',
          top: TOP_NAV_HEIGHT,
          transition: 'width 250ms ease-in-out',
          width: collapse ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH,
          zIndex: (theme) => theme.zIndex.appBar - 100
        }
      }}
    >
      <Scrollbar
        sx={{
          height: '100%',
          overflowX: 'hidden',
          '& .simplebar-content': {
            height: '100%'
          }
        }}
      >
        <Box
          component="nav"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            p: 2
          }}
        >
          <Box
            component="ul"
            sx={{
              flexGrow: 1,
              listStyle: 'none',
              m: 0,
              p: 0
            }}
          >
            {renderItems({
              collapse,
              depth: 0,
              items,
              pathname
            })}
          </Box>
          <Divider />
          <Box sx={{ pt: 1 }}>
            <IconButton onClick={onPin}>
              <SvgIcon fontSize="small">
                {pinned ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </SvgIcon>
            </IconButton>
          </Box>
        </Box>
      </Scrollbar>
    </Drawer>
  );
};

SideNav.propTypes = {
  onPin: PropTypes.func,
  pinned: PropTypes.bool
};
