-- SCRIPT SOLO PARA CREAR TABLA CLIENTES
-- Empezaremos solo con lo esencial para ver si funciona

-- Limpiar todo
DROP TABLE IF EXISTS configuracion CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS contratos CASCADE;
DROP TABLE IF EXISTS cotizaciones CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Eliminar cualquier función existente
DROP FUNCTION IF EXISTS update_fecha_actualizacion() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Crear solo la tabla de clientes
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

-- Crear tabla de configuracion básica
CREATE TABLE configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion VARCHAR(200),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración básica
INSERT INTO configuracion (clave, valor, descripcion) VALUES 
    ('itbms', '7', 'Porcentaje de ITBMS'),
    ('moneda_base', 'USD', 'Moneda base del sistema'),
    ('tasa_cambio', '1', 'Tasa de cambio respecto al USD');

-- Verificar que todo está bien
SELECT 'Tablas básicas creadas correctamente' as resultado;
SELECT * FROM configuracion; 