import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LEVEL_OPTIONS, JOB_TYPE_OPTIONS, pickOption, SORT_OPTIONS, WORK_MODE_OPTIONS } from '@/lib/options'
import type { JobFilters } from '@/types'

export type JobFilterKey = Exclude<keyof JobFilters, 'page' | 'per_page'>

/** Job filters live in the URL query string, so a filtered list can be bookmarked and shared. */
export function useJobFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<JobFilters>(
    () => ({
      search: params.get('search') || undefined,
      location: params.get('location') || undefined,
      category: params.get('category') || undefined,
      type: pickOption(JOB_TYPE_OPTIONS, params.get('type')),
      work_mode: pickOption(WORK_MODE_OPTIONS, params.get('work_mode')),
      experience_level: pickOption(LEVEL_OPTIONS, params.get('experience_level')),
      sort: pickOption(SORT_OPTIONS, params.get('sort')),
      page: Math.max(1, Number(params.get('page')) || 1),
    }),
    [params],
  )

  /** Changing a filter goes back to the first page. */
  const setFilter = useCallback(
    (key: JobFilterKey, value: string) => {
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
        if (page > 1) next.set('page', String(page))
        else next.delete('page')
        return next
      })
      window.scrollTo({ top: 0 })
    },
    [setParams],
  )

  const clear = useCallback(() => setParams({}), [setParams])
  const activeCount = [...params.keys()].filter((key) => key !== 'page' && key !== 'sort').length

  return { filters, setFilter, setPage, clear, activeCount }
}
