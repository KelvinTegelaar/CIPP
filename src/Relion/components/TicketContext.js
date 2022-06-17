import React, { useState, createContext } from 'react'

const TicketContext = createContext()

// eslint-disable-next-line react/prop-types
const TicketProvider = ({ children }) => (
  <TicketContext.Provider value={useState(0)}>{children}</TicketContext.Provider>
)

export default TicketContext
