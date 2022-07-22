import React from 'react'
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useSelector } from 'react-redux'
import { Typography } from '@mui/material'

export default function IssueTypeCount() {
  const issueTypeCount = useSelector((state) => state.ticketList.issueTypeCount)

  // calculate barchart height based on number of issue types
  // set min height to 110
  const height = issueTypeCount.length * 40 > 110 ? issueTypeCount.length * 40 : 110

  return (
    <>
      <Typography variant="h5" color="primary">
        Issue Types
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={issueTypeCount}
          margin={{
            top: 5,
            right: 30,
            left: 100,
            bottom: 5,
          }}
        >
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" interval={0} tick={{ width: 150 }} />
          <Bar dataKey="count" barSize={20} label={{ position: 'right' }}>
            {issueTypeCount.map((entry, index) => (
              <Cell key={index} fill="#90caf9" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
