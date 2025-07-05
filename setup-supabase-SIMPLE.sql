-- SCRIPT SIMPLIFICADO PARA SUPABASE
-- Este script es más simple y sin triggers complejos
-- Úsalo si el script completo da errores

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

-- 2. TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
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
    estado VARCHAR(20) DEFAULT 'borrador',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

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
    estado VARCHAR(20) DEFAULT 'borrador',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- 5. TABLA DE FACTURAS
CREATE TABLE IF NOT EXISTS facturas (
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
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- 6. TABLA DE CONFIGURACIÓN
CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion VARCHAR(200),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto
INSERT INTO configuracion (clave, valor, descripcion) VALUES 
    ('itbms', '7', 'Porcentaje de ITBMS'),
    ('moneda_base', 'USD', 'Moneda base del sistema'),
    ('tasa_cambio', '1', 'Tasa de cambio respecto al USD')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;

-- ÍNDICES BÁSICOS
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_codigo ON cotizaciones(codigo);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente_id ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_numero_contrato ON contratos(numero_contrato);
CREATE INDEX IF NOT EXISTS idx_contratos_cliente_id ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_numero_factura ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);

-- CONFIGURACIÓN DE SEGURIDAD BÁSICA
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo
CREATE POLICY "Permitir todo en usuarios" ON usuarios FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en clientes" ON clientes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en cotizaciones" ON cotizaciones FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en contratos" ON contratos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en facturas" ON facturas FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en configuracion" ON configuracion FOR ALL TO anon USING (true) WITH CHECK (true);

-- Políticas para usuarios autenticados
CREATE POLICY "Permitir todo en usuarios auth" ON usuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en clientes auth" ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en cotizaciones auth" ON cotizaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en contratos auth" ON contratos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en facturas auth" ON facturas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en configuracion auth" ON configuracion FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ¡LISTO! Este script debería funcionar sin errores. 