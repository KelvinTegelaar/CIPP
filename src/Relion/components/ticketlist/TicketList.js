import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DataGrid } from '@mui/x-data-grid'
import { Link, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { setCurrentTenant } from 'src/store/features/app'
import {
  setTicketMyCount,
  setTicketNewCount,
  setTicketRespondedCount,
} from '../../store/features/ticketListSlice'
import {
  setClientValue,
  setClientId,
  setContactValue,
  setContactId,
  setContactEmail,
  setDetails,
  setEditMode,
  setIssueType,
  setIssueTypeId,
  setLocationId,
  setOpenDate,
  setSourceId,
  setStatusId,
  setTitle,
  setTicketId,
} from '../../store/features/ticketFormSlice'
import TicketCount from './TicketCount'
import getTicketList from '../../functions/getTicketList'
import getContactList from '../../functions/getContactList'
import { clientList } from '../../data/clientList'

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
  const techId = useSelector((state) => state.ticketForm.techId)
  useEffect(() => {
    const fetchData = async () => {
      const response = await getTicketList()
      setTicketList(response)
      console.log('Ticket List:')
      console.log(response)

      // generate ticket counts
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

    const interval = setInterval(() => fetchData(), 15000) // fetch every 15 sec
    return () => {
      clearInterval(interval)
    }
  }, [techId, dispatch])

  // populate ticket state from row selection
  const rowHandler = async ({ row }) => {
    // find row match from clientList
    const cv = clientList.filter((item) => item.id === row.accountId)
    dispatch(setClientValue(cv[0]))

    // set Tenant Switcher
    dispatch(
      setCurrentTenant({
        tenant: {
          customerId: cv[0].id,
          defaultDomainName: cv[0].defaultDomainName,
          displayName: cv[0].label,
        },
      }),
    )

    // fetch contactEmail
    const data = await getContactList(row.accountId)
    const tc = data.filter((item) => item.id === row.contactId)
    console.log('Ticket Contact:')
    console.log(tc)
    if (tc[0]) {
      dispatch(setContactEmail(tc[0].email))
      dispatch(
        setContactValue({
          id: row.contactId,
          label: row.contactName,
          email: tc[0].email,
        }),
      )
    } else {
      dispatch(
        setContactValue({
          id: 0,
          label: '',
          email: '',
        }),
      )
    }
    dispatch(setClientId(row.accountId))
    dispatch(setContactId(row.contactId))
    dispatch(setDetails(row.details))
    dispatch(setEditMode(true))
    dispatch(setIssueTypeId(row.issueTypeId))
    dispatch(setIssueType(row.issueTypeName))
    dispatch(setLocationId(row.locationId))
    dispatch(setOpenDate(row.openDate))
    dispatch(setSourceId(row.id))
    dispatch(setStatusId(36708))
    dispatch(setTicketId(row.id))
    dispatch(setTitle(row.title))

    console.log('Selected Row:')
    console.log(row)
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

  return (
    <Accordion
      sx={{
        backgroundColor: 'transparent',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id="ticket-list-header">
        <TicketCount />
      </AccordionSummary>
      <AccordionDetails>
        <div style={{ height: 400, width: '100%' }}>
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
                    field: 'statusName',
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
