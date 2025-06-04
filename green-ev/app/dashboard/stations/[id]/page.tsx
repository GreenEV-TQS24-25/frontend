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

// Common styles
const styles = {
  container: "container mx-auto py-8 px-4",
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexColCenter: "flex flex-col items-center justify-center",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-8",
  card: "hover:shadow-md transition-shadow",
  buttonOutline: "mr-1 hover:bg-gray-100",
  textMuted: "text-sm font-medium text-muted-foreground mb-1.5",
  textLarge: "text-lg",
  spacing: {
    mb4: "mb-4",
    mb8: "mb-8",
    spaceY3: "space-y-3",
    spaceY6: "space-y-6",
    gap2: "gap-2",
    gap3: "gap-3",
    gap4: "gap-4",
  }
} as const

// Common components
const LoadingSpinner = () => (
  <div className={styles.flexCenter}>
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
  </div>
)

const ErrorState = ({ message, showBackButton = true }: { message: string; showBackButton?: boolean }) => (
  <div className={styles.flexColCenter}>
    <h1 className={`text-2xl font-bold ${styles.spacing.mb4}`}>{message}</h1>
    {showBackButton && (
      <Link href="/dashboard/map">
        <Button variant="outline">
          <ArrowLeft />
        </Button>
      </Link>
    )}
  </div>
)

const IconButton = ({ 
  href, 
  icon: Icon, 
  className = "" 
}: { 
  href: string; 
  icon: React.ElementType; 
  className?: string 
}) => (
  <Link href={href}>
    <Button variant="outline" className={className}>
      <Icon />
    </Button>
  </Link>
)

const SectionHeader = ({ 
  title, 
  action 
}: { 
  title: string; 
  action?: React.ReactNode 
}) => (
  <div className={styles.flexBetween}>
    <h2 className="text-xl font-semibold">{title}</h2>
    {action}
  </div>
)

// Station components
const StationHeader = ({ 
  stationName, 
  stationId, 
  isOperator 
}: { 
  stationName: string; 
  stationId: string; 
  isOperator: boolean 
}) => (
  <div className={`${styles.flexBetween} ${styles.spacing.mb8}`}>
    <div className={styles.flexCenter}>
      <IconButton href="/dashboard/map" icon={ArrowLeft} className={styles.buttonOutline} />
      {isOperator && (
        <IconButton 
          href={`/dashboard/stations/${stationId}/edit`} 
          icon={Pencil} 
          className={styles.buttonOutline} 
        />
      )}
      <h1 className="text-3xl font-bold tracking-tight">{stationName}</h1>
    </div>
  </div>
)

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
    <div className={`${styles.spacing.spaceY6} bg-white rounded-lg p-6 shadow-sm`}>
      <InfoSection 
        label="Location" 
        value={`${stationInfo.lat}, ${stationInfo.lon}`} 
      />
      <InfoSection 
        label="Status" 
        value={
          <div className={`${styles.flexCenter} ${styles.spacing.gap3}`}>
            <Badge variant={statusVariant} className="px-2.5 py-0.5">
              {statusText}
            </Badge>
            <span className={styles.textLarge}>
              {`${freeSpots} of ${totalSpots} spots available`}
            </span>
          </div>
        } 
      />
    </div>
  )
}

const InfoSection = ({ 
  label, 
  value 
}: { 
  label: string; 
  value: React.ReactNode 
}) => (
  <div>
    <p className={styles.textMuted}>{label}</p>
    {typeof value === 'string' ? <p className={styles.textLarge}>{value}</p> : value}
  </div>
)

const SpotCard = ({ 
  spot, 
  stationId, 
  isOperator 
}: { 
  spot: ChargingSpot; 
  stationId: string; 
  isOperator: boolean 
}) => (
  <Card className={styles.card}>
    <CardContent className="pt-6">
      <div className={styles.spacing.spaceY3}>
        <div className={styles.flexBetween}>
          <div className={`${styles.flexCenter} ${styles.spacing.gap2}`}>
            <Badge 
              variant={spot.state === 'FREE' ? "default" : "destructive"} 
              className="px-2.5 py-0.5"
            >
              {spot.state}
            </Badge>
            {isOperator && (
              <IconButton 
                href={`/dashboard/stations/${stationId}/spots/${spot.id}/edit`} 
                icon={Pencil} 
                className="h-8 w-8 p-0" 
              />
            )}
          </div>
          <Badge variant="outline" className="px-2.5 py-0.5">
            {spot.connectorType}
          </Badge>
        </div>
        <p className={styles.textMuted}>Spot ID: {spot.id}</p>
        <p className={styles.textMuted}>Power: {spot.powerKw} kW</p>
        <p className={styles.textMuted}>Price: {spot.pricePerKwh} €/kWh</p>
        <p className={styles.textMuted}>Velocity: {spot.chargingVelocity}</p>
      </div>
    </CardContent>
  </Card>
)

const AddSpotButton = ({ stationId }: { stationId: string }) => (
  <Link href={`/dashboard/stations/${stationId}/spots/new`}>
    <Button size="sm" className={styles.spacing.gap2}>
      <Plus className="h-4 w-4" />
      Add Spot
    </Button>
  </Link>
)

const EmptyState = ({ stationId }: { stationId: string }) => (
  <div className={styles.flexColCenter}>
    <h1 className={`text-2xl font-bold ${styles.spacing.mb4}`}>No spots found in this station</h1>
    <Link href={`/dashboard/stations/${stationId}/spots/new`}>
      <Button className={styles.spacing.gap2}>
        <Plus className="h-4 w-4" />
        Add First Spot
      </Button>
    </Link>
  </div>
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
    const intervalId = setInterval(fetchStation, 60000)
    return () => clearInterval(intervalId)
  }, [params.id])

  if (loading) return <LoadingSpinner />
  if (!spots.length) {
    if (user?.role === UserRole.OPERATOR) {
      return (
        <div className={styles.container}>
          <div className="h-[60vh]">
            <EmptyState stationId={params.id as string} />
          </div>
        </div>
      )
    }
    return <ErrorState message="Station not found" />
  }

  const freeSpots = spots.filter(spot => spot.state === 'FREE').length
  const totalSpots = spots.length
  const stationInfo = spots[0].station
  const isOperator = user?.role === UserRole.OPERATOR

  if (!stationInfo) return <ErrorState message="Station information not available" />

  return (
    <div className={styles.container}>
      <StationHeader 
        stationName={stationInfo.name} 
        stationId={params.id as string} 
        isOperator={isOperator} 
      />

      <div className={styles.grid}>
        <StationInfoCard 
          stationInfo={stationInfo} 
          freeSpots={freeSpots} 
          totalSpots={totalSpots} 
        />

        <div className="md:col-span-2">
          <SectionHeader 
            title="Charging Spots" 
            action={isOperator && <AddSpotButton stationId={params.id as string} />} 
          />
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