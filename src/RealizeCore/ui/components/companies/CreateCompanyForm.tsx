/**
 * @file src/RealizeCore/ui/components/companies/CreateCompanyForm.tsx
 * @version 1.0.0 – 2025-02-26 11:05
 * @description
 * Клиентская форма создания компании (пока без интеграции с API).
 */

'use client'

import React from 'react'

import { Input } from '@/RealizeCore/ui/components/shadcn/input'
import { Button } from '@/RealizeCore/ui/components/shadcn/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/RealizeCore/ui/components/shadcn/field'
import { Alert, AlertDescription, AlertTitle } from '@/RealizeCore/ui/components/shadcn/alert'

export interface CreateCompanyFormProps {
  locale: string
  defaultPhone?: string
  defaultEmail?: string
}

const textareaClasses =
  'min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const CreateCompanyForm: React.FC<CreateCompanyFormProps> = ({
  defaultPhone = '',
  defaultEmail,
}) => {
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [formState, setFormState] = React.useState({
    legalName: '',
    companyName: '',
    slug: '',
    urlAlias: '',
    identCode: '',
    description: '',
    administrativeArea: '',
    city: '',
    phone: defaultPhone,
    additionalPhone: '',
    website: '',
    address: '',
  })

  const updateField = (name: keyof typeof formState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const nextValue = event.target.value

    setFormState((prev) => {
      const nextState = { ...prev, [name]: nextValue }

      if (name === 'companyName') {
        if (!prev.slug) {
          nextState.slug = slugify(nextValue)
        }
        if (!prev.urlAlias) {
          nextState.urlAlias = slugify(nextValue)
        }
      }

      return nextState
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/accounts/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.message || 'Failed to create a company.')
      }

      setSuccess(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit the form.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {success ? (
        <Alert>
          <AlertTitle>Draft submitted</AlertTitle>
          <AlertDescription>
            We saved the provided data. API integration will appear in upcoming releases.
          </AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Failed to create a company</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldDescription>
            Attribute selection (company type, legal form) is now managed via the admin interface.
            Frontend form will support it in upcoming releases.
          </FieldDescription>
        </Field>

        <Field className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="legalName">Legal name</FieldLabel>
            <Input id="legalName" value={formState.legalName} onChange={updateField('legalName')} />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="companyName">Company name</FieldLabel>
            <Input
              id="companyName"
              value={formState.companyName}
              onChange={updateField('companyName')}
            />
          </div>
        </Field>

        <Field className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input id="slug" value={formState.slug} onChange={updateField('slug')} />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="urlAlias">URL alias</FieldLabel>
            <Input id="urlAlias" value={formState.urlAlias} onChange={updateField('urlAlias')} />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="identCode">Identification code</FieldLabel>
          <Input id="identCode" value={formState.identCode} onChange={updateField('identCode')} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <textarea
            id="description"
            className={textareaClasses}
            value={formState.description}
            onChange={updateField('description')}
            placeholder="Describe the specialization of the agency or developer"
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="phone">Primary phone</FieldLabel>
            <Input id="phone" value={formState.phone} onChange={updateField('phone')} />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="additionalPhone">Additional phone</FieldLabel>
            <Input
              id="additionalPhone"
              value={formState.additionalPhone}
              onChange={updateField('additionalPhone')}
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="website">Website</FieldLabel>
          <Input id="website" value={formState.website} onChange={updateField('website')} />
        </Field>

      </FieldGroup>

      <FieldGroup>
        <Field className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="administrativeArea">Administrative area ID</FieldLabel>
            <Input
              id="administrativeArea"
              value={formState.administrativeArea}
              onChange={updateField('administrativeArea')}
              placeholder="ID from Administrative Areas collection"
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="city">City ID</FieldLabel>
            <Input
              id="city"
              value={formState.city}
              onChange={updateField('city')}
              placeholder="City record ID"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input id="address" value={formState.address} onChange={updateField('address')} />
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-3">
        <Button type="submit" className="w-full md:w-auto" disabled={pending}>
          {pending ? 'Saving...' : 'Save draft'}
        </Button>
        {defaultEmail ? (
          <p className="text-xs text-muted-foreground">
            Notification email will be sent to {defaultEmail}
          </p>
        ) : null}
      </div>
    </form>
  )
}

export default CreateCompanyForm
