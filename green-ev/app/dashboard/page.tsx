'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chargingStationApi } from '@/lib/api'
import { StationsSpots } from '@/lib/types'
import { useUser } from '@/lib/contexts/user-context'
import Image from 'next/image'
import { Zap } from 'lucide-react'

export default function DashboardPage() {
  const [stations, setStations] = useState<StationsSpots[]>([])
  const { user } = useUser()

  useEffect(() => {
    const fetchStations = async () => {
      try {
        // If user is an operator, fetch only their stations
        const stationsData = user?.role === 'OPERATOR' 
          ? await chargingStationApi.getByOperator()
          : await chargingStationApi.getAll()
        setStations(stationsData || [])
      } catch (error) {
        console.error('Error fetching stations:', error)
        setStations([])
      }
    }

    fetchStations()
  }, [user?.role])

  const getAvailabilityColor = (station: StationsSpots) => {
    if (!station.spots || !Array.isArray(station.spots)) {
      return 'bg-gray-100 text-gray-800'
    }
    
    const freeSpots = station.spots.filter(spot => spot.state === 'FREE').length
    const totalSpots = station.spots.length
    const freePercentage = (freeSpots / totalSpots) * 100

    if (freePercentage === 0) return 'bg-red-100 text-red-800'
    if (freePercentage <= 35) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Stations Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stations.map((station) => (
          station.chargingStation ? (
            <Card key={station.chargingStation.id} className="overflow-hidden">
              <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                <Image
                  src="/charging-station.jpg"
                  alt={station.chargingStation.name || "Charging Station"}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-24 h-24 text-gray-400" />
                </div>
              </div>
              <CardHeader>
                <CardTitle>{station.chargingStation.name || "Unnamed Station"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">
                      {station.chargingStation.lat}, {station.chargingStation.lon}
                    </p>
                  </div>
                  
                  {station.spots ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Availability</p>
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {station.spots.filter(spot => spot.state === 'FREE').length} / {station.spots.length} spots
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(station)}`}>
                            {station.spots.filter(spot => spot.state === 'FREE').length === 0 ? 'Full' : 'Available'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Connector Types</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Array.from(new Set(station.spots.map(spot => spot.connectorType).filter(Boolean))).map(type => (
                            <span key={type} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>No spot data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null
        ))}
      </div>
    </div>
  )
}