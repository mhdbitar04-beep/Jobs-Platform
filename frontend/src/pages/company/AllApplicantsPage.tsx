import { useQuery } from '@tanstack/react-query'
import { companyApi } from '@/api/company'
import { ApplicantList } from '@/components/applications/ApplicantList'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { queryKeys } from '@/lib/queryKeys'

export function AllApplicantsPage() {
  const { data: applications, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.companyApplications,
    queryFn: companyApi.applications,
  })

  return (
    <>
      <PageHeader title="Applicants" description="Everyone who applied to any of your jobs, newest first." />
      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <PageSpinner />
      ) : (
        <ApplicantList applications={applications} showJob />
      )}
    </>
  )
}
