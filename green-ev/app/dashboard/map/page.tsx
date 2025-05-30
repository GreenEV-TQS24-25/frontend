'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ChargingStation } from '@/lib/types'
import { chargingStationApi } from '@/lib/api'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix default marker icons (prevents broken images)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: icon.src,
    iconRetinaUrl: icon.src,
    shadowUrl: iconShadow.src,
  });
}

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const center = {
  lat: 38.7223, // Lisbon coordinates
  lng: -9.1393,
}

export default function MapPage() {
  const [stations, setStations] = useState<ChargingStation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Create custom icon once (memoized)
  const zapIcon = useMemo(() => {
    return L.icon({
      iconUrl: '/zap.svg', // Public folder path
      iconSize: [30, 30], // Adjust size as needed
      iconAnchor: [15, 30], // Point tip at position
      popupAnchor: [0, -30], // Adjust popup position
      className: 'charging-station-marker'
    })
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await chargingStationApi.getAll()
        setStations(data)
      } catch (error) {
        console.error('Error loading stations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStations()
  }, [])

  if (!isMounted || isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading stations...</div>
  }

  return (
    <div className="h-screen">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lon]}
            icon={zapIcon}
          >
          </Marker>
        ))}

      </MapContainer>
    </div>
  )
}