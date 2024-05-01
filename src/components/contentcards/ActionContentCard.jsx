import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippContentCard } from '../layout'
import { CButton, CButtonGroup, CSpinner } from '@coreui/react'

export default function ActionContentCard({
  title,
  icon,
  content,
  className = null,
  isFetching,
  error,
  errorMessage,
}) {
  return (
    <CippContentCard
      title={title}
      icon={icon}
      className={`action-content-card ${className ?? ''} `}
    >
      {isFetching && <CSpinner />}
      {!isFetching && error && <>{errorMessage}</>}
      {!isFetching && !error && (
        <CButtonGroup vertical role="group" variant="outline">
          {content.map((item, index) => (
            <CButton
              href={item.link}
              target={item.target ?? ''}
              onClick={item.onClick}
              key={index}
              color={item.color ?? 'actioncard'}
              variant="ghost"
              className="text-start"
            >
              <FontAwesomeIcon icon={item.icon} className="me-2" fixedWidth />
              {item.label}
            </CButton>
          ))}
        </CButtonGroup>
      )}
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
      icon: PropTypes.oneOfType([PropTypes.element, PropTypes.object, PropTypes.string]),
      color: PropTypes.string,
      target: PropTypes.string,
      onClick: PropTypes.func,
    }),
  ).isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
