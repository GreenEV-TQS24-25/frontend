import { 
  Vehicle, 
  User, 
  ChargingStation, 
  ChargingSpot, 
  Session, 
  LoginRequest, 
  LoginResponse 
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
const API_BASE_URL = `${API_URL}/api/v1`

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
  getAll: () => fetchApi<Vehicle[]>('/private/vehicles'),
  create: (vehicle: Omit<Vehicle, 'id'>) => 
    fetchApi<Vehicle>('/private/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    }),
  update: (vehicle: Vehicle) =>
    fetchApi<Vehicle>('/private/vehicles', {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    }),
  delete: (vehicleId: number) =>
    fetchApi<void>(`/private/vehicles/${vehicleId}`, {
      method: 'DELETE',
    }),
}

// User API
export const userApi = {
  login: (data: LoginRequest) =>
    fetchApi<LoginResponse>('/public/user-table/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: LoginRequest) =>
    fetchApi<LoginResponse>('/public/user-table', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (user: User) =>
    fetchApi<User>('/private/user-table', {
      method: 'PUT',
      body: JSON.stringify(user),
    }),
  delete: () =>
    fetchApi<void>('/private/user-table', {
      method: 'DELETE',
    }),
}

// Charging Station API
export const chargingStationApi = {
  getAll: () => fetchApi<ChargingStation[]>('/public/charging-stations/all'),
  getAllByOperator: () => fetchApi<ChargingStation[]>('/private/charging-stations'),
  create: (station: Omit<ChargingStation, 'id'>) =>
    fetchApi<ChargingStation>('/private/charging-stations', {
      method: 'POST',
      body: JSON.stringify(station),
    }),
  update: (station: ChargingStation) =>
    fetchApi<ChargingStation>('/private/charging-stations', {
      method: 'PUT',
      body: JSON.stringify(station),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/private/charging-stations/${id}`, {
      method: 'DELETE',
    }),
  filterByConnectorType: (connectorTypes: string[]) =>
    fetchApi<ChargingStation[]>(`/public/charging-stations/filter?connectorTypeInputs=${connectorTypes.join(',')}`),
}

// Charging Spot API
export const chargingSpotApi = {
  getAllByStation: (stationId: number) =>
    fetchApi<ChargingSpot[]>(`/public/charging-spots/${stationId}`),
  create: (spot: Omit<ChargingSpot, 'id'>) =>
    fetchApi<ChargingSpot>('/private/charging-spots', {
      method: 'POST',
      body: JSON.stringify(spot),
    }),
  update: (spot: ChargingSpot) =>
    fetchApi<ChargingSpot>('/private/charging-spots', {
      method: 'PUT',
      body: JSON.stringify(spot),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/private/charging-spots/${id}`, {
      method: 'DELETE',
    }),
}

// Session API
export const sessionApi = {
  getAllByUser: () => fetchApi<Session[]>('/private/session'),
  getAllByStation: (stationId: number) =>
    fetchApi<Session[]>(`/private/session/station/${stationId}`),
  create: (session: Omit<Session, 'id'>) =>
    fetchApi<Session>('/private/session', {
      method: 'POST',
      body: JSON.stringify(session),
    }),
  delete: (sessionId: number) =>
    fetchApi<void>(`/private/session/${sessionId}`, {
      method: 'DELETE',
    }),
} 