'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function NewSpotPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const spotData: ChargingSpot = {
      station: { 
        id: Number(params.id),
        name: '', // Required by type but not used in creation
        lat: 0,   // Required by type but not used in creation
        lon: 0    // Required by type but not used in creation
      },
      powerKw: Number(formData.get('powerKw')),
      pricePerKwh: Number(formData.get('pricePerKwh')),
      chargingVelocity: formData.get('chargingVelocity') as ChargingVelocity,
      connectorType: formData.get('connectorType') as ConnectorType,
      state: ChargingSpotState.FREE
    }

    try {
      await chargingSpotApi.create(spotData)
      toast.success("Charging spot created successfully")
      router.push(`/dashboard/stations/${params.id}`)
    } catch (error) {
      console.error('Error creating spot:', error)
      toast.error("Failed to create charging spot")
    } finally {
      setLoading(false)
    }
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
              <Label htmlFor="powerKw">Power (kW)</Label>
              <Input
                id="powerKw"
                name="powerKw"
                type="number"
                step="0.1"
                required
                placeholder="Enter power in kW"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerKwh">Price per kWh</Label>
              <Input
                id="pricePerKwh"
                name="pricePerKwh"
                type="number"
                step="0.01"
                required
                placeholder="Enter price per kWh"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chargingVelocity">Charging Velocity</Label>
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
              <Label htmlFor="connectorType">Connector Type</Label>
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