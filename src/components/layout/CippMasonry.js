import React from 'react'
import PropTypes from 'prop-types'
import Masonry from 'react-masonry-component'
import { CContainer, CCol } from '@coreui/react'

export function CippMasonryItem({ size, children, className = null }) {
  const columnSizes = {
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
  }

  return (
    <CCol {...columnSizes[size]} className={`cipp-masonry-item ${className ?? ''}`}>
      <div className="cipp-masonry-item-content">{children}</div>
    </CCol>
  )
}

CippMasonryItem.propTypes = {
  size: PropTypes.oneOf(['single', 'double', 'triple']),
  children: PropTypes.object,
  className: PropTypes.string,
}

export function CippMasonry({ children, className = null }) {
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
        <CCol className="cipp-masonry-sizer" xl={4} lg={6} xs={12}></CCol>
        {children}
      </Masonry>
    </CContainer>
  )
}

CippMasonry.propTypes = {
  children: PropTypes.array,
  className: PropTypes.string,
}
