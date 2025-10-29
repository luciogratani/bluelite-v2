-- Aggiornamento schema database per supportare il sistema di backup automatico
-- Eseguire questo script in Supabase SQL Editor

-- Aggiungi le colonne per i backup
ALTER TABLE portfolio 
ADD COLUMN IF NOT EXISTS is_backup BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS backup_created_at TIMESTAMP WITH TIME ZONE;

-- Crea un indice per migliorare le performance delle query sui backup
CREATE INDEX IF NOT EXISTS idx_portfolio_backup ON portfolio(is_backup, backup_created_at);

-- Crea un indice per l'ordinamento degli ID
CREATE INDEX IF NOT EXISTS idx_portfolio_id_desc ON portfolio(id DESC);

-- Aggiorna le policy RLS per permettere l'inserimento di backup
-- (Le policy esistenti dovrebbero già permettere questo, ma verifichiamo)

-- Policy per lettura (già esistente)
-- CREATE POLICY "Enable read access for all users" ON portfolio
-- FOR SELECT USING (true);

-- Policy per scrittura (già esistente) 
-- CREATE POLICY "Enable all operations for anon users" ON portfolio
-- FOR ALL USING (true) WITH CHECK (true);

-- Opzionale: Crea una funzione per pulire i backup vecchi (mantieni solo gli ultimi 50)
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS void AS $$
BEGIN
  DELETE FROM portfolio 
  WHERE is_backup = true 
  AND id NOT IN (
    SELECT id FROM portfolio 
    WHERE is_backup = true 
    ORDER BY backup_created_at DESC 
    LIMIT 50
  );
END;
$$ LANGUAGE plpgsql;

-- Opzionale: Crea un trigger per pulire automaticamente i backup vecchi
-- (Decommentare se si vuole la pulizia automatica)
-- CREATE OR REPLACE FUNCTION trigger_cleanup_backups()
-- RETURNS trigger AS $$
-- BEGIN
--   PERFORM cleanup_old_backups();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER cleanup_backups_trigger
--   AFTER INSERT ON portfolio
--   FOR EACH ROW
--   WHEN (NEW.is_backup = true)
--   EXECUTE FUNCTION trigger_cleanup_backups();
