import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { profileApi } from '@/api/profile'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { FormAlert } from '@/components/ui/FormAlert'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/context/toast-context'
import { applyServerErrors } from '@/lib/errors'

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    password_confirmation: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: 'The passwords do not match.',
  })

type PasswordValues = z.infer<typeof passwordSchema>

const FIELDS = ['current_password', 'password', 'password_confirmation'] as const
const EMPTY: PasswordValues = { current_password: '', password: '', password_confirmation: '' }

export function PasswordForm() {
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: EMPTY })

  const change = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      reset(EMPTY)
      toast.success('Password changed.')
    },
    onError: (error) => setFormError(applyServerErrors(error, setError, FIELDS)),
  })

  const onSubmit = handleSubmit((values) => {
    setFormError(null)
    change.mutate(values)
  })

  return (
    <Card>
      <CardHeader title="Password" />
      <form onSubmit={onSubmit} noValidate className="grid gap-5 p-5 sm:grid-cols-2">
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={errors.current_password?.message}
          wrapperClassName="sm:col-span-2 sm:max-w-sm"
          {...register('current_password')}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
        <div className="space-y-4 sm:col-span-2">
          <FormAlert message={formError} />
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" loading={change.isPending}>
              Change password
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
