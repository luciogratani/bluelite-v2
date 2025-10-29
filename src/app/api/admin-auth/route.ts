import { NextRequest } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { adminName, password } = await request.json()
    
    if (!adminName || !password) {
      return Response.json({ 
        success: false, 
        error: 'Admin name and password are required' 
      }, { status: 400 })
    }

    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123' // Fallback per testing
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set')
      return Response.json({ 
        success: false, 
        error: 'Admin authentication not configured' 
      }, { status: 500 })
    }

    // Use constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(password, 'utf8'),
      Buffer.from(adminPassword, 'utf8')
    )

    if (isValid) {
      return Response.json({ 
        success: true,
        message: 'Authentication successful'
      })
    } else {
      return Response.json({ 
        success: false, 
        error: 'Invalid password' 
      }, { status: 401 })
    }

  } catch (error) {
    console.error('Admin authentication error:', error)
    return Response.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}
