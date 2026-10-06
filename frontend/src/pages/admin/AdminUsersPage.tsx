import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, UserSearch } from 'lucide-react'
import { useState } from 'react'
import { adminApi, type AdminUserParams } from '@/api/admin'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchField } from '@/components/ui/SearchField'
import { Select } from '@/components/ui/Select'
import { PageSpinner } from '@/components/ui/Spinner'
import { Table, Td, Th } from '@/components/ui/Table'
import { useToast } from '@/context/toast-context'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { pickOption, ROLE_LABELS, ROLE_OPTIONS } from '@/lib/options'
import { queryKeys } from '@/lib/queryKeys'
import type { User } from '@/types'

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { params, page, setFilter, setPage } = useUrlFilters()
  const [deleting, setDeleting] = useState<User | null>(null)

  const query: AdminUserParams = {
    search: params.get('search') || undefined,
    role: pickOption(ROLE_OPTIONS, params.get('role')),
    page,
  }
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.adminUsers(query),
    queryFn: () => adminApi.users(query),
    placeholderData: keepPreviousData,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin })

  const setActive = useMutation({
    mutationFn: (user: User) => adminApi.setUserActive(user.id, !user.is_active),
    onSuccess: async (updated) => {
      await refresh()
      toast.success(updated.is_active ? `${updated.name} can log in again.` : `${updated.name} is suspended and has been signed out.`)
    },
    onError: (activeError) => toast.error(getErrorMessage(activeError)),
  })

  const remove = useMutation({
    mutationFn: (user: User) => adminApi.deleteUser(user.id),
    onSuccess: async () => {
      await refresh()
      toast.success('User deleted.')
    },
    onError: (removeError) => toast.error(getErrorMessage(removeError)),
    onSettled: () => setDeleting(null),
  })

  return (
    <>
      <PageHeader title="Users" description="Everyone with an account." />

      <div className="mb-4 grid gap-4 sm:grid-cols-[1fr_12rem]">
        <SearchField label="Search" placeholder="Name or email" value={query.search ?? ''} onCommit={(value) => setFilter('search', value)} />
        <Select
          label="Role"
          placeholder="All roles"
          options={ROLE_OPTIONS}
          value={query.role ?? ''}
          onChange={(event) => setFilter('role', event.target.value)}
        />
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <PageSpinner />
      ) : data.data.length === 0 ? (
        <EmptyState icon={UserSearch} title="No users found" description="Try a different name, email or role." />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((user) => (
                <tr key={user.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900">{user.name}</p>
                        <p className="text-xs text-ink-500">{user.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={user.role === 'admin' ? 'violet' : user.role === 'company' ? 'blue' : 'neutral'}>{ROLE_LABELS[user.role]}</Badge>
                    {user.company && <p className="mt-1 text-xs text-ink-500">{user.company.name}</p>}
                  </Td>
                  <Td>
                    <Badge tone={user.is_active ? 'green' : 'red'}>{user.is_active ? 'Active' : 'Suspended'}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-ink-600">{formatDate(user.created_at)}</Td>
                  <Td>
                    {user.role !== 'admin' && (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="secondary" size="sm" disabled={setActive.isPending} onClick={() => setActive.mutate(user)}>
                          {user.is_active ? 'Suspend' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-red-700 hover:bg-red-50"
                          aria-label={`Delete ${user.name}`}
                          onClick={() => setDeleting(user)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-6">
            <Pagination meta={data.meta} onPageChange={setPage} />
          </div>
        </>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this user?"
          message={`${deleting.name} (${deleting.email}) and everything tied to the account will be removed permanently. To block access without losing data, suspend the account instead.`}
          confirmLabel="Delete user"
          loading={remove.isPending}
          onConfirm={() => remove.mutate(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
