'use client'

import { useState, useEffect } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'

interface BackupRecord {
  id: number
  updated_at: string
  backup_created_at: string
}

interface BackupViewerProps {
  className?: string
}

const BackupViewer: React.FC<BackupViewerProps> = ({ className = '' }) => {
  const { getBackups } = usePortfolio()
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBackups = async () => {
    setLoading(true)
    setError(null)
    try {
      const backupData = await getBackups()
      setBackups(backupData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBackups()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s fa`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m fa`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h fa`
    return `${Math.floor(diffInSeconds / 86400)}g fa`
  }

  return (
    <div className={`p-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Backup History
            </h2>
            <p className="text-white/60 text-sm">
              Visualizza la cronologia dei backup automatici del portfolio
            </p>
          </div>
          <button
            onClick={loadBackups}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium ring-1 ring-white/20 hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Caricamento...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Aggiorna
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Backup</p>
              <p className="text-white text-xl font-semibold">{backups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-400">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white/60 text-sm">Ultimo Backup</p>
              <p className="text-white text-sm font-medium">
                {backups.length > 0 ? getTimeAgo(backups[0].backup_created_at) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white/60 text-sm">ID Range</p>
              <p className="text-white text-sm font-medium">
                {backups.length > 0 ? `2 - ${backups[0].id}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-400">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-red-400 font-medium">Errore nel caricamento</p>
              <p className="text-red-400/70 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Backup List */}
      <div className="space-y-3">
        {loading && backups.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Caricamento backup...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white/40">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-white/60 text-lg font-medium mb-2">Nessun backup trovato</p>
            <p className="text-white/40 text-sm">I backup verranno creati automaticamente quando salvi il portfolio</p>
          </div>
        ) : (
          backups.map((backup, index) => (
            <div
              key={backup.id}
              className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10 hover:bg-white/[0.07] transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">#{backup.id}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Backup #{backup.id}
                    </p>
                    <p className="text-white/60 text-sm">
                      Creato {formatDate(backup.backup_created_at)}
                    </p>
                    <p className="text-white/40 text-xs">
                      {getTimeAgo(backup.backup_created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    Backup
                  </div>
                  {index === 0 && (
                    <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                      Più recente
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg ring-1 ring-white/10">
        <div className="flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-400 mt-0.5">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="text-white font-medium text-sm mb-1">Informazioni sui Backup</p>
            <p className="text-white/60 text-sm">
              I backup vengono creati automaticamente ogni volta che salvi il portfolio. 
              Il record principale (ID: 1) contiene sempre i dati attuali, mentre i backup 
              (ID: 2+) mantengono la cronologia delle modifiche precedenti.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackupViewer
