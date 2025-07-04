// Función serverless para Vercel - Reportes
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const db = await connectDB();
        const tipoReporte = req.query.tipo || req.body?.tipo;

        switch (tipoReporte) {
            case 'dashboard':
                // Reporte de dashboard - resumen general
                const [totalClientes] = await db.execute('SELECT COUNT(*) as total FROM clientes WHERE activo = 1');
                const [totalCotizaciones] = await db.execute('SELECT COUNT(*) as total FROM cotizaciones');
                const [totalContratos] = await db.execute('SELECT COUNT(*) as total FROM contratos');
                const [totalFacturas] = await db.execute('SELECT COUNT(*) as total FROM facturas');
                
                const [ventasActuales] = await db.execute(`
                    SELECT SUM(total) as ventas_totales, COUNT(*) as facturas_mes
                    FROM facturas 
                    WHERE MONTH(fecha_factura) = MONTH(CURRENT_DATE()) 
                    AND YEAR(fecha_factura) = YEAR(CURRENT_DATE())
                `);

                const [estadoCotizaciones] = await db.execute(`
                    SELECT estado, COUNT(*) as cantidad, SUM(total) as monto_total
                    FROM cotizaciones 
                    GROUP BY estado
                `);

                await db.end();
                return res.json({
                    resumen: {
                        clientes: totalClientes[0].total,
                        cotizaciones: totalCotizaciones[0].total,
                        contratos: totalContratos[0].total,
                        facturas: totalFacturas[0].total
                    },
                    ventas: {
                        mes_actual: ventasActuales[0].ventas_totales || 0,
                        facturas_mes: ventasActuales[0].facturas_mes || 0
                    },
                    cotizaciones_por_estado: estadoCotizaciones
                });

            case 'ventas':
                // Reporte de ventas por período
                const { fecha_inicio, fecha_fin } = req.query;
                
                const [ventasPeriodo] = await db.execute(`
                    SELECT 
                        DATE(fecha_factura) as fecha,
                        COUNT(*) as cantidad_facturas,
                        SUM(subtotal) as subtotal,
                        SUM(itbms) as itbms,
                        SUM(total) as total
                    FROM facturas 
                    WHERE fecha_factura BETWEEN ? AND ?
                    GROUP BY DATE(fecha_factura)
                    ORDER BY fecha_factura DESC
                `, [fecha_inicio || '2024-01-01', fecha_fin || '2024-12-31']);

                const [ventasPorCliente] = await db.execute(`
                    SELECT 
                        cliente_nombre,
                        COUNT(*) as cantidad_facturas,
                        SUM(total) as total_ventas
                    FROM facturas 
                    WHERE fecha_factura BETWEEN ? AND ?
                    GROUP BY cliente_id, cliente_nombre
                    ORDER BY total_ventas DESC
                `, [fecha_inicio || '2024-01-01', fecha_fin || '2024-12-31']);

                await db.end();
                return res.json({
                    ventas_por_fecha: ventasPeriodo,
                    ventas_por_cliente: ventasPorCliente
                });

            case 'clientes':
                // Reporte de actividad de clientes
                const [clientesActivos] = await db.execute(`
                    SELECT 
                        c.nombre,
                        c.ruc,
                        COUNT(DISTINCT cot.id) as cotizaciones,
                        COUNT(DISTINCT con.id) as contratos,
                        COUNT(DISTINCT f.id) as facturas,
                        COALESCE(SUM(f.total), 0) as total_facturado,
                        MAX(f.fecha_factura) as ultima_factura
                    FROM clientes c
                    LEFT JOIN cotizaciones cot ON c.id = cot.cliente_id
                    LEFT JOIN contratos con ON c.id = con.cliente_id
                    LEFT JOIN facturas f ON c.id = f.cliente_id
                    WHERE c.activo = 1
                    GROUP BY c.id, c.nombre, c.ruc
                    ORDER BY total_facturado DESC
                `);

                await db.end();
                return res.json({ clientes: clientesActivos });

            case 'contratos':
                // Reporte de estado de contratos
                const [estadoContratos] = await db.execute(`
                    SELECT 
                        numero_contrato,
                        cliente_nombre,
                        fecha_inicio,
                        fecha_finalizacion,
                        horas_contratadas,
                        horas_reportadas,
                        horas_facturadas,
                        (horas_contratadas - horas_reportadas) as horas_pendientes,
                        estado,
                        total
                    FROM contratos 
                    ORDER BY fecha_inicio DESC
                `);

                const [resumenContratos] = await db.execute(`
                    SELECT 
                        estado,
                        COUNT(*) as cantidad,
                        SUM(total) as monto_total,
                        SUM(horas_contratadas) as horas_totales,
                        SUM(horas_reportadas) as horas_reportadas
                    FROM contratos 
                    GROUP BY estado
                `);

                await db.end();
                return res.json({
                    contratos: estadoContratos,
                    resumen: resumenContratos
                });

            case 'financiero':
                // Reporte financiero detallado
                const [ventasMensuales] = await db.execute(`
                    SELECT 
                        YEAR(fecha_factura) as año,
                        MONTH(fecha_factura) as mes,
                        MONTHNAME(fecha_factura) as nombre_mes,
                        COUNT(*) as cantidad_facturas,
                        SUM(subtotal) as subtotal,
                        SUM(itbms) as itbms,
                        SUM(total) as total
                    FROM facturas 
                    GROUP BY YEAR(fecha_factura), MONTH(fecha_factura)
                    ORDER BY año DESC, mes DESC
                    LIMIT 12
                `);

                const [topClientes] = await db.execute(`
                    SELECT 
                        cliente_nombre,
                        COUNT(*) as facturas,
                        SUM(total) as total_ventas,
                        AVG(total) as promedio_factura
                    FROM facturas 
                    GROUP BY cliente_id, cliente_nombre
                    ORDER BY total_ventas DESC
                    LIMIT 10
                `);

                await db.end();
                return res.json({
                    ventas_mensuales: ventasMensuales,
                    top_clientes: topClientes
                });

            default:
                await db.end();
                return res.status(400).json({ error: 'Tipo de reporte no válido' });
        }

    } catch (error) {
        console.error('Error en función reportes:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 