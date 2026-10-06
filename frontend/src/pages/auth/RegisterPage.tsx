import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, UserRound, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/auth-context'
import { applyServerErrors } from '@/lib/errors'
import { cn } from '@/lib/format'
import { AuthLayout } from './AuthLayout'

const registerSchema = z
  .object({
    role: z.enum(['seeker', 'company']),
    name: z.string().trim().min(1, 'Enter your name.').max(100),
    company_name: z.string().trim().max(150),
    email: z.email('Enter a valid email address.').max(150),
    password: z.string().min(8, 'Use at least 8 characters.'),
    password_confirmation: z.string(),
  })
  .refine((values) => values.role !== 'company' || values.company_name.length > 0, {
    path: ['company_name'],
    message: 'Enter the company name.',
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: 'The passwords do not match.',
  })

type RegisterValues = z.infer<typeof registerSchema>

const FIELDS = ['role', 'name', 'company_name', 'email', 'password', 'password_confirmation'] as const

const ROLE_CHOICES: { value: RegisterValues['role']; label: string; description: string; icon: LucideIcon }[] = [
  { value: 'seeker', label: 'I am looking for a job', description: 'Search, save and apply.', icon: UserRound },
  { value: 'company', label: 'I am hiring', description: 'Post jobs and review applicants.', icon: Building2 },
]

export function RegisterPage() {
  const { register: registerAccount } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: searchParams.get('role') === 'company' ? 'company' : 'seeker',
      name: '',
      company_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })
  const role = useWatch({ control, name: 'role' })

  // On success the <GuestOnly> guard around this page redirects to the right place.
  const onSubmit = handleSubmit(async ({ company_name, ...values }) => {
    setFormError(null)
    try {
      await registerAccount(values.role === 'company' ? { ...values, company_name } : values)
    } catch (error) {
      setFormError(applyServerErrors(error, setError, FIELDS))
    }
  })

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have one?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-brand-600 hover:text-brand-800">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <FormAlert message={formError} />

        <fieldset>
          <legend className="text-sm font-medium text-ink-800">What brings you here?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {ROLE_CHOICES.map(({ value, label, description, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-500',
                  role === value ? 'border-brand-500 bg-brand-50' : 'border-ink-300 hover:border-ink-400',
                )}
              >
                <input type="radio" value={value} className="sr-only" {...register('role')} />
                <Icon className={cn('size-5', role === value ? 'text-brand-600' : 'text-ink-500')} aria-hidden />
                <span className="mt-1 text-sm font-semibold text-ink-900">{label}</span>
                <span className="text-xs text-ink-600">{description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Input label="Your name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        {role === 'company' && (
          <Input label="Company name" autoComplete="organization" error={errors.company_name?.message} {...register('company_name')} />
        )}
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
        <Button type="submit" size="lg" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
