'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChargingSpot, UserRole } from '@/lib/types'
import { chargingSpotApi } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/lib/contexts/user-context'

// Common loading state component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
  </div>
)

// Common error state component
const ErrorState = ({ message, showBackButton = true }: { message: string; showBackButton?: boolean }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-2xl font-bold mb-4">{message}</h1>
    {showBackButton && (
      <Link href="/dashboard/map">
        <Button variant="outline">
          <ArrowLeft/>
        </Button>
      </Link>
    )}
  </div>
)

// Station header component
const StationHeader = ({ 
  stationName, 
  stationId, 
  isOperator 
}: { 
  stationName: string; 
  stationId: string; 
  isOperator: boolean 
}) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center">
      <Link href="/dashboard/map">
        <Button variant="outline" className="mr-1 hover:bg-gray-100">
          <ArrowLeft/>
        </Button>
      </Link>
      {isOperator && (
        <Link href={`/dashboard/stations/${stationId}/edit`}>
          <Button variant="outline" className="mr-2">
            <Pencil/>
          </Button>
        </Link>
      )}
      <h1 className="text-3xl font-bold tracking-tight">{stationName}</h1>
    </div>
  </div>
)

// Station info card component
const StationInfoCard = ({ 
  stationInfo, 
  freeSpots, 
  totalSpots 
}: { 
  stationInfo: { lat: number; lon: number }; 
  freeSpots: number; 
  totalSpots: number 
}) => {
  const freePercentage = (freeSpots / totalSpots) * 100
  const statusVariant = freePercentage === 0 ? "destructive" : freePercentage <= 35 ? "secondary" : "default"
  const statusText = freePercentage === 0 ? "Full" : freePercentage <= 35 ? "Limited" : "Available"

  return (
    <div className="space-y-6 bg-white rounded-lg p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1.5">Location</p>
        <p className="text-lg">{`${stationInfo.lat}, ${stationInfo.lon}`}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1.5">Status</p>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant} className="px-2.5 py-0.5">
            {statusText}
          </Badge>
          <span className="text-lg">{`${freeSpots} of ${totalSpots} spots available`}</span>
        </div>
      </div>
    </div>
  )
}

// Spot card component
const SpotCard = ({ 
  spot, 
  stationId, 
  isOperator 
}: { 
  spot: ChargingSpot; 
  stationId: string; 
  isOperator: boolean 
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="pt-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={spot.state === 'FREE' ? "default" : "destructive"} className="px-2.5 py-0.5">
              {spot.state}
            </Badge>
            {isOperator && (
              <Link href={`/dashboard/stations/${stationId}/spots/${spot.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            )}
          </div>
          <Badge variant="outline" className="px-2.5 py-0.5">
            {spot.connectorType}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Spot ID: {spot.id}
        </p>
      </div>
    </CardContent>
  </Card>
)

export default function StationPage() {
  const params = useParams()
  const { user } = useUser()
  const [spots, setSpots] = useState<ChargingSpot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const data = await chargingSpotApi.getByStation(Number(params.id))
        setSpots(data)
      } catch (error) {
        console.error('Error fetching station:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStation()
    const intervalId = setInterval(fetchStation, 60000) // Refresh every minute
    return () => clearInterval(intervalId)
  }, [params.id])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!spots.length) {
    return <ErrorState message="Station not found" />
  }

  const freeSpots = spots.filter(spot => spot.state === 'FREE').length
  const totalSpots = spots.length
  const stationInfo = spots[0].station
  const isOperator = user?.role === UserRole.OPERATOR

  if (!stationInfo) {
    return <ErrorState message="Station information not available" />
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <StationHeader 
        stationName={stationInfo.name} 
        stationId={params.id as string} 
        isOperator={isOperator} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StationInfoCard 
          stationInfo={stationInfo} 
          freeSpots={freeSpots} 
          totalSpots={totalSpots} 
        />

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Charging Spots</h2>
            {isOperator && (
              <Link href={`/dashboard/stations/${params.id}/spots/new`}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Spot
                </Button>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spots.map((spot) => (
              <SpotCard 
                key={spot.id} 
                spot={spot} 
                stationId={params.id as string} 
                isOperator={isOperator} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 