import React from 'react'
import PropTypes from 'prop-types'
import { CListGroup, CListGroupItem } from '@coreui/react'
import { CippContentCard } from '../layout'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { CellTip } from 'src/components/tables'

export default function ListGroupContentCard({
  title,
  icon,
  content,
  className = null,
  isFetching,
  error,
  errorMessage,
  tooltip = false,
}) {
  let bodyClass = ''
  if (!isFetching && !error) {
    bodyClass = 'p-0'
  }
  function bodycontent(item) {
    // Wrapping fancy objects with tooltip has bad result so we ensure we only do ones
    // that produce legible results
    if (
      tooltip &&
      (typeof item.body === 'string' ||
        typeof item.body === 'number' ||
        typeof item.body === 'boolean' ||
        typeof item.body === 'bigint')
    ) {
      return CellTip(item.body, true)
    }

    return item.body
  }
  function classcontent(item) {
    if (item.className !== undefined) {
      return <span className={item.className}>{bodycontent(item) ?? null}</span>
    }
    return bodycontent(item) ?? null
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
              className="d-flex justify-content-between align-items-center overflow-auto"
            >
              {item.heading ? <h6 className="w-50 mb-0 mr-15">{item.heading}</h6> : null}
              {classcontent(item)}
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
      className: PropTypes.string,
    }),
  ).isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
  tooltip: PropTypes.bool,
}
