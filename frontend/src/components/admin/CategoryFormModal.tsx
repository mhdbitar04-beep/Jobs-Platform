import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { adminApi } from '@/api/admin'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/toast-context'
import { applyServerErrors } from '@/lib/errors'
import { queryKeys } from '@/lib/queryKeys'
import type { Category } from '@/types'

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(80, 'Use 80 characters or fewer.'),
})

type CategoryValues = z.infer<typeof categorySchema>

interface CategoryFormModalProps {
  /** The category to rename, or null to add a new one. */
  category: Category | null
  onClose: () => void
}

export function CategoryFormModal({ category, onClose }: CategoryFormModalProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CategoryValues>({ resolver: zodResolver(categorySchema), defaultValues: { name: category?.name ?? '' } })

  const save = useMutation({
    mutationFn: ({ name }: CategoryValues) => (category ? adminApi.renameCategory(category.id, name) : adminApi.createCategory(name)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminStats }),
      ])
      toast.success(category ? 'Category renamed.' : 'Category added.')
      onClose()
    },
    onError: (error) => setFormError(applyServerErrors(error, setError, ['name'])),
  })

  const onSubmit = handleSubmit((values) => {
    setFormError(null)
    save.mutate(values)
  })

  return (
    <Modal title={category ? 'Rename category' : 'Add category'} onClose={onClose} size="sm">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormAlert message={formError} />
        <Input label="Name" autoFocus placeholder="Data & Analytics" error={errors.name?.message} {...register('name')} />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {category ? 'Save name' : 'Add category'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
