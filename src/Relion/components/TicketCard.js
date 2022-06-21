import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

// mui
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'

export default function TicketCard() {
  const ticketId = useSelector((state) => state.ticket.ticketId)

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
    if (!ticketId) {
      setVisible(false)
    } else {
      setVisible(true)
      setTimeLeft(20)
    }
  }, [ticketId])

  return (
    <Fade in={visible}>
      <Card variant="outlined">
        <CardContent>
          <ConfirmationNumberIcon />
          <Typography>Ticket created</Typography>
          <Typography variant="h5" component="div">
            #{ticketId}
          </Typography>
          <Typography>
            <i>Dimissed in {timeLeft}</i>
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={() => {
              window.open(`https://bms.kaseya.com/react/servicedesk/tickets/${ticketId}`)
            }}
          >
            Go to ticket in BMS
          </Button>
        </CardActions>
      </Card>
    </Fade>
  )
}
