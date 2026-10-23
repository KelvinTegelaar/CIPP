import { Box, Link, Tooltip, Typography } from '@mui/material'

const isWebUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value)

/**
 * Tooltip that shows a heading, an optional description and a list of label/value pairs.
 * Items with an empty value are skipped; with nothing to show, the children render as-is.
 *
 * @param {string} [title] - Heading
 * @param {string} [description] - Free text under the heading
 * @param {{ label: string, value: any, href?: string }[]} [items] - Rows; an http(s) href makes the value a link
 * @param {string} [placement="bottom-start"] - MUI Tooltip placement
 */
export const CippStructuredTooltip = ({
  title,
  description,
  items = [],
  placement = 'bottom-start',
  children,
}) => {
  const rows = items.filter(
    (item) => item && item.value !== undefined && item.value !== null && item.value !== ''
  )
  if (!title && !description && rows.length === 0) return children

  const content = (
    // Tooltips portal out of the cell, but React events still bubble to the table row.
    <Box onClick={(event) => event.stopPropagation()} sx={{ py: 0.5 }}>
      {title && (
        <Typography variant="subtitle2" sx={{ mb: description || rows.length ? 0.5 : 0 }}>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="caption" component="p" sx={{ mb: rows.length ? 1 : 0, opacity: 0.9 }}>
          {description}
        </Typography>
      )}
      {rows.length > 0 && (
        <Box
          component="dl"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 1.5,
            rowGap: 0.25,
            m: 0,
          }}
        >
          {rows.map((item) => (
            <Box key={item.label} sx={{ display: 'contents' }}>
              <Typography component="dt" variant="caption" sx={{ opacity: 0.7 }}>
                {item.label}
              </Typography>
              <Typography component="dd" variant="caption" sx={{ m: 0, wordBreak: 'break-word' }}>
                {isWebUrl(item.href) ? (
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    underline="always"
                  >
                    {String(item.value)}
                  </Link>
                ) : Array.isArray(item.value) ? (
                  item.value.join(', ')
                ) : (
                  String(item.value)
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )

  return (
    <Tooltip
      title={content}
      placement={placement}
      enterDelay={300}
      arrow
      slotProps={{ tooltip: { sx: { maxWidth: 380 } } }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          maxWidth: '100%',
          cursor: 'help',
          borderBottom: '1px dotted',
          borderColor: 'text.disabled',
        }}
      >
        {children}
      </Box>
    </Tooltip>
  )
}

export default CippStructuredTooltip
