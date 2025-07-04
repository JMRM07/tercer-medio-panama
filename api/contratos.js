// Función serverless para Vercel - Gestión de Contratos
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
                    // Obtener todos los contratos
                    const [contratos] = await db.execute(`
                        SELECT c.*, cl.nombre as cliente_nombre, cl.ruc as cliente_ruc
                        FROM contratos c 
                        LEFT JOIN clientes cl ON c.cliente_id = cl.id 
                        ORDER BY c.fecha_registro DESC
                    `);
                    await db.end();
                    return res.json(contratos);
                }
                
                // Obtener contrato específico
                const [contrato] = await db.execute(`
                    SELECT c.*, cl.nombre as cliente_nombre, cl.ruc as cliente_ruc
                    FROM contratos c 
                    LEFT JOIN clientes cl ON c.cliente_id = cl.id 
                    WHERE c.id = ?
                `, [req.query.id]);
                
                await db.end();
                return res.json(contrato[0] || null);

            case 'POST':
                // Crear nuevo contrato
                const {
                    numero_contrato, cliente_id, fecha_creacion, fecha_inicio,
                    fecha_finalizacion, referencia, tarifa, horas_contratadas,
                    horas_facturadas, estado
                } = req.body;
                
                if (!numero_contrato || !cliente_id || !fecha_inicio || !tarifa || !horas_contratadas) {
                    await db.end();
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                // Calcular totales
                const subtotal = horas_facturadas * tarifa;
                const itbms = subtotal * 0.07; // 7% ITBMS
                const total = subtotal + itbms;

                // Obtener datos del cliente
                const [cliente] = await db.execute('SELECT nombre, ruc FROM clientes WHERE id = ?', [cliente_id]);
                
                if (!cliente.length) {
                    await db.end();
                    return res.status(400).json({ error: 'Cliente no encontrado' });
                }

                const [result] = await db.execute(`
                    INSERT INTO contratos (
                        numero_contrato, cliente_id, cliente_nombre, cliente_ruc,
                        fecha_creacion, fecha_inicio, fecha_finalizacion, referencia,
                        tarifa, horas_contratadas, horas_reportadas, horas_facturadas,
                        subtotal, itbms, total, estado
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    numero_contrato, cliente_id, cliente[0].nombre, cliente[0].ruc,
                    fecha_creacion, fecha_inicio, fecha_finalizacion, referencia,
                    tarifa, horas_contratadas, 0, horas_facturadas,
                    subtotal, itbms, total, estado || 'borrador'
                ]);
                
                await db.end();
                return res.json({ 
                    success: true, 
                    id: result.insertId,
                    totales: { subtotal, itbms, total }
                });

            case 'PUT':
                // Actualizar contrato
                const contratoId = req.query.id;
                const updateData = req.body;
                
                if (!contratoId) {
                    await db.end();
                    return res.status(400).json({ error: 'ID de contrato requerido' });
                }

                // Recalcular totales si es necesario
                if (updateData.horas_facturadas || updateData.tarifa) {
                    const subtotal = updateData.horas_facturadas * updateData.tarifa;
                    const itbms = subtotal * 0.07;
                    const total = subtotal + itbms;
                    
                    updateData.subtotal = subtotal;
                    updateData.itbms = itbms;
                    updateData.total = total;
                }

                await db.execute(`
                    UPDATE contratos SET 
                    fecha_inicio = ?, fecha_finalizacion = ?, referencia = ?,
                    tarifa = ?, horas_contratadas = ?, horas_reportadas = ?,
                    horas_facturadas = ?, subtotal = ?, itbms = ?, total = ?, estado = ?
                    WHERE id = ?
                `, [
                    updateData.fecha_inicio, updateData.fecha_finalizacion, updateData.referencia,
                    updateData.tarifa, updateData.horas_contratadas, updateData.horas_reportadas,
                    updateData.horas_facturadas, updateData.subtotal, updateData.itbms, 
                    updateData.total, updateData.estado, contratoId
                ]);
                
                await db.end();
                return res.json({ success: true, message: 'Contrato actualizado' });

            case 'DELETE':
                const deleteId = req.query.id;
                
                if (!deleteId) {
                    await db.end();
                    return res.status(400).json({ error: 'ID de contrato requerido' });
                }

                await db.execute('UPDATE contratos SET estado = ? WHERE id = ?', ['cancelado', deleteId]);
                await db.end();
                return res.json({ success: true, message: 'Contrato cancelado' });

            default:
                await db.end();
                return res.status(405).json({ error: 'Método no permitido' });
        }

    } catch (error) {
        console.error('Error en función contratos:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 