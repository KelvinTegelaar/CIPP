import { useCallback, useState } from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import { Box, ButtonBase, Collapse, SvgIcon } from '@mui/material';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';

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
    title
  } = props;
  const [open, setOpen] = useState(openImmediately);

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
            px: '6px',
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
            {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
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
          px: '6px',
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
        {external && (
          <SvgIcon sx={{ fontSize: 18 }}>
            <ArrowTopRightOnSquareIcon />
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
  title: PropTypes.string.isRequired
};
