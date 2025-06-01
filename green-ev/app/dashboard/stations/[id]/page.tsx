'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChargingSpot, UserRole } from '@/lib/types'
import { chargingSpotApi } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/lib/contexts/user-context'

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
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!spots.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Station not found</h1>
        <Link href="/dashboard/map">
          <Button variant="outline">
            <ArrowLeft/>
          </Button>
        </Link>
      </div>
    )
  }

  const freeSpots = spots.filter(spot => spot.state === 'FREE').length
  const totalSpots = spots.length
  const freePercentage = (freeSpots / totalSpots) * 100

  // Get station info from the first spot
  const stationInfo = spots[0].station

  if (!stationInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Station information not available</h1>
        <Link href="/dashboard/map">
          <Button variant="outline">
            <ArrowLeft/>
          </Button>
        </Link>
      </div>
    )
  }

  const isOperator = user?.role === UserRole.OPERATOR

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href="/dashboard/map">
          <Button variant="outline" className="mr-4 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5"/>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{stationInfo.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-white rounded-lg p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1.5">Location</p>
            <p className="text-lg">{`${stationInfo.lat}, ${stationInfo.lon}`}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1.5">Status</p>
            <div className="flex items-center gap-3">
              <Badge variant={freePercentage === 0 ? "destructive" : freePercentage <= 35 ? "secondary" : "default"} className="px-2.5 py-0.5">
                {freePercentage === 0 ? "Full" : freePercentage <= 35 ? "Limited" : "Available"}
              </Badge>
              <span className="text-lg">{`${freeSpots} of ${totalSpots} spots available`}</span>
            </div>
          </div>
        </div>

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
              <Card key={spot.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={spot.state === 'FREE' ? "default" : "destructive"} className="px-2.5 py-0.5">
                        {spot.state}
                      </Badge>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 