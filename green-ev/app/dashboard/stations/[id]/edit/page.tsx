'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { chargingStationApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ChargingStation, User } from '@/lib/types'

export default function EditStationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [station, setStation] = useState<ChargingStation | null>(null)

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const stationsData = await chargingStationApi.getByOperator()
        const stationData = stationsData.find(s => s.chargingStation?.id === parseInt(params.id))
        if (stationData?.chargingStation) {
          setStation(stationData.chargingStation)
        } else {
          toast.error('Station not found')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error fetching station:', error)
        toast.error('Failed to fetch station details')
        router.push('/dashboard')
      }
    }

    if (user?.role === 'OPERATOR') {
      fetchStation()
    }
  }, [params.id, user?.role, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || user.role !== 'OPERATOR' || !station) {
      toast.error('Only operators can edit stations')
      return
    }

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const lat = formData.get('lat') as string
    const lon = formData.get('lon') as string
    const photoUrl = formData.get('photoUrl') as string

    // Validate required fields
    if (!name || !lat || !lon) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate coordinates
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    if (isNaN(latNum) || isNaN(lonNum)) {
      toast.error('Invalid coordinates')
      return
    }

    const operator: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      password: '' // Required by type but not used in this context
    }

    const stationData: ChargingStation = {
      id: station.id,
      name,
      lat: latNum,
      lon: lonNum,
      photoUrl: photoUrl || undefined,
      operator
    }

    try {
      setLoading(true)
      await chargingStationApi.update(stationData)
      toast.success('Station updated successfully')
      router.push(`/dashboard/stations/${params.id}`)
    } catch (error) {
      console.error('Error updating station:', error)
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to update station')
      } else {
        toast.error('Failed to update station')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'OPERATOR') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">You don't have permission to edit stations.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!station) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Loading station details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <div className="flex items-center">
          <Link href={`/dashboard/stations/${params.id}`}>
            <Button variant="outline" className="mr-1 hover:bg-gray-100">
              <ArrowLeft/>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Station</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Station Name *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Enter station name"
                  defaultValue={station.name}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude *</Label>
                  <Input
                    id="lat"
                    name="lat"
                    type="number"
                    step="any"
                    required
                    placeholder="Enter latitude"
                    defaultValue={station.lat}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lon">Longitude *</Label>
                  <Input
                    id="lon"
                    name="lon"
                    type="number"
                    step="any"
                    required
                    placeholder="Enter longitude"
                    defaultValue={station.lon}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
                <Input
                  id="photoUrl"
                  name="photoUrl"
                  type="url"
                  placeholder="Enter photo URL"
                  defaultValue={station.photoUrl}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link href={`/dashboard/stations/${params.id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 