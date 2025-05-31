'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { chargingStationApi } from '@/lib/api'
import { StationsSpots, ConnectorType } from '@/lib/types'
import { useUser } from '@/lib/contexts/user-context'
import L from 'leaflet'

// Fix for default marker icon
const DefaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

export default function MapPage() {
  const [stations, setStations] = useState<StationsSpots[]>([])
  const [selectedConnectorTypes, setSelectedConnectorTypes] = useState<ConnectorType[]>([])
  const { user } = useUser()

  useEffect(() => {
    const fetchStations = async () => {
      try {
        // If user is an operator, fetch only their stations
        const stationsData = user?.role === 'OPERATOR' 
          ? await chargingStationApi.getByOperator()
          : await chargingStationApi.getAll()
        setStations(stationsData)
      } catch (error) {
        console.error('Error fetching stations:', error)
      }
    }

    fetchStations()
  }, [user?.role])

  const getIconColor = (station: StationsSpots) => {
    const freeSpots = station.spots.filter(spot => spot.state === 'FREE').length
    const totalSpots = station.spots.length
    const freePercentage = (freeSpots / totalSpots) * 100

    if (freePercentage === 0) return 'red'
    if (freePercentage <= 35) return 'yellow'
    return 'green'
  }

  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      // If no connector types are selected, show all stations
      if (selectedConnectorTypes.length === 0) return true

      // Check if any of the station's spots have the selected connector types
      return station.spots.some(spot =>
        spot.connectorType && selectedConnectorTypes.includes(spot.connectorType)
      )
    })
  }, [stations, selectedConnectorTypes])

  const handleConnectorTypeChange = (type: ConnectorType) => {
    setSelectedConnectorTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <Card className="absolute top-4 right-4 z-10 p-4 bg-white/90 backdrop-blur-sm">
        <div className="space-y-4">
          <h3 className="font-semibold">Filter by Connector Type</h3>
          <div className="space-y-2">
            {Object.values(ConnectorType).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedConnectorTypes.includes(type)}
                  onCheckedChange={() => handleConnectorTypeChange(type)}
                />
                <Label htmlFor={type}>{type}</Label>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <MapContainer
        center={[38.7223, -9.1393]} // Lisbon coordinates
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredStations.map((station) => (
          <Marker
            key={station.chargingStation.id}
            position={[station.chargingStation.lat, station.chargingStation.lon]}
            icon={L.icon({
              iconUrl: `/zap-${getIconColor(station)}.svg`,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{station.chargingStation.name}</h3>
                <p className="text-sm text-gray-600">
                  {station.chargingStation.lat}, {station.chargingStation.lon}
                </p>
                <div className="mt-2">
                  <p className="text-sm">
                    Available spots: {station.spots.filter(spot => spot.state === 'FREE').length} / {station.spots.length}
                  </p>
                  <div className="mt-1">
                    <p className="text-sm font-medium">Connector Types:</p>
                    <ul className="text-sm text-gray-600">
                      {Array.from(new Set(station.spots.map(spot => spot.connectorType).filter(Boolean))).map(type => (
                        <li key={type}>{type}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}