import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setActivities } from '../store/features/ticketSlice'
import getTicketActivities from '../functions/getTicketActivities'

export default function TicketActivities() {
  const dispatch = useDispatch()
  const ticketId = useSelector((state) => state.ticket.ticketId)
  const activities = useSelector((state) => state.ticket.activities)
  useEffect(() => {
    const fetchData = async () => {
      const response = await getTicketActivities(ticketId)
      console.log('Ticket Activities:')
      console.log(response)
      dispatch(setActivities(response))
    }
    fetchData()
  }, [ticketId, dispatch])

  return (
    <p>
      {activities.map((activity, index) => {
        return (
          <div key={index}>
            {
              <>
                <hr />
                {activity.activityType === 'Status Changed' && (
                  <div>
                    {activity.notes} → {activity.internalNotes}
                  </div>
                )}
                {activity.activityType !== 'Status Changed' && (
                  <>
                    <div>
                      <b>{activity.createdByName}</b>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: activity.notes }} />
                  </>
                )}
              </>
            }
          </div>
        )
      })}
    </p>
  )
}
