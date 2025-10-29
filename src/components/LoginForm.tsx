'use client'

import React, { useState } from 'react'
import Badge from './Badge'

interface LoginFormProps {
  onLogin: (adminName: string, password: string) => Promise<boolean>
  isLoading: boolean
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading }) => {
  const [adminName, setAdminName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!adminName.trim() || !password.trim()) {
      setError('Please enter both admin name and password')
      return
    }

    const success = await onLogin(adminName, password)
    if (!success) {
      setError('Invalid credentials')
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-lg px-6">
        <div className="space-y-8 text-center animate-fade-in">
          {/* Logo with breathing animation */}
          <div className="flex justify-center">
            <div className="text-2xl tracking-[0.3em] text-white font-semibold">
              BLUELITE
            </div>
          </div>

          {/* Admin Badge */}
          <div className="flex justify-center">
            <Badge variant="info">Admin Access</Badge>
          </div>

          {/* Login Form */}
          <div className="space-y-6 pt-8">
            <p className="text-sm text-white/60">Administrator Login</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-white/10 px-6 py-4 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Admin Name"
                  autoComplete="username"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-white/10 px-6 py-4 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-white/10 px-6 py-4 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Access Admin Panel'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-white/40 text-xs">
              Secure administrator access
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
