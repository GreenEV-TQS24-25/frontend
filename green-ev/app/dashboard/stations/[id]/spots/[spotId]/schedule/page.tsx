'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { chargingSpotApi, sessionApi, vehicleApi } from '@/lib/api'
import { toast } from 'sonner'
import { ChargingSpot, Session, Vehicle } from '@/lib/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { WeeklyCalendar } from '@/components/WeeklyCalendar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PageProps {
  params: Promise<{
    id: string
    spotId: string
  }>
}

export default function SchedulePage({ params }: PageProps) {
  const { id, spotId } = use(params)
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [spot, setSpot] = useState<ChargingSpot | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [duration, setDuration] = useState(60) // Default duration in minutes
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const spots = await chargingSpotApi.getByStation(parseInt(id))
        const spotData = spots.find(s => s.id === parseInt(spotId))
        if (spotData) {
          setSpot(spotData)
          // Fetch sessions for this spot
          const allSessions = await sessionApi.getByStation(parseInt(id))
          const spotSessions = allSessions.filter(session => session.chargingSpot?.id === spotData.id)
          setSessions(spotSessions)
          // Fetch user's vehicles
          const userVehicles = await vehicleApi.getAll()
          setVehicles(userVehicles)
          // Select the first vehicle by default if available
          if (userVehicles.length > 0) {
            setSelectedVehicleId(userVehicles[0].id?.toString() || '')
          }
        } else {
          toast.error('Spot not found')
          router.push(`/dashboard/stations/${id}`)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch spot details')
        router.push(`/dashboard/stations/${id}`)
      }
    }

    if (user?.role === 'USER') {
      fetchData()
    }
  }, [id, spotId, user?.role, router])

  const handleSelectTime = (date: Date, selectedDuration: number) => {
    setSelectedTime(date)
    setDuration(selectedDuration)
  }

  const handleSchedule = async () => {
    if (!selectedTime || !spot?.id || !user?.id || !spot.connectorType || !selectedVehicleId) {
      toast.error('Please select a vehicle and time slot')
      return
    }

    const selectedVehicle = vehicles.find(v => v.id?.toString() === selectedVehicleId)
    if (!selectedVehicle) {
      toast.error('Selected vehicle not found')
      return
    }

    try {
      setLoading(true)
      const sessionData: Session = {
        uuid: crypto.randomUUID(),
        startTime: selectedTime.toISOString(),
        duration: duration,
        chargingSpot: {
          id: spot.id,
          powerKw: spot.powerKw,
          pricePerKwh: spot.pricePerKwh,
          state: spot.state,
          chargingVelocity: spot.chargingVelocity,
          connectorType: spot.connectorType,
          station: spot.station
        },
        vehicle: selectedVehicle
      }

      await sessionApi.create(sessionData)
      toast.success('Charging session scheduled successfully')
      router.push(`/dashboard/stations/${id}`)
    } catch (error) {
      console.error('Error scheduling session:', error)
      toast.error('Failed to schedule charging session')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'USER') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">You don&apos;t have permission to schedule charging sessions.</div>
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
        title={`Schedule Charging - ${spot.connectorType}`}
        backUrl={`/dashboard/stations/${id}`}
      />

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <WeeklyCalendar
              sessions={sessions}
              onSelectTime={handleSelectTime}
              spotId={spot.id!}
            />
          </div>

          <div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Spot Details</h3>
                    <div className="space-y-2 text-sm">
                      <p>Power: {spot.powerKw} kW</p>
                      <p>Price: {spot.pricePerKwh} €/kWh</p>
                      <p>Velocity: {spot.chargingVelocity}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Select Vehicle</h3>
                    <Select
                      value={selectedVehicleId}
                      onValueChange={setSelectedVehicleId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id?.toString() || ''}>
                            {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTime && (
                    <div>
                      <h3 className="font-medium mb-2">Selected Time</h3>
                      <p className="text-sm">
                        {format(selectedTime, 'PPp')}
                      </p>
                      <div className="mt-4">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="15"
                          step="15"
                          value={Math.floor(duration / 60)}
                          onChange={(e) => setDuration(parseInt(e.target.value) * 60)}
                          className="mt-1"
                          disabled={true}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Selected {Math.floor(duration / 60)} minutes starting at {format(selectedTime, 'HH:mm')}
                        </p>
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={handleSchedule}
                        disabled={loading || !selectedVehicleId}
                      >
                        {loading ? 'Scheduling...' : 'Schedule Session'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
} 