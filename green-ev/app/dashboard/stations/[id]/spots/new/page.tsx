'use client'

import { useState } from 'react'
import { ChargingSpot, ChargingVelocity, ConnectorType, ChargingSpotState } from '@/lib/types'
import { chargingSpotApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useUser } from '@/lib/contexts/user-context'
import { useParams, useRouter } from 'next/navigation'

export default function NewSpotPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || user.role !== 'OPERATOR') {
      toast.error('Only operators can create charging spots')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const powerKw = Number(formData.get('powerKw'))
    const pricePerKwh = Number(formData.get('pricePerKwh'))
    const connectorType = formData.get('connectorType') as ConnectorType
    const chargingVelocity = formData.get('chargingVelocity') as ChargingVelocity

    // Validate required fields
    if (!powerKw || !pricePerKwh || !connectorType || !chargingVelocity) {
      toast.error('Please fill in all required fields with valid values')
      setLoading(false)
      return
    }

    const spotData: ChargingSpot = {
      station: { 
        id: Number(params.id),
        name: '', // Required by type but not used in creation
        lat: 0,   // Required by type but not used in creation
        lon: 0    // Required by type but not used in creation
      },
      powerKw,
      pricePerKwh,
      chargingVelocity,
      connectorType,
      state: ChargingSpotState.FREE
    }

    try {
      await chargingSpotApi.create(spotData)
      toast.success("Charging spot created successfully")
      router.push(`/dashboard/stations/${params.id}`)
    } catch (error) {
      console.error('Error creating spot:', error)
      toast.error("Failed to create charging spot. Make sure you are the operator of this station.")
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'OPERATOR') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">You don&apos;t have permission to create charging spots.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href={`/dashboard/stations/${params.id}`}>
          <Button variant="outline" className="mr-4 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5"/>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Charging Spot</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Spot Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="powerKw">Power (kW) *</Label>
              <Input
                id="powerKw"
                name="powerKw"
                type="number"
                step="0.1"
                required
                min="0"
                placeholder="Enter power in kW"
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
                min="0"
                placeholder="Enter price per kWh"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chargingVelocity">Charging Velocity *</Label>
              <Select name="chargingVelocity" required>
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
              <Select name="connectorType" required>
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

            <div className="flex justify-end gap-4">
              <Link href={`/dashboard/stations/${params.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Spot'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 