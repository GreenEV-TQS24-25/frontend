'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { chargingSpotApi } from '@/lib/api'
import { toast } from 'sonner'
import { ChargingSpot, ChargingVelocity, ConnectorType, ChargingSpotState } from '@/lib/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormLayout } from '@/components/shared/FormLayout'
import { FormField } from '@/components/shared/FormField'

interface PageProps {
  params: Promise<{
    id: string
    spotId: string
  }>
}

export default function EditSpotPage({ params }: PageProps) {
  const { id, spotId } = use(params)
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [spot, setSpot] = useState<ChargingSpot | null>(null)

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const spots = await chargingSpotApi.getByStation(parseInt(id))
        const spotData = spots.find(s => s.id === parseInt(spotId))
        if (spotData) {
          setSpot(spotData)
        } else {
          toast.error('Spot not found')
          router.push(`/dashboard/stations/${id}`)
        }
      } catch (error) {
        console.error('Error fetching spot:', error)
        toast.error('Failed to fetch spot details')
        router.push(`/dashboard/stations/${id}`)
      }
    }

    if (user?.role === 'OPERATOR') {
      fetchSpot()
    }
  }, [id, spotId, user?.role, router])

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

    try {
      setLoading(true)

      // Check if only the status has changed
      const onlyStatusChanged = 
        powerKwNum === spot.powerKw &&
        pricePerKwhNum === spot.pricePerKwh &&
        chargingVelocity === spot.chargingVelocity &&
        connectorType === spot.connectorType &&
        state !== spot.state

      if (onlyStatusChanged) {
        // Use the new updateStatus method if only status changed
        if (!spot.id) {
          throw new Error('Spot ID is required')
        }
        const success = await chargingSpotApi.updateStatus(spot.id, state)
        if (success) {
          toast.success('Spot status updated successfully')
          router.push(`/dashboard/stations/${id}`)
        } else {
          toast.error('Failed to update spot status')
        }
      } else {
        // Use the full update method if other fields changed
        const spotData: ChargingSpot = {
          id: spot.id,
          station: spot.station,
          powerKw: powerKwNum,
          pricePerKwh: pricePerKwhNum,
          chargingVelocity,
          connectorType,
          state
        }
        await chargingSpotApi.update(spotData)
        toast.success('Spot updated successfully')
        router.push(`/dashboard/stations/${id}`)
      }
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
        backUrl={`/dashboard/stations/${id}`}
      />
      <FormLayout 
        title="Spot Details"
        onSubmit={handleSubmit}
        loading={loading}
        cancelUrl={`/dashboard/stations/${id}`}
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