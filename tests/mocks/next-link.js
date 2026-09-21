import React from 'react'

const Link = ({ children, href, ...props }) => {
  return React.createElement('a', { href, ...props }, children)
}

export default Link
