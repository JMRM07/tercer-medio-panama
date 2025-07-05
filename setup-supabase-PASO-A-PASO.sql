-- SCRIPT PASO A PASO PARA ENCONTRAR EL ERROR
-- Ejecuta cada sección POR SEPARADO para ver dónde falla

-- ============================================
-- PASO 1: LIMPIAR TODO (Ejecutar primero)
-- ============================================
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS contratos CASCADE;
DROP TABLE IF EXISTS cotizaciones CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;

-- Eliminar cualquier función que pueda existir
DROP FUNCTION IF EXISTS update_fecha_actualizacion() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

SELECT 'Paso 1: Limpieza completada' as resultado;

-- ============================================
-- PASO 2: CREAR TABLA USUARIOS (Ejecutar segundo)
-- ============================================
-- Descomenta estas líneas para ejecutar el Paso 2:
/*
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

SELECT 'Paso 2: Tabla usuarios creada' as resultado;
*/

-- ============================================
-- PASO 3: CREAR TABLA CLIENTES (Ejecutar tercero)
-- ============================================
-- Descomenta estas líneas para ejecutar el Paso 3:
/*
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ruc VARCHAR(20) NOT NULL,
    dv VARCHAR(2) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Paso 3: Tabla clientes creada' as resultado;
*/

-- ============================================
-- PASO 4: CREAR TABLA COTIZACIONES (Ejecutar cuarto)
-- ============================================
-- Descomenta estas líneas para ejecutar el Paso 4:
/*
CREATE TABLE cotizaciones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    numero_documento VARCHAR(50),
    cliente_id INTEGER NOT NULL,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_ruc VARCHAR(50) NOT NULL,
    numero_leads INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento_monto DECIMAL(10,2) DEFAULT 0,
    itbms DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'borrador',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Paso 4: Tabla cotizaciones creada' as resultado;
*/

-- ============================================
-- PASO 5: CREAR TABLA CONTRATOS (Ejecutar quinto)
-- ============================================
-- Descomenta estas líneas para ejecutar el Paso 5:
/*
CREATE TABLE contratos (
    id SERIAL PRIMARY KEY,
    numero_contrato VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INTEGER NOT NULL,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_ruc VARCHAR(50) NOT NULL,
    fecha_creacion DATE NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_finalizacion DATE NOT NULL,
    referencia TEXT,
    tarifa DECIMAL(10,2) NOT NULL,
    horas_contratadas DECIMAL(8,2) NOT NULL,
    horas_reportadas DECIMAL(8,2) DEFAULT 0,
    horas_facturadas DECIMAL(8,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    itbms DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'borrador',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Paso 5: Tabla contratos creada' as resultado;
*/

-- ============================================
-- PASO 6: CREAR TABLA FACTURAS (Ejecutar sexto)
-- ============================================
-- Descomenta estas líneas para ejecutar el Paso 6:
/*
CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    documento_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_ruc VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    itbms DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    fecha_factura DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Paso 6: Tabla facturas creada' as resultado;
*/

-- ============================================
-- PASO 7: CREAR TABLA CONFIGURACION (Ejecutar séptimo)
-- ============================================
-- Descomenta estas líneas para ejecutar el Paso 7:
/*
CREATE TABLE configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion VARCHAR(200),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO configuracion (clave, valor, descripcion) VALUES 
    ('itbms', '7', 'Porcentaje de ITBMS'),
    ('moneda_base', 'USD', 'Moneda base del sistema'),
    ('tasa_cambio', '1', 'Tasa de cambio respecto al USD');

SELECT 'Paso 7: Tabla configuracion creada' as resultado;
*/ 