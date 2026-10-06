import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/auth-context'
import { applyServerErrors } from '@/lib/errors'
import { ROLE_LABELS } from '@/lib/options'
import type { Role } from '@/types'
import { AuthLayout } from './AuthLayout'

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

type LoginValues = z.infer<typeof loginSchema>

const DEMO_PASSWORD = 'password'
const DEMO_ACCOUNTS: { role: Role; email: string }[] = [
  { role: 'seeker', email: 'seeker@jobs.test' },
  { role: 'company', email: 'company@jobs.test' },
  { role: 'admin', email: 'admin@jobs.test' },
]

export function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  // On success the <GuestOnly> guard around this page redirects to the right place.
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values)
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ['email', 'password']))
    }
  })

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', DEMO_PASSWORD, { shouldValidate: true })
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle={
        <>
          New here?{' '}
          <Link to="/register" state={location.state} className="font-semibold text-brand-600 hover:text-brand-800">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <FormAlert message={formError} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" size="lg" loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <section aria-labelledby="demo-heading" className="mt-10 rounded-xl border border-ink-200 bg-ink-50 p-5">
        <h2 id="demo-heading" className="font-sans text-sm font-semibold">
          Demo accounts
        </h2>
        <p className="mt-1 text-sm text-ink-600">Pick one to fill in the form, then log in.</p>
        <div className="mt-4 grid gap-2">
          {DEMO_ACCOUNTS.map(({ role, email }) => (
            <button
              key={role}
              type="button"
              onClick={() => fillDemo(email)}
              className="flex items-center justify-between gap-3 rounded-md border border-ink-200 bg-white px-3.5 py-2.5 text-left text-sm hover:border-brand-400"
            >
              <span className="font-semibold text-ink-900">{ROLE_LABELS[role]}</span>
              <span className="truncate text-ink-600">{email}</span>
            </button>
          ))}
        </div>
      </section>
    </AuthLayout>
  )
}
