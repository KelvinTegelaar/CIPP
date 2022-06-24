import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

// mui
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import Link from '@mui/material/Link'
import Fade from '@mui/material/Fade'

export default function TicketConfirm() {
  const confirmedTicketId = useSelector((state) => state.ticket.confirmedTicketId)
  const timeEntryId = useSelector((state) => state.ticket.timeEntryId)

  // TicketCard disappears after 20 seconds
  const [visible, setVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!timeLeft) {
      setVisible(false)
    } else {
      const intervalId = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)

      // clear interval on re-render to avoid memory leaks
      return () => clearInterval(intervalId)
    }
  }, [timeLeft])

  useEffect(() => {
    if (!timeEntryId) {
      setVisible(false)
    } else {
      setVisible(true)
      setTimeLeft(20)
    }
  }, [timeEntryId])

  return (
    <Fade in={visible}>
      <Card variant="outlined">
        <CardContent>
          <ConfirmationNumberIcon />
          <Typography>Go to ticket in BMS</Typography>
          <Link
            variant="h5"
            href={`https://bms.kaseya.com/react/servicedesk/tickets/${confirmedTicketId}`}
            target="_blank"
          >
            #{confirmedTicketId}
          </Link>
          <Typography>
            <i>Dimissed in {timeLeft}</i>
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  )
}
