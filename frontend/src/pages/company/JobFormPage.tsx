import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { companyApi } from '@/api/company'
import { JobForm } from '@/components/jobs/JobForm'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { useToast } from '@/context/toast-context'
import { queryKeys } from '@/lib/queryKeys'
import type { JobPayload } from '@/types'

/** Runs after a job was created or changed: refresh every list that shows it and go back to "My jobs". */
function useAfterSave() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()

  return async (message: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.company }),
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
      queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
    ])
    toast.success(message)
    navigate('/company/jobs')
  }
}

export function NewJobPage() {
  const afterSave = useAfterSave()
  const create = async (payload: JobPayload) => {
    await companyApi.createJob(payload)
    await afterSave('Job posted.')
  }

  return (
    <>
      <PageHeader title="Post a job" description="It is listed as soon as you publish it." />
      <JobForm submitLabel="Publish job" onSubmit={create} />
    </>
  )
}

export function EditJobPage() {
  const jobId = Number(useParams().id)
  const afterSave = useAfterSave()
  const { data: job, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.companyJob(jobId),
    queryFn: () => companyApi.job(jobId),
    retry: false,
  })

  const update = async (payload: JobPayload) => {
    await companyApi.updateJob(jobId, payload)
    await afterSave('Job saved.')
  }

  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (isPending) return <PageSpinner />

  return (
    <>
      <PageHeader title="Edit job" description={job.title} />
      <JobForm job={job} submitLabel="Save changes" onSubmit={update} />
    </>
  )
}
