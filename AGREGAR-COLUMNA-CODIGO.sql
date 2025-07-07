-- SCRIPT PARA AGREGAR COLUMNA CODIGO A LA TABLA CLIENTES
-- Ejecutar SOLO este script en Supabase SQL Editor

-- Paso 1: Agregar la columna codigo
ALTER TABLE clientes 
ADD COLUMN codigo VARCHAR(50) UNIQUE;

-- Paso 2: Generar códigos para los registros existentes (si los hay)
-- Esto crea códigos únicos para cualquier cliente que ya exista
UPDATE clientes 
SET codigo = 'C' || LPAD(id::text, 4, '0') 
WHERE codigo IS NULL;

-- Paso 3: Hacer la columna NOT NULL después de llenar los datos
ALTER TABLE clientes 
ALTER COLUMN codigo SET NOT NULL;

-- Paso 4: Crear índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);

-- Paso 5: Verificar que todo esté bien
SELECT 
    'Columna codigo agregada exitosamente' as resultado,
    count(*) as total_clientes
FROM clientes;

-- Paso 6: Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND table_schema = 'public'
ORDER BY ordinal_position; 