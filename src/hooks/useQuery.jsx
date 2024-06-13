import React from 'react'
import { useLocation } from 'react-router-dom'

function useQuery() {
  const { search } = useLocation()

  return React.useMemo(() => new URLSearchParams(search), [search])
}

export default useQuery
