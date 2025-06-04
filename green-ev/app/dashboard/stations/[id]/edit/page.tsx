'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { chargingStationApi } from '@/lib/api'
import { toast } from 'sonner'
import { ChargingStation } from '@/lib/types'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { FormLayout } from '@/app/components/shared/FormLayout'
import { FormField } from '@/app/components/shared/FormField'
import { validateStationForm, createStationData } from '@/lib/utils/station-form'


export default function EditStationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [station, setStation] = useState<ChargingStation | null>(null)

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const stations = await chargingStationApi.getByOperator()
        const stationData = stations.find(s => s.chargingStation.id === parseInt(params.id))
        if (stationData) {
          setStation(stationData.chargingStation)
        } else {
          toast.error('Station not found')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error fetching station:', error)
        toast.error('Failed to fetch station details')
        router.push('/dashboard')
      }
    }

    if (user?.role === 'OPERATOR') {
      fetchStation()
    }
  }, [params.id, user?.role, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || user.role !== 'OPERATOR' || !station) {
      toast.error('Only operators can edit stations')
      return
    }

    const formData = new FormData(e.currentTarget)
    const validatedData = validateStationForm(formData)
    if (!validatedData) return

    const stationData = createStationData(validatedData, user, station)

    try {
      setLoading(true)
      await chargingStationApi.update(stationData)
      toast.success('Station updated successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating station:', error)
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to update station')
      } else {
        toast.error('Failed to update station')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'OPERATOR') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">You don&apos;t have permission to edit stations.</div>
      </div>
    )
  }

  if (!station) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">Loading station details...</div>
      </div>
    )
  }

  return (
    <>
      <PageHeader 
        title="Edit Charging Station" 
        backUrl="/dashboard"
      />
      <FormLayout 
        title="Station Details"
        onSubmit={handleSubmit}
        loading={loading}
        cancelUrl="/dashboard"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Name"
            name="name"
            required
            placeholder="Enter station name"
            defaultValue={station.name}
          />

          <FormField
            label="Photo URL"
            name="photoUrl"
            placeholder="Enter photo URL (optional)"
            defaultValue={station.photoUrl}
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
            defaultValue={station.lat}
          />

          <FormField
            label="Longitude"
            name="lon"
            type="number"
            required
            step="0.000001"
            placeholder="Enter longitude"
            defaultValue={station.lon}
          />
        </div>
      </FormLayout>
    </>
  )
} 