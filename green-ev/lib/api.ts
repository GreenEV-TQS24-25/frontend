import { 
  Vehicle, 
  User, 
  ChargingStation, 
  ChargingSpot, 
  Session, 
  LoginRequest, 
  LoginResponse,
  StationsSpots,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  // Check both localStorage and cookies for the token
  const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })
  return handleResponse<T>(response)
}

// Vehicle API
export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    return fetchWithAuth<Vehicle[]>(`${API_URL}/api/v1/private/vehicles`)
  },

  create: async (vehicle: Vehicle): Promise<Vehicle> => {
    return fetchWithAuth<Vehicle>(`${API_URL}/api/v1/private/vehicles`, {
      method: 'POST',
      body: JSON.stringify(vehicle),
    })
  },

  update: async (vehicle: Vehicle): Promise<Vehicle> => {
    return fetchWithAuth<Vehicle>(`${API_URL}/api/v1/private/vehicles`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    })
  },

  delete: async (vehicleId: number): Promise<void> => {
    await fetchWithAuth(`${API_URL}/api/v1/private/vehicles/${vehicleId}`, {
      method: 'DELETE',
    })
  },
}

// User API
export const userApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/v1/public/user-table/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    return handleResponse<LoginResponse>(response)
  },

  register: async (userData: User): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/v1/public/user-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    return handleResponse<LoginResponse>(response)
  },

  update: async (userData: User): Promise<void> => {
    await fetchWithAuth(`${API_URL}/api/v1/private/user-table`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  },

  delete: async (): Promise<void> => {
    await fetchWithAuth(`${API_URL}/api/v1/private/user-table`, {
      method: 'DELETE',
    })
  },
}

// Charging Station API
export const chargingStationApi = {
  getAll: async (): Promise<StationsSpots[]> => {
    return fetchWithAuth<StationsSpots[]>(`${API_URL}/api/v1/public/charging-stations/all`)
  },

  getByOperator: async (): Promise<StationsSpots[]> => {
    return fetchWithAuth<StationsSpots[]>(`${API_URL}/api/v1/private/charging-stations`)
  },

  filterByConnectorType: async (connectorTypes: string[]): Promise<ChargingStation[]> => {
    const params = new URLSearchParams()
    connectorTypes.forEach(type => params.append('connectorTypeInputs', type))
    return fetchWithAuth<ChargingStation[]>(`${API_URL}/api/v1/public/charging-stations/filter?${params}`)
  },

  create: async (station: ChargingStation): Promise<ChargingStation> => {
    return fetchWithAuth<ChargingStation>(`${API_URL}/api/v1/private/charging-stations`, {
      method: 'POST',
      body: JSON.stringify(station),
    })
  },

  update: async (station: ChargingStation): Promise<ChargingStation> => {
    return fetchWithAuth<ChargingStation>(`${API_URL}/api/v1/private/charging-stations`, {
      method: 'PUT',
      body: JSON.stringify(station),
    })
  },

  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`${API_URL}/api/v1/private/charging-stations/${id}`, {
      method: 'DELETE',
    })
  },
}

// Charging Spot API
export const chargingSpotApi = {
  getByStation: async (stationId: number): Promise<ChargingSpot[]> => {
    return fetchWithAuth<ChargingSpot[]>(`${API_URL}/api/v1/public/charging-spots/${stationId}`)
  },

  create: async (spot: ChargingSpot): Promise<ChargingSpot> => {
    return fetchWithAuth<ChargingSpot>(`${API_URL}/api/v1/private/charging-spots`, {
      method: 'POST',
      body: JSON.stringify(spot),
    })
  },

  update: async (spot: ChargingSpot): Promise<ChargingSpot> => {
    return fetchWithAuth<ChargingSpot>(`${API_URL}/api/v1/private/charging-spots`, {
      method: 'PUT',
      body: JSON.stringify(spot),
    })
  },

  updateStatus: async (id: number, status: string): Promise<boolean> => {
    return fetchWithAuth<boolean>(`${API_URL}/api/v1/private/charging-spots/status/${id}?status=${status}`, {
      method: 'PUT',
    })
  },

  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`${API_URL}/api/v1/private/charging-spots/${id}`, {
      method: 'DELETE',
    })
  },
}

// Session API
export const sessionApi = {
  getAll: async (): Promise<Session[]> => {
    return fetchWithAuth<Session[]>(`${API_URL}/api/v1/private/session`)
  },

  getByStation: async (stationId: number): Promise<Session[]> => {
    return fetchWithAuth<Session[]>(`${API_URL}/api/v1/private/session/station/${stationId}`)
  },

  create: async (session: Session): Promise<Session> => {
    return fetchWithAuth<Session>(`${API_URL}/api/v1/private/session`, {
      method: 'POST',
      body: JSON.stringify(session),
    })
  },

  delete: async (sessionId: number): Promise<void> => {
    await fetchWithAuth(`${API_URL}/api/v1/private/session/${sessionId}`, {
      method: 'DELETE',
    })
  },
} 