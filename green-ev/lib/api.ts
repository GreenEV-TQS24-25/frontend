import { LoginRequest, LoginResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/v1/public/user-table/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}

export async function register(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/v1/public/user-table`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Registration failed')
  }

  return response.json()
} 