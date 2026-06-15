-- Schema de Base de Datos para OMVITAL - Supabase & PostgreSQL

-- Habilitar la extensión para UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creación de Enums
CREATE TYPE tipo_rol_trabajador AS ENUM ('Interno', 'Médico Externo', 'Jaladora');
CREATE TYPE estado_trabajador AS ENUM ('Activo', 'Inactivo');
CREATE TYPE estado_paquete_cliente AS ENUM ('Al día', 'Deuda', 'Parcial');
CREATE TYPE estado_caja AS ENUM ('Abierto', 'Cerrado');
CREATE TYPE tipo_movimiento AS ENUM ('Ingreso', 'Egreso');
CREATE TYPE metodo_pago AS ENUM ('Efectivo', 'Yape', 'Plin', 'Transferencia', 'Tarjeta');
CREATE TYPE estado_comision AS ENUM ('Pendiente', 'Pagado');

-- 1. Tabla de Trabajadores / Referidores
CREATE TABLE public.trabajadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    dni VARCHAR(15) UNIQUE NOT NULL,
    rol tipo_rol_trabajador NOT NULL DEFAULT 'Interno',
    especialidad VARCHAR(100),
    comision_rate DECIMAL(5,2) DEFAULT 0.00, -- Puede ser porcentaje (ej. 10.00%) o valor fijo
    estado estado_trabajador NOT NULL DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Tabla de Pacientes
CREATE TABLE public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE, -- ID visual del paciente (ej. '45902-B')
    nombre VARCHAR(255) NOT NULL,
    dni VARCHAR(15) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    referido_por_id UUID REFERENCES public.trabajadores(id) ON DELETE SET NULL, -- Referidor (médico/jaladora)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Tabla de Catálogo de Paquetes
CREATE TABLE public.paquetes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    cantidad_sesiones INTEGER NOT NULL CHECK (cantidad_sesiones > 0),
    precio_total DECIMAL(10,2) NOT NULL CHECK (precio_total >= 0.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Tabla de Venta / Seguimiento de Paquetes a Clientes
CREATE TABLE public.paquetes_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    paquete_id UUID NOT NULL REFERENCES public.paquetes(id),
    precio_venta DECIMAL(10,2) NOT NULL CHECK (precio_venta >= 0.00),
    pagado DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (pagado >= 0.00),
    deuda DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (deuda >= 0.00),
    sesiones_realizadas INTEGER NOT NULL DEFAULT 0 CHECK (sesiones_realizadas >= 0), -- Sesiones consumidas
    estado estado_paquete_cliente NOT NULL DEFAULT 'Deuda',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_deuda_pagado CHECK (pagado + deuda = precio_venta)
);

-- 5. Tabla de Registro de Sesiones del Paciente (Detalle clínico/asistencia)
CREATE TABLE public.sesiones_paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paquete_cliente_id UUID NOT NULL REFERENCES public.paquetes_cliente(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    terapeuta_id UUID NOT NULL REFERENCES public.trabajadores(id), -- Terapeuta que atendió la sesión
    notas TEXT, -- Comentarios o evolución del paciente en la sesión
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Tabla de Sesiones de Caja
CREATE TABLE public.sesiones_caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abierto_por UUID REFERENCES public.trabajadores(id),
    fecha_apertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    monto_apertura DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (monto_apertura >= 0.00),
    monto_cierre DECIMAL(10,2) CHECK (monto_cierre >= 0.00),
    estado estado_caja NOT NULL DEFAULT 'Abierto',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Tabla de Movimientos Financieros (Libro Diario)
CREATE TABLE public.movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caja_id UUID NOT NULL REFERENCES public.sesiones_caja(id),
    tipo tipo_movimiento NOT NULL,
    concepto VARCHAR(255) NOT NULL, -- ej. 'Pago de Sesión', 'Gasto Luz', etc.
    categoria VARCHAR(100), -- Categoría del movimiento (ej. 'Rehabilitación', 'Gasto Operativo', 'Nómina', 'Tecnología')
    metodo metodo_pago NOT NULL DEFAULT 'Efectivo',
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0.00),
    estado VARCHAR(50) NOT NULL DEFAULT 'Completado', -- Estado visual de la transacción (ej. 'Completado', 'Pendiente')
    nota TEXT,
    paquete_cliente_id UUID REFERENCES public.paquetes_cliente(id) ON DELETE SET NULL, -- Para trazabilidad
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Tabla de Control de Comisiones
CREATE TABLE public.comisiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trabajador_id UUID NOT NULL REFERENCES public.trabajadores(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
    monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0.00),
    estado estado_comision NOT NULL DEFAULT 'Pendiente',
    movimiento_id UUID REFERENCES public.movimientos(id) ON DELETE SET NULL, -- Asocia la liquidación (Egreso)
    fecha_comision DATE DEFAULT CURRENT_DATE NOT NULL, -- Fecha de la comisión registrada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE public.trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paquetes_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comisiones ENABLE ROW LEVEL SECURITY;

-- Creación de Políticas de Seguridad (RLS)

-- 1. Políticas de Lectura (Cualquier usuario autenticado puede leer datos)
CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON public.trabajadores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON public.pacientes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON public.paquetes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON public.paquetes_cliente FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON public.sesiones_paciente FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON public.sesiones_caja FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON public.movimientos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON public.comisiones FOR SELECT TO authenticated USING (true);

-- 2. Políticas de Escritura (Modificaciones de datos)
CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON public.movimientos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON public.pacientes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir inserción y actualización a usuarios autenticados" 
ON public.paquetes_cliente FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir inserción y actualización a usuarios autenticados" 
ON public.sesiones_paciente FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir inserción y actualización a usuarios autenticados" 
ON public.sesiones_caja FOR ALL TO authenticated USING (true);

-- 3. Políticas restrictivas de Administración (Trabajadores, Catálogo de Paquetes y Comisiones)
CREATE POLICY "Permitir CRUD completo solo a administradores" 
ON public.trabajadores FOR ALL TO authenticated 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Permitir CRUD completo solo a administradores" 
ON public.paquetes FOR ALL TO authenticated 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Permitir liquidar comisiones solo a administradores" 
ON public.comisiones FOR ALL TO authenticated 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
