'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { chargingStationApi } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { FormLayout } from '@/app/components/shared/FormLayout'
import { FormField } from '@/app/components/shared/FormField'
import { validateStationForm, createStationData } from '@/lib/utils/station-form'

export default function NewStationPage() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || user.role !== 'OPERATOR') {
      toast.error('Only operators can create stations')
      return
    }

    const formData = new FormData(e.currentTarget)
    const validatedData = validateStationForm(formData)
    if (!validatedData) return

    const stationData = createStationData(validatedData, user)

    try {
      setLoading(true)
      await chargingStationApi.create(stationData)
      toast.success('Station created successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating station:', error)
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to create station')
      } else {
        toast.error('Failed to create station')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'OPERATOR') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">You don&apos;t have permission to create stations.</div>
      </div>
    )
  }

  return (
    <>
      <PageHeader 
        title="New Charging Station" 
        backUrl="/dashboard"
      />
      <FormLayout 
        title="Station Details"
        onSubmit={handleSubmit}
        loading={loading}
        cancelUrl="/dashboard"
        submitText="Create Station"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Name"
            name="name"
            required
            placeholder="Enter station name"
          />

          <FormField
            label="Photo URL"
            name="photoUrl"
            placeholder="Enter photo URL (optional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Latitude"
            name="lat"
            type="number"
            required
            step="0.000001"
            placeholder="Enter latitude"
          />

          <FormField
            label="Longitude"
            name="lon"
            type="number"
            required
            step="0.000001"
            placeholder="Enter longitude"
          />
        </div>
      </FormLayout>
    </>
  )
} 