'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { chargingStationApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ChargingStation, User } from '@/lib/types'

export default function NewStationPage() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user ?? user.role !== 'OPERATOR') {
      toast.error('Only operators can create stations')
      return
    }

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const lat = formData.get('lat') as string
    const lon = formData.get('lon') as string
    const photoUrl = formData.get('photoUrl') as string

    // Validate required fields
    if (!name ?? !lat ?? !lon) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate coordinates
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    if (isNaN(latNum) ?? isNaN(lonNum)) {
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
      name,
      lat: latNum,
      lon: lonNum,
      photoUrl: photoUrl ?? undefined,
      operator
    }

    try {
      setLoading(true)
      await chargingStationApi.create(stationData)
      toast.success('Station created successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating station:', error)
      if (error instanceof Error) {
        toast.error(error.message ?? 'Failed to create station')
      } else {
        toast.error('Failed to create station')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user ?? user.role !== 'OPERATOR') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">You don't have permission to create stations.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href="/dashboard">
          <Button variant="outline" className="mr-4 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5"/>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Station</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Station Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Station Name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter station name"
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
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Station'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 