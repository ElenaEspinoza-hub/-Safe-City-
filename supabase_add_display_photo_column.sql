-- Ejecuta esto una vez en Supabase: SQL Editor.
-- La original permanece en photo_data_url; la app lee la copia protegida.
ALTER TABLE public."safecity-noticias"
  ADD COLUMN IF NOT EXISTS photo_display_data_url TEXT;
