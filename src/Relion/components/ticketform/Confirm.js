import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import Link from '@mui/material/Link'

export default function Confirm() {
  const ticketConfirmId = useSelector((state) => state.ticketConfirm.ticketConfirmId)
  const timeEntryConfirmId = useSelector((state) => state.ticketConfirm.ticketConfirmId)
  const [visible, setVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // Confirm card disappears after 20 seconds
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
    if (!timeEntryConfirmId) {
      setVisible(false)
    } else {
      setVisible(true)
      setTimeLeft(20)
    }
  }, [timeEntryConfirmId])

  return (
    <>
      {visible && (
        <Card variant="outlined">
          <CardContent>
            <ConfirmationNumberIcon />
            <Typography>Go to BMS ticket</Typography>
            <Link
              variant="h5"
              href={`https://bms.kaseya.com/react/servicedesk/tickets/${ticketConfirmId}`}
              target="_blank"
            >
              #{ticketConfirmId}
            </Link>
            <Typography>
              <i>Dimissed in {timeLeft}</i>
            </Typography>
          </CardContent>
        </Card>
      )}
    </>
  )
}
