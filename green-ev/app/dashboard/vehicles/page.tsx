'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/contexts/user-context'
import { vehicleApi } from '@/lib/api'
import { Vehicle, ConnectorType } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Car } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function VehiclesPage() {
  const { user } = useUser()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    licensePlate: '',
    connectorType: ''
  })

  useEffect(() => {
    if (user?.role === 'USER') {
      fetchVehicles()
    }
  }, [user?.role])

  const fetchVehicles = async () => {
    try {
      const userVehicles = await vehicleApi.getAll()
      setVehicles(userVehicles)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to fetch vehicles')
    }
  }

  const handleAddVehicle = async () => {
    try {
      setLoading(true)
      await vehicleApi.create({
        brand: newVehicle.brand,
        model: newVehicle.model,
        licensePlate: newVehicle.licensePlate,
        connectorType: newVehicle.connectorType as ConnectorType
      })
      toast.success('Vehicle added successfully')
      setIsAddDialogOpen(false)
      setNewVehicle({
        brand: '',
        model: '',
        licensePlate: '',
        connectorType: ''
      })
      fetchVehicles()
    } catch (error) {
      console.error('Error adding vehicle:', error)
      toast.error('Failed to add vehicle')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'USER') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">You don&apos;t have permission to view vehicles.</div>
      </div>
    )
  }

  return (
    <>
      <PageHeader 
        title="My Vehicles"
        backUrl="/dashboard"
      />

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-end mb-6">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Car className="h-6 w-6 mr-2 text-gray-500" />
                    <h3 className="font-medium">{vehicle.brand} {vehicle.model}</h3>
                  </div>
                  <span className="text-sm text-gray-500">{vehicle.connectorType}</span>
                </div>
                <p className="text-sm text-gray-500">License Plate: {vehicle.licensePlate}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={newVehicle.brand}
                  onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={newVehicle.licensePlate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connectorType">Connector Type</Label>
                <Select
                  value={newVehicle.connectorType}
                  onValueChange={(value) => setNewVehicle({ ...newVehicle, connectorType: value })}
                >
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVehicle} disabled={loading}>
                {loading ? 'Adding...' : 'Add Vehicle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
} 