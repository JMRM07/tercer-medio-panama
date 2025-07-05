-- SQL para crear tabla clientes en Supabase
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

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (temporal para desarrollo)
CREATE POLICY "Permitir todo en clientes" ON clientes
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- También crear política para usuarios anónimos
CREATE POLICY "Permitir acceso anónimo a clientes" ON clientes
    FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true); 