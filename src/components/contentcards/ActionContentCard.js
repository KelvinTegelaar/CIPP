import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippContentCard } from '../layout'

export default function ActionContentCard({ title, icon, content, className = null }) {
  return (
    <CippContentCard title={title} icon={icon} className={className ?? ''}>
      {content.map((item, index) => (
        <Link
          className={item.className ?? ''}
          href={item.link}
          target={item.target ?? ''}
          key={index}
        >
          <FontAwesomeIcon icon={item.icon} className="me-2" />
          {item.label}
        </Link>
      ))}
    </CippContentCard>
  )
}

ActionContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.object,
  content: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      icon: PropTypes.element,
      color: PropTypes.string,
      target: PropTypes.string,
    }),
  ).isRequired,
  className: PropTypes.string,
}
