import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCurrentTenant } from 'src/store/features/app'

// mui
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Stack from '@mui/material/Stack'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Slider from '@mui/material/Slider'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// functions
//import getClientList from '../functions/getClientList'
import getContactList from '../functions/getContactList'
import getLocationID from '../functions/getLocationID'
import postTicket from '../functions/postTicket'
import postTime from '../functions/postTime'
import getTenants from '../functions/getTenants'
//import { TicketContext } from './TicketContext'

// cipp
import { useLoadClientPrincipalQuery } from '../../store/api/auth'
import Users from 'src/views/identity/administration/Users.js'

export default function Ticket() {
  // MUI dark mode
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  // use Redux
  const dispatch = useDispatch()

  // ----- Tech (hidden) -----
  const { data: profile } = useLoadClientPrincipalQuery()
  const currentUser = profile.clientPrincipal.userDetails
  const [techId, setTechId] = useState('')
  useEffect(() => {
    const techList = [
      { id: 51085, user: 'alex@thinkrelion.com' },
      { id: 48017, user: 'brian@thinkrelion.com' },
      { id: 48221, user: 'carlos@thinkrelion.com' },
      { id: 51084, user: 'jeremy@thinkrelion.com' },
      { id: 51083, user: 'zach@thinkrelion.com' },
    ]
    const bmsUser = techList.find((item) => item.user === currentUser)
    setTechId(bmsUser.id)
    console.log(`techID: ${techId}`)
  }, [techId, currentUser])

  // let techId = 0
  // useEffect(() => {
  //   switch (currentUser) {
  //     case 'alex@thinkrelion.com':
  //       techId = 51085
  //       break
  //     case 'brian@thinkrelion.com':
  //       techId = 48017
  //       break
  //     case 'carlos@thinkrelion.com':
  //       techId = 48221
  //       break
  //     case 'jeremy@thinkrelion.com':
  //       techId = 51084
  //       break
  //     case 'zach@thinkrelion.com':
  //       techId = 51083
  //       break
  //     default:
  //       techId = 0
  //       break
  //   }
  //   console.log(`techID: ${techId}`)
  // }, [])

  // ----- Client Field -----

  /*
  const [clientList, setClientList] = useState('')
  useEffect(() => {
    const resolvePromise = async () => {
      const cl = await getClientList() // get client list from BMS
      setClientList(cl)
    }
    resolvePromise()
  }, [])
  */

  const clientList = [
    { id: 101238, label: 'ACW', tenant: '188495f2-336a-4cc3-868b-a4765f71185c' },
    { id: 101239, label: 'AKP', tenant: '56d4ef54-2d64-4729-aca4-10a530f9e137' },
    { id: 101240, label: 'BASE', tenant: '' },
    { id: 105196, label: 'BASE Sherman Oaks', tenant: '' },
    { id: 101241, label: 'CI', tenant: '' },
    {
      id: 101230,
      label: 'City of Rolling Hills Estates',
      tenant: '88879da4-54a3-4a21-aef5-c17e8980d0a1',
    },
    { id: 101242, label: 'DLITE', tenant: '6a8e5d53-3e2b-418a-9dd8-5ecc8337962a' },
    { id: 101243, label: 'Dolorosa', tenant: '4a74ab7f-6c1d-487e-bedb-f2244caf8adf' },
    { id: 101244, label: 'DWC', tenant: '92c60ce1-2f5d-44ed-9464-6422ebdff615' },
    { id: 101245, label: 'Extant', tenant: '' },
    { id: 101247, label: 'F2', tenant: '9bca80f2-845d-4262-ba3a-66b2578c9098' },
    { id: 101248, label: 'FriendsLA', tenant: '2cc4db87-c199-41e0-9361-74b7d8bdf6b4' },
    { id: 105939, label: 'Garfield', tenant: 'be17f196-dd65-4a88-ba34-96155e758c0e' },
    { id: 101249, label: 'GCC', tenant: 'b77d26b2-b4b8-4527-b3f9-f2d97e3fb468' },
    { id: 101250, label: 'Ho Rehab', tenant: '' },
    { id: 101251, label: 'HOPT', tenant: '3fffdedc-a531-4d72-be1b-894941bc9817' },
    { id: 101252, label: 'ILA', tenant: '5256f2c6-e353-4350-a6af-df61ae110387' },
    { id: 101253, label: 'KGC', tenant: 'be6fd3e8-8ffb-46e2-bf59-63fe1569d7a8' },
    { id: 101254, label: 'Kimble', tenant: 'e71914b9-82ee-47a3-ba9d-8eac5151d7ab' },
    { id: 114089, label: 'LA Stagecall', tenant: 'c5e1f34a-934c-45fb-8a4f-2e88395c8a76' },
    { id: 101255, label: 'LACS', tenant: '13f017e1-e5e0-49cb-b7fa-18233f5dfb12' },
    { id: 101224, label: 'NZXT', tenant: '' },
    { id: 101225, label: 'PCSI', tenant: '98e954bc-6d5e-4cfc-bf1d-aca9d95d6917' },
    { id: 101226, label: 'Phoenix CA', tenant: '4114297e-889f-4a48-afd7-e5c688f70639' },
    { id: 101227, label: 'Phoenix FL', tenant: '4114297e-889f-4a48-afd7-e5c688f70639' },
    { id: 101228, label: 'Powertec', tenant: '04bcc83f-8f40-4656-a18b-4046d1fb30b3' },
    { id: 98695, label: 'Relion', tenant: '' },
    { id: 101229, label: 'RFCU', tenant: '82f49824-c485-4c63-8c1c-c5b8ef09b526' },
    { id: 101231, label: 'Rollouts', tenant: '0ca2d474-cf2a-4bdf-9b08-92b11a983e87' },
    { id: 102538, label: 'Shoes4Grades', tenant: '2a1f6a93-79a4-4a09-93d6-8bc88697986d' },
    { id: 113122, label: 'Shore Logistics', tenant: '312e6833-d248-490a-acef-be497d7f1b11' },
    { id: 112610, label: 'Superior Handforge', tenant: '77fa3d9b-21de-4a40-9bc5-74625f6c9382' },
    { id: 101232, label: 'Trademark', tenant: '' },
    { id: 101233, label: 'TSE', tenant: '' },
    { id: 101234, label: 'Walker', tenant: 'eab27e0a-90e2-414f-ad3a-ff0df0d2a2c9' },
    { id: 101235, label: 'Warden', tenant: '' },
    { id: 101236, label: 'West Coast Trends', tenant: 'c531b5a1-496e-4b73-b205-e2b0cae113b5' },
    { id: 101237, label: 'WI', tenant: 'f56b4ab8-3ab4-4537-ac2d-e2f1e3eabadc' },
  ]

  const [client, setClient] = useState('')
  const [clientID, setClientID] = useState('')
  const [locationID, setLocationID] = useState('')
  const clientHandler = async (event, newValue) => {
    const cid = newValue.id
    setClientID(cid)
    console.log(`clientID: ${cid}`)

    const lid = await getLocationID(cid) // get location ID from BMS
    setLocationID(lid)
    console.log(`locationID: ${lid}`)

    const col = await getContactList(cid) // get contact list from BMS
    setContactList(col)
    console.log(col)

    setClient(newValue) // controls form

    const tenantList = await getTenants()
    const tenantId = newValue.tenant
    const currentTenant = tenantList.filter((t) => t.customerId === tenantId)
    console.log(tenantList)
    console.log(tenantId)
    console.log(currentTenant[0])

    dispatch(
      setCurrentTenant({
        tenant: {
          customerId: currentTenant[0].customerId,
          defaultDomainName: currentTenant[0].defaultDomainName,
          displayName: currentTenant[0].displayName,
          domains: currentTenant[0].domains,
        },
      }),
    )
  }

  // ----- Contact Field -----
  const [contact, setContact] = useState('')
  const [contactList, setContactList] = useState([])
  const contactHandler = async (event, newValue) => {
    setContact(newValue)
    console.log(`contactID: ${newValue.label}`)
  }

  // ----- Issue Type Field -----
  const [issueType, setIssueType] = useState('')
  const issueTypeHandler = (event, newValue) => {
    setIssueType(newValue)
    console.log(`issueTypeID: ${newValue.id}`)
  }
  const issueTypeList = [
    { id: 10490, label: 'Help Desk' },
    { id: 10487, label: 'User Administration' },
    { id: 10491, label: 'System Change' },
    { id: 10486, label: 'Reboot / False Alarm' },
    { id: 10542, label: '3CX' },
    { id: 10480, label: 'Application' },
    { id: 12282, label: 'Internet' },
    { id: 12304, label: 'iPhone/Andriod' },
    { id: 12307, label: 'M365' },
    { id: 10483, label: 'Network' },
    { id: 10481, label: 'Printing' },
    { id: 10484, label: 'Remote Access' },
    { id: 11401, label: 'Security' },
    { id: 10479, label: 'Server' },
    { id: 10482, label: 'Workstation' },
  ]

  // ----- Title Field -----
  const [title, setTitle] = useState('')
  const titleHandler = (event) => {
    setTitle(event.target.value)
    console.log(`title: ${event.target.value}`)
  }

  // ----- Notes Field -----
  const [notes, setNotes] = useState('')
  const notesHandler = (event) => {
    setNotes(event.target.value)
    console.log(`notes: ${event.target.value}`)
  }

  // ---- Status Field -----
  const [status, setStatus] = useState(36708) // set default to closed
  const statusHandler = (event) => {
    setStatus(event.target.value)
    console.log(`statusID: ${event.target.value}`)
  }

  // ---- Time Entry -----
  const [timeEntry, setTimeEntry] = useState(15) // set default to 15 minutes
  const timeEntryHandler = (event) => {
    setTimeEntry(event.target.value)
    console.log(`timeEntry: ${event.target.value}`)
  }

  // slider fomatting values
  const marks = [
    {
      value: 15,
      label: '15 min',
    },
    {
      value: 60,
      label: '1 hr',
    },
    {
      value: 120,
      label: '2 hrs',
    },
    {
      value: 180,
      label: '3hrs',
    },
  ]

  const valueLabelFormat = (value) => {
    return value % 60
  }

  // ---- Due Date -----
  const [dueDate, setDueDate] = useState('')
  const [dueDateISO, setDueDateISO] = useState('')
  const [queue, setQueue] = useState('27976') // Help Desk is default
  const [priority, setPriority] = useState('28791') // 4 hr SLA is default
  const dueDateHandler = (event) => {
    setDueDate(event.target.value)
    console.log(event.target.value)
    setDueDateISO(new Date(event.target.value).toISOString())
    setQueue('28295') //change queue to Back Buner
    setPriority('28789') //change SLA to 2 days
  }

  // ----- Submit -----
  const [ticketId, setTicketID] = useState('')
  const submitHandler = async () => {
    const now = new Date()
    const nowISO = now.toISOString()

    const ticketJSON = JSON.stringify({
      assigneeId: techId,
      title: title,
      details: title,
      accountId: clientID,
      locationId: locationID,
      contactId: contact.id,
      statusId: status,
      issueTypeID: issueType.id,
      priorityId: priority, //2-day SLA
      typeId: 28, //Service Request
      sourceId: 4, //Email
      openDate: nowISO,
      dueDate: dueDateISO,
      queueID: queue,
    })
    const tid = await postTicket(ticketJSON)
    setTicketID(tid)

    // format time in GMT for start/end time
    const startTimeUTC = now.toLocaleTimeString('en-GB', { timeZone: 'UTC' })
    const endTime = new Date(now.getTime() + timeEntry * 60000)
    const endTimeUTC = endTime.toLocaleTimeString('en-GB', { timeZone: 'UTC' })
    const timeHours = timeEntry / 60 // convert to hours in decimal

    const timeJSON = JSON.stringify({
      startDate: nowISO,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      timespent: timeHours,
      notes: notes,
      userId: techId,
      workTypeId: 19558,
      roleId: 15324,
    })
    await postTime(tid, timeJSON)

    //reset form
    setClient('')
    setClientID('')
    setLocationID('')
    setContact('')
    setIssueType('')
    setTitle('')
    setNotes('')
    setStatus('36708')
    setTimeEntry(15)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Grid container spacing={4}>
        <Grid item xs={4}>
          <Stack spacing={2}>
            <Autocomplete
              autoFocus
              openOnFocus
              autoHighlight
              autoSelect
              id="client"
              value={client}
              options={clientList}
              onChange={clientHandler}
              renderInput={(params) => <TextField {...params} label="Client" />}
            />
            <Autocomplete
              openOnFocus
              autoHighlight
              autoSelect
              id="contact"
              value={contact}
              options={contactList}
              onChange={contactHandler}
              renderInput={(params) => <TextField {...params} label="Contact" />}
            />
            <Autocomplete
              openOnFocus
              autoHighlight
              autoSelect
              id="issue-type"
              value={issueType}
              options={issueTypeList}
              onChange={issueTypeHandler}
              renderInput={(params) => <TextField {...params} label="Issue Type" />}
            />
            <TextField id="title" label="Title" value={title} onChange={titleHandler} />
            <TextField
              id="notes"
              label="Notes"
              value={notes}
              onChange={notesHandler}
              multiline
              rows={6}
            />
            <Slider
              aria-label="Time Logged"
              label="Time Logged"
              defaultValue={15}
              step={15}
              min={15}
              max={180}
              valueLabelDisplay="auto"
              valueLabelFormat={valueLabelFormat}
              marks={marks}
              onChange={timeEntryHandler}
              value={timeEntry}
            />
            <br />
            <RadioGroup value={status} name="status-buttons-group" onChange={statusHandler}>
              <FormControlLabel
                value="36708"
                control={<Radio onChange={() => setDueDate('')} />} //reset DueDate
                label="Closed"
              />
              <FormControlLabel
                value="36709"
                control={<Radio onChange={() => setDueDate('')} />} //reset DueDate
                label="In Progress"
              />
              <FormControlLabel
                value="36707"
                control={<Radio onChange={() => setDueDate('')} />} //reset DueDate
                label="Waiting For Customer"
              />
              <FormControlLabel value="37182" control={<Radio />} label="Follow-up Scheduled" />
              {['37182'].includes(status) && ( //show date picker for scheduled tickets
                <TextField type="date" id="due-date" value={dueDate} onChange={dueDateHandler} />
              )}
              <FormControlLabel value="37097" control={<Radio />} label="Onsite Scheduled" />
              {['37097'].includes(status) && ( //show date picker for scheduled tickets
                <TextField type="date" id="due-date" value={dueDate} onChange={dueDateHandler} />
              )}
            </RadioGroup>

            <Button onClick={submitHandler} variant="contained">
              Submit
            </Button>

            {ticketId && (
              <Card variant="outlined">
                <CardContent>
                  <ConfirmationNumberIcon />
                  <Typography>Ticket created</Typography>
                  <Typography variant="h5" component="div">
                    {ticketId}
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
            )}
          </Stack>
        </Grid>
        <Grid item xs={8}>
          <Stack spacing={2}>
            <Users />
          </Stack>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}
