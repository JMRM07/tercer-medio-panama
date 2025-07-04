// Función serverless para Vercel - Configuración del Sistema
import mysql from 'mysql2/promise';

async function connectDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    return connection;
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const db = await connectDB();

        switch (req.method) {
            case 'GET':
                // Obtener todas las configuraciones
                if (!req.query.clave) {
                    const [configuraciones] = await db.execute('SELECT * FROM configuracion ORDER BY clave');
                    await db.end();
                    
                    // Convertir a objeto para fácil acceso
                    const config = {};
                    configuraciones.forEach(item => {
                        config[item.clave] = {
                            valor: item.valor,
                            descripcion: item.descripcion,
                            fecha_actualizacion: item.fecha_actualizacion
                        };
                    });
                    
                    return res.json(config);
                }
                
                // Obtener configuración específica
                const [config] = await db.execute('SELECT * FROM configuracion WHERE clave = ?', [req.query.clave]);
                await db.end();
                return res.json(config[0] || null);

            case 'POST':
                // Crear nueva configuración
                const { clave, valor, descripcion } = req.body;
                
                if (!clave || !valor) {
                    await db.end();
                    return res.status(400).json({ error: 'Clave y valor son requeridos' });
                }

                const [result] = await db.execute(`
                    INSERT INTO configuracion (clave, valor, descripcion) 
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    valor = VALUES(valor), 
                    descripcion = VALUES(descripcion),
                    fecha_actualizacion = CURRENT_TIMESTAMP
                `, [clave, valor, descripcion]);
                
                await db.end();
                return res.json({ 
                    success: true, 
                    message: 'Configuración guardada',
                    id: result.insertId
                });

            case 'PUT':
                // Actualizar configuración existente
                const claveUpdate = req.query.clave || req.body.clave;
                const updateData = req.body;
                
                if (!claveUpdate) {
                    await db.end();
                    return res.status(400).json({ error: 'Clave de configuración requerida' });
                }

                await db.execute(`
                    UPDATE configuracion SET 
                    valor = ?, 
                    descripcion = COALESCE(?, descripcion),
                    fecha_actualizacion = CURRENT_TIMESTAMP
                    WHERE clave = ?
                `, [updateData.valor, updateData.descripcion, claveUpdate]);
                
                await db.end();
                return res.json({ success: true, message: 'Configuración actualizada' });

            default:
                await db.end();
                return res.status(405).json({ error: 'Método no permitido' });
        }

    } catch (error) {
        console.error('Error en función configuración:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 