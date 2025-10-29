'use client'

import { useState, useEffect } from 'react'

const ADMIN_SESSION_KEY = 'bluelite_admin_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface AdminSession {
  isAuthenticated: boolean
  adminName: string
  timestamp: number
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem(ADMIN_SESSION_KEY)
        if (sessionData) {
          const session: AdminSession = JSON.parse(sessionData)
          const now = Date.now()
          
          // Check if session is still valid (within 24 hours)
          if (session.isAuthenticated && (now - session.timestamp) < SESSION_DURATION) {
            setIsAuthenticated(true)
            setAdminName(session.adminName || '')
          } else {
            // Session expired, clear it
            localStorage.removeItem(ADMIN_SESSION_KEY)
            setIsAuthenticated(false)
            setAdminName('')
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking admin authentication:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (adminName: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminName, password }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Store session in localStorage
        const session: AdminSession = {
          isAuthenticated: true,
          adminName: adminName,
          timestamp: Date.now()
        }
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
        setIsAuthenticated(true)
        setAdminName(adminName)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY)
    setIsAuthenticated(false)
    setAdminName('')
  }

  return {
    isAuthenticated,
    adminName,
    isLoading,
    login,
    logout
  }
}
