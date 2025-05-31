'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ChargingStation, ChargingSpot } from '@/lib/types'
import { chargingStationApi, chargingSpotApi } from '@/lib/api'
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

interface StationWithSpots extends ChargingStation {
  spots: ChargingSpot[];
}

export default function MapPage() {
  const [stations, setStations] = useState<StationWithSpots[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Create custom icons once (memoized)
  const icons = useMemo(() => ({
    red: L.icon({
      iconUrl: '/zap-red.svg',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
      className: 'charging-station-marker'
    }),
    yellow: L.icon({
      iconUrl: '/zap-yellow.svg',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
      className: 'charging-station-marker'
    }),
    green: L.icon({
      iconUrl: '/zap-green.svg',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
      className: 'charging-station-marker'
    })
  }), [])

  const getStationIcon = (spots: ChargingSpot[]) => {
    const totalSpots = spots.length
    if (totalSpots === 0) return icons.red

    const freeSpots = spots.filter(spot => spot.state === 'FREE').length
    const freePercentage = (freeSpots / totalSpots) * 100
    console.log(freePercentage)

    if (freePercentage === 0) return icons.red
    if (freePercentage <= 35) return icons.yellow
    return icons.green
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const loadStations = async () => {
      try {
        const stationsData = await chargingStationApi.getAll()
        const stationsWithSpots = await Promise.all(
          stationsData.map(async (station) => {
            const spots = await chargingSpotApi.getByStation(station.id!)
            return { ...station, spots }
          })
        )
        setStations(stationsWithSpots)
      } catch (error) {
        console.error('Error loading stations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStations()
  }, [])

  if (!isMounted || isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-4rem)]">Loading stations...</div>
  }

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lon]}
            icon={getStationIcon(station.spots)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{station.name}</h3>
                <p>Total Spots: {station.spots.length}</p>
                <p>Free Spots: {station.spots.filter(spot => spot.state === 'FREE').length}</p>
                {station.operator && (
                  <p>Operator: {station.operator.name}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  )
}