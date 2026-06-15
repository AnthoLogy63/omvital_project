# OMVITAL - Trazabilidad de Componentes UI a Base de Datos

Este documento define la correspondencia detallada entre los componentes visuales de las 7 vistas del sistema (implementadas bajo `src/routes/`) y el esquema de base de datos relacional definido en [schema.sql](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/database/schema.sql).

---

## 1. Vista General / Dashboard (`/`)
Archivo fuente: [index.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/index.tsx)

Esta vista presenta un resumen de la situación financiera y operativa diaria de la clínica.

| Elemento Visual UI | Tabla(s) en BD | Columna(s) / Lógica SQL | Operación / Query |
| :--- | :--- | :--- | :--- |
| **Estado de Caja: ABIERTO/CERRADO** | `public.sesiones_caja` | `estado` (Enum: `'Abierto'`, `'Cerrado'`) | `SELECT estado FROM public.sesiones_caja ORDER BY fecha_apertura DESC LIMIT 1;` |
| **Ingresos del día** | `public.movimientos` | `monto`, `tipo` | `SELECT SUM(monto) FROM public.movimientos WHERE tipo = 'Ingreso' AND created_at::date = CURRENT_DATE;` |
| **Egresos del día** | `public.movimientos` | `monto`, `tipo` | `SELECT SUM(monto) FROM public.movimientos WHERE tipo = 'Egreso' AND created_at::date = CURRENT_DATE;` |
| **Saldo en Caja** | `public.sesiones_caja`, `public.movimientos` | `monto_apertura`, `monto` | `Saldo = (monto_apertura de caja abierta) + (SUM(Ingresos) - SUM(Egresos) del día)` |
| **Alertas: Paquetes Pendientes** | `public.paquetes_cliente` | `COUNT(*)` | `SELECT COUNT(*) FROM public.paquetes_cliente WHERE estado IN ('Deuda', 'Parcial');` |
| **Tabla: Últimos Movimientos** | `public.movimientos` | `created_at` (Fecha), `concepto` (Descripción), `categoria` (Categoría), `monto` (Monto), `tipo` (Ingreso/Egreso), `estado` (Estado) | `SELECT created_at, concepto, categoria, monto, tipo, estado FROM public.movimientos ORDER BY created_at DESC LIMIT 5;` |
| **Lista Lateral: Paquetes con deuda** | `public.paquetes_cliente` JOIN `public.pacientes` JOIN `public.paquetes` | `pacientes.nombre`, `paquetes.nombre`, `paquetes.cantidad_sesiones`, `paquetes_cliente.deuda`, `paquetes_cliente.sesiones_realizadas` | `SELECT pac.nombre as paciente, paq.nombre as paquete, paq.cantidad_sesiones, pc.deuda, (paq.cantidad_sesiones - pc.sesiones_realizadas) as pendientes FROM public.paquetes_cliente pc JOIN public.pacientes pac ON pc.paciente_id = pac.id JOIN public.paquetes paq ON pc.paquete_id = paq.id WHERE pc.deuda > 0 ORDER BY pc.deuda DESC LIMIT 3;` |
| **Lista Lateral: Comisiones pendientes** | `public.comisiones` JOIN `public.trabajadores` | `trabajadores.nombre`, `SUM(comisiones.monto)` | `SELECT t.nombre, SUM(c.monto) as total_pendiente FROM public.comisiones c JOIN public.trabajadores t ON c.trabajador_id = t.id WHERE c.estado = 'Pendiente' GROUP BY t.nombre ORDER BY total_pendiente DESC LIMIT 3;` |

---

## 2. Control de Caja (`/caja`)
Archivo fuente: [caja.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/caja.tsx)

Permite gestionar la sesión de caja activa y registrar transacciones manuales.

