'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { chargingSpotApi } from '@/lib/api'
import { toast } from 'sonner'
import { ChargingSpot, ChargingVelocity, ConnectorType, ChargingSpotState } from '@/lib/types'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { FormLayout } from '@/app/components/shared/FormLayout'
import { FormField } from '@/app/components/shared/FormField'

export default function EditSpotPage() {
  const params = useParams<{ id: string; spotId: string }>()
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [spot, setSpot] = useState<ChargingSpot | null>(null)

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const spots = await chargingSpotApi.getByStation(parseInt(params.id))
        const spotData = spots.find(s => s.id === parseInt(params.spotId))
        if (spotData) {
          setSpot(spotData)
        } else {
          toast.error('Spot not found')
          router.push(`/dashboard/stations/${params.id}`)
        }
      } catch (error) {
        console.error('Error fetching spot:', error)
        toast.error('Failed to fetch spot details')
        router.push(`/dashboard/stations/${params.id}`)
      }
    }

    if (user?.role === 'OPERATOR') {
      fetchSpot()
    }
  }, [params.id, params.spotId, user?.role, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || user.role !== 'OPERATOR' || !spot) {
      toast.error('Only operators can edit spots')
      return
    }

    const formData = new FormData(e.currentTarget)
    const powerKw = formData.get('powerKw') as string
    const pricePerKwh = formData.get('pricePerKwh') as string
    const chargingVelocity = formData.get('chargingVelocity') as ChargingVelocity
    const connectorType = formData.get('connectorType') as ConnectorType
    const state = formData.get('state') as ChargingSpotState

    // Validate required fields
    if (!powerKw || !pricePerKwh || !chargingVelocity || !connectorType || !state) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate numeric fields
    const powerKwNum = parseFloat(powerKw)
    const pricePerKwhNum = parseFloat(pricePerKwh)
    if (isNaN(powerKwNum) || isNaN(pricePerKwhNum)) {
      toast.error('Invalid numeric values')
      return
    }

    const spotData: ChargingSpot = {
      id: spot.id,
      station: spot.station,
      powerKw: powerKwNum,
      pricePerKwh: pricePerKwhNum,
      chargingVelocity,
      connectorType,
      state
    }

    try {
      setLoading(true)
      await chargingSpotApi.update(spotData)
      toast.success('Spot updated successfully')
      router.push(`/dashboard/stations/${params.id}`)
    } catch (error) {
      console.error('Error updating spot:', error)
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to update spot')
      } else {
        toast.error('Failed to update spot')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'OPERATOR') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">You don&apos;t have permission to edit spots.</div>
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">Loading spot details...</div>
      </div>
    )
  }

  return (
    <>
      <PageHeader 
        title="Edit Charging Spot" 
        backUrl={`/dashboard/stations/${params.id}`}
      />
      <FormLayout 
        title="Spot Details"
        onSubmit={handleSubmit}
        loading={loading}
        cancelUrl={`/dashboard/stations/${params.id}`}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Power (kW)"
            name="powerKw"
            type="number"
            required
            step="0.1"
            placeholder="Enter power in kW"
            defaultValue={spot.powerKw}
          />

          <FormField
            label="Price per kWh"
            name="pricePerKwh"
            type="number"
            required
            step="0.01"
            placeholder="Enter price per kWh"
            defaultValue={spot.pricePerKwh}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Charging Velocity"
            name="chargingVelocity"
            type="select"
            required
            defaultValue={spot.chargingVelocity}
            options={[
              { value: ChargingVelocity.NORMAL, label: 'Normal' },
              { value: ChargingVelocity.FAST, label: 'Fast' },
              { value: ChargingVelocity.FASTPP, label: 'Fast++' }
            ]}
          />

          <FormField
            label="Connector Type"
            name="connectorType"
            type="select"
            required
            defaultValue={spot.connectorType}
            options={[
              { value: ConnectorType.SAEJ1772, label: 'SAE J1772' },
              { value: ConnectorType.MENNEKES, label: 'Mennekes' },
              { value: ConnectorType.CHADEMO, label: 'CHAdeMO' },
              { value: ConnectorType.CCS, label: 'CCS' }
            ]}
          />
        </div>

        <FormField
          label="Status"
          name="state"
          type="select"
          required
          defaultValue={spot.state}
          options={[
            { value: ChargingSpotState.FREE, label: 'Free' },
            { value: ChargingSpotState.OCCUPIED, label: 'Occupied' },
            { value: ChargingSpotState.OUT_OF_SERVICE, label: 'Out of Service' }
          ]}
        />
      </FormLayout>
    </>
  )
} 