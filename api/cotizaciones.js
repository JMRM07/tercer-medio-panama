// Función serverless para Vercel - Gestión de Cotizaciones
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const db = await connectDB();

        switch (req.method) {
            case 'GET':
                if (!req.query.id) {
                    // Obtener todas las cotizaciones con información del cliente
                    const [cotizaciones] = await db.execute(`
                        SELECT c.*, cl.nombre as cliente_nombre, cl.ruc as cliente_ruc
                        FROM cotizaciones c 
                        LEFT JOIN clientes cl ON c.cliente_id = cl.id 
                        ORDER BY c.fecha_creacion DESC
                    `);
                    await db.end();
                    return res.json(cotizaciones);
                }
                
                // Obtener cotización específica
                const [cotizacion] = await db.execute(`
                    SELECT c.*, cl.nombre as cliente_nombre, cl.ruc as cliente_ruc
                    FROM cotizaciones c 
                    LEFT JOIN clientes cl ON c.cliente_id = cl.id 
                    WHERE c.id = ?
                `, [req.query.id]);
                
                await db.end();
                return res.json(cotizacion[0] || null);

            case 'POST':
                // Crear nueva cotización
                const {
                    codigo, numero_documento, cliente_id, numero_leads,
                    precio_unitario, descuento, descripcion, estado
                } = req.body;
                
                if (!codigo || !cliente_id || !numero_leads || !precio_unitario) {
                    await db.end();
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                // Calcular totales
                const subtotal = numero_leads * precio_unitario;
                const descuento_monto = subtotal * (descuento / 100 || 0);
                const subtotal_descuento = subtotal - descuento_monto;
                const itbms = subtotal_descuento * 0.07; // 7% ITBMS
                const total = subtotal_descuento + itbms;

                // Obtener datos del cliente
                const [cliente] = await db.execute('SELECT nombre, ruc FROM clientes WHERE id = ?', [cliente_id]);
                
                const [result] = await db.execute(`
                    INSERT INTO cotizaciones (
                        codigo, numero_documento, cliente_id, cliente_nombre, cliente_ruc,
                        numero_leads, precio_unitario, descuento, subtotal, 
                        descuento_monto, itbms, total, descripcion, estado
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    codigo, numero_documento, cliente_id, cliente[0].nombre, cliente[0].ruc,
                    numero_leads, precio_unitario, descuento, subtotal,
                    descuento_monto, itbms, total, descripcion, estado || 'borrador'
                ]);
                
                await db.end();
                return res.json({ 
                    success: true, 
                    id: result.insertId,
                    totales: { subtotal, descuento_monto, itbms, total }
                });

            case 'PUT':
                // Actualizar cotización
                const cotizacionId = req.query.id;
                const updateData = req.body;
                
                if (!cotizacionId) {
                    await db.end();
                    return res.status(400).json({ error: 'ID de cotización requerido' });
                }

                // Recalcular totales si es necesario
                if (updateData.numero_leads || updateData.precio_unitario || updateData.descuento) {
                    const subtotal = updateData.numero_leads * updateData.precio_unitario;
                    const descuento_monto = subtotal * (updateData.descuento / 100 || 0);
                    const subtotal_descuento = subtotal - descuento_monto;
                    const itbms = subtotal_descuento * 0.07;
                    const total = subtotal_descuento + itbms;
                    
                    updateData.subtotal = subtotal;
                    updateData.descuento_monto = descuento_monto;
                    updateData.itbms = itbms;
                    updateData.total = total;
                }

                await db.execute(`
                    UPDATE cotizaciones SET 
                    numero_documento = ?, numero_leads = ?, precio_unitario = ?,
                    descuento = ?, subtotal = ?, descuento_monto = ?, 
                    itbms = ?, total = ?, descripcion = ?, estado = ?
                    WHERE id = ?
                `, [
                    updateData.numero_documento, updateData.numero_leads, updateData.precio_unitario,
                    updateData.descuento, updateData.subtotal, updateData.descuento_monto,
                    updateData.itbms, updateData.total, updateData.descripcion, updateData.estado,
                    cotizacionId
                ]);
                
                await db.end();
                return res.json({ success: true, message: 'Cotización actualizada' });

            case 'DELETE':
                const deleteId = req.query.id;
                
                if (!deleteId) {
                    await db.end();
                    return res.status(400).json({ error: 'ID de cotización requerido' });
                }

                await db.execute('UPDATE cotizaciones SET estado = ? WHERE id = ?', ['anulada', deleteId]);
                await db.end();
                return res.json({ success: true, message: 'Cotización anulada' });

            default:
                await db.end();
                return res.status(405).json({ error: 'Método no permitido' });
        }

    } catch (error) {
        console.error('Error en función cotizaciones:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 