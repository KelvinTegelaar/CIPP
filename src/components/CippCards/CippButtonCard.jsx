import React, { useEffect } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Skeleton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { useState } from 'react'

export default function CippButtonCard({
  title,
  CardButton,
  children,
  isFetching = false,
  cardSx,
  cardActions,
  variant,
  component = 'card',
  accordionExpanded = false,
  onAccordionChange,
}) {
  const [cardExpanded, setCardExpanded] = useState(accordionExpanded)
  useEffect(() => {
    if (accordionExpanded !== cardExpanded) {
      setCardExpanded(accordionExpanded)
    }
  }, [accordionExpanded])

  useEffect(() => {
    if (onAccordionChange) {
      onAccordionChange(cardExpanded)
    }
  }, [cardExpanded])

  return (
    <Card variant={variant} sx={cardSx}>
      {component === 'card' && (
        <>
          {title && (
            <>
              {/* Long titles (tenant domains) are one unbreakable token: without this they
                  push the header action past the card edge at phone widths. */}
              <CardHeader
                action={cardActions}
                title={title}
                sx={{ '& .MuiCardHeader-content': { minWidth: 0, overflowWrap: 'anywhere' } }}
              />
              <Divider />
            </>
          )}
          <CardContent style={{ marginBottom: 'auto' }}>
            {isFetching ? <Skeleton /> : children}
          </CardContent>
          <Divider />
          {CardButton && <CardActions>{CardButton}</CardActions>}
        </>
      )}
      {component === 'accordion' && (
        <Accordion expanded={cardExpanded}>
          <AccordionSummary
            expandIcon={<CippIcons.ExpandMore />}
            onClick={() => setCardExpanded(!cardExpanded)}
          >
            <CardHeader action={cardActions} title={title} sx={{ pl: 1, py: 0, flexGrow: 1 }} />
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <CardContent style={{ marginBottom: 'auto' }}>
              {isFetching ? <Skeleton /> : children}
            </CardContent>
            {CardButton && <CardActions>{CardButton}</CardActions>}
          </AccordionDetails>
        </Accordion>
      )}
    </Card>
  )
}
