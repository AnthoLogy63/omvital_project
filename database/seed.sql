-- Seed de Datos Iniciales para OMVITAL - Catálogo de Paquetes
-- Este archivo inserta los paquetes base en la tabla public.paquetes.

INSERT INTO public.paquetes (id, nombre, descripcion, cantidad_sesiones, precio_total)
VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Paquete Básico (5 Sesiones)', '5 sesiones de rehabilitación física y tratamiento focalizado', 5, 250.00),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Paquete Intenso (10 Sesiones)', '10 sesiones de rehabilitación integral con seguimiento continuo', 10, 450.00),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Paquete Integral OMVITAL (15 Sesiones)', '15 sesiones de fisioterapia avanzada y reevaluación médica', 15, 650.00),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Paquete Preventivo (3 Sesiones)', '3 sesiones de evaluación y terapia preventiva', 3, 150.00),
  ('e5f6a7b8-c90d-1e2f-3a4b-5c6d7e8f9a0b', 'Paquete Especializado Senior (8 Sesiones)', '8 sesiones de fisioterapia para adultos mayores y fortalecimiento', 8, 380.00)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  cantidad_sesiones = EXCLUDED.cantidad_sesiones,
  precio_total = EXCLUDED.precio_total;
