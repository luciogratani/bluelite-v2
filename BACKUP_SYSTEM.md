# Sistema di Backup Automatico

## Panoramica

Il sistema include un backup automatico che viene creato ogni volta che il portfolio viene salvato. Questo garantisce che non si perdano mai le modifiche precedenti.

## Come Funziona

### 1. Struttura del Database

```sql
-- Record principale (sempre ID = 1)
id: 1, is_backup: false, data: {...}, updated_at: timestamp

-- Backup automatici (ID incrementali)
id: 2, is_backup: true, data: {...}, backup_created_at: timestamp
id: 3, is_backup: true, data: {...}, backup_created_at: timestamp
id: 4, is_backup: true, data: {...}, backup_created_at: timestamp
...
```

### 2. Flusso di Salvataggio

```
1. Utente salva modifiche nell'Admin Panel
   ↓
2. createBackup() crea un nuovo record con ID incrementale
   ↓
3. savePortfolio() aggiorna il record principale (ID = 1)
   ↓
4. Backup automatico completato
```

### 3. Caratteristiche

- **Automatico**: Nessuna azione richiesta dall'utente
- **Incrementale**: ID auto-incrementali per i backup
- **Non bloccante**: Se il backup fallisce, il salvataggio principale continua
- **Timestamp**: Ogni backup ha un timestamp di creazione
- **Pulizia opzionale**: Mantiene solo gli ultimi 50 backup

## Utilizzo

### Setup Iniziale

1. Eseguire lo script SQL in Supabase:
```sql
-- Eseguire database-update.sql nel Supabase SQL Editor
```

2. Il sistema funziona automaticamente da quel momento

### Verifica Backup

Per verificare che i backup funzionino:

```javascript
// Nel browser console o in un componente
const { getBackups } = usePortfolio()
const backups = await getBackups()
console.log('Backups disponibili:', backups)
```

### Query Manuali

Per vedere tutti i backup nel database:

```sql
SELECT id, updated_at, backup_created_at 
FROM portfolio 
WHERE is_backup = true 
ORDER BY backup_created_at DESC;
```

## Pulizia Automatica (Opzionale)

Il sistema include una funzione per pulire i backup vecchi:

```sql
-- Mantiene solo gli ultimi 50 backup
SELECT cleanup_old_backups();
```

Per abilitare la pulizia automatica, decommentare il trigger nel file `database-update.sql`.

## Vantaggi

1. **Sicurezza**: Nessuna perdita di dati
2. **Trasparente**: Funziona in background
3. **Efficiente**: Solo i dati necessari vengono duplicati
4. **Recupero**: Possibilità di ripristinare versioni precedenti
5. **Debug**: Facile identificazione di quando sono state fatte le modifiche

## Limitazioni

- I backup occupano spazio nel database
- Non c'è interfaccia per gestire i backup (solo database)
- La pulizia automatica è opzionale e manuale

## Monitoraggio

Per monitorare l'uso dello spazio:

```sql
-- Conta i backup
SELECT COUNT(*) as total_backups FROM portfolio WHERE is_backup = true;

-- Dimensione approssimativa
SELECT 
  pg_size_pretty(pg_total_relation_size('portfolio')) as table_size,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_backup = true) as backup_records
FROM portfolio;
```
