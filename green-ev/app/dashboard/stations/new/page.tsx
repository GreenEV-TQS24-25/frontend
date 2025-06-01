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

export default function NewStationPage() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    const formData = new FormData(e.currentTarget)
    const stationData = {
      name: formData.get('name') as string,
      lat: parseFloat(formData.get('lat') as string),
      lon: parseFloat(formData.get('lon') as string),
      photoUrl: formData.get('photoUrl') as string || undefined,
    }

    try {
      setLoading(true)
      await chargingStationApi.create(stationData)
      toast.success('Station created successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating station:', error)
      toast.error('Failed to create station')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'OPERATOR') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">You don't have permission to create stations.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Station</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Station Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter station name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
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
                <Label htmlFor="lon">Longitude</Label>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
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