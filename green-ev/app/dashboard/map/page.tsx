'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { StationsSpots } from '@/lib/types'
import { chargingStationApi } from '@/lib/api'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

export default function MapPage() {
  const [stations, setStations] = useState<StationsSpots[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const fetchStations = async () => {
      try {
        const data = await chargingStationApi.getAll()
        console.log(data)
        setStations(data)
      } catch (error) {
        console.error('Error fetching stations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStations()
  }, [])

  const getIconColor = (station: StationsSpots) => {
    const freeSpots = station.spots.filter(spot => spot.state === 'FREE').length;
    const totalSpots = station.spots.length;
    const freePercentage = (freeSpots / totalSpots) * 100;

    if (freePercentage == 0) return 'red';
    else if (freePercentage <= 35) return 'yellow';
    return 'green';
  }

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <MapContainer
        center={[38.7223, -9.1393]} // Lisbon coordinates
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {stations.map((station) => (
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
                <h3 className="font-bold">{station.chargingStation.name}</h3>
                <p>Available spots: {station.spots.filter(spot => spot.state === 'FREE').length}</p>
                <p>Total spots: {station.spots.length}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}