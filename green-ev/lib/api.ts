import { 
  Vehicle, 
  User, 
  ChargingStation, 
  ChargingSpot, 
  Session, 
  LoginRequest, 
  LoginResponse,
  StationsSpots,
  ConnectorType
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

  console.log(`Making API request to ${endpoint}`, { headers, options })

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    console.error('API request failed:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    })
    throw new Error(errorData?.detail || response.statusText)
  }

  const data = await response.json()
  console.log(`API response from ${endpoint}:`, data)
  return data
}

// Vehicle API
export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    return fetchApi<Vehicle[]>('/private/vehicles')
  },

  create: async (vehicle: Vehicle): Promise<Vehicle> => {
    return fetchApi<Vehicle>('/private/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    })
  },

  update: async (vehicle: Vehicle): Promise<Vehicle> => {
    return fetchApi<Vehicle>('/private/vehicles', {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    })
  },

  delete: async (vehicleId: number): Promise<void> => {
    await fetchApi(`/private/vehicles/${vehicleId}`, {
      method: 'DELETE',
    })
  },
}

// User API
export const userApi = {
  create: async (user: User): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/public/user-table', {
      method: 'POST',
      body: JSON.stringify(user),
    })
  },

  update: async (user: User): Promise<void> => {
    await fetchApi('/private/user-table', {
      method: 'PUT',
      body: JSON.stringify(user),
    })
  },

  delete: async (): Promise<void> => {
    await fetchApi('/private/user-table', {
      method: 'DELETE',
    })
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/public/user-table/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },
}

// Charging Station API
export const chargingStationApi = {
  getAll: async (): Promise<StationsSpots[]> => {
    return fetchApi<StationsSpots[]>('/public/charging-stations/all')
  },

  getByOperator: async (): Promise<StationsSpots[]> => {
    return fetchApi<StationsSpots[]>('/private/charging-stations')
  },

  filterByConnectorType: async (connectorTypes: ConnectorType[]): Promise<ChargingStation[]> => {
    const params = new URLSearchParams()
    connectorTypes.forEach(type => params.append('connectorTypeInputs', type))
    return fetchApi<ChargingStation[]>(`/public/charging-stations/filter?${params}`)
  },

  create: async (station: ChargingStation): Promise<ChargingStation> => {
    return fetchApi<ChargingStation>('/private/charging-stations', {
      method: 'POST',
      body: JSON.stringify(station),
    })
  },

  update: async (station: ChargingStation): Promise<ChargingStation> => {
    return fetchApi<ChargingStation>('/private/charging-stations', {
      method: 'PUT',
      body: JSON.stringify(station),
    })
  },

  delete: async (id: number): Promise<void> => {
    await fetchApi(`/private/charging-stations/${id}`, {
      method: 'DELETE',
    })
  },
}

// Charging Spot API
export const chargingSpotApi = {
  getByStation: async (stationId: number): Promise<ChargingSpot[]> => {
    return fetchApi<ChargingSpot[]>(`/public/charging-spots/${stationId}`)
  },

  create: async (spot: ChargingSpot): Promise<ChargingSpot> => {
    return fetchApi<ChargingSpot>('/private/charging-spots', {
      method: 'POST',
      body: JSON.stringify(spot),
    })
  },

  update: async (spot: ChargingSpot): Promise<ChargingSpot> => {
    return fetchApi<ChargingSpot>('/private/charging-spots', {
      method: 'PUT',
      body: JSON.stringify(spot),
    })
  },

  delete: async (id: number): Promise<void> => {
    await fetchApi(`/private/charging-spots/${id}`, {
      method: 'DELETE',
    })
  },
}

// Session API
export const sessionApi = {
  getAll: async (): Promise<Session[]> => {
    return fetchApi<Session[]>('/private/session')
  },

  getByStation: async (stationId: number): Promise<Session[]> => {
    return fetchApi<Session[]>(`/private/session/station/${stationId}`)
  },

  create: async (session: Session): Promise<Session> => {
    return fetchApi<Session>('/private/session', {
      method: 'POST',
      body: JSON.stringify(session),
    })
  },

  delete: async (sessionId: number): Promise<void> => {
    await fetchApi(`/private/session/${sessionId}`, {
      method: 'DELETE',
    })
  },
} 