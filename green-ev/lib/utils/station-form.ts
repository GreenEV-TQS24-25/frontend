import { toast } from 'sonner'
import { User, ChargingStation } from '@/lib/types'

interface StationFormData {
  name: string
  lat: string
  lon: string
  photoUrl: string
}

export function validateStationForm(formData: FormData): StationFormData | null {
  const name = formData.get('name') as string
  const lat = formData.get('lat') as string
  const lon = formData.get('lon') as string
  const photoUrl = formData.get('photoUrl') as string

  // Validate required fields
  if (!name || !lat || !lon) {
    toast.error('Please fill in all required fields')
    return null
  }

  // Validate coordinates
  const latNum = parseFloat(lat)
  const lonNum = parseFloat(lon)
  if (isNaN(latNum) || isNaN(lonNum)) {
    toast.error('Invalid coordinates')
    return null
  }

  return { name, lat, lon, photoUrl }
}

export function createStationData(
  formData: StationFormData, 
  user: User, 
  existingStation?: ChargingStation
): ChargingStation {
  const operator: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    password: '' // Required by type but not used in this context
  }

  return {
    ...(existingStation && { id: existingStation.id }),
    name: formData.name,
    lat: parseFloat(formData.lat),
    lon: parseFloat(formData.lon),
    photoUrl: formData.photoUrl || undefined,
    operator
  }
} 