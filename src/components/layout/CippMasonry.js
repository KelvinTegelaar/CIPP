import React from 'react'
import PropTypes from 'prop-types'
import Masonry from 'react-masonry-component'
import { CContainer, CCol } from '@coreui/react'

export function CippMasonryItem({ size, children, className = null }) {
  const columnSizes = {
    card: {
      xs: 12,
      lg: 2,
      xl: 3,
    },
    single: {
      xs: 12,
      lg: 6,
      xl: 4,
    },
    double: {
      xs: 12,
      lg: 12,
      xl: 8,
    },
    triple: {
      xs: 12,
      lg: 12,
      xl: 12,
    },
    full: {
      xs: 12,
      lg: 12,
      xl: 12,
    },
    half: {
      xs: 12,
      lg: 6,
      xl: 6,
    },
  }

  return (
    <CCol {...columnSizes[size]} className={`cipp-masonry-item ${className ?? ''}`}>
      <div className="cipp-masonry-item-content">{children}</div>
    </CCol>
  )
}

CippMasonryItem.propTypes = {
  size: PropTypes.oneOf(['single', 'double', 'triple', 'full', 'half']),
  children: PropTypes.object,
  className: PropTypes.string,
}

export function CippMasonry({ columns = 3, children, className = null }) {
  const numberOfColumns = {
    1: {
      xs: 12,
      lg: 12,
      xl: 12,
    },
    2: {
      xs: 12,
      lg: 6,
      xl: 6,
    },
    3: {
      xs: 12,
      lg: 4,
      xl: 4,
    },
    4: {
      xs: 12,
      lg: 3,
      xl: 3,
    },
  }

  const CippMasonryOptions = {
    transitionDuration: 0,
    percentPosition: true,
    itemSelector: '.cipp-masonry-item',
    columnWidth: '.cipp-masonry-sizer',
  }

  return (
    <CContainer fluid={true} className="px-0">
      <Masonry
        className={`cipp-masonry row g-4 ${className ?? ''}`}
        options={CippMasonryOptions}
        enableResizableChildren={true}
      >
        <CCol className="cipp-masonry-sizer" {...numberOfColumns[columns]}></CCol>
        {children}
      </Masonry>
    </CContainer>
  )
}

CippMasonry.propTypes = {
  columns: PropTypes.oneOf([1, 2, 3]),
  children: PropTypes.array,
  className: PropTypes.string,
}
