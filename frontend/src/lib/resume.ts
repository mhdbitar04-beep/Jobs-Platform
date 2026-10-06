export const RESUME_ACCEPT = '.pdf,.doc,.docx'
export const RESUME_MAX_BYTES = 5 * 1024 * 1024

/** Mirrors the API's rule for resumes; returns a message when the file would be rejected. */
export function validateResume(file: File): string | null {
  if (!/\.(pdf|docx?)$/i.test(file.name)) return 'Choose a PDF, DOC or DOCX file.'
  if (file.size > RESUME_MAX_BYTES) return 'The file must be 5 MB or smaller.'
  return null
}
