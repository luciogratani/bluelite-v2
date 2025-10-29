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
      
      // Prima salva il backup automatico
      await createBackup(newData)
      
      // Poi aggiorna il record principale
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

  const createBackup = async (data: PortfolioData) => {
    try {
      // Ottieni il prossimo ID disponibile per il backup
      const { data: lastBackup, error: countError } = await supabase
        .from('portfolio')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)

      if (countError) throw countError

      // Calcola il prossimo ID (il primo backup sarà id: 2)
      const nextId = lastBackup && lastBackup.length > 0 ? lastBackup[0].id + 1 : 2

      // Crea il backup con timestamp
      const backupData = {
        id: nextId,
        data: data,
        updated_at: new Date().toISOString(),
        is_backup: true,
        backup_created_at: new Date().toISOString()
      }

      const { error: backupError } = await supabase
        .from('portfolio')
        .insert(backupData)

      if (backupError) throw backupError

      console.log(`Backup created with ID: ${nextId}`)
    } catch (err: any) {
      console.error('Error creating backup:', err)
      // Non bloccare il salvataggio principale se il backup fallisce
    }
  }

  // Funzione per ottenere la lista dei backup (opzionale, per debug)
  const getBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('id, updated_at, backup_created_at')
        .eq('is_backup', true)
        .order('backup_created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (err: any) {
      console.error('Error fetching backups:', err)
      return []
    }
  }

  return {
    portfolioData,
    loading,
    error,
    savePortfolio,
    loadPortfolio,
    getBackups
  }
}
