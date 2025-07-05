const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabase = async () => {
    try {
        // Conectar a MySQL sin especificar base de datos
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('✅ Conexión establecida con MySQL');

        // Crear base de datos si no existe
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Base de datos '${process.env.DB_NAME}' creada o ya existe`);

        await connection.end();

        // Conectar a la base de datos específica
        const dbConnection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Crear tablas
        await createTables(dbConnection);
        
        await dbConnection.end();
        console.log('✅ Configuración de base de datos completada');

    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error.message);
        process.exit(1);
    }
};

const createTables = async (connection) => {
    // Tabla de usuarios
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario VARCHAR(50) UNIQUE NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            telefono VARCHAR(20),
            password_hash VARCHAR(255) NOT NULL,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            activo BOOLEAN DEFAULT TRUE,
            INDEX idx_usuario (usuario)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Tabla de clientes
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INT AUTO_INCREMENT PRIMARY KEY,
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
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Crear índices para mejor performance
    await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);
        CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
        CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
    `);

    // Habilitar RLS (Row Level Security)
    await connection.execute(`
        ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
    `);

    // Crear política para permitir todas las operaciones (temporal para desarrollo)
    await connection.execute(`
        CREATE POLICY "Permitir todo en clientes" ON clientes
            FOR ALL 
            TO authenticated 
            USING (true) 
            WITH CHECK (true);
    `);

    // Crear política para usuarios anónimos (para el registro)
    await connection.execute(`
        CREATE POLICY "Permitir acceso anónimo a clientes" ON clientes
            FOR ALL 
            TO anon 
            USING (true) 
            WITH CHECK (true);
    `);

    // Tabla de cotizaciones
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS cotizaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            codigo VARCHAR(20) UNIQUE NOT NULL,
            numero_documento VARCHAR(50),
            cliente_id INT NOT NULL,
            cliente_nombre VARCHAR(150) NOT NULL,
            cliente_ruc VARCHAR(50) NOT NULL,
            numero_leads INT NOT NULL,
            precio_unitario DECIMAL(10,2) NOT NULL,
            descuento DECIMAL(5,2) DEFAULT 0,
            subtotal DECIMAL(10,2) NOT NULL,
            descuento_monto DECIMAL(10,2) DEFAULT 0,
            itbms DECIMAL(10,2) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            descripcion TEXT,
            estado ENUM('borrador', 'pendiente', 'aprobada', 'rechazada', 'facturada', 'anulada') DEFAULT 'borrador',
            configuracion_original JSON,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
            INDEX idx_codigo (codigo)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Tabla de contratos
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS contratos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            numero_contrato VARCHAR(20) UNIQUE NOT NULL,
            cliente_id INT NOT NULL,
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
            estado ENUM('borrador', 'activo', 'finalizado', 'cancelado') DEFAULT 'borrador',
            configuracion_original JSON,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
            INDEX idx_numero_contrato (numero_contrato)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Tabla de facturas
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS facturas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            numero_factura VARCHAR(20) UNIQUE NOT NULL,
            tipo_documento ENUM('cotizacion', 'contrato') NOT NULL,
            documento_id INT NOT NULL,
            cliente_id INT NOT NULL,
            cliente_nombre VARCHAR(150) NOT NULL,
            cliente_ruc VARCHAR(50) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL,
            itbms DECIMAL(10,2) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            descripcion TEXT,
            configuracion_original JSON,
            fecha_factura DATE NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
            INDEX idx_numero_factura (numero_factura)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Tabla de configuración
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS configuracion (
            id INT AUTO_INCREMENT PRIMARY KEY,
            clave VARCHAR(50) UNIQUE NOT NULL,
            valor TEXT NOT NULL,
            descripcion VARCHAR(200),
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Insertar configuración por defecto
    await connection.execute(`
        INSERT INTO configuracion (clave, valor, descripcion) VALUES 
        ('itbms', '7', 'Porcentaje de ITBMS'),
        ('moneda_base', 'USD', 'Moneda base del sistema'),
        ('tasa_cambio', '1', 'Tasa de cambio respecto al USD')
        ON DUPLICATE KEY UPDATE valor = VALUES(valor)
    `);

    console.log('✅ Todas las tablas creadas exitosamente');
};

createDatabase(); 