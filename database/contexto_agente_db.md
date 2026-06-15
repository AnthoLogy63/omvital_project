# Contexto para Agente de Programación: Esquema de Base de Datos OMVITAL

Este archivo provee el contexto completo y las reglas de negocio necesarias para que un agente de programación pueda modificar, extender o actualizar de manera segura el esquema de la base de datos de la clínica terapéutica OMVITAL.

---

## 1. Tecnologías y Arquitectura de Datos
- **Motor**: PostgreSQL (diseñado para Supabase).
- **Identificadores**: Uso mandatorio de UUIDs (`gen_random_uuid()`) como llaves primarias en lugar de enteros autoincrementales.
- **Tipos de Datos**: Uso de Enums nativos de PostgreSQL para restringir los estados y roles del sistema.
- **Seguridad**: RLS (Row Level Security) habilitado en todas las tablas para restringir accesos. Toda nueva tabla debe habilitar RLS y definir políticas de acceso para usuarios autenticados (`authenticated`) y administradores (`auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'`).

---

## 2. Reglas de Negocio Clave

### 2.1 Trabajadores y Comisión
- Los trabajadores (`public.trabajadores`) pueden ser Internos (personal clínico en planilla), Médicos Externos (médicos referidores) o Jaladoras (promotores de campo).
- Las comisiones (`public.comisiones`) se registran asociadas a un trabajador y un paciente.
- Las comisiones tienen estado `'Pendiente'` o `'Pagado'`. Cuando una comisión se paga:
  1. Se crea un registro de Egreso en `public.movimientos` con categoría `'Nómina'`.
  2. Se asocia el `movimiento_id` en la fila de la comisión.
  3. Se cambia el estado de la comisión a `'Pagado'`.

### 2.2 Control de Caja (Sesiones de Caja)
- Para registrar transacciones en `public.movimientos`, debe haber una sesión de caja abierta en `public.sesiones_caja` (estado `'Abierto'`).
- Un movimiento contable (`public.movimientos`) requiere un `caja_id` que apunte a la sesión de caja activa.
- Al cerrar la caja (`public.sesiones_caja` pasa a `'Cerrado'`), se deben registrar `fecha_cierre` y `monto_cierre` (el cual debe corresponder al cálculo exacto de `monto_apertura + Ingresos - Egresos` de los movimientos vinculados).

### 2.3 Venta de Paquetes y Seguimiento de Sesiones
- Un paciente puede comprar un paquete del catálogo. Esto crea un registro en `public.paquetes_cliente`.
- `precio_venta = pagado + deuda`. El estado del paquete puede ser `'Al día'` (sin deuda), `'Deuda'` (pago inicial en 0 o deuda total), o `'Parcial'` (se ha amortizado una parte pero queda saldo).
- Cada vez que el paciente asiste a una terapia, se inserta una fila en `public.sesiones_paciente` y se incrementa en uno `sesiones_realizadas` en `public.paquetes_cliente`.
- Las amortizaciones de deuda generan movimientos tipo `'Ingreso'` en la tabla `public.movimientos` y actualizan los campos `pagado` y `deuda` en `public.paquetes_cliente`.

### 2.4 Clasificación Financiera
- Todo movimiento financiero debe tener un `concepto` descriptivo (ej. "Pago de Sesión - Maria Garcia") y una `categoria` que clasifica el tipo de flujo de caja (ej. `'Rehabilitación'`, `'Gasto Operativo'`, `'Nómina'`, `'Tecnología'`, `'Paquete'`).
- Los movimientos se clasifican en `tipo` de movimiento (`'Ingreso'`, `'Egreso'`).

---

## 3. Guía de Modificación del Esquema (Paso a Paso)

Si necesitas actualizar el esquema:
1. **Verificar dependencias**: Si agregas una columna a `public.pacientes`, `public.trabajadores` o `public.paquetes_cliente`, asegúrate de actualizar la vista de la tabla y los formularios de inserción en el frontend (`src/routes/`).
2. **Respetar RLS**: Toda nueva tabla debe terminar con:
   ```sql
   ALTER TABLE public.mi_tabla ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.mi_tabla FOR SELECT TO authenticated USING (true);
   ```
3. **Mantener Enums**: Si se necesita agregar un método de pago o un rol de trabajador, realiza un `ALTER TYPE` o redefine el enum al inicio del archivo SQL.
4. **Trazabilidad**: Consulta siempre el archivo de trazabilidad [trazabilidad_ui_db.md](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/database/trazabilidad_ui_db.md) para saber qué componentes de la interfaz de usuario se verán afectados por tus cambios a nivel de columnas o constraints.

---

## 4. Referencia de Archivos de Datos y Rutas
- **Esquema de BD Principal**: [schema.sql](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/database/schema.sql)
- **Trazabilidad de Componentes**: [trazabilidad_ui_db.md](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/database/trazabilidad_ui_db.md)
- **Vistas del Sistema**:
  - Dashboard: [index.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/index.tsx)
  - Caja: [caja.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/caja.tsx)
  - Paquetes: [paquetes.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/paquetes.tsx)
  - Comisiones: [comisiones.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/comisiones.tsx)
  - Movimientos: [movimientos.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/movimientos.tsx)
  - Reportes: [reportes.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/reportes.tsx)
  - Trabajadores: [trabajadores.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/trabajadores.tsx)
  - Layout General: [__root.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/__root.tsx)
