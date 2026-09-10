import { useCallback, useState } from 'react';
import { CippIcons } from '../utils/icon-registry';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { Box, ButtonBase, Collapse, SvgIcon } from '@mui/material';

export const MobileNavItem = (props) => {
  const {
    active = false,
    children,
    depth = 0,
    disabled = false,
    external = false,
    icon,
    openImmediately = false,
    path,
    scope,
    title
  } = props;

  const isGlobal = scope === "global";
  const [open, setOpen] = useState(openImmediately);

  // same step as side-nav-item, nesting reads the same in both navs
  const indent = depth > 0 ? depth * 1.5 : 1;

  const handleToggle = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  // Branch

  if (children) {
    return (
      <li>
        <ButtonBase
          onClick={handleToggle}
          sx={{
            alignItems: 'center',
            borderRadius: 1,
            display: 'flex',
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: 14,
            fontWeight: 500,
            justifyContent: 'flex-start',
            px: `${indent * 6}px`,
            py: '12px',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            width: '100%'
          }}
        >
          <Box
            component="span"
            sx={{
              alignItems: 'center',
              color: 'neutral.400',
              display: 'inline-flex',
              flexGrow: 0,
              flexShrink: 0,
              height: 24,
              justifyContent: 'center',
              width: 24
            }}
          >
            {icon}
          </Box>
          <Box
            component="span"
            sx={{
              color: depth === 0 ? 'text.primary' : 'text.secondary',
              flexGrow: 1,
              fontSize: 14,
              mx: '12px',
              ...(active && {
                color: 'primary.main'
              })
            }}
          >
            {title}
          </Box>
          <SvgIcon sx={{ fontSize: 16 }}>
            {open ? <CippIcons.ChevronDownIcon /> : <CippIcons.ChevronRightIcon />}
          </SvgIcon>
        </ButtonBase>
        <Collapse
          in={open}
          sx={{ mt: 0.5 }}
        >
          {children}
        </Collapse>
      </li>
    );
  }

  // Leaf

  const linkProps = path
    ? external
      ? {
        component: 'a',
        href: path,
        target: '_blank'
      }
      : {
        component: NextLink,
        href: path
      }
    : {};

  return (
    <li>
      <ButtonBase
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          display: 'flex',
          fontFamily: (theme) => theme.typography.fontFamily,
          fontSize: 14,
          fontWeight: 500,
          justifyContent: 'flex-start',
          px: `${indent * 6}px`,
          py: '12px',
          textAlign: 'left',
          whiteSpace: 'nowrap',
          width: '100%'
        }}
        {...linkProps}>
        <Box
          component="span"
          sx={{
            alignItems: 'center',
            color: 'neutral.400',
            display: 'inline-flex',
            flexGrow: 0,
            flexShrink: 0,
            height: 24,
            justifyContent: 'center',
            width: 24
          }}
        >
          {icon}
        </Box>
        <Box
          component="span"
          sx={{
            color: depth === 0 ? 'text.primary' : 'text.secondary',
            flexGrow: 1,
            mx: '12px',
            ...(active && {
              color: 'primary.main'
            })
          }}
        >
          {title}
        </Box>
        {isGlobal && (
          <Box
            component="span"
            title="Global - not tied to selected tenant"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              flexShrink: 0,
              ml: 0.5,
            }}
          >
            <SvgIcon sx={{ color: "neutral.400", fontSize: 14 }}>
              <CippIcons.Language />
            </SvgIcon>
          </Box>
        )}
        {external && (
          <SvgIcon sx={{ fontSize: 18 }}>
            <CippIcons.ArrowTopRightOnSquareIcon />
          </SvgIcon>
        )}
      </ButtonBase>
    </li>
  );
};

MobileNavItem.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.node,
  depth: PropTypes.number,
  disabled: PropTypes.bool,
  external: PropTypes.bool,
  icon: PropTypes.node,
  openImmediately: PropTypes.bool,
  path: PropTypes.string,
  scope: PropTypes.string,
  title: PropTypes.string.isRequired
};
