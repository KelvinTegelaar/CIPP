import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DataGrid } from '@mui/x-data-grid'
import { Chip, Link, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { darken } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { setCurrentTenant } from 'src/store/features/app'
import {
  setIssueTypeCount,
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

// format status chips
function getChipProps(params) {
  switch (params.value) {
    case 'New':
      return {
        label: params.value,
        color: 'error',
      }
    case 'Client Responded':
      return {
        label: params.value,
        color: 'warning',
      }
    case 'Closed':
      return {
        label: params.value,
        color: 'default',
      }
    default:
      return {
        label: params.value,
        color: 'primary',
      }
  }
}

export default function TicketList() {
  const dispatch = useDispatch()
  const initialState = [
    {
      id: '',
      accountName: '',
      contactName: '',
      title: '',
      statusName: '',
      issueTypeName: '',
    },
  ]

  // fetch ticket list from BMS
  const [ticketList, setTicketList] = useState(initialState)
  const techId = useSelector((state) => state.ticketForm.techId)
  const clientValue = useSelector((state) => state.ticketForm.clientValue)
  const contactValue = useSelector((state) => state.ticketForm.contactValue)
  const issueType = useSelector((state) => state.ticketForm.issueType)
  const editMode = useSelector((state) => state.ticketForm.editMode)
  useEffect(() => {
    const fetch = async () => {
      // show closed tickets as contact and contact are selected
      const excludeCompleted = clientValue.label || contactValue.label ? 0 : 1
      const filter = {
        filter: {
          queueNames: 'Help Desk',
          excludeCompleted: excludeCompleted,
          account: clientValue.label,
          contactName: contactValue.label,
          issueTypeNames: issueType,
        },
      }
      const response = await getTicketList(filter)
      setTicketList(response)
      console.log('Ticket List:')
      console.log(response)

      // generate ticket counts
      if (!editMode) {
        const myCount = response.filter(
          (item) => item.assigneeId === techId && !item.completedDate,
        ).length
        dispatch(setTicketMyCount(myCount))

        const newCount = response.filter(
          (item) => (item.statusName === 'New' || item.assigneeId === null) && !item.completedDate,
        ).length
        dispatch(setTicketNewCount(newCount))

        const respondedCount = response.filter(
          (item) => item.statusName === 'Client Responded' && !item.completedDate,
        ).length
        dispatch(setTicketRespondedCount(respondedCount))
      }

      // generate issueTypes count
      // https://stackoverflow.com/questions/44387647/group-and-count-values-in-an-array
      let counts = response.reduce((p, c) => {
        let name = c.issueTypeName
        if (!p.hasOwnProperty(name)) {
          p[name] = 0
        }
        p[name]++
        return p
      }, {})

      let countsExtended = Object.keys(counts).map((k) => {
        return { name: k, count: counts[k] }
      })

      // sort descending by count
      // https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
      countsExtended.sort((a, b) => (a.count < b.count ? 1 : b.count < a.count ? -1 : 0))

      console.log('Issue Type Count:')
      console.log(countsExtended)

      dispatch(setIssueTypeCount(countsExtended))
    }

    fetch() // initial load

    const interval = setInterval(() => fetch(), 15000) // fetch every 15 sec
    return () => {
      clearInterval(interval)
    }
  }, [techId, clientValue, contactValue, issueType, editMode, dispatch])

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
    { field: 'assigneeName', headerName: 'Assignee', width: 120 },
    {
      field: 'statusName',
      headerName: 'Status',
      width: 120,
      renderCell: (cellValues) => {
        return <Chip variant="outlined" {...getChipProps(cellValues)} />
      },
    },
    { field: 'contactName', headerName: 'Contact', width: 150 },
    { field: 'issueTypeName', headerName: 'Issue Type', width: 160 },
    { field: 'title', headerName: 'Title', width: 500 },
  ]

  return (
    <Accordion
      defaultExpanded={true}
      sx={{
        backgroundColor: 'transparent',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id="ticket-list-header">
        <TicketCount />
      </AccordionSummary>
      <AccordionDetails
        sx={{
          height: 400,
          width: '100%',
          '& .super-app-theme--New': {
            // no styling
            '&:hover': {
              bgcolor: '435252',
            },
          },
          '& .super-app-theme--In-Progress': {
            // no styling
            '&:hover': {
              bgcolor: '435252',
            },
          },
          '& .super-app-theme--Client-Responded': {
            // no styling
            '&:hover': {
              bgcolor: '435252',
            },
          },
          '& .super-app-theme--Merged': {
            color: '#678296',
            bgcolor: '#242c2c',
            '&:hover': {
              bgcolor: darken('#242c2c', 0.6),
            },
          },
          '& .super-app-theme--Closed': {
            color: '#678296',
            bgcolor: '#242c2c',
            '&:hover': {
              bgcolor: darken('#242c2c', 0.6),
            },
          },
        }}
      >
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
                  field: 'openDate',
                  sort: 'desc',
                },
              ],
            },
          }}
          getRowClassName={(params) => {
            const statusName = params.row.statusName.replace(' ', '-')
            return `super-app-theme--${statusName}`
          }}
        />
      </AccordionDetails>
    </Accordion>
  )
}
