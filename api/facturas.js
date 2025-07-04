// Función serverless para Vercel - Gestión de Facturas
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
                    // Obtener todas las facturas
                    const [facturas] = await db.execute(`
                        SELECT f.*, c.nombre as cliente_nombre, c.ruc as cliente_ruc
                        FROM facturas f 
                        LEFT JOIN clientes c ON f.cliente_id = c.id 
                        ORDER BY f.fecha_creacion DESC
                    `);
                    await db.end();
                    return res.json(facturas);
                }
                
                // Obtener factura específica
                const [factura] = await db.execute(`
                    SELECT f.*, c.nombre as cliente_nombre, c.ruc as cliente_ruc
                    FROM facturas f 
                    LEFT JOIN clientes c ON f.cliente_id = c.id 
                    WHERE f.id = ?
                `, [req.query.id]);
                
                await db.end();
                return res.json(factura[0] || null);

            case 'POST':
                // Crear nueva factura
                const {
                    numero_factura, tipo_documento, documento_id, cliente_id,
                    subtotal, itbms, total, descripcion, fecha_factura
                } = req.body;
                
                if (!numero_factura || !tipo_documento || !documento_id || !cliente_id) {
                    await db.end();
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                // Obtener datos del cliente
                const [cliente] = await db.execute('SELECT nombre, ruc FROM clientes WHERE id = ?', [cliente_id]);
                
                if (!cliente.length) {
                    await db.end();
                    return res.status(400).json({ error: 'Cliente no encontrado' });
                }

                // Obtener datos del documento origen (cotización o contrato)
                let documentoInfo = null;
                if (tipo_documento === 'cotizacion') {
                    const [cot] = await db.execute('SELECT * FROM cotizaciones WHERE id = ?', [documento_id]);
                    documentoInfo = cot[0];
                } else if (tipo_documento === 'contrato') {
                    const [con] = await db.execute('SELECT * FROM contratos WHERE id = ?', [documento_id]);
                    documentoInfo = con[0];
                }

                const [result] = await db.execute(`
                    INSERT INTO facturas (
                        numero_factura, tipo_documento, documento_id, cliente_id,
                        cliente_nombre, cliente_ruc, subtotal, itbms, total,
                        descripcion, fecha_factura, configuracion_original
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    numero_factura, tipo_documento, documento_id, cliente_id,
                    cliente[0].nombre, cliente[0].ruc, subtotal, itbms, total,
                    descripcion, fecha_factura, JSON.stringify(documentoInfo)
                ]);
                
                await db.end();
                return res.json({ 
                    success: true, 
                    id: result.insertId,
                    message: 'Factura creada exitosamente'
                });

            case 'PUT':
                // Actualizar factura
                const facturaId = req.query.id;
                const updateData = req.body;
                
                if (!facturaId) {
                    await db.end();
                    return res.status(400).json({ error: 'ID de factura requerido' });
                }

                await db.execute(`
                    UPDATE facturas SET 
                    subtotal = ?, itbms = ?, total = ?, 
                    descripcion = ?, fecha_factura = ?
                    WHERE id = ?
                `, [
                    updateData.subtotal, updateData.itbms, updateData.total,
                    updateData.descripcion, updateData.fecha_factura, facturaId
                ]);
                
                await db.end();
                return res.json({ success: true, message: 'Factura actualizada' });

            case 'DELETE':
                const deleteId = req.query.id;
                
                if (!deleteId) {
                    await db.end();
                    return res.status(400).json({ error: 'ID de factura requerido' });
                }

                // Eliminar factura (eliminar registro real)
                await db.execute('DELETE FROM facturas WHERE id = ?', [deleteId]);
                await db.end();
                return res.json({ success: true, message: 'Factura eliminada' });

            default:
                await db.end();
                return res.status(405).json({ error: 'Método no permitido' });
        }

    } catch (error) {
        console.error('Error en función facturas:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 