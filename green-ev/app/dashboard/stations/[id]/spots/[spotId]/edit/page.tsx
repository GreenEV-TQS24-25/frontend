'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { chargingSpotApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ChargingSpot, ChargingVelocity, ConnectorType, ChargingSpotState } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function EditSpotPage({ params }: { params: { id: string; spotId: string } }) {
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
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">You don't have permission to edit spots.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Loading spot details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <div className="flex items-center">
          <Link href={`/dashboard/stations/${params.id}`}>
            <Button variant="outline" className="mr-1 hover:bg-gray-100">
              <ArrowLeft/>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Charging Spot</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="powerKw">Power (kW) *</Label>
                  <Input
                    id="powerKw"
                    name="powerKw"
                    type="number"
                    step="0.1"
                    required
                    placeholder="Enter power in kW"
                    defaultValue={spot.powerKw}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerKwh">Price per kWh *</Label>
                  <Input
                    id="pricePerKwh"
                    name="pricePerKwh"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Enter price per kWh"
                    defaultValue={spot.pricePerKwh}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chargingVelocity">Charging Velocity *</Label>
                  <Select name="chargingVelocity" defaultValue={spot.chargingVelocity} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select charging velocity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ChargingVelocity.NORMAL}>Normal</SelectItem>
                      <SelectItem value={ChargingVelocity.FAST}>Fast</SelectItem>
                      <SelectItem value={ChargingVelocity.FASTPP}>Fast++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="connectorType">Connector Type *</Label>
                  <Select name="connectorType" defaultValue={spot.connectorType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select connector type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ConnectorType.SAEJ1772}>SAE J1772</SelectItem>
                      <SelectItem value={ConnectorType.MENNEKES}>Mennekes</SelectItem>
                      <SelectItem value={ConnectorType.CHADEMO}>CHAdeMO</SelectItem>
                      <SelectItem value={ConnectorType.CCS}>CCS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Status *</Label>
                <Select name="state" defaultValue={spot.state} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ChargingSpotState.FREE}>Free</SelectItem>
                    <SelectItem value={ChargingSpotState.OCCUPIED}>Occupied</SelectItem>
                    <SelectItem value={ChargingSpotState.OUT_OF_SERVICE}>Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4">
                <Link href={`/dashboard/stations/${params.id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 