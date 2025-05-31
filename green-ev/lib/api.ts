import { 
  Vehicle, 
  User, 
  ChargingStation, 
  ChargingSpot, 
  Session, 
  LoginRequest, 
  LoginResponse,
  StationsSpots
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/api/v1'

// Helper function to handle API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

// Vehicle API
export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await fetch(`${API_URL}/private/vehicles`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch vehicles')
    return response.json()
  },

  create: async (vehicle: Vehicle): Promise<Vehicle> => {
    const response = await fetch(`${API_URL}/private/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(vehicle),
    })
    if (!response.ok) throw new Error('Failed to create vehicle')
    return response.json()
  },

  update: async (vehicle: Vehicle): Promise<Vehicle> => {
    const response = await fetch(`${API_URL}/private/vehicles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(vehicle),
    })
    if (!response.ok) throw new Error('Failed to update vehicle')
    return response.json()
  },

  delete: async (vehicleId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/private/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete vehicle')
  },
}

// User API
export const userApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/public/user-table/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (!response.ok) throw new Error('Login failed')
    return response.json()
  },

  register: async (user: User): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/public/user-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    if (!response.ok) throw new Error('Registration failed')
    return response.json()
  },

  update: async (user: User): Promise<User> => {
    const response = await fetch(`${API_URL}/private/user-table`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(user),
    })
    if (!response.ok) throw new Error('Update failed')
    return response.json()
  },

  delete: async (): Promise<void> => {
    const response = await fetch(`${API_URL}/private/user-table`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Delete failed')
  },
}

// Charging Station API
export const chargingStationApi = {
  getAll: async (): Promise<StationsSpots[]> => {
    const response = await fetch(`${API_URL}/public/charging-stations/all`)
    if (!response.ok) throw new Error('Failed to fetch charging stations')
    return response.json()
  },

  getByOperator: async (): Promise<ChargingStation[]> => {
    const response = await fetch(`${API_URL}/private/charging-stations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch charging stations')
    return response.json()
  },

  filterByConnectorType: async (connectorTypes: string[]): Promise<ChargingStation[]> => {
    const params = new URLSearchParams()
    connectorTypes.forEach(type => params.append('connectorTypeInputs', type))
    const response = await fetch(`${API_URL}/public/charging-stations/filter?${params}`)
    if (!response.ok) throw new Error('Failed to filter charging stations')
    return response.json()
  },

  create: async (station: ChargingStation): Promise<ChargingStation> => {
    const response = await fetch(`${API_URL}/private/charging-stations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(station),
    })
    if (!response.ok) throw new Error('Failed to create charging station')
    return response.json()
  },

  update: async (station: ChargingStation): Promise<ChargingStation> => {
    const response = await fetch(`${API_URL}/private/charging-stations`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(station),
    })
    if (!response.ok) throw new Error('Failed to update charging station')
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/private/charging-stations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete charging station')
  },
}

// Charging Spot API
export const chargingSpotApi = {
  getByStation: async (stationId: number): Promise<ChargingSpot[]> => {
    const response = await fetch(`${API_URL}/public/charging-spots/${stationId}`)
    if (!response.ok) throw new Error('Failed to fetch charging spots')
    return response.json()
  },

  create: async (spot: ChargingSpot): Promise<ChargingSpot> => {
    const response = await fetch(`${API_URL}/private/charging-spots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(spot),
    })
    if (!response.ok) throw new Error('Failed to create charging spot')
    return response.json()
  },

  update: async (spot: ChargingSpot): Promise<ChargingSpot> => {
    const response = await fetch(`${API_URL}/private/charging-spots`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(spot),
    })
    if (!response.ok) throw new Error('Failed to update charging spot')
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/private/charging-spots/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete charging spot')
  },
}

// Session API
export const sessionApi = {
  getAll: async (): Promise<Session[]> => {
    const response = await fetch(`${API_URL}/private/session`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch sessions')
    return response.json()
  },

  getByStation: async (stationId: number): Promise<Session[]> => {
    const response = await fetch(`${API_URL}/private/session/station/${stationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch sessions')
    return response.json()
  },

  create: async (session: Session): Promise<Session> => {
    const response = await fetch(`${API_URL}/private/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(session),
    })
    if (!response.ok) throw new Error('Failed to create session')
    return response.json()
  },

  delete: async (sessionId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/private/session/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete session')
  },
} 