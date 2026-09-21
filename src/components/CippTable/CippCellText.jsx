import { Box, Tooltip } from '@mui/material'
import { forwardRef, useCallback, useRef, useState } from 'react'

const ELLIPSIS_SX = {
  cursor: 'text',
  userSelect: 'text',
  display: 'block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

export const CippCellText = forwardRef(function CippCellText(props, ref) {
  const { children, sx, onMouseEnter, onMouseLeave, ...rest } = props
  const localRef = useRef(null)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const setRefs = useCallback(
    (node) => {
      localRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref]
  )

  const handleMouseEnter = (event) => {
    const el = localRef.current
    if (el && el.scrollWidth > el.clientWidth) {
      setTooltipOpen(true)
    }
    onMouseEnter?.(event)
  }

  const handleMouseLeave = (event) => {
    setTooltipOpen(false)
    onMouseLeave?.(event)
  }

  const title = children == null ? '' : String(children)

  return (
    <Tooltip
      title={title}
      open={tooltipOpen}
      onClose={() => setTooltipOpen(false)}
      disableHoverListener
      placement="top"
      arrow
      disableInteractive
    >
      <Box
        component="span"
        ref={setRefs}
        className="cipp-cell-text"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={[ELLIPSIS_SX, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
        {...rest}
      >
        {children}
      </Box>
    </Tooltip>
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