| Elemento Visual UI | Tabla(s) en BD | Columna(s) / Lógica SQL | Operación / Query |
| :--- | :--- | :--- | :--- |
| **Resumen: Total Ingresos (Sesión)** | `public.movimientos` | `monto` | `SELECT SUM(monto) FROM public.movimientos WHERE tipo = 'Ingreso' AND caja_id = :active_caja_id;` |
| **Resumen: Total Egresos (Sesión)** | `public.movimientos` | `monto` | `SELECT SUM(monto) FROM public.movimientos WHERE tipo = 'Egreso' AND caja_id = :active_caja_id;` |
| **Resumen: Saldo Actual (Caja)** | `public.sesiones_caja`, `public.movimientos` | `monto_apertura`, `monto` | `Monto Apertura + (Ingresos - Egresos)` |
| **Acción: Cierre de Caja** | `public.sesiones_caja` | `fecha_cierre`, `monto_cierre`, `estado` | `UPDATE public.sesiones_caja SET fecha_cierre = NOW(), monto_cierre = :monto_calculado, estado = 'Cerrado' WHERE id = :active_caja_id;` |
| **Formulario: Nuevo Ingreso** | `public.movimientos` | `monto`, `concepto` (Select: Pago de Sesión, Paquete, Venta Insumos, Otros), `metodo` (Radio: Efectivo, Yape, Plin, Tarjeta, etc.), `tipo` | `INSERT INTO public.movimientos (caja_id, tipo, concepto, categoria, metodo, monto, estado) VALUES (:caja_id, 'Ingreso', :concepto, 'Caja', :metodo, :monto, 'Completado');` |
| **Formulario: Egreso Operativo** | `public.movimientos` | `monto`, `concepto` (Input texto), `nota` (Textarea), `tipo` | `INSERT INTO public.movimientos (caja_id, tipo, concepto, categoria, metodo, monto, nota, estado) VALUES (:caja_id, 'Egreso', :concepto, 'Gasto Operativo', 'Efectivo', :monto, :nota, 'Completado');` |
| **Tabla: Movimientos del Día** | `public.movimientos` | `created_at` (Hora), `concepto`, `nota` (Sub-concepto/Detalle), `metodo`, `monto`, `tipo` | `SELECT created_at, concepto, nota, metodo, monto, tipo FROM public.movimientos WHERE caja_id = :active_caja_id ORDER BY created_at DESC;` |

---

## 3. Gestión de Paquetes (`/paquetes`)
Archivo fuente: [paquetes.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/paquetes.tsx)

Controla el estado de ventas de paquetes terapéuticos, sesiones consumidas y deudas por paciente.

| Elemento Visual UI | Tabla(s) en BD | Columna(s) / Lógica SQL | Operación / Query |
| :--- | :--- | :--- | :--- |
| **Resumen: Recaudación Total (Mes)** | `public.paquetes_cliente` | `pagado` | `SELECT SUM(pagado) FROM public.paquetes_cliente WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE);` |
| **Resumen: Deuda Pendiente Total** | `public.paquetes_cliente` | `deuda` | `SELECT SUM(deuda) FROM public.paquetes_cliente;` |
| **Resumen: Paquetes en Curso** | `public.paquetes_cliente` JOIN `public.paquetes` | `sesiones_realizadas`, `paquetes.cantidad_sesiones` | `SELECT COUNT(*) FROM public.paquetes_cliente pc JOIN public.paquetes p ON pc.paquete_id = p.id WHERE pc.sesiones_realizadas < p.cantidad_sesiones;` |
| **Acción: Registrar Nueva Venta** | `public.paquetes_cliente` | `paciente_id`, `paquete_id`, `precio_venta`, `pagado`, `deuda`, `estado` | `INSERT INTO public.paquetes_cliente (paciente_id, paquete_id, precio_venta, pagado, deuda, estado) VALUES (:paciente_id, :paquete_id, :precio_venta, :pagado, :deuda, :estado);` |
| **Tabla: Ventas y Seguimiento** | `public.paquetes_cliente` JOIN `public.pacientes` JOIN `public.paquetes` | `pacientes.nombre`, `pacientes.codigo`, `paquetes.nombre`, `paquetes.cantidad_sesiones`, `precio_venta`, `pagado`, `deuda`, `estado`, `sesiones_realizadas` | `SELECT pac.nombre, pac.codigo, paq.nombre as paquete_nombre, pc.precio_venta, pc.pagado, pc.deuda, pc.estado, pc.sesiones_realizadas, paq.cantidad_sesiones FROM public.paquetes_cliente pc JOIN public.pacientes pac ON pc.paciente_id = pac.id JOIN public.paquetes paq ON pc.paquete_id = paq.id;` |
| **Acción: Registrar Pago (add_card)** | `public.paquetes_cliente`, `public.movimientos` | `pagado`, `deuda`, `estado`, `movimientos` insertion | `1. UPDATE public.paquetes_cliente SET pagado = pagado + :monto_pago, deuda = deuda - :monto_pago, estado = :nuevo_estado WHERE id = :paquete_cliente_id;`<br>`2. INSERT INTO public.movimientos (caja_id, tipo, concepto, categoria, metodo, monto, paquete_cliente_id) VALUES (:caja_id, 'Ingreso', 'Pago Paquete - ' \|\| :paciente_nombre, 'Paquete', :metodo, :monto_pago, :paquete_cliente_id);` |
| **Acción: Registrar Sesión Asistida** | `public.sesiones_paciente`, `public.paquetes_cliente` | `paquete_cliente_id`, `terapeuta_id`, `notas`, `sesiones_realizadas` | `1. INSERT INTO public.sesiones_paciente (paquete_cliente_id, terapeuta_id, notas) VALUES (:pc_id, :terapeuta_id, :notas);`<br>`2. UPDATE public.paquetes_cliente SET sesiones_realizadas = sesiones_realizadas + 1 WHERE id = :pc_id;` |

