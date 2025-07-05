-- Script completo para crear todas las tablas en Supabase
-- Adaptado desde setup-database.js para PostgreSQL

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);

-- 2. TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
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

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);

-- 3. TABLA DE COTIZACIONES
CREATE TABLE IF NOT EXISTS cotizaciones (
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
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'pendiente', 'aprobada', 'rechazada', 'facturada', 'anulada')),
    configuracion_original JSONB,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Índices para cotizaciones
CREATE INDEX IF NOT EXISTS idx_cotizaciones_codigo ON cotizaciones(codigo);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente_id ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);

-- 4. TABLA DE CONTRATOS
CREATE TABLE IF NOT EXISTS contratos (
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
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'activo', 'finalizado', 'cancelado')),
    configuracion_original JSONB,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Índices para contratos
CREATE INDEX IF NOT EXISTS idx_contratos_numero_contrato ON contratos(numero_contrato);
CREATE INDEX IF NOT EXISTS idx_contratos_cliente_id ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_estado ON contratos(estado);

-- 5. TABLA DE FACTURAS
CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL CHECK (tipo_documento IN ('cotizacion', 'contrato')),
    documento_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_ruc VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    itbms DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    configuracion_original JSONB,
    fecha_factura DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Índices para facturas
CREATE INDEX IF NOT EXISTS idx_facturas_numero_factura ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_tipo_documento ON facturas(tipo_documento);

-- 6. TABLA DE CONFIGURACIÓN
CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion VARCHAR(200),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para actualizar automáticamente fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar fecha_actualizacion en configuración
CREATE TRIGGER update_configuracion_updated_at 
    BEFORE UPDATE ON configuracion 
    FOR EACH ROW 
    EXECUTE FUNCTION update_fecha_actualizacion();

-- Trigger para actualizar updated_at en clientes
CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at();

-- Insertar configuración por defecto
INSERT INTO configuracion (clave, valor, descripcion) VALUES 
    ('itbms', '7', 'Porcentaje de ITBMS'),
    ('moneda_base', 'USD', 'Moneda base del sistema'),
    ('tasa_cambio', '1', 'Tasa de cambio respecto al USD')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;

-- ===========================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS - Row Level Security)
-- ===========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados (temporal para desarrollo)
CREATE POLICY "Permitir todo en usuarios" ON usuarios
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir todo en clientes" ON clientes
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir todo en cotizaciones" ON cotizaciones
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir todo en contratos" ON contratos
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir todo en facturas" ON facturas
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir todo en configuracion" ON configuracion
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Políticas para usuarios anónimos (para el registro y acceso público)
CREATE POLICY "Permitir acceso anónimo a usuarios" ON usuarios
    FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir acceso anónimo a clientes" ON clientes
    FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir acceso anónimo a cotizaciones" ON cotizaciones
    FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir acceso anónimo a contratos" ON contratos
    FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir acceso anónimo a facturas" ON facturas
    FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir acceso anónimo a configuracion" ON configuracion
    FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

-- =====================================
-- COMENTARIOS FINALES
-- =====================================

-- Este script crea toda la estructura de base de datos para Supabase
-- Incluye: usuarios, clientes, cotizaciones, contratos, facturas, configuración
-- Con índices optimizados, relaciones FK y políticas de seguridad RLS
-- Adaptado desde MySQL a PostgreSQL para Supabase

-- INSTRUCCIONES PARA USAR:
-- 1. Copia este script completo
-- 2. Ve a tu proyecto de Supabase
-- 3. Dirígete a SQL Editor
-- 4. Pega el script y ejecútalo
-- 5. Todas las tablas se crearán automáticamente 