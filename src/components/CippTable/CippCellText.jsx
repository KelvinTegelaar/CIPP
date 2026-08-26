import { Box } from '@mui/material'
import { forwardRef } from 'react'

export const CippCellText = forwardRef(function CippCellText(props, ref) {
  const { children, ...rest } = props
  return (
    <Box
      component="span"
      ref={ref}
      className="cipp-cell-text"
      sx={{ cursor: 'text', userSelect: 'text', display: 'inline' }}
      {...rest}
    >
      {children}
    </Box>
  )
})

export const formatCellText = (value, isText) => {
  if (isText) {
    return value == null ? '' : String(value)
  }
  if (value == null || value === '') {
    return value
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return <CippCellText>{value}</CippCellText>
  }
  return value
}
