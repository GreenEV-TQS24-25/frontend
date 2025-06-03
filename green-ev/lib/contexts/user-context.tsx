'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, LoginResponse } from '../types'
import { userApi } from '../api'

interface UserContextType {
  user: LoginResponse | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => Promise<void>
  deleteUser: () => Promise<void>
  updateUserThenLogout: (user: User) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user:', e)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Attempting login...')
      const response = await userApi.login({ email, password })
      console.log('Login response:', response)
      
      if (!response || !response.token) {
        throw new Error('Invalid login response')
      }

      // Store the token in a cookie
      document.cookie = `token=${response.token}; path=/`
      
      setUser(response)
      localStorage.setItem('user', JSON.stringify(response))
      console.log('Login successful, user stored')
    } catch (e) {
      console.error('Login error:', e)
      setError(e instanceof Error ? e.message : 'Failed to login')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    // Clear any other user-related data
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }

  const updateUser = async (userData: User) => {
    try {
      setLoading(true)
      setError(null)
      await userApi.update(userData)
      if (user) {
        const updatedUser = { ...user, ...userData }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update user')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async () => {
    try {
      setLoading(true)
      setError(null)
      await userApi.delete()
      logout()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete user')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const updateUserThenLogout = async (userData: User) => {
    await updateUser(userData)
    logout()
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        updateUser,
        deleteUser,
        updateUserThenLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 