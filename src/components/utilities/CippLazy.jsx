import { useRef } from 'react'
import PropTypes from 'prop-types'

export function CippLazy({ visible, children }) {
  const rendered = useRef(visible)

  if (visible && !rendered.current) {
    rendered.current = true
  }

  if (!rendered.current) return null

  return <div style={{ display: visible ? 'block' : 'none' }}>{children}</div>
}

CippLazy.propTypes = {
  visible: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
}
