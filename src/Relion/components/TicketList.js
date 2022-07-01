// import React
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// import MUI
import { DataGrid } from '@mui/x-data-grid'
import { Link, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
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
  setTicketMyCount,
  setTicketNewCount,
  setTicketRespondedCount,
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

  // fetch ticket list from BMS
  const [ticketList, setTicketList] = useState(initialState)
  const techId = useSelector((state) => state.ticket.techId)
  useEffect(() => {
    const fetchData = async () => {
      const response = await getTicketList()
      console.log('Ticket List:')
      console.log(response)
      setTicketList(response)

      // count of tickets for display in TicketCount
      const myCount = response.filter((item) => item.assigneeId === techId).length
      dispatch(setTicketMyCount(myCount))

      const newCount = response.filter(
        (item) => item.statusName === 'New' || item.assigneeId === null,
      ).length
      dispatch(setTicketNewCount(newCount))

      const respondedCount = response.filter(
        (item) => item.statusName === 'Client Responded',
      ).length
      dispatch(setTicketRespondedCount(respondedCount))
    }

    fetchData() // initial load

    const interval = setInterval(() => fetchData(), 10000) // fetch every 10 sec
    return () => {
      clearInterval(interval)
    }
  }, [techId, dispatch])

  // selecting a row populates the ticket form
  // and other necessary values for BMS API
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
    { field: 'assigneeName', headerName: 'Assignee', width: 150 },
    {
      field: 'statusName',
      headerName: 'Status',
      width: 150,
    },
    { field: 'contactName', headerName: 'Contact', width: 150 },
    { field: 'title', headerName: 'Title', width: 500 },
  ]

  const [expand, setExpand] = React.useState(false)
  const toggleAccordion = () => {
    setExpand((prev) => !prev)
  }

  return (
    <Accordion
      sx={{
        backgroundColor: 'transparent',
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
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            onRowClick={rowHandler}
            rows={ticketList}
            columns={columns}
            rowHeight={38}
            pageSize={100}
            initialState={{
              sorting: {
                sortModel: [
                  {
                    field: 'status',
                    sort: 'desc',
                  },
                ],
              },
            }}
          />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
