import axios from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

interface ApiErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

const FALLBACK_MESSAGE = 'Something went wrong. Check your connection and try again.'

function errorBody(error: unknown): ApiErrorBody | null {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return null
  const body = error.response?.data
  return body && typeof body === 'object' && !(body instanceof Blob) ? body : null
}

/** The human-readable message of a failed request. */
export function getErrorMessage(error: unknown): string {
  const body = errorBody(error)
  const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined
  return firstFieldError ?? body?.message ?? FALLBACK_MESSAGE
}

/**
 * Puts 422 field errors under the matching form fields.
 * Returns a message for anything that could not be tied to a field, or null when every error was placed.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  const body = errorBody(error)
  if (!body?.errors) return getErrorMessage(error)

  let unplaced: string | null = null
  for (const [key, messages] of Object.entries(body.errors)) {
    const field = fields.find((name) => name === key)
    if (field) {
      setError(field, { type: 'server', message: messages[0] })
    } else {
      unplaced ??= messages[0] ?? null
    }
  }
  return unplaced
}