---

## 4. Gestión de Comisiones (`/comisiones`)
Archivo fuente: [comisiones.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/comisiones.tsx)

Permite registrar y liquidar las comisiones para médicos y promotores.

| Elemento Visual UI | Tabla(s) en BD | Columna(s) / Lógica SQL | Operación / Query |
| :--- | :--- | :--- | :--- |
| **Formulario: Nueva Comisión** | `public.comisiones` | `trabajador_id` (basado en nombre/rol), `paciente_id` (basado en nombre/dni), `monto`, `fecha_comision` | `INSERT INTO public.comisiones (trabajador_id, paciente_id, monto, fecha_comision, estado) VALUES (:trabajador_id, :paciente_id, :monto, :fecha, 'Pendiente');` |
| **Tabla: Comisiones Registradas** | `public.comisiones` JOIN `public.trabajadores` JOIN `public.pacientes` | `trabajadores.nombre`, `trabajadores.rol` (Médico/Jalador), `pacientes.nombre`, `comisiones.monto`, `comisiones.estado` | `SELECT t.nombre as trabajador_nombre, t.rol as trabajador_rol, p.nombre as paciente_nombre, c.monto, c.estado FROM public.comisiones c JOIN public.trabajadores t ON c.trabajador_id = t.id JOIN public.pacientes p ON c.paciente_id = p.id;` |
| **Acción: Liquidar / Pagar Comisión** | `public.comisiones` JOIN `public.movimientos` | `comisiones.estado`, `comisiones.movimiento_id`, `movimientos` insertion | `1. INSERT INTO public.movimientos (caja_id, tipo, concepto, categoria, metodo, monto) VALUES (:caja_id, 'Egreso', 'Pago Comisión - ' \|\| :trabajador_nombre, 'Nómina', 'Transferencia', :monto_comision) RETURNING id;`<br>`2. UPDATE public.comisiones SET estado = 'Pagado', movimiento_id = :movimiento_id WHERE id = :comision_id;` |
| **Resumen: Total Pendiente** | `public.comisiones` | `monto` | `SELECT SUM(monto) FROM public.comisiones WHERE estado = 'Pendiente';` |
| **Resumen: Pagado este Mes** | `public.comisiones` | `monto` | `SELECT SUM(monto) FROM public.comisiones WHERE estado = 'Pagado' AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE);` |
| **Historial: Últimos Pagos** | `public.comisiones` JOIN `public.trabajadores` JOIN `public.movimientos` | `trabajadores.nombre`, `movimientos.metodo`, `movimientos.created_at`, `comisiones.monto` | `SELECT t.nombre, m.metodo, m.created_at, c.monto FROM public.comisiones c JOIN public.trabajadores t ON c.trabajador_id = t.id JOIN public.movimientos m ON c.movimiento_id = m.id WHERE c.estado = 'Pagado' ORDER BY m.created_at DESC LIMIT 2;` |

---

## 5. Libro Contable / Movimientos (`/movimientos`)
Archivo fuente: [movimientos.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/movimientos.tsx)

El libro diario que unifica todas las transacciones financieras.

| Elemento Visual UI | Tabla(s) en BD | Columna(s) / Lógica SQL | Operación / Query |
| :--- | :--- | :--- | :--- |
| **Buscador global** | `public.movimientos` | `concepto`, `categoria`, `nota` | `SELECT * FROM public.movimientos WHERE concepto ILIKE :search OR categoria ILIKE :search;` |
| **Filtro por Tipo** | `public.movimientos` | `tipo` | `SELECT * FROM public.movimientos WHERE tipo = :tipo_filtro;` |
| **Filtro por Origen** | `public.movimientos` | `categoria`, `paquete_cliente_id` | `SELECT * FROM public.movimientos WHERE categoria = :categoria_origen;` (Caja, Paquete, Nómina/Comisión, etc.) |
| **Filtro por Método** | `public.movimientos` | `metodo` | `SELECT * FROM public.movimientos WHERE metodo = :metodo_filtro;` |
| **Tabla: Movimientos** | `public.movimientos` | `created_at` (Fecha & Hora), `categoria` (Origen), `tipo`, `metodo`, `monto` | `SELECT created_at, categoria, tipo, metodo, monto FROM public.movimientos ORDER BY created_at DESC;` |

