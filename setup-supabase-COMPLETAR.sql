-- SCRIPT PARA COMPLETAR LAS TABLAS RESTANTES
-- Usa este script DESPUÉS de que el script básico haya funcionado

-- Crear tabla de usuarios
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

-- Crear tabla de cotizaciones
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

-- Crear tabla de contratos
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

-- Crear tabla de facturas
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

-- Verificar que todo está bien
SELECT 'Tablas adicionales creadas correctamente' as resultado;

-- Mostrar todas las tablas creadas
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 