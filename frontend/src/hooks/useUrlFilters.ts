import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Search, filter and page state for a table, kept in the URL query string. */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams()

  /** Changing a filter goes back to the first page. */
  const setFilter = useCallback(
    (key: string, value: string) => {
      setParams((current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        next.delete('page')
        return next
      })
    },
    [setParams],
  )

  const setPage = useCallback(
    (page: number) => {
      setParams((current) => {
        const next = new URLSearchParams(current)
        next.set('page', String(page))
        return next
      })
    },
    [setParams],
  )

  return {
    params,
    page: Math.max(1, Number(params.get('page')) || 1),
    setFilter,
    setPage,
  }
}
