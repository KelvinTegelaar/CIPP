import React from 'react'
import PropTypes from 'prop-types'
import { CListGroup, CListGroupItem } from '@coreui/react'
import { CippContentCard } from '../layout'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function ListGroupContentCard({
  title,
  icon,
  content,
  className = null,
  isFetching,
  error,
  errorMessage,
}) {
  let bodyClass = ''
  if (!isFetching && !error) {
    bodyClass = 'p-0'
  }
  return (
    <CippContentCard
      title={title}
      icon={icon}
      bodyClass={bodyClass}
      className="list-group-content-card"
    >
      {isFetching && <Skeleton count={5} />}
      {!isFetching && error && <>{errorMessage}</>}
      {!isFetching && !error && (
        <CListGroup flush classname={className ?? ''}>
          {content.map((item, index) => (
            <CListGroupItem
              key={index}
              className="d-flex justify-content-between align-items-center"
            >
              {item.heading ? <h6 className="w-50 mb-0">{item.heading}</h6> : null}
              {item.body ?? null}
              {item.link ? <a href={item.link}>{item.linkText ?? 'URL'}</a> : null}
            </CListGroupItem>
          ))}
        </CListGroup>
      )}
    </CippContentCard>
  )
}

ListGroupContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.object,
  content: PropTypes.arrayOf(
    PropTypes.shape({
      heading: PropTypes.string,
      body: PropTypes.any,
      link: PropTypes.string,
      linkText: PropTypes.string,
    }),
  ).isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
