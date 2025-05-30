'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { StationsSpots, ConnectorType } from '@/lib/types'
import { chargingStationApi } from '@/lib/api'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
import L from 'leaflet'

// Fix for default marker icon
const DefaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

const CONNECTOR_TYPES = [
  ConnectorType.SAEJ1772,
  ConnectorType.MENNEKES,
  ConnectorType.CHADEMO,
  ConnectorType.CCS,
] as const

export default function MapPage() {
  const [stations, setStations] = useState<StationsSpots[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selectedConnectors, setSelectedConnectors] = useState<ConnectorType[]>([])

  useEffect(() => {
    setMounted(true)
    const fetchStations = async () => {
      try {
        const data = await chargingStationApi.getAll()
        setStations(data)
      } catch (error) {
        console.error('Error fetching stations:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchStations()

    // Set up polling every minute
    const intervalId = setInterval(fetchStations, 60000) // 60000 ms = 1 minute

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const getIconColor = (station: StationsSpots) => {
    const freeSpots = station.spots.filter(spot => spot.state === 'FREE').length;
    const totalSpots = station.spots.length;
    const freePercentage = (freeSpots / totalSpots) * 100;

    if (freePercentage == 0) return 'red';
    else if (freePercentage <= 35) return 'yellow';
    return 'green';
  }

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchesConnectors =
        selectedConnectors.length === 0 ||
        station.spots.some(
          (spot) =>
            spot.connectorType &&
            selectedConnectors.includes(spot.connectorType)
        )
      return matchesConnectors
    })
  }, [stations, selectedConnectors])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <div className="absolute right-4 top-3 z-10">
        <Card>
          <CardHeader>
            <CardTitle>Filter by Connector Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CONNECTOR_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={selectedConnectors.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedConnectors([...selectedConnectors, type])
                      } else {
                        setSelectedConnectors(
                          selectedConnectors.filter((t) => t !== type)
                        )
                      }
                    }}
                  />
                  <Label htmlFor={type}>{type}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {mounted && (
        <MapContainer
          center={[38.7223, -9.1393]}
          zoom={13}
          className="h-full w-full z-0"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredStations.map((station) => (
            <Marker
              key={station.chargingStation.id}
              position={[
                station.chargingStation.lat,
                station.chargingStation.lon,
              ]}
              icon={L.icon({
                iconUrl: `/zap-${getIconColor(station)}.svg`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
              })}
            >
              <Popup>
                <Card className="w-[300px]">
                  <CardHeader>
                    <CardTitle>{station.chargingStation.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {`${station.chargingStation.lat}, ${station.chargingStation.lon}`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {station.spots.filter((spot) => spot.state === 'FREE')
                            .length}{" "}
                          spots available
                        </Badge>
                        <Badge variant="outline">
                          {station.spots.length} total spots
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Connector Types:</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Array.from(
                            new Set(
                              station.spots
                                .map((spot) => spot.connectorType)
                                .filter(Boolean)
                            )
                          ).map((type) => (
                            <Badge key={type} variant="secondary">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  )
}