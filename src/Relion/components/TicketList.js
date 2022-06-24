// import React
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// import MUI
import { DataGrid } from '@mui/x-data-grid'
import Link from '@mui/material/Link'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// import components
import NewTicket from './NewTicket'

// import reducers
import {
  setClient,
  setClientId,
  setContact,
  setContactId,
  setIssueType,
  setIssueTypeId,
  setLocationId,
  setOpenDate,
  setSourceId,
  setStatusId,
  setTitle,
  setTicketId,
} from '../store/features/ticketSlice'

// import functions
import getTicketList from '../functions/getTicketList'

export default function TicketList() {
  const dispatch = useDispatch()

  const initialState = [
    {
      id: '',
      accountName: '',
      contactName: '',
      title: '',
      statusName: '',
    },
  ]

  // fetch data every 5 seconds
  const [ticketList, setTicketList] = useState(initialState)
  useEffect(() => {
    const fetchData = async () => {
      const response = await getTicketList()
      console.log(response)
      setTicketList(response)
    }

    fetchData() // initial load

    const interval = setInterval(() => fetchData(), 5000) // fetch every 5 sec
    return () => {
      clearInterval(interval)
    }
  }, [])

  const rowHandler = ({ row }) => {
    console.log(row)
    dispatch(setClientId(row.accountId))
    dispatch(setClient(row.accountName))
    dispatch(setContactId(row.contactId))
    dispatch(setContact(row.contactName))
    dispatch(setIssueTypeId(row.issueTypeId))
    dispatch(setIssueType(row.issueTypeName))
    dispatch(setLocationId(row.locationId))
    dispatch(setOpenDate(row.openDate))
    dispatch(setSourceId(row.id))
    dispatch(setStatusId(row.statusId))
    dispatch(setTicketId(row.id))
    dispatch(setTitle(row.title))
  }

  // format table
  const columns = [
    {
      field: 'id',
      headerName: 'Ticket',
      width: 60,
      renderCell: (cellValues) => {
        return (
          <Link
            href={`https://bms.kaseya.com/react/servicedesk/tickets/${cellValues.row.id}`}
            target="_blank"
          >
            BMS
          </Link>
        )
      },
    },
    { field: 'contactName', headerName: 'Contact', width: 150 },
    { field: 'title', headerName: 'Title', width: 400 },
    {
      field: 'statusName',
      headerName: 'Status',
      width: 150,
    },
    { field: 'assigneeName', headerName: 'Assignee', width: 150 },
  ]

  const [expand, setExpand] = React.useState(true)
  const toggleAccordion = () => {
    setExpand((prev) => !prev)
  }

  return (
    <Accordion
      sx={{
        backgroundColor: '#000009',
      }}
      expanded={expand}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon onClick={toggleAccordion} />}
        id="ticket-list-header"
      >
        <NewTicket />
      </AccordionSummary>
      <AccordionDetails>
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid onRowClick={rowHandler} rows={ticketList} columns={columns} pageSize={20} />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
