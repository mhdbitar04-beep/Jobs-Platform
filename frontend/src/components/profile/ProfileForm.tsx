import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { profileApi } from '@/api/profile'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { FormAlert } from '@/components/ui/FormAlert'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TagInput } from '@/components/ui/TagInput'
import { Textarea } from '@/components/ui/Textarea'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/context/toast-context'
import { applyServerErrors } from '@/lib/errors'
import { emptyToNull } from '@/lib/format'
import { COMPANY_SIZE_OPTIONS } from '@/lib/options'
import type { ProfilePayload, User } from '@/types'

const MAX_SKILLS = 20

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100),
  phone: z.string().max(30),
  location: z.string().max(150),
  headline: z.string().max(150),
  bio: z.string().max(2000),
  skills: z.array(z.string()).max(MAX_SKILLS),
  company: z.object({
    name: z.string().max(150),
    website: z.union([z.literal(''), z.url('Enter a full address, starting with https://')]),
    location: z.string().max(150),
    industry: z.string().max(100),
    size: z.string(),
    description: z.string().max(3000),
  }),
})

type ProfileValues = z.infer<typeof profileSchema>

const FIELDS = [
  'name',
  'phone',
  'location',
  'headline',
  'bio',
  'skills',
  'company.name',
  'company.website',
  'company.location',
  'company.industry',
  'company.size',
  'company.description',
] as const

function toValues(user: User): ProfileValues {
  return {
    name: user.name,
    phone: user.phone ?? '',
    location: user.location ?? '',
    headline: user.headline ?? '',
    bio: user.bio ?? '',
    skills: user.skills,
    company: {
      name: user.company?.name ?? '',
      website: user.company?.website ?? '',
      location: user.company?.location ?? '',
      industry: user.company?.industry ?? '',
      size: user.company?.size ?? '',
      description: user.company?.description ?? '',
    },
  }
}

function toPayload(values: ProfileValues, isCompany: boolean): ProfilePayload {
  const { company, ...personal } = values
  return {
    name: personal.name,
    phone: emptyToNull(personal.phone),
    location: emptyToNull(personal.location),
    headline: emptyToNull(personal.headline),
    bio: emptyToNull(personal.bio),
    skills: personal.skills,
    ...(isCompany && {
      company: {
        name: company.name.trim(),
        website: emptyToNull(company.website),
        location: emptyToNull(company.location),
        industry: emptyToNull(company.industry),
        size: emptyToNull(company.size),
        description: emptyToNull(company.description),
      },
    }),
  }
}

export function ProfileForm({ user }: { user: User }) {
  const { setUser } = useAuth()
  const toast = useToast()
  const isCompany = user.role === 'company'
  const isSeeker = user.role === 'seeker'
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: toValues(user) })

  const save = useMutation({
    mutationFn: (values: ProfileValues) => profileApi.update(toPayload(values, isCompany)),
    onSuccess: (updated) => {
      setUser(updated)
      reset(toValues(updated))
      toast.success('Profile saved.')
    },
    onError: (error) => setFormError(applyServerErrors(error, setError, FIELDS)),
  })

  const onSubmit = handleSubmit((values) => {
    if (isCompany && values.company.name.trim() === '') {
      setError('company.name', { message: 'Enter the company name.' })
      return
    }
    setFormError(null)
    save.mutate(values)
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Card>
        <CardHeader title="About you" description={isSeeker ? 'Companies see this when you apply.' : undefined} />
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" value={user.email} disabled readOnly hint="Your email cannot be changed here." />
          <Input label="Phone" type="tel" optional autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
          <Input label="Location" optional placeholder="City, country" error={errors.location?.message} {...register('location')} />
          {isSeeker && (
            <>
              <Input
                label="Headline"
                optional
                placeholder="Junior full-stack developer"
                error={errors.headline?.message}
                wrapperClassName="sm:col-span-2"
                {...register('headline')}
              />
              <Textarea label="About" optional rows={5} error={errors.bio?.message} wrapperClassName="sm:col-span-2" {...register('bio')} />
              <div className="sm:col-span-2">
                <Controller
                  control={control}
                  name="skills"
                  render={({ field, fieldState }) => (
                    <TagInput
                      label="Skills"
                      value={field.value}
                      onChange={field.onChange}
                      max={MAX_SKILLS}
                      placeholder="React, Laravel, SQL"
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {isCompany && (
        <Card>
          <CardHeader title="Company" description="Shown next to every job you post." />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Input label="Company name" error={errors.company?.name?.message} {...register('company.name')} />
            <Input
              label="Website"
              type="url"
              optional
              placeholder="https://example.com"
              error={errors.company?.website?.message}
              {...register('company.website')}
            />
            <Input label="Head office" optional placeholder="City, country" error={errors.company?.location?.message} {...register('company.location')} />
            <Input label="Industry" optional placeholder="Software" error={errors.company?.industry?.message} {...register('company.industry')} />
            <Select
              label="Company size"
              placeholder="Not specified"
              options={COMPANY_SIZE_OPTIONS}
              error={errors.company?.size?.message}
              {...register('company.size')}
            />
            <Textarea
              label="About the company"
              optional
              rows={5}
              error={errors.company?.description?.message}
              wrapperClassName="sm:col-span-2"
              {...register('company.description')}
            />
          </div>
        </Card>
      )}

      <FormAlert message={formError} />
      <div className="flex justify-end">
        <Button type="submit" loading={save.isPending} disabled={!isDirty}>
          Save profile
        </Button>
      </div>
    </form>
  )
}
