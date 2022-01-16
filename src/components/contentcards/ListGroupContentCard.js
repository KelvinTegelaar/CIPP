import React from 'react'
import PropTypes from 'prop-types'
import { CListGroup, CListGroupItem } from '@coreui/react'
import { CippContentCard } from '../layout'

export default function ListGroupContentCard({ title, icon, content, className = null }) {
  return (
    <CippContentCard title={title} icon={icon}>
      <CListGroup flush classname={className ?? ''}>
        {content.map((item, index) => (
          <CListGroupItem key={index} className="d-flex justify-content-between align-items-center">
            <h7>{item.heading}</h7>
            {item.body}
          </CListGroupItem>
        ))}
      </CListGroup>
    </CippContentCard>
  )
}

ListGroupContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.object,
  content: PropTypes.arrayOf(
    PropTypes.shape({
      heading: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
    }),
  ).isRequired,
  className: PropTypes.string,
}
