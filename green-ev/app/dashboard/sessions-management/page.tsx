'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/contexts/user-context'
import { chargingStationApi, sessionApi } from '@/lib/api'
import { StationsSpots, Session } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { WeeklyCalendar } from '@/components/WeeklyCalendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function SessionsManagementPage() {
  const { user } = useUser()
  const [stations, setStations] = useState<StationsSpots[]>([])
  const [selectedStation, setSelectedStation] = useState<string>('')
  const [selectedSpot, setSelectedSpot] = useState<string>('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'OPERATOR') {
      fetchStations()
    }
  }, [user?.role])

  useEffect(() => {
    if (selectedStation) {
      fetchSessions()
    }
  }, [selectedStation, selectedSpot])

  const fetchStations = async () => {
    try {
      const operatorStations = await chargingStationApi.getByOperator()
      setStations(operatorStations)
      if (operatorStations.length > 0) {
        setSelectedStation(operatorStations[0].chargingStation.id?.toString() || '')
        if (operatorStations[0].spots.length > 0) {
          setSelectedSpot(operatorStations[0].spots[0].id?.toString() || '')
        }
      }
    } catch (error) {
      console.error('Error fetching stations:', error)
      toast.error('Failed to fetch stations')
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    if (!selectedStation) return

    try {
      const stationSessions = await sessionApi.getByStation(parseInt(selectedStation))
      const spotSessions = selectedSpot 
        ? stationSessions.filter(session => session.chargingSpot?.id === parseInt(selectedSpot))
        : stationSessions
      setSessions(spotSessions)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to fetch sessions')
    }
  }

  const handleSelectTime = (date: Date, duration: number) => {
    // This is just for viewing sessions, no need to handle time selection
  }

  if (!user || user.role !== 'OPERATOR') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">You don&apos;t have permission to view sessions management.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
        </div>
      </div>
    )
  }

  const currentStation = stations.find(s => s.chargingStation.id?.toString() === selectedStation)
  const currentSpot = currentStation?.spots.find(s => s.id?.toString() === selectedSpot)

  return (
    <>
      <PageHeader 
        title="Sessions Calendar"
        backUrl="/dashboard"
      />

      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Station</label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem 
                      key={station.chargingStation.id} 
                      value={station.chargingStation.id?.toString() || ''}
                    >
                      {station.chargingStation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentStation && (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Spot</label>
                <Select value={selectedSpot} onValueChange={setSelectedSpot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a spot" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentStation.spots.map((spot) => (
                      <SelectItem 
                        key={spot.id} 
                        value={spot.id?.toString() || ''}
                      >
                        {spot.connectorType} - {spot.powerKw}kW
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {currentSpot && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-6 w-6 mr-2 text-gray-500" />
                    <h3 className="font-medium">{currentStation?.chargingStation.name}</h3>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {currentSpot.connectorType} - {currentSpot.powerKw}kW
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {currentSpot && (
          <WeeklyCalendar
            sessions={sessions}
            onSelectTime={handleSelectTime}
            spotId={currentSpot.id!}
          />
        )}
      </div>
    </>
  )
} 