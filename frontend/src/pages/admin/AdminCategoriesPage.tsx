import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { adminApi } from '@/api/admin'
import { jobsApi } from '@/api/jobs'
import { CategoryFormModal } from '@/components/admin/CategoryFormModal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { Table, Td, Th } from '@/components/ui/Table'
import { useToast } from '@/context/toast-context'
import { getErrorMessage } from '@/lib/errors'
import { queryKeys } from '@/lib/queryKeys'
import type { Category } from '@/types'

/** `'new'` opens the form empty; a category opens it for renaming. */
type Editing = Category | 'new' | null

export function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<Editing>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const { data: categories, isPending, isError, error, refetch } = useQuery({ queryKey: queryKeys.categories, queryFn: jobsApi.categories })

  const remove = useMutation({
    mutationFn: (category: Category) => adminApi.deleteCategory(category.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      toast.success('Category deleted.')
    },
    // A category that still has jobs comes back as a 422 with the reason.
    onError: (removeError) => toast.error(getErrorMessage(removeError)),
    onSettled: () => setDeleting(null),
  })

  const addButton = (
    <Button onClick={() => setEditing('new')}>
      <Plus className="size-4" aria-hidden />
      Add category
    </Button>
  )

  return (
    <>
      <PageHeader title="Categories" description="How jobs are grouped on the site." action={addButton} />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <PageSpinner />
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" description="Companies need at least one category to post a job." action={addButton} />
      ) : (
        <Table className="min-w-96">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Open jobs</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <Td>
                  <p className="font-semibold text-ink-900">{category.name}</p>
                  <p className="text-xs text-ink-500">/{category.slug}</p>
                </Td>
                <Td className="tabular-nums">{category.jobs_count}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(category)}>
                      <Pencil className="size-3.5" aria-hidden />
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-red-700 hover:bg-red-50"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => setDeleting(category)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {editing && <CategoryFormModal category={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete this category?"
          message={`"${deleting.name}" will be removed. A category that still has jobs, open or closed, cannot be deleted.`}
          confirmLabel="Delete category"
          loading={remove.isPending}
          onConfirm={() => remove.mutate(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
