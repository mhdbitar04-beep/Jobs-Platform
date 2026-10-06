import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { jobsApi } from '@/api/jobs'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card, CardHeader } from '@/components/ui/Card'
import { FormAlert } from '@/components/ui/FormAlert'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TagInput } from '@/components/ui/TagInput'
import { Textarea } from '@/components/ui/Textarea'
import { applyServerErrors } from '@/lib/errors'
import { JOB_STATUS_OPTIONS, JOB_TYPE_OPTIONS, LEVEL_OPTIONS, WORK_MODE_OPTIONS } from '@/lib/options'
import { queryKeys } from '@/lib/queryKeys'
import type { Job, JobPayload } from '@/types'
import { EMPTY_JOB_VALUES, JOB_FORM_FIELDS, jobFormSchema, MAX_JOB_SKILLS, toJobFormValues, toJobPayload, type JobFormValues } from './jobFormSchema'

interface JobFormProps {
  /** The job being edited; leave out to create a new one. */
  job?: Job
  submitLabel: string
  onSubmit: (payload: JobPayload) => Promise<unknown>
}

export function JobForm({ job, submitLabel, onSubmit }: JobFormProps) {
  const { data: categories = [] } = useQuery({ queryKey: queryKeys.categories, queryFn: jobsApi.categories })
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: job ? toJobFormValues(job) : EMPTY_JOB_VALUES,
  })

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await onSubmit(toJobPayload(values))
    } catch (error) {
      setFormError(applyServerErrors(error, setError, JOB_FORM_FIELDS))
    }
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card>
        <CardHeader title="The role" />
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Input
            label="Job title"
            placeholder="Junior full-stack developer"
            error={errors.title?.message}
            wrapperClassName="sm:col-span-2"
            {...register('title')}
          />
          {/* Keyed on the loaded categories so the select picks up its value once the options exist. */}
          <Select
            key={categories.length}
            label="Category"
            placeholder="Choose a category"
            options={categories.map((category) => ({ value: String(category.id), label: category.name }))}
            error={errors.category_id?.message}
            {...register('category_id')}
          />
          <Input label="Location" placeholder="City, country" error={errors.location?.message} {...register('location')} />
          <Select label="Job type" options={JOB_TYPE_OPTIONS} error={errors.type?.message} {...register('type')} />
          <Select label="Work mode" options={WORK_MODE_OPTIONS} error={errors.work_mode?.message} {...register('work_mode')} />
          <Select label="Experience level" options={LEVEL_OPTIONS} error={errors.experience_level?.message} {...register('experience_level')} />
          <Select
            label="Status"
            options={JOB_STATUS_OPTIONS}
            hint="Only open jobs are listed and accept applications."
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Description" />
        <div className="grid gap-5 p-5">
          <Textarea
            label="About the role"
            rows={9}
            hint="What the person will do day to day. At least 30 characters. Line breaks are kept."
            error={errors.description?.message}
            {...register('description')}
          />
          <Textarea
            label="Requirements"
            optional
            rows={6}
            hint="One requirement per line reads best."
            error={errors.requirements?.message}
            {...register('requirements')}
          />
          <Controller
            control={control}
            name="skills"
            render={({ field, fieldState }) => (
              <TagInput
                label="Skills"
                value={field.value}
                onChange={field.onChange}
                max={MAX_JOB_SKILLS}
                placeholder="React, TypeScript, REST"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Salary and deadline" description="Jobs with a salary range get more applications." />
        <div className="grid gap-5 p-5 sm:grid-cols-3">
          <Input label="Minimum salary" optional inputMode="numeric" placeholder="30000" error={errors.salary_min?.message} {...register('salary_min')} />
          <Input label="Maximum salary" optional inputMode="numeric" placeholder="45000" error={errors.salary_max?.message} {...register('salary_max')} />
          <Input label="Apply by" optional type="date" error={errors.deadline?.message} {...register('deadline')} />
        </div>
      </Card>

      <FormAlert message={formError} />
      <div className="flex justify-end gap-3">
        <Link to="/company/jobs" className={buttonStyles('secondary')}>
          Cancel
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
