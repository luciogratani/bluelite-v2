'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { PortfolioData } from '../types/portfolio'

export const usePortfolio = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carica i dati da Supabase all'avvio
  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('portfolio')
        .select('data')
        .eq('id', 1)
        .single()

      if (error) {
        throw error
      }

      console.log('Portfolio loaded from Supabase')
      setPortfolioData(data.data)
    } catch (err: any) {
      console.error('Error loading portfolio:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const savePortfolio = async (newData: PortfolioData) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('portfolio')
        .upsert({ 
          id: 1, 
          data: newData,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setPortfolioData(newData)
      console.log('Portfolio saved to Supabase successfully!')
      return true
    } catch (err: any) {
      console.error('Error saving portfolio:', err)
      setError(err.message)
      return false
    }
  }

  return {
    portfolioData,
    loading,
    error,
    savePortfolio,
    loadPortfolio
  }
}
