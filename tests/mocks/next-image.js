import React from 'react'

const Image = ({ src, alt, ...rest }) => {
  return React.createElement('img', { src, alt, ...rest })
}

Image.displayName = 'NextImage'
export default Image
