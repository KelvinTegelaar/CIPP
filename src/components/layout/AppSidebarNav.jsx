import React from 'react'
import { NavLink as BaseNavLink, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import { CBadge } from '@coreui/react'
import { abortRequestSafe } from 'src/store/api/baseQuery'

const NavLink = React.forwardRef(({ activeClassName, activeStyle, ...props }, ref) => {
  return (
    <BaseNavLink
      ref={ref}
      {...props}
      className={({ isActive }) =>
        [props.className, isActive ? activeClassName : null].filter(Boolean).join(' ')
      }
      style={({ isActive }) => ({
        ...props.style,
        ...(isActive ? activeStyle : null),
      })}
    />
  )
})

NavLink.displayName = 'NavLink'
NavLink.propTypes = {
  activeClassName: PropTypes.string,
  activeStyle: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object,
}

export const AppSidebarNav = ({ items }) => {
  const location = useLocation()
  const navLink = (name, icon, badge) => {
    return (
      <>
        {icon && icon}
        {name && name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item, index) => {
    const { component, name, badge, icon, ...rest } = item
    const Component = component
    const navItemKey = `${item.name.toLowerCase().replace(' ', '-')}_${index}`
    return (
      <Component
        onClick={() => abortRequestSafe('default', 'Route Change')}
        {...(rest.to &&
          !rest.items && {
            component: NavLink,
            activeClassName: 'active',
          })}
        key={navItemKey}
        {...rest}
      >
        {navLink(name, icon, badge)}
      </Component>
    )
  }
  const navGroup = (item, index) => {
    const { component, name, icon, to, ...rest } = item
    const Component = component
    const navGroupKey = `${item.name.toLowerCase().replace(' ', '-')}_${index}`
    const navGroupIdx = `${item.section.toLowerCase().replace(' ', '-')}_${item.name
      .toLowerCase()
      .replace(' ', '-')}`
    return (
      <Component
        idx={navGroupIdx}
        key={navGroupKey}
        toggler={navLink(name, icon)}
        visible={location.pathname.startsWith(to)}
        {...rest}
      >
        {item.items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index),
        )}
      </Component>
    )
  }

  return (
    <React.Fragment>
      {items &&
        items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </React.Fragment>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
