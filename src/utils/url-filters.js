import { useMemo } from 'react'
import { useRouter } from 'next/router'

// Column filters passed in the URL (?filters=[{ id, value }]), as dashboard cards link into reports.
export const useUrlFilters = () => {
  const { query } = useRouter()
  return useMemo(() => {
    try {
      const filters = query?.filters ? JSON.parse(query.filters) : []
      return Array.isArray(filters) ? filters : []
    } catch {
      return []
    }
  }, [query?.filters])
}
