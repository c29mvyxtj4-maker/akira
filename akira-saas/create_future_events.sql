-- Insert future calendar events for testing
INSERT INTO calendar_events (title, description, start_at, end_at, type, org_id, archived)
VALUES
  ('Reunión con Marc', 'Discusión de estrategia', '2026-08-20 10:00:00+00:00', '2026-08-20 11:00:00+00:00', 'meeting', 'b66ce8ac-6415-40c1-b801-4bef15ef7982', false),
  ('Presentación proyecto', 'Demo cliente', '2026-08-21 14:30:00+00:00', '2026-08-21 15:30:00+00:00', 'meeting', 'b66ce8ac-6415-40c1-b801-4bef15ef7982', false),
  ('Llamada DRACS', 'Seguimiento cuenta', '2026-08-22 16:00:00+00:00', '2026-08-22 16:45:00+00:00', 'call', 'b66ce8ac-6415-40c1-b801-4bef15ef7982', false),
  ('Reunión equipo', 'Sync semanal', '2026-08-23 09:00:00+00:00', '2026-08-23 10:00:00+00:00', 'meeting', 'b66ce8ac-6415-40c1-b801-4bef15ef7982', false),
  ('Revisión documentos', 'Validación contratos', '2026-08-25 11:00:00+00:00', '2026-08-25 12:00:00+00:00', 'other', 'b66ce8ac-6415-40c1-b801-4bef15ef7982', false);
