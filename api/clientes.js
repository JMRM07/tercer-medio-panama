// Ejemplo de función serverless para Vercel - Gestión de Clientes
import mysql from 'mysql2/promise';

// Configuración de base de datos
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

// Función principal exportada para Vercel
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const db = await connectDB();

        switch (req.method) {
            case 'GET':
                // Obtener todos los clientes
                if (!req.query.id) {
                    const [clientes] = await db.execute('SELECT * FROM clientes WHERE activo = 1 ORDER BY nombre');
                    await db.end();
                    return res.json(clientes);
                }
                
                // Obtener cliente específico
                const [cliente] = await db.execute('SELECT * FROM clientes WHERE id = ? AND activo = 1', [req.query.id]);
                await db.end();
                return res.json(cliente[0] || null);

            case 'POST':
                // Crear nuevo cliente
                const { codigo, nombre, ruc, dv, email, telefono } = req.body;
                
                // Validar datos requeridos
                if (!codigo || !nombre || !ruc || !dv || !email) {
                    await db.end();
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                const [result] = await db.execute(
                    'INSERT INTO clientes (codigo, nombre, ruc, dv, email, telefono) VALUES (?, ?, ?, ?, ?, ?)',
                    [codigo, nombre, ruc, dv, email, telefono]
                );
                
                await db.end();
                return res.json({ 
                    success: true, 
                    id: result.insertId,
                    message: 'Cliente creado exitosamente' 
                });

            case 'PUT':
                // Actualizar cliente
                const clienteId = req.query.id;
                const updateData = req.body;
                
                if (!clienteId) {
                    await db.end();
                    return res.status(400).json({ error: 'ID de cliente requerido' });
                }

                await db.execute(
                    'UPDATE clientes SET nombre = ?, ruc = ?, dv = ?, email = ?, telefono = ? WHERE id = ?',
                    [updateData.nombre, updateData.ruc, updateData.dv, updateData.email, updateData.telefono, clienteId]
                );
                
                await db.end();
                return res.json({ success: true, message: 'Cliente actualizado' });

            case 'DELETE':
                // Eliminar cliente (soft delete)
                const deleteId = req.query.id;
                
                if (!deleteId) {
                    await db.end();
                    return res.status(400).json({ error: 'ID de cliente requerido' });
                }

                await db.execute('UPDATE clientes SET activo = 0 WHERE id = ?', [deleteId]);
                await db.end();
                return res.json({ success: true, message: 'Cliente eliminado' });

            default:
                await db.end();
                return res.status(405).json({ error: 'Método no permitido' });
        }

    } catch (error) {
        console.error('Error en función clientes:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 