import axios from 'axios'
import { getErrorMessage } from '@/lib/errors'

export interface ApplyErrors {
  cover_letter?: string
  resume?: string
  /** Problems with the job itself, e.g. it has closed or was already applied to. */
  form?: string
}

/** Sorts the API's 422 errors for an application into the two fields and a form-level message. */
export function readApplyErrors(error: unknown): ApplyErrors {
  const fieldErrors = axios.isAxiosError<{ errors?: Record<string, string[]> }>(error)
    ? error.response?.data?.errors
    : undefined
  if (!fieldErrors) return { form: getErrorMessage(error) }

  const { cover_letter, resume, ...rest } = fieldErrors
  return {
    cover_letter: cover_letter?.[0],
    resume: resume?.[0],
    form: Object.values(rest)[0]?.[0],
  }
}
