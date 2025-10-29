# Flusso del Sistema di Backup

## Diagramma del Flusso

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin Panel   │───▶│   usePortfolio   │───▶│   Supabase DB   │
│                 │    │                  │    │                 │
│ Modifica dati   │    │ savePortfolio()  │    │ portfolio table │
│ Clicca "Save"   │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ createBackup()   │    │ Record ID = 1   │
                       │                  │    │ (Dati attuali)  │
                       │ 1. Trova ultimo  │    │ is_backup: false│
                       │    ID backup     │    │                 │
                       │ 2. Crea nuovo    │    └─────────────────┘
                       │    record        │             │
                       │ 3. ID incrementale│            │
                       └──────────────────┘             │
                                │                       │
                                ▼                       │
                       ┌──────────────────┐             │
                       │ Record ID = N+1  │◀────────────┘
                       │ (Backup)         │
                       │ is_backup: true  │
                       │ backup_created_at│
                       └──────────────────┘
```

## Esempio Pratico

### Stato Iniziale
```
ID | is_backup | data | updated_at
1  | false     | {...}| 2024-01-01 10:00
```

### Dopo Primo Salvataggio
```
ID | is_backup | data | updated_at | backup_created_at
1  | false     | {...}| 2024-01-01 10:30 | null
2  | true      | {...}| 2024-01-01 10:30 | 2024-01-01 10:30
```

### Dopo Secondo Salvataggio
```
ID | is_backup | data | updated_at | backup_created_at
1  | false     | {...}| 2024-01-01 11:00 | null
2  | true      | {...}| 2024-01-01 10:30 | 2024-01-01 10:30
3  | true      | {...}| 2024-01-01 11:00 | 2024-01-01 11:00
```

## Sequenza Temporale

1. **T0**: Utente modifica dati nell'Admin Panel
2. **T1**: Utente clicca "Update Database"
3. **T2**: `createBackup()` esegue:
   - Query per trovare ultimo ID backup
   - Crea nuovo record con ID incrementale
   - Imposta `is_backup = true`
4. **T3**: `savePortfolio()` esegue:
   - Aggiorna record con ID = 1
   - Imposta `is_backup = false`
5. **T4**: Operazione completata

## Gestione Errori

```
┌─────────────────┐
│ createBackup()  │
│     FAILS       │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│ Log Error       │    │ Continue with   │
│ Don't Block     │───▶│ savePortfolio() │
│ Main Save       │    │                 │
└─────────────────┘    └─────────────────┘
```

## Vantaggi del Design

1. **Non Bloccante**: Il backup non impedisce il salvataggio principale
2. **Incrementale**: ID auto-incrementali evitano conflitti
3. **Tracciabile**: Timestamp per ogni backup
4. **Efficiente**: Solo i dati necessari vengono duplicati
5. **Recuperabile**: Facile identificazione e ripristino
