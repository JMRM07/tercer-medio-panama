// Función serverless para Vercel - Reportes con Supabase
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
        const tipoReporte = req.query.tipo || req.body?.tipo;

        switch (tipoReporte) {
            case 'dashboard':
                // Reporte de dashboard - resumen general
                const { count: totalClientes } = await supabase
                    .from('clientes')
                    .select('*', { count: 'exact', head: true })
                    .eq('activo', true);

                const { count: totalCotizaciones } = await supabase
                    .from('cotizaciones')
                    .select('*', { count: 'exact', head: true })
                    .eq('activo', true);

                const { count: totalContratos } = await supabase
                    .from('contratos')
                    .select('*', { count: 'exact', head: true })
                    .eq('activo', true);

                const { count: totalFacturas } = await supabase
                    .from('facturas')
                    .select('*', { count: 'exact', head: true })
                    .eq('activo', true);

                // Ventas del mes actual
                const fechaInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
                const fechaFin = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();
                
                const { data: ventasActuales } = await supabase
                    .from('facturas')
                    .select('total')
                    .eq('activo', true)
                    .gte('fecha_factura', fechaInicio)
                    .lte('fecha_factura', fechaFin);

                const ventasTotal = ventasActuales?.reduce((sum, factura) => sum + (factura.total || 0), 0) || 0;

                // Estado de cotizaciones
                const { data: cotizacionesEstado } = await supabase
                    .from('cotizaciones')
                    .select('estado, total')
                    .eq('activo', true);

                const estadoCotizaciones = cotizacionesEstado?.reduce((acc, cot) => {
                    const estado = cot.estado || 'Sin estado';
                    if (!acc[estado]) {
                        acc[estado] = { cantidad: 0, monto_total: 0 };
                    }
                    acc[estado].cantidad += 1;
                    acc[estado].monto_total += cot.total || 0;
                    return acc;
                }, {});

                return res.json({
                    resumen: {
                        clientes: totalClientes || 0,
                        cotizaciones: totalCotizaciones || 0,
                        contratos: totalContratos || 0,
                        facturas: totalFacturas || 0
                    },
                    ventas: {
                        mes_actual: ventasTotal,
                        facturas_mes: ventasActuales?.length || 0
                    },
                    cotizaciones_por_estado: estadoCotizaciones || {}
                });

            case 'ventas':
                // Reporte de ventas por período
                const { fecha_inicio, fecha_fin } = req.query;
                const startDate = fecha_inicio || '2024-01-01';
                const endDate = fecha_fin || '2024-12-31';

                const { data: ventasPeriodo } = await supabase
                    .from('facturas')
                    .select(`
                        fecha_factura,
                        subtotal,
                        itbms,
                        total,
                        clientes (
                            nombre
                        )
                    `)
                    .eq('activo', true)
                    .gte('fecha_factura', startDate)
                    .lte('fecha_factura', endDate)
                    .order('fecha_factura', { ascending: false });

                // Agrupar por fecha
                const ventasPorFecha = ventasPeriodo?.reduce((acc, factura) => {
                    const fecha = factura.fecha_factura?.split('T')[0];
                    if (!acc[fecha]) {
                        acc[fecha] = {
                            fecha,
                            cantidad_facturas: 0,
                            subtotal: 0,
                            itbms: 0,
                            total: 0
                        };
                    }
                    acc[fecha].cantidad_facturas += 1;
                    acc[fecha].subtotal += factura.subtotal || 0;
                    acc[fecha].itbms += factura.itbms || 0;
                    acc[fecha].total += factura.total || 0;
                    return acc;
                }, {});

                // Agrupar por cliente
                const ventasPorCliente = ventasPeriodo?.reduce((acc, factura) => {
                    const clienteNombre = factura.clientes?.nombre || 'Sin cliente';
                    if (!acc[clienteNombre]) {
                        acc[clienteNombre] = {
                            cliente_nombre: clienteNombre,
                            cantidad_facturas: 0,
                            total_ventas: 0
                        };
                    }
                    acc[clienteNombre].cantidad_facturas += 1;
                    acc[clienteNombre].total_ventas += factura.total || 0;
                    return acc;
                }, {});

                return res.json({
                    ventas_por_fecha: Object.values(ventasPorFecha || {}),
                    ventas_por_cliente: Object.values(ventasPorCliente || {})
                });

            case 'clientes':
                // Reporte de actividad de clientes
                const { data: clientesData } = await supabase
                    .from('clientes')
                    .select(`
                        *,
                        cotizaciones (
                            id,
                            total
                        ),
                        contratos (
                            id,
                            total
                        ),
                        facturas (
                            id,
                            total,
                            fecha_factura
                        )
                    `)
                    .eq('activo', true);

                const clientesActivos = clientesData?.map(cliente => ({
                    nombre: cliente.nombre,
                    ruc: cliente.ruc,
                    cotizaciones: cliente.cotizaciones?.length || 0,
                    contratos: cliente.contratos?.length || 0,
                    facturas: cliente.facturas?.length || 0,
                    total_facturado: cliente.facturas?.reduce((sum, f) => sum + (f.total || 0), 0) || 0,
                    ultima_factura: cliente.facturas?.length > 0 ? 
                        Math.max(...cliente.facturas.map(f => new Date(f.fecha_factura).getTime())) : null
                })) || [];

                return res.json({ clientes: clientesActivos });

            case 'contratos':
                // Reporte de estado de contratos
                const { data: estadoContratos } = await supabase
                    .from('contratos')
                    .select(`
                        *,
                        clientes (
                            nombre
                        )
                    `)
                    .eq('activo', true)
                    .order('fecha_inicio', { ascending: false });

                const contratos = estadoContratos?.map(contrato => ({
                    numero: contrato.numero,
                    cliente_nombre: contrato.clientes?.nombre,
                    fecha_inicio: contrato.fecha_inicio,
                    fecha_fin: contrato.fecha_fin,
                    tipo_contrato: contrato.tipo_contrato,
                    estado: contrato.estado,
                    total: contrato.total
                })) || [];

                // Resumen de contratos
                const resumenContratos = estadoContratos?.reduce((acc, contrato) => {
                    const estado = contrato.estado || 'Sin estado';
                    if (!acc[estado]) {
                        acc[estado] = {
                            cantidad: 0,
                            monto_total: 0
                        };
                    }
                    acc[estado].cantidad += 1;
                    acc[estado].monto_total += contrato.total || 0;
                    return acc;
                }, {});

                return res.json({
                    contratos: contratos,
                    resumen: Object.entries(resumenContratos || {}).map(([estado, datos]) => ({
                        estado,
                        ...datos
                    }))
                });

            case 'financiero':
                // Reporte financiero detallado
                const { data: todasFacturas } = await supabase
                    .from('facturas')
                    .select(`
                        fecha_factura,
                        subtotal,
                        itbms,
                        total,
                        clientes (
                            nombre
                        )
                    `)
                    .eq('activo', true)
                    .order('fecha_factura', { ascending: false });

                // Ventas mensuales
                const ventasMensuales = todasFacturas?.reduce((acc, factura) => {
                    const fecha = new Date(factura.fecha_factura);
                    const año = fecha.getFullYear();
                    const mes = fecha.getMonth() + 1;
                    const clave = `${año}-${mes.toString().padStart(2, '0')}`;
                    
                    if (!acc[clave]) {
                        acc[clave] = {
                            año,
                            mes,
                            nombre_mes: fecha.toLocaleDateString('es-ES', { month: 'long' }),
                            cantidad_facturas: 0,
                            subtotal: 0,
                            itbms: 0,
                            total: 0
                        };
                    }
                    acc[clave].cantidad_facturas += 1;
                    acc[clave].subtotal += factura.subtotal || 0;
                    acc[clave].itbms += factura.itbms || 0;
                    acc[clave].total += factura.total || 0;
                    return acc;
                }, {});

                // Top clientes
                const topClientes = todasFacturas?.reduce((acc, factura) => {
                    const cliente = factura.clientes?.nombre || 'Sin cliente';
                    if (!acc[cliente]) {
                        acc[cliente] = {
                            cliente_nombre: cliente,
                            facturas: 0,
                            total_ventas: 0
                        };
                    }
                    acc[cliente].facturas += 1;
                    acc[cliente].total_ventas += factura.total || 0;
                    return acc;
                }, {});

                const topClientesArray = Object.values(topClientes || {})
                    .map(cliente => ({
                        ...cliente,
                        promedio_factura: cliente.total_ventas / cliente.facturas
                    }))
                    .sort((a, b) => b.total_ventas - a.total_ventas)
                    .slice(0, 10);

                return res.json({
                    ventas_mensuales: Object.values(ventasMensuales || {}).slice(0, 12),
                    top_clientes: topClientesArray
                });

            default:
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