---

## 6. Análisis y Reportes (`/reportes`)
Archivo fuente: [reportes.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/reportes.tsx)

Generación de indicadores de rendimiento financiero e información estadística.

| Elemento Visual UI | Tabla(s) en BD | Columna(s) / Lógica SQL | Operación / Query |
| :--- | :--- | :--- | :--- |
| **Tarjeta: Total Ingresos** | `public.movimientos` | `monto` | `SELECT SUM(monto) FROM public.movimientos WHERE tipo = 'Ingreso' AND created_at BETWEEN :fecha_inicio AND :fecha_fin;` |
| **Tarjeta: Total Gastos** | `public.movimientos` | `monto` | `SELECT SUM(monto) FROM public.movimientos WHERE tipo = 'Egreso' AND created_at BETWEEN :fecha_inicio AND :fecha_fin;` |
| **Balance Neto** | `public.movimientos` | `monto` | `Balance = Total Ingresos - Total Gastos` |
| **Promedio Diario Caja** | `public.movimientos` | `monto` / días transcurridos | `SELECT SUM(monto) / COUNT(DISTINCT created_at::date) FROM public.movimientos WHERE tipo = 'Ingreso' AND categoria = 'Caja';` |
| **Paquetes Vendidos** | `public.paquetes_cliente` | `COUNT(*)` | `SELECT COUNT(*) FROM public.paquetes_cliente WHERE created_at BETWEEN :fecha_inicio AND :fecha_fin;` |
| **Comisiones Pagadas** | `public.comisiones` | `monto` | `SELECT SUM(monto) FROM public.comisiones WHERE estado = 'Pagado' AND created_at BETWEEN :fecha_inicio AND :fecha_fin;` |
| **Desglose de Movimientos Recientes** | `public.movimientos` | `created_at`, `concepto`, `categoria`, `monto`, `estado` | `SELECT created_at, concepto, categoria, monto, estado FROM public.movimientos ORDER BY created_at DESC LIMIT 5;` |

---

## 7. Gestión de Trabajadores (`/trabajadores`)
Archivo fuente: [trabajadores.tsx](file:///home/rikich/repos/academicos/tecn_inf/omvital_project/src/routes/trabajadores.tsx)

Control del catálogo de staff y el cálculo de rendimiento de los referidores.

| Elemento Visual UI | Tabla(s) en BD | Columna(s) / Lógica SQL | Operación / Query |
| :--- | :--- | :--- | :--- |
| **Estadística: Total Personal** | `public.trabajadores` | `COUNT(*)` | `SELECT COUNT(*) FROM public.trabajadores;` |
| **Estadística: Médicos Externos** | `public.trabajadores` | `COUNT(*)` | `SELECT COUNT(*) FROM public.trabajadores WHERE rol = 'Médico Externo';` |
| **Acción: Registrar Trabajador** | `public.trabajadores` | `nombre`, `dni`, `rol`, `especialidad`, `comision_rate`, `estado` | `INSERT INTO public.trabajadores (nombre, dni, rol, especialidad, comision_rate, estado) VALUES (:nombre, :dni, :rol, :especialidad, :comision_rate, :estado);` |
| **Tabla: Catálogo de Referidores** | `public.trabajadores` LEFT JOIN `public.comisiones` | `trabajadores.*`, `SUM(comisiones.monto)` (Comisiones este mes) | `SELECT t.id, t.nombre, t.dni, t.rol, t.especialidad, t.estado, COALESCE(SUM(c.monto), 0) as comisiones_mes FROM public.trabajadores t LEFT JOIN public.comisiones c ON c.trabajador_id = t.id AND EXTRACT(MONTH FROM c.created_at) = EXTRACT(MONTH FROM CURRENT_DATE) GROUP BY t.id, t.nombre, t.dni, t.rol, t.especialidad, t.estado;` |
| **Sección: Referenciadores Destacados** | `public.pacientes` JOIN `public.trabajadores` | `pacientes.referido_por_id` | `SELECT t.nombre, COUNT(p.id) as referidos_count FROM public.pacientes p JOIN public.trabajadores t ON p.referido_por_id = t.id GROUP BY t.nombre ORDER BY referidos_count DESC LIMIT 3;` |